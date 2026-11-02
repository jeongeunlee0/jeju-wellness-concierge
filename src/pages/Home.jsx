import { lazy, Suspense, useEffect, useState } from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { ping } from '../api/client'
import { ensureUser, isSupabaseReady, supabase } from '../lib/supabase'
import ConditionsBar from '../components/ConditionsBar'
import { Loading } from '../components/Status'
import MoodGallery from '../components/MoodGallery'

const Jeju3D = lazy(() => import('../components/Jeju3D'))

const COMPARE = [
  ['장소 검색 중심', '휴식 목적 중심'],
  ['개별 관광지 추천', '연결된 웰니스 코스'],
  ['인기·평점 중심', '개인의 선호와 상황 반영'],
  ['정보 나열', '추천 이유 설명'],
]

const FLOW = [
  { icon: 'sliders', title: '휴식 선호 입력', text: '목적·동행·위치·시간·실내외 선호' },
  { icon: 'cloud-sun', title: '공공데이터 조회', text: '날씨·대기질·관광·문화 데이터를 에이전트가 직접 확인' },
  { icon: 'stars', title: 'AI 코스 구성', text: '장소와 순서, 그리고 추천 이유까지' },
  { icon: 'bookmark-heart', title: '확인 · 저장', text: '근거를 보고 Supabase에 저장' },
]

// 홈 = 기획 의도 + 3D 히어로 + "동작 체크" 대시보드
export default function Home() {
  const isPhone = typeof window !== "undefined" && window.innerWidth < 768   // 모바일은 3D 영역을 줄여 제목이 바로 보이게
  const [db, setDb] = useState(isSupabaseReady
    ? { state: 'wait', msg: '확인 중...' }
    : { state: 'warn', msg: '.env.local 미설정 — 코스는 이 브라우저에만 저장돼요' })
  const [api, setApi] = useState({ state: 'wait', msg: '확인 중...' })

  useEffect(() => {
    if (isSupabaseReady) ensureUser()
      .then(() => supabase.from('courses').select('id').limit(1))
      .then(({ error }) => setDb(error ? { state: 'fail', msg: error.message } : { state: 'ok', msg: '연결 OK (익명 사용자 · RLS)' }))
      .catch((e) => setDb({ state: 'fail', msg: e.message }))

    ping()
      .then((d) => setApi({
        state: d.hasDataKey && d.hasClaudeKey ? 'ok' : 'warn',
        msg: `서버 함수 OK · 공공데이터 키 ${d.hasDataKey ? '있음' : '없음'} · Claude 키 ${d.hasClaudeKey ? '있음' : '없음'}`,
      }))
      .catch(() => setApi({ state: 'fail', msg: '/api 응답 없음 — npm run dev 또는 vercel dev 로 실행했는지 확인' }))
  }, [])

  return (
    <>
      <section className="hero rounded-4 mb-4">
        <Suspense fallback={<Loading text="3D 제주를 그리는 중…" />}><Jeju3D height={isPhone ? 240 : 440} focusX={isPhone ? 0 : -4.5} /></Suspense>
        <div className="hero-text">
          <div className="eyebrow">Wellness Expertise × Jeju Open Data × AI Agent</div>
          <h1 className="fw-bold">JEJU WELLNESS<br />CONCIERGE</h1>
          <p className="lead mb-3">“지금 나에게 어떤 휴식이 필요한가?”<br />웰니스 전문가의 판단 기준으로, 오늘의 제주 데이터에 맞는 휴식 코스를 설계합니다.</p>
          <Button as={Link} to="/concierge" size="lg" variant="primary"><i className="bi bi-stars me-2" />내 휴식 코스 만들기</Button>
          <div className="mt-3"><ConditionsBar place="제주시" /></div>
        </div>
      </section>

      <Row xs={1} md={2} lg={4} className="g-3 mb-4">
        {FLOW.map((f, i) => (
          <Col key={f.title}>
            <Card className="h-100 feature-card"><Card.Body>
              <i className={`bi bi-${f.icon} fs-2 text-primary`} />
              <div className="fw-bold mt-2">{i + 1}. {f.title}</div>
              <div className="small text-muted">{f.text}</div>
            </Card.Body></Card>
          </Col>
        ))}
      </Row>

      <MoodGallery topic="jeju" />

      <Card className="mb-4"><Card.Body>
        <h5 className="fw-bold mb-3">일반 추천과 무엇이 다른가요?</h5>
        {COMPARE.map(([a, b]) => (
          <Row key={a} className="py-2 border-top align-items-center">
            <Col xs={5} className="text-muted text-decoration-line-through">{a}</Col>
            <Col xs={2} className="text-center text-primary"><i className="bi bi-arrow-right" /></Col>
            <Col xs={5} className="fw-bold">{b}</Col>
          </Row>
        ))}
      </Card.Body></Card>

      <h5 className="fw-bold mb-3"><i className="bi bi-clipboard-check me-2" />동작 체크</h5>
      <Row xs={1} md={3} className="g-3">
        <Col><Check title="React · 라우터" state="ok" msg="이 화면이 보이면 OK" /></Col>
        <Col><Check title="Supabase" {...db} /></Col>
        <Col><Check title="서버 함수 /api" {...api} /></Col>
      </Row>
    </>
  )
}

function Check({ title, state, msg }) {
  const icon = {
    ok: 'check-circle-fill text-success', warn: 'exclamation-circle-fill text-warning',
    fail: 'x-circle-fill text-danger', wait: 'hourglass-split text-muted',
  }[state]
  return (
    <Card className="h-100"><Card.Body>
      <div className="fw-bold mb-1"><i className={`bi bi-${icon} me-2`} />{title}</div>
      <div className="small text-muted">{msg}</div>
    </Card.Body></Card>
  )
}
