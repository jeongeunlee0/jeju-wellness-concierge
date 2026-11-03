// 장소 방문 가이드: 방문객이 알아야 할 정보를 "실제 데이터"로만 만든다.
//  · 공공데이터: 한국관광공사 TourAPI 상세(주차·쉬는 날·이용시간·반려동물·유모차·문의처), 주변 음식점·카페·관광지와 실제 거리
//  · 실시간 수치: 기상청 예보(기온·강수확률·풍속), Open-Meteo(자외선·미세먼지), 위도·경도로 계산한 일출·일몰
//  · 옷차림·준비물·주의사항: 위 수치에 정해진 규칙을 적용한 안내 (basis 로 근거를 밝힘: '날씨' | '공공데이터' | '일반')
//  · 데이터에 없는 항목은 지어내지 않고 null 로 둬서 화면에서 "정보 없음 · 확인 필요"로 표시한다.
import { getWeather } from './weather.js'
import { getAirQuality } from './airquality.js'

const BASE = 'https://apis.data.go.kr/B551011/KorService2'

export async function tourCall(op, params) {
  if (!process.env.DATA_GO_KR_KEY) throw new Error('DATA_GO_KR_KEY 가 설정되지 않았어요')
  const qs = new URLSearchParams({ serviceKey: process.env.DATA_GO_KR_KEY, MobileOS: 'ETC', MobileApp: 'JejuIP', _type: 'json', ...params })
  const r = await fetch(`${BASE}/${op}?${qs}`)
  const text = await r.text()
  let data
  try { data = JSON.parse(text) } catch { throw new Error(`TourAPI 응답이 JSON이 아님 (${op})`) }
  const err = data?.OpenAPI_ServiceResponse?.cmmMsgHeader
  if (err) throw new Error(`TourAPI 오류: ${err.returnAuthMsg ?? err.errMsg}`)
  if (!r.ok) throw new Error(`TourAPI HTTP 오류 (${r.status})`)
  const header = data?.response?.header
  if (!header || !['0000', '00'].includes(String(header.resultCode))) throw new Error(`TourAPI 오류: ${header?.resultMsg ?? '응답 형식 확인 필요'}`)
  const item = data?.response?.body?.items?.item
  return !item ? [] : Array.isArray(item) ? item : [item]
}

// 공공데이터 문장에는 HTML 태그·특수 공백이 섞여 있어 정리한다
const clean = (v, max = 220) => {
  const t = String(v ?? '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
  return t ? t.slice(0, max) : null
}
const first = (obj, keys) => { for (const k of keys) { const v = clean(obj?.[k]); if (v) return v } return null }

// ── 일출·일몰 (위도·경도·날짜로 계산, 분 단위 오차) ──
export function sunTimes(lat, lng, now = new Date()) {
  const rad = Math.PI / 180
  const jd = now.getTime() / 86400000 + 2440587.5
  const n = Math.ceil(jd - 2451545.0 + 0.0008)
  const jStar = n - lng / 360   // 경도(동경)만큼 자정이 앞당겨짐
  const M = (357.5291 + 0.98560028 * jStar) % 360
  const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad)
  const lambda = (M + C + 180 + 102.9372) % 360
  const jTransit = 2451545.0 + jStar + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lambda * rad)
  const sinD = Math.sin(lambda * rad) * Math.sin(23.4397 * rad)
  const cosD = Math.cos(Math.asin(sinD))
  const cosW = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * sinD) / (Math.cos(lat * rad) * cosD)
  const w = Math.acos(Math.max(-1, Math.min(1, cosW))) / rad
  const fmt = (j) => {
    const kst = new Date((j - 2440587.5) * 86400000 + 9 * 3600e3)
    return `${String(kst.getUTCHours()).padStart(2, '0')}:${String(kst.getUTCMinutes()).padStart(2, '0')}`
  }
  return { sunrise: fmt(jTransit - w / 360), sunset: fmt(jTransit + w / 360) }
}

