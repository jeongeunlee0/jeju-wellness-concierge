// React 화면이 우리 서버 함수(/api/...)를 부를 때 쓰는 함수 모음
// 공공데이터 API를 브라우저에서 직접 부르지 않습니다 (키 노출 + CORS 문제) → 반드시 /api 를 거칩니다.

async function readJson(r) {
  let data
  try { data = await r.json() }
  catch { throw new Error(`서버 응답이 JSON이 아님 (${r.status}) — npm run dev 또는 vercel dev 로 실행했는지 확인`) }
  if (!r.ok) throw new Error(data.error || r.statusText)
  return data
}

export async function get(path) {
  return readJson(await fetch(path))
}

export async function post(path, body) {
  return readJson(await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }))
}

export const ping = () => get('/api/hello')

// 공공데이터 API
export const fetchPlaces = (keyword = '', type = '12') =>
  get(`/api/tour?keyword=${encodeURIComponent(keyword)}&type=${type}`)
export const fetchWeather = (place = '제주시') =>
  get(`/api/weather?place=${encodeURIComponent(place)}`)
export const fetchHeritage = (keyword = '') =>
  get(`/api/heritage?keyword=${encodeURIComponent(keyword)}`)
export const fetchAir = (place = '제주시') =>
  get(`/api/air?place=${encodeURIComponent(place)}`)

// AI 컨시어지: 선호 입력 → 웰니스 코스
export const planCourse = (preferences) => post('/api/agent', { preferences })


// 장소 방문 가이드 (날씨 기반 옷차림·준비물·주의사항 + TourAPI 상세·주변 정보)
export const fetchGuide = ({ name, lat, lng, id, type }) => {
  const q = new URLSearchParams({ name, lat, lng })
  if (id) q.set('id', id)
  if (type) q.set('type', type)
  return get(`/api/guide?${q}`)
}
