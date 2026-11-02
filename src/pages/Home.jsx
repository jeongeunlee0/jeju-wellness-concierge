import { lazy, Suspense, useEffect } from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ConditionsBar from '../components/ConditionsBar'
import { Loading } from '../components/Status'
import Icon from '../components/Icon'
import WellnessTopics from '../components/WellnessTopics'
import { VisitJejuLink } from '../components/Credits'
import { VISITJEJU } from '../lib/visitjeju'
import { useAppStore } from '../store/useAppStore'
import HealthStrip from '../components/HealthStrip'

const Jeju3D = lazy(() => import('../components/Jeju3D'))

const START = [
  { to: '/concierge', icon: 'spark', title: '코스 만들기', text: '휴식 목적과 시간에 맞는 하루 코스를 만들어 드려요' },
  { to: '/places', icon: 'leaf', title: '장소 찾기', text: '숲·해변·카페 등 웰니스 장소를 찾고 방문 가이드를 확인해요' },
  { to: '/wellness', icon: 'compass', title: '비짓제주 웰니스', text: '공식 관광정보 포털의 웰니스 여행 정보로 이어가요' },
]

const STEPS = [
  { icon: 'sliders', title: '선호 선택', text: '목적·동행·지역·시간' },
  { icon: 'cloud', title: '오늘 데이터 확인', text: '날씨·대기질·관광 정보' },
  { icon: 'route', title: '코스 추천', text: '장소·순서·이동거리' },
  { icon: 'bookmark', title: '저장·장바구니', text: '담아 두고 이어서 보기' },
]

const ago = (iso) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  return s < 3600 ? `${Math.max(1, Math.floor(s / 60))}분 전` : s < 86400 ? `${Math.floor(s / 3600)}시간 전` : `${Math.floor(s / 86400)}일 전`
}

export default function Home() {
  const isPhone = typeof window !== 'undefined' && window.innerWidth < 768
  const { guestbook, loadGuestbook } = useAppStore()
  useEffect(() => { loadGuestbook() }, [loadGuestbook])

  return (
    <>
      <section className="hero rounded-4 mb-4">
        <Suspense fallback={<Loading text="지도를 그리는 중…" />}><Jeju3D height={isPhone ? 240 : 500} focusX={isPhone ? 0 : -4.5} /></Suspense>
        <div className="hero-text glass">
          <h1 className="fw-bold">오늘의 제주에<br />맞는 휴식 코스</h1>
          <p className="lead mb-3">날씨·대기질·관광 데이터를 확인해 지금 나에게 맞는 웰니스 코스를 만들어 드려요.</p>
          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to="/concierge" size="lg" variant="primary"><Icon name="spark" size={20} className="me-2" />코스 만들기</Button>
            <Button as={Link} to="/places" size="lg" variant="outline-primary"><Icon name="leaf" size={20} className="me-2" />장소 찾기</Button>
          </div>
          <div className="mt-3"><ConditionsBar place="제주시" /></div>
        </div>
      </section>

      <Row xs={1} md={3} className="g-3 mb-4">
        {START.map((f) => (
          <Col key={f.to}>
            <Card as={Link} to={f.to} className="h-100 feature-card text-decoration-none">
              <Card.Body>
                <span className="feature-icon"><Icon name={f.icon} size={26} /></span>
                <div className="fw-bold mt-2">{f.title}</div>
                <div className="small text-muted">{f.text}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <section className="mb-4" aria-labelledby="how-h">
        <h2 id="how-h" className="h5 fw-bold mb-3">이용 방법</h2>
        <ol className="steps-row list-unstyled m-0">
          {STEPS.map((s, i) => (
            <li key={s.title} className="glass step">
              <span className="step-no">{i + 1}</span>
              <Icon name={s.icon} size={22} />
              <div><b>{s.title}</b><span>{s.text}</span></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-4" aria-labelledby="vj-h">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
          <h2 id="vj-h" className="h5 fw-bold mb-0">비짓제주 웰니스 여행</h2>
          <VisitJejuLink href={VISITJEJU.wellness}>웰니스 공식 페이지</VisitJejuLink>
        </div>
        <WellnessTopics compact />
      </section>

      {guestbook.length > 0 && (
        <section className="mb-2" aria-labelledby="gb-h">
          <div className="d-flex justify-content-between align-items-end mb-3">
            <h2 id="gb-h" className="h5 fw-bold mb-0">최근 방명록</h2>
            <Link to="/guestbook" className="small fw-bold">전체 보기</Link>
          </div>
          <Row xs={1} md={3} className="g-3">
            {guestbook.slice(0, 3).map((g) => (
              <Col key={g.id}>
                <div className="glass gb-item h-100 mb-0">
                  <div className="d-flex justify-content-between small"><b>{g.nickname}</b><span className="text-muted">{ago(g.created_at)}</span></div>
                  {g.place && <div className="small text-muted"><Icon name="pin" size={12} className="me-1" />{g.place}</div>}
                  <p className="gb-msg small mb-0">{g.message.length > 90 ? `${g.message.slice(0, 90)}…` : g.message}</p>
                </div>
              </Col>
            ))}
          </Row>
        </section>
      )}

      <HealthStrip />
    </>
  )
}
