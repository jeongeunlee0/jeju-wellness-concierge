// AI(Claude)를 쓸 수 없을 때(크레딧 소진·키 오류·장애)도 서비스가 멈추지 않도록 만드는 "규칙 기반 기본 추천".
// 같은 공공데이터(기상청·대기질·TourAPI·국가유산청)만 사용하고, 장소·주소·날씨 수치는 응답에 있는 값만 문장에 넣는다(지어내지 않음).
// 이동 부담을 줄이려고 "첫 장소 → 그 주변" 순서로 위치 기반 검색(locationBasedList2)을 써서 가까운 곳끼리 묶는다.
// AI 가 만든 코스와 섞이지 않도록 호출하는 쪽이 mode: 'rules' 로 표시하고 화면에도 "기본 추천"이라고 알린다.
import { searchTour } from './tour.js'
import { getWeather } from './weather.js'
import { searchHeritage } from './heritage.js'
import { getAirQuality } from './airquality.js'
import { haversineKm, tourCall } from './placeGuide.js'

// 휴식 목적 → 본 활동 장소를 고를 때 쓰는 이름 키워드와 안내 문구
const PURPOSE = {
  '스트레스 해소': { kw: /숲|곶자왈|산책|공원|휴양림|폭포|오솔길|수목원|계곡/, search: ['숲', '산책'], role: '숲과 산책로에서 호흡을 가다듬기 좋은 곳이에요' },
  '숙면·재충전': { kw: /온천|스파|휴양|힐링|숲|수목원|명상|리조트/, search: ['온천', '휴양림'], role: '몸의 긴장을 풀고 쉬어 가기 좋은 곳이에요' },
  '몸 풀기·가벼운 활동': { kw: /오름|올레|둘레길|트레킹|해안|산책|계곡/, search: ['오름', '올레'], role: '가볍게 걸으며 몸을 풀기 좋은 곳이에요' },
  '감정 정리·사색': { kw: /해변|바다|해안|포구|등대|전망|갯|돌담/, search: ['해변', '바다'], role: '바다를 바라보며 생각을 정리하기 좋은 곳이에요' },
  '미식과 함께하는 휴식': { kw: /./, search: ['카페', '맛집'], role: '천천히 음식을 즐기며 쉬어 가기 좋은 곳이에요' },
}
const TYPE_LABEL = { 12: '관광지', 14: '문화시설', 39: '음식점·카페' }
const isCafe = (it) => String(it.cat3) === 'A05020900'
const inJeju = (lat, lng) => lat >= 33 && lat <= 34.2 && lng >= 126 && lng <= 127.2
// 유물·서화처럼 직접 방문할 수 없는 국가유산 이름은 제외
const NOT_VISITABLE = /유물|유묵|서화|고문서|일괄|필사|문서|탁본|초상/

const mapTour = (it) => ({ name: it.title, source: 'tour', id: String(it.contentid ?? it.id ?? ''), type: String(it.contenttypeid ?? it.type ?? ''), addr: it.addr1 ?? it.addr ?? null, lat: Number(it.mapy ?? it.lat), lng: Number(it.mapx ?? it.lng), cafe: isCafe(it) })

