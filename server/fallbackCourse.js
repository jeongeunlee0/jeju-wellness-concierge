// AI(Claude)를 쓸 수 없을 때(크레딧 소진·키 오류·장애)도 서비스가 멈추지 않도록 만드는 "규칙 기반 기본 추천".
// 같은 공공데이터(기상청·대기질·TourAPI·국가유산청)만 사용하고, 장소·주소·날씨 수치는 응답에 있는 값만 문장에 넣는다(지어내지 않음).
// AI 가 만든 코스와 섞이지 않도록 호출하는 쪽이 mode: 'rules' 로 표시하고 화면에도 "기본 추천"이라고 알린다.
import { searchTour } from './tour.js'
import { getWeather } from './weather.js'
import { searchHeritage } from './heritage.js'
import { getAirQuality } from './airquality.js'

// 휴식 목적 → 검색 키워드 (TourAPI contentTypeId: 12 관광지, 14 문화시설, 39 음식점)
const PLAN = {
  '스트레스 해소': { main: [['숲', '12'], ['산책', '12']], close: [['카페', '39']], mainRole: '숲과 산책로에서 호흡을 가다듬기 좋은 곳이에요' },
  '숙면·재충전': { main: [['온천', '12'], ['휴양림', '12']], close: [['카페', '39']], mainRole: '몸의 긴장을 풀고 쉬어 가기 좋은 곳이에요' },
  '몸 풀기·가벼운 활동': { main: [['오름', '12'], ['올레', '12']], close: [['해변', '12']], mainRole: '가볍게 걸으며 몸을 풀기 좋은 곳이에요' },
  '감정 정리·사색': { main: [['해변', '12'], ['바다', '12']], close: [['카페', '39']], mainRole: '바다를 바라보며 생각을 정리하기 좋은 곳이에요' },
  '미식과 함께하는 휴식': { main: [['카페', '39'], ['맛집', '39']], close: [['산책', '12']], mainRole: '천천히 음식을 즐기며 쉬어 가기 좋은 곳이에요' },
}
const INDOOR = [['박물관', '14'], ['미술관', '14'], ['전시', '14']]

const TYPE_LABEL = { 12: '관광지', 14: '문화시설', 15: '축제·행사', 39: '음식점·카페' }
const SAFE = async (fn, args, tool, steps) => {
  try {
    const r = await fn(args)
    steps.push({ tool, args, count: Array.isArray(r) ? r.length : 1 })
    return r
  } catch (e) {
    steps.push({ tool, args, count: 0, error: e.message })
    return null
  }
}

