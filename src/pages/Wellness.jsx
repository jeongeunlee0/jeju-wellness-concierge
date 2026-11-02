import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import WellnessTopics from '../components/WellnessTopics'
import { VisitJejuPlaceLink } from '../components/Credits'
import { useAppStore } from '../store/useAppStore'

// 비짓제주 웰니스 여행: 공식 포털의 웰니스 콘텐츠로 연결하고, 내 코스·장바구니의 장소를 비짓제주에서 이어서 찾아보게 합니다.
export default function Wellness() {
  const { cart, courses, loadCart, loadCourses } = useAppStore()
  useEffect(() => { loadCart(); loadCourses() }, [loadCart, loadCourses])

  const latest = courses[0]
  const stops = latest?.course?.stops ?? []
  const names = [...new Set([...cart.map((c) => c.name), ...stops.map((s) => s.name)])].slice(0, 12)

  return (
    <>
      <PageHeader icon="compass" title="비짓제주" subtitle="제주관광공사 공식 포털 비짓제주의 웰니스 정보로 이어서 계획해요" />

      <section className="mb-4" aria-labelledby="topics-h">
        <h2 id="topics-h" className="h5 fw-bold mb-3">웰니스 여행 입구</h2>
        <WellnessTopics />
        <p className="small text-muted mt-2 mb-0">
          링크를 누르면 비짓제주가 새 창으로 열려요. 사진과 소개글은 비짓제주의 자료이므로 이 앱에 복사하지 않고, 원문 사이트에서 확인하도록 연결만 합니다.
        </p>
      </section>

      <section className="mb-4" aria-labelledby="mine-h">
        <h2 id="mine-h" className="h5 fw-bold mb-3">내 코스·장바구니 장소를 비짓제주에서 찾아보기</h2>
        {names.length === 0 ? (
          <div className="glass p-4 text-center" style={{ borderRadius: '1.2rem' }}>
            <p className="mb-3 text-muted">아직 담거나 저장한 장소가 없어요. 코스를 만들거나 장소를 담으면 여기에서 바로 비짓제주 검색으로 이어져요.</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <Link to="/concierge" className="btn btn-primary"><Icon name="spark" size={18} className="me-1" />AI 코스 만들기</Link>
              <Link to="/places" className="btn btn-outline-primary"><Icon name="leaf" size={18} className="me-1" />장소 둘러보기</Link>
            </div>
          </div>
        ) : (
          <ul className="list-unstyled m-0 d-grid gap-2">
            {names.map((n) => (
              <li key={n} className="glass cart-item">
                <span className="cart-source"><Icon name="pin" size={22} /></span>
                <div className="flex-grow-1 min-w-0 fw-bold text-truncate">{n}</div>
                <VisitJejuPlaceLink name={n} />
              </li>
            ))}
          </ul>
        )}
      </section>

    </>
  )
}