export async function buildFallbackCourse(p) {
  const steps = []
  const log = async (tool, args, fn) => {
    try { const r = await fn(); steps.push({ tool, args, count: Array.isArray(r) ? r.length : 1 }); return r } catch (e) { steps.push({ tool, args, count: 0, error: e.message }); return null }
  }
  const plan = PURPOSE[p.purpose] ?? PURPOSE['스트레스 해소']

  const [weather, air] = await Promise.all([
    log('get_weather', { place: p.place }, () => getWeather({ place: p.place })),
    log('get_air_quality', { place: p.place }, () => getAirQuality({ place: p.place })),
  ])
  const w = weather?.[0]
  const rainy = Boolean(w && (w.rain !== '없음' || w.pop >= 60))
  const badAir = Boolean(air && ['민감군 주의', '나쁨'].includes(air.grade))
  const indoor = p.env === '실내 중심' || ((rainy || badAir) && p.env !== '실외 중심')

  const inRegion = (x) => String(x.addr ?? '').includes(p.place)
  const used = new Set()
  const pick = (list, anchor, { regionOnly = false } = {}) => {
    let c = list.filter((x) => x.name && !used.has(x.name) && inJeju(x.lat, x.lng))
    if (regionOnly) c = c.filter(inRegion)
    if (!c.length) return null
    c.sort((a, b) => Number(inRegion(b)) - Number(inRegion(a)) || (anchor ? haversineKm(anchor, a) - haversineKm(anchor, b) : 0))
    used.add(c[0].name)
    return c[0]
  }
  const nearby = async (anchor, type, radius) => {
    const r = await log('search_tour_places', { nearby: true, contentTypeId: type, radiusKm: radius / 1000 }, () => tourCall('locationBasedList2', { mapX: String(anchor.lng), mapY: String(anchor.lat), radius: String(radius), arrange: 'E', numOfRows: '40', contentTypeId: type }))
    return (r ?? []).map(mapTour)
  }

  // 1) 시작 장소: 선택 지역의 방문 가능한 국가유산(조용히 시작) → 없으면 목적 키워드 관광지
  const heritageRaw = (await log('search_heritage', { keyword: '' }, () => searchHeritage({ keyword: '', rows: 60 }))) ?? []
  const heritage = heritageRaw.filter((h) => !NOT_VISITABLE.test(h.name)).map((h) => ({ name: h.name, source: 'heritage', id: null, type: null, addr: h.city, lat: Number(h.lat), lng: Number(h.lng), kind: h.kind }))
  let first = !indoor && p.purpose === '감정 정리·사색' ? pick(heritage, null, { regionOnly: true }) : null
  if (!first) {
    const seedType = p.purpose === '미식과 함께하는 휴식' ? '39' : indoor ? '14' : '12'
    const seedWords = p.purpose === '미식과 함께하는 휴식' ? plan.search : indoor ? ['미술관', '박물관'] : plan.search
    const seed = (await Promise.all(seedWords.map((keyword) => log('search_tour_places', { keyword, contentTypeId: seedType }, () => searchTour({ keyword, contentTypeId: seedType, rows: 20 }))))).flat().filter(Boolean).map(mapTour)
    first = pick(seed, null, { regionOnly: true })
    if (!first) {
      const regional = (await log('search_tour_places', { keyword: '', contentTypeId: seedType }, () => searchTour({ contentTypeId: seedType, rows: 40 }))) ?? []
      const candidates = regional.map(mapTour)
      first = pick(candidates, null, { regionOnly: true }) ?? pick(seed, null) ?? pick(candidates, null)
    }
    if (!first && !indoor) first = pick(heritage, null)
  }
  if (!first) throw new Error('기본 추천을 만들 데이터가 없어요')

  // 2) 본 활동: 첫 장소 주변(10km)에서 목적에 맞는 곳 — 실내면 문화시설
  const stopsRaw = [first]
  const foodie = p.purpose === '미식과 함께하는 휴식'
  const around = (await nearby(first, foodie ? '39' : indoor ? '14' : '12', foodie ? 3000 : 10000)) ?? []
  const matching = foodie ? around.filter((x) => !x.cafe) : indoor ? around : around.filter((x) => plan.kw.test(x.name))
  const main = pick(matching, first) ?? pick(around, first)
  if (main) stopsRaw.push(main)

  // 3) 마무리: 본 활동 장소 주변 3km 의 카페(없으면 음식점)
  const anchor2 = main ?? first
  const food = (await nearby(anchor2, '39', 3000)) ?? []
  const closer = pick(food.filter((x) => x.cafe), anchor2) ?? pick(food, anchor2)
  if (closer) stopsRaw.push(closer)

  // 시간에 맞춰 장소 수를 조절 (이용 시간을 넘기지 않게)
  const want = p.hours <= 2 ? 2 : p.hours <= 4 ? 3 : 4
  if (stopsRaw.length < want) {
    const more = pick(around, anchor2) ?? (!indoor ? pick(heritage, anchor2, { regionOnly: true }) : null)
    if (more) stopsRaw.splice(Math.max(1, stopsRaw.length - 1), 0, more)
  }
  const base = (s) => (s.source === 'heritage' ? 40 : s.type === '39' ? 60 : s.type === '14' ? 50 : 70)
  const stops = stopsRaw.slice(0, want).map((s) => ({ ...s, minutes: base(s) }))
  const budget = p.hours * 60
  while (stops.reduce((a, s) => a + s.minutes, 0) > budget && stops.length > 1) stops.pop()

  const hourLabel = w ? `${String(w.time).slice(-4, -2)}시` : ''
  const weatherPhrase = w ? `${p.place} ${hourLabel} 예보는 ${w.sky}·기온 ${w.temp}℃·강수확률 ${w.pop}%예요.` : '날씨 정보를 불러오지 못해 날씨는 반영하지 못했어요.'
  const airPhrase = air ? `대기질은 '${air.grade}'(PM2.5 ${Math.round(air.pm25)}, 자외선 ${air.uv})예요.` : ''
  const reasonFor = (s, i) => {
    const label = s.source === 'heritage' ? `국가유산(${s.kind ?? '문화유산'})` : TYPE_LABEL[s.type] ?? '장소'
    const role = s.type === '14' ? '문화·전시를 둘러보는 휴식 후보예요. 실내 관람 범위는 방문 전에 확인하세요' : i === 0 ? '코스의 시작으로 차분히 마음을 가라앉히기 좋아요' : i === stops.length - 1 && stops.length > 2 ? '마무리로 천천히 쉬어 가기 좋아요' : plan.role
    return `${label}이에요. ${role}.`
  }
  const legs = stops.slice(1).map((s, i) => haversineKm(stops[i], s))
  const outOfRegion = stops.some((s) => !inRegion(s))
  const far = Math.max(0, ...legs) >= 20

  return {
    course: {
      summary: `${p.place}에서 방문시간 ${p.hours}시간 이내로 ${stops.length}곳을 ${indoor ? '문화시설 중심으로 둘러보는' : '가까운 곳끼리 연결한'} '${p.purpose}' 기본 추천 코스입니다.`,
      stops: stops.map((s, i) => ({ name: s.name, source: s.source, minutes: s.minutes, reason: reasonFor(s, i), verified: true, lat: s.lat, lng: s.lng, addr: s.addr, id: s.id || null, type: s.type || null })),
      conditions: `${weatherPhrase} ${airPhrase} ${indoor ? '비·미세먼지 또는 선호에 따라 문화시설을 우선 조회했어요. 야외 구간 유무는 방문 전 확인하세요.' : '조회된 날씨를 참고한 추천이며 현장 안전·운영 여부는 별도 확인이 필요해요.'}`.trim(),
      notes: `표시 시간은 장소 체류시간이며 실제 도로 이동·대기시간은 포함하지 않아요. 문화시설 분류가 실내 이용 가능 여부를 보장하지는 않아요. 장소는 공공데이터에 실제 있는 곳만 담았고, 운영시간은 장소별 방문 가이드에서 확인하세요.${outOfRegion ? ` 선택한 지역(${p.place})에서 찾은 장소가 부족해 일부는 다른 지역에 있어요.` : ''}${far ? ' 장소 사이가 멀어 차량 이동이 필요해요.' : ''}`,
    },
    steps,
    mode: 'rules',
  }
}