export async function buildFallbackCourse(p) {
  const steps = []
  const plan = PLAN[p.purpose] ?? PLAN['스트레스 해소']
  const [weather, air] = await Promise.all([
    SAFE(getWeather, { place: p.place }, 'get_weather', steps),
    SAFE(getAirQuality, { place: p.place }, 'get_air_quality', steps),
  ])

  const w = weather?.[0]
  const rainy = Boolean(w && (w.rain !== '없음' || w.pop >= 60))
  const badAir = Boolean(air && ['민감군 주의', '나쁨'].includes(air.grade))
  const indoor = p.env === '실내 중심' || ((rainy || badAir) && p.env !== '실외 중심')

  // 후보 검색 (실패한 도구는 건너뛰고, 있는 데이터로만 구성)
  const queries = indoor ? [...INDOOR, ...plan.close] : [...plan.main, ...plan.close]
  const tourResults = await Promise.all(queries.map(([keyword, contentTypeId]) =>
    SAFE(searchTour, { keyword, contentTypeId, rows: 8 }, 'search_tour_places', steps).then((r) => ({ keyword, type: contentTypeId, items: r ?? [] }))))
  const heritage = (await SAFE(searchHeritage, { keyword: '' }, 'search_heritage', steps)) ?? []

  const used = new Set()
  let outOfRegion = false
  const inRegion = (x) => String(x.addr ?? x.city ?? '').includes(p.place)
  const take = (items, source) => {
    const fresh = (items ?? []).filter((x) => (x.title ?? x.name) && !used.has(x.title ?? x.name))
    const local = fresh.find(inRegion)
    const it = local ?? fresh[0]
    if (it && !local) outOfRegion = true
    if (!it) return null
    const name = it.title ?? it.name
    used.add(name)
    return { name, source, addr: it.addr ?? it.city ?? null, lat: it.lat ? Number(it.lat) : null, lng: it.lng ? Number(it.lng) : null, type: it.type ?? null, kind: it.kind ?? null }
  }
  const pool = (types) => tourResults.filter((r) => types.includes(r.type)).flatMap((r) => r.items)

  // 흐름: 진정(조용한 곳) → 본 활동 → 마무리
  const calm = indoor ? take(pool(['14']), 'tour') ?? take(heritage, 'heritage') : take(heritage, 'heritage') ?? take(pool(['12']), 'tour')
  const main = indoor ? take(pool(['14']), 'tour') ?? take(pool(['12']), 'tour') : take(pool(plan.main.map((m) => m[1])), 'tour')
  const closeStop = take(pool(plan.close.map((c) => c[1])), 'tour')
  const wantStops = p.hours <= 2 ? 2 : p.hours <= 4 ? 3 : 4
  let picked = [calm, main, closeStop].filter(Boolean)
  const extra = take(heritage, 'heritage')
  if (extra && picked.length < wantStops) picked.push(extra)
  picked = picked.slice(0, wantStops)
  if (picked.length === 0) throw new Error('기본 추천을 만들 데이터가 없어요')

  // 이용 시간을 넘기지 않게 장소별 시간을 배분
  const base = (s) => (s.source === 'heritage' ? 40 : s.type === '39' ? 60 : s.type === '14' ? 50 : 70)
  let stops = picked.map((s) => ({ ...s, minutes: base(s) }))
  const budget = p.hours * 60
  while (stops.reduce((a, s) => a + s.minutes, 0) > budget && stops.length > 1) stops.pop()

  const hourLabel = w ? `${String(w.time).slice(-4, -2)}시` : ''
  const weatherPhrase = w
    ? `${p.place} ${hourLabel} 예보는 ${w.sky}·기온 ${w.temp}℃·강수확률 ${w.pop}%예요.`
    : '날씨 정보를 불러오지 못해 날씨는 반영하지 못했어요.'
  const airPhrase = air ? `대기질은 '${air.grade}'(PM2.5 ${Math.round(air.pm25)}, 자외선 ${air.uv})예요.` : ''

  const reasonFor = (s, i) => {
    const label = s.source === 'heritage' ? `국가유산(${s.kind ?? '문화유산'})` : TYPE_LABEL[s.type] ?? '장소'
    const role = i === 0 ? '코스의 시작으로 차분히 마음을 가라앉히기 좋아요' : i === stops.length - 1 && stops.length > 2 ? '마무리로 천천히 쉬어 가기 좋아요' : plan.mainRole
    return `${label}이에요. ${role}.`
  }

  const course = {
    summary: `${p.place}에서 ${p.hours}시간 안에 ${stops.length}곳을 ${indoor ? '실내 중심으로 이어 쉬는' : '천천히 이어 걷는'} '${p.purpose}' 기본 추천 코스입니다.`,
    stops: stops.map((s, i) => ({
      name: s.name, source: s.source, minutes: s.minutes, reason: reasonFor(s, i),
      verified: true, lat: s.lat, lng: s.lng, addr: s.addr,
    })),
    conditions: `${weatherPhrase} ${airPhrase} ${indoor ? '비·미세먼지 또는 선호에 따라 실내 중심으로 구성했어요.' : '야외 활동에 무리가 없다고 보고 구성했어요.'}`.trim(),
    notes: `AI 컨시어지를 사용할 수 없어 정해진 규칙으로 만든 기본 추천이에요. 장소는 공공데이터에 실제 있는 곳만 담았고, 운영시간·장소 간 이동시간은 데이터에 없어 확인이 필요해요.${outOfRegion ? ` 선택한 지역(${p.place})에서 찾은 장소가 부족해 일부는 다른 지역에 있어요.` : ''}`,
  }
  return { course, steps, mode: 'rules' }
}