export const haversineKm = (a, b) => {
  const R = 6371, rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

// 장소의 위치에서 가까운 기상 관측 격자(제주시/서귀포시)
const nearestCity = (lat, lng) => (haversineKm({ lat, lng }, { lat: 33.5, lng: 126.53 }) <= haversineKm({ lat, lng }, { lat: 33.25, lng: 126.56 }) ? '제주시' : '서귀포시')

const TYPE_LABEL = { 12: '관광지', 14: '문화시설', 15: '축제·행사', 28: '레포츠', 32: '숙박', 38: '쇼핑', 39: '음식점' }
const isCafe = (it) => String(it.cat3) === 'A05020900'

// ── 옷차림(체감온도 구간) ──
export function outfitFor({ temp, wind = 0, pop = 0, uv = 0, minTemp = temp, maxTemp = temp }) {
  const feels = Math.round(temp - (wind >= 4 ? (wind - 3) * 0.7 : 0))
  let layer
  if (feels >= 28) layer = '반팔·반바지 등 시원한 옷. 통풍이 잘 되는 소재가 좋아요'
  else if (feels >= 23) layer = '반팔에 얇은 겉옷 하나'
  else if (feels >= 17) layer = '긴팔 셔츠나 얇은 가디건'
  else if (feels >= 12) layer = '니트·맨투맨에 자켓이나 가벼운 외투'
  else if (feels >= 6) layer = '두꺼운 외투와 긴 바지, 목이 따뜻한 옷'
  else layer = '패딩·목도리·장갑 등 방한 용품까지'
  const extra = []
  if (maxTemp - minTemp >= 6) extra.push(`예보 시간대의 기온 차가 ${maxTemp - minTemp}℃라 겹쳐 입고 벗기 쉬운 옷이 좋아요`)
  if (wind >= 7) extra.push('바람이 강해 바람막이를 챙기세요')
  if (pop >= 50) extra.push('비 예보가 있어 방수 겉옷이나 우산이 필요해요')
  if (uv >= 6) extra.push('자외선이 강해 모자와 선글라스를 권해요')
  return { feels, layer, extra }
}

// TourAPI 식별자가 없는 장소(장바구니·국가유산 등)는 이름이 같고 가까운(1km 이내) 장소가 있을 때만 연결한다
async function resolveContent(name, lat, lng) {
  const list = await tourCall('searchKeyword2', { keyword: name.replace(/\(.*?\)/g, '').trim().slice(0, 40), areaCode: '39', numOfRows: '10' })
  const hit = list.find((it) => it.title === name && haversineKm({ lat, lng }, { lat: Number(it.mapy), lng: Number(it.mapx) }) <= 1)
  return hit ? { id: String(hit.contentid), type: String(hit.contenttypeid) } : null
}

export async function buildGuide({ name, lat, lng, id, type }) {
  const region = nearestCity(lat, lng)
  const sources = []
  const safe = async (label, fn) => { try { const r = await fn(); sources.push({ name: label, ok: true }); return r } catch (e) { sources.push({ name: label, ok: false, error: e.message }); return null } }

  if (!id) { try { const r = await resolveContent(name, lat, lng); if (r) { id = r.id; type = r.type } } catch { /* 연결 실패 시 상세 정보 없이 진행 */ } }
  const [weather, air, intro, common, foodRaw, spotRaw] = await Promise.all([
    safe('기상청 단기예보', () => getWeather({ place: region })),
    safe('Open-Meteo 대기질', () => getAirQuality({ place: region })),
    id && type ? safe('TourAPI 상세(이용 정보)', () => tourCall('detailIntro2', { contentId: id, contentTypeId: type })) : null,
    id ? safe('TourAPI 공통 정보', () => tourCall('detailCommon2', { contentId: id })) : null,
    safe('TourAPI 주변 음식점·카페', () => tourCall('locationBasedList2', { mapX: String(lng), mapY: String(lat), radius: '3000', arrange: 'E', numOfRows: '30', contentTypeId: '39' })),
    safe('TourAPI 주변 관광지', () => tourCall('locationBasedList2', { mapX: String(lng), mapY: String(lat), radius: '8000', arrange: 'E', numOfRows: '20', contentTypeId: '12' })),
  ])

  const slots = weather ?? []
  const w = slots[0]
  const temps = slots.map((s) => s.temp).filter(Number.isFinite)
  const now = w ? {
    time: w.time, temp: w.temp, sky: w.sky, rain: w.rain, pop: Math.max(...slots.map((s) => s.pop).filter(Number.isFinite), 0),
    wind: Math.max(...slots.map((s) => s.wind).filter(Number.isFinite), 0), humidity: w.humidity,
    minTemp: temps.length ? Math.min(...temps) : w.temp, maxTemp: temps.length ? Math.max(...temps) : w.temp,
  } : null
  const uv = air?.uv ?? 0
  const badAir = Boolean(air && ['민감군 주의', '나쁨'].includes(air.grade))
  const sun = sunTimes(lat, lng)

  const t = intro?.[0] ?? {}
  const c = common?.[0] ?? {}
  const typeNum = Number(type) || null
  const placeInfo = {
    parking: first(t, ['parking', 'parkingculture', 'parkingfood']),
    parkingFee: first(t, ['parkingfee']),
    openHours: first(t, ['usetime', 'usetimeculture', 'opentimefood']),
    restDay: first(t, ['restdate', 'restdateculture', 'restdatefood']),
    fee: first(t, ['usefee']),
    spendTime: first(t, ['spendtime']),
    phone: first(t, ['infocenter', 'infocenterculture', 'infocenterfood']) ?? clean(c.tel, 60),
    pet: first(t, ['chkpet', 'chkpetculture']),
    stroller: first(t, ['chkbabycarriage', 'chkbabycarriageculture']),
    menu: first(t, ['firstmenu', 'treatmenu']),
    reservation: first(t, ['reservationfood']),
    season: first(t, ['useseason']),
  }
  // 상세 정보의 홈페이지 필드에 비짓제주 상세 페이지 주소가 들어 있는 경우만 사용 (호스트를 엄격히 검사)
  const hp = String(c.homepage ?? '').match(/https?:\/\/(?:www\.)?visitjeju\.net\/[^\s"'<>]*/i)?.[0] ?? null
  const visitjeju = hp && /^https?:\/\/(?:www\.)?visitjeju\.net\/kr\/detail\/view\?contentsid=CONT_\d+$/i.test(hp) ? hp.replace(/^http:/, 'https:') : null

  const here = (it) => (id && String(it.contentid) === String(id)) || it.title === name
  const mapNear = (it) => ({ name: it.title, addr: clean(it.addr1, 80), distM: Math.round(Number(it.dist) || 0), lat: Number(it.mapy) || null, lng: Number(it.mapx) || null, id: it.contentid, type: Number(it.contenttypeid) })
  const foods = (foodRaw ?? []).filter((x) => !here(x))
  const restaurants = foods.filter((x) => !isCafe(x)).slice(0, 3).map(mapNear)
  const cafes = foods.filter(isCafe).slice(0, 3).map(mapNear)
  const spots = (spotRaw ?? []).filter((x) => !here(x)).slice(0, 4).map(mapNear)

  // ── 옷차림·준비물·주의사항 (규칙 + 근거 표시) ──
  const outfit = now ? outfitFor({ temp: now.temp, wind: now.wind, pop: now.pop, uv, minTemp: now.minTemp, maxTemp: now.maxTemp }) : null
  const month = new Date(Date.now() + 9 * 3600e3).getUTCMonth() + 1
  const nm = String(name)
  const trail = /오름|숲|곶자왈|올레|휴양림|폭포|산책|오솔길/.test(nm)
  const beach = /해변|해수욕장|포구|바다|해안|갯/.test(nm)

  const bring = [{ text: '물과 간식, 보조배터리', basis: '일반' }]
  const caution = []
  const tips = []
  if (now) {
    if (now.pop >= 40 || now.rain !== '없음') bring.push({ text: '우산 또는 방수 재킷', basis: '날씨' })
    if (uv >= 3) bring.push({ text: uv >= 6 ? '선크림·모자·선글라스' : '선크림과 모자', basis: '날씨' })
    if (now.temp <= 8) bring.push({ text: '핫팩과 장갑', basis: '날씨' })
    if (now.temp >= 26) bring.push({ text: '손수건과 휴대용 선풍기, 물은 넉넉히', basis: '날씨' })
    if (now.wind >= 7) bring.push({ text: '바람막이', basis: '날씨' })
    if (now.pop >= 60) caution.push({ text: `강수확률이 ${now.pop}%예요. 젖은 돌·나무 데크는 미끄러워 걸음을 천천히 하세요`, basis: '날씨' })
    if (now.wind >= 8) caution.push({ text: `풍속이 ${now.wind}m/s까지 올라가요. 해안·오름 능선에서는 강풍에 주의하세요`, basis: '날씨' })
    if (now.maxTemp >= 30) caution.push({ text: '한낮 더위에 대비해 그늘에서 자주 쉬고 물을 마시세요', basis: '날씨' })
  }
  if (badAir) { bring.push({ text: '마스크', basis: '날씨' }); caution.push({ text: `미세먼지 등급이 '${air.grade}'이에요. 호흡기가 약하면 야외 시간을 줄이세요`, basis: '날씨' }) }
  if (uv >= 6) caution.push({ text: `자외선 지수가 ${uv}로 높아요. 한낮 직사광선을 피하세요`, basis: '날씨' })
  if (trail || typeNum === 12) bring.push({ text: '걷기 편한 운동화(미끄럼 방지)', basis: '일반' })
  if (trail && month >= 6 && month <= 9) bring.push({ text: '벌레 기피제', basis: '일반' })
  if (beach) bring.push({ text: '여벌 양말과 수건', basis: '일반' })
  if (trail) caution.push({ text: `일몰은 ${sun.sunset}이에요. 숲길·오름은 일몰 1시간 전에는 내려오세요`, basis: '날씨' })
  if (placeInfo.restDay) caution.push({ text: `쉬는 날: ${placeInfo.restDay}`, basis: '공공데이터' })
  if (placeInfo.openHours) caution.push({ text: `이용 시간: ${placeInfo.openHours}`, basis: '공공데이터' })
  if (placeInfo.pet) caution.push({ text: `반려동물 동반: ${placeInfo.pet}`, basis: '공공데이터' })
  if (placeInfo.stroller) caution.push({ text: `유모차 대여·이용: ${placeInfo.stroller}`, basis: '공공데이터' })

  if (trail) tips.push({ text: '걷는 시간까지 넉넉히 잡고, 쓰레기는 되가져가세요', basis: '일반' })
  if (beach) tips.push({ text: '파도·물때 안전 표지를 확인하고 물가에서 너무 가까이 서지 마세요', basis: '일반' })
  if (typeNum === 39) tips.push({ text: '식사 시간(12~13시, 18~19시)을 피하면 덜 붐벼요', basis: '일반' })
  if (typeNum === 14) tips.push({ text: '휴관일과 입장 마감 시간을 미리 확인하세요', basis: '일반' })
  if (!typeNum && !trail && !beach) tips.push({ text: '문화유산은 만지거나 올라서지 말고 안내문을 지켜 관람하세요', basis: '일반' })
  if (cafes[0]) tips.push({ text: `가까운 카페: ${cafes[0].name}(${cafes[0].distM}m)`, basis: '공공데이터' })

  return {
    place: { name, lat, lng, region, typeLabel: TYPE_LABEL[typeNum] ?? null },
    now, uv, air: air ? { grade: air.grade, pm10: air.pm10, pm25: air.pm25 } : null, sun, outfit,
    bring, caution, tips,
    info: placeInfo,
    nearby: { restaurants, cafes, spots },
    links: { visitjeju, map: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` },
    sources, generatedAt: new Date().toISOString(),
  }
}
