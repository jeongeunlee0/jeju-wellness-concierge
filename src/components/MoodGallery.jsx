import { useImages } from '../lib/useImages'
import { PixabayCredit, VisitJejuLink } from './Credits'
import PixImg from './PixImg'

// 홈의 사진 갤러리 — Pixabay API 로 제주 분위기 사진을 보여줍니다 (실제 추천 장소 사진이 아님을 표기)
export default function MoodGallery({ topic = 'jeju' }) {
  const { items, error } = useImages(topic, 6)
  if (error) return null            // 이미지 API 가 실패해도 화면은 정상 (장식 요소)
  return (
    <section className="mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <div>
          <h5 className="fw-bold mb-0">제주의 쉼표 같은 풍경</h5>
          <PixabayCredit />
        </div>
        <VisitJejuLink>비짓제주 공식 관광정보</VisitJejuLink>
      </div>
      <div className="gallery">
        {items.map((p, i) => (
          <a key={p.id} className={`gallery-item g${i}`} href={p.page} target="_blank" rel="noopener noreferrer" title={p.tags}>
            <PixImg photo={p} alt={`제주 분위기 사진: ${p.tags}`} loading="lazy" />
          </a>
        ))}
        {items.length === 0 && Array.from({ length: 6 }, (_, i) => <div key={i} className={`gallery-item g${i} skeleton`} />)}
      </div>
    </section>
  )
}
