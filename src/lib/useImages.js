import { useEffect, useState } from 'react'
import { fetchImages } from '../api/client'

// 주제별 이미지를 한 번만 불러와 앱 전체가 공유합니다 (서버도 24시간 캐시)
const cache = new Map()

export function useImages(topic, count = 6) {
  const [state, setState] = useState(() => ({ items: cache.get(topic) ?? [], error: '' }))

  useEffect(() => {
    if (cache.has(topic)) return setState({ items: cache.get(topic), error: '' })
    let alive = true
    fetchImages(topic, 12)
      .then((items) => { cache.set(topic, items); if (alive) setState({ items, error: '' }) })
      .catch((e) => alive && setState({ items: [], error: e.message }))
    return () => { alive = false }
  }, [topic])

  return { items: state.items.slice(0, count), error: state.error }
}
