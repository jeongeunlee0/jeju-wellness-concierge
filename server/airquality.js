// Open-Meteo 대기질 API (키 불필요) — 미세먼지·자외선은 야외 웰니스 코스 판단의 핵심 근거
const GRADE = (aqi) => (aqi <= 50 ? '좋음' : aqi <= 100 ? '보통' : aqi <= 150 ? '민감군 주의' : '나쁨')

const PLACES = { '제주시': [33.5, 126.53], '서귀포시': [33.25, 126.56] }

export async function getAirQuality({ place = '제주시' } = {}) {
  const [lat, lng] = PLACES[place] ?? PLACES['제주시']
  const r = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}` +
    '&current=pm10,pm2_5,uv_index,us_aqi&timezone=Asia%2FSeoul',
  )
  if (!r.ok) throw new Error(`대기질 API 오류 (${r.status})`)
  const { current: c } = await r.json()
  return {
    place, time: c.time, pm10: c.pm10, pm25: c.pm2_5, uv: c.uv_index,
    aqi: c.us_aqi, grade: GRADE(c.us_aqi),
  }
}
