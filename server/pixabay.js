// Pixabay 이미지 API — 분위기 참고용 사진 (실제 장소 사진이 아님)
// 약관: 반환된 이미지 URL 은 "검색 결과의 일시적 표시"에만 사용, 결과는 24시간 캐시, 출처(Pixabay) 표기.
// 그래서 서버에서 24시간 캐시하고, 화면에는 항상 "분위기 참고 이미지 · Pixabay" 로 표시한다.

// 허용된 주제만 검색한다 (임의 검색어로 API 한도를 소진하는 남용 방지)
export const TOPICS = {
  jeju: 'jeju island',
  oreum: 'jeju oreum',
  forest: 'forest path',
  sea: 'ocean waves',
  sunset: 'ocean sunset',
  spa: 'spa wellness',
  tea: 'tea cafe',
  heritage: 'korean traditional architecture',
}

const TTL = 24 * 3600e3
const cache = new Map()

export async function getTopicImages({ topic = 'jeju', count = 6 } = {}) {
  const q = Object.hasOwn(TOPICS, topic) ? TOPICS[topic] : null
  if (!q) throw new Error('허용되지 않은 주제예요')
  if (!process.env.PIXABAY_API_KEY) throw new Error('PIXABAY_API_KEY 가 설정되지 않았어요 (.env.local / Vercel 환경변수 확인)')
  const n = Math.min(Math.max(Number(count) || 6, 1), 12)

  const hit = cache.get(topic)
  if (hit && Date.now() - hit.at < TTL) return hit.items.slice(0, n)

  const params = new URLSearchParams({
    key: process.env.PIXABAY_API_KEY, q, image_type: 'photo', orientation: 'horizontal',
    safesearch: 'true', order: 'popular', per_page: '40',
  })
  const r = await fetch(`https://pixabay.com/api/?${params}`, { signal: AbortSignal.timeout(10000) })
  if (!r.ok) throw new Error(`Pixabay API 오류 (${r.status})`)
  const data = await r.json()
  // 분위기에 맞지 않는 동물·인물 사진은 거르고, 제주 태그가 붙은 사진을 앞에 둔다
  const BAD = new Set(['animal', 'bird', 'birds', 'cormorant', 'duck', 'dog', 'cat', 'girl', 'woman', 'man', 'men', 'people', 'person', 'portrait', 'child', 'baby', 'selfie', 'model'])
  const good = (data.hits ?? []).filter((h) => !h.tags.toLowerCase().split(/[,\s]+/).some((w) => BAD.has(w)))
  const score = (h) => (/jeju|jejudo/i.test(h.tags) ? 1 : 0)
  const ranked = good.map((h, i) => [h, i]).sort((a, b) => score(b[0]) - score(a[0]) || a[1] - b[1]).map(([h]) => h)
  const items = ranked.slice(0, 12).map((h) => ({
    id: h.id, preview: h.previewURL, thumb: h.webformatURL, large: h.largeImageURL ?? h.webformatURL,
    page: h.pageURL, tags: h.tags, user: h.user,
  }))
  cache.set(topic, { at: Date.now(), items })
  return items.slice(0, n)
}
