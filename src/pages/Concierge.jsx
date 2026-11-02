import { Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import ConditionsBar from '../components/ConditionsBar'
import CourseResult from '../components/CourseResult'
import { useAppStore } from '../store/useAppStore'

const PURPOSES = ['스트레스 해소', '숙면·재충전', '몸 풀기·가벼운 활동', '감정 정리·사색', '미식과 함께하는 휴식']
const COMPANIONS = ['혼자', '연인·부부', '친구', '가족(아이 동반)', '부모님과 함께']
const ENVS = ['상관없음', '실내 중심', '실외 중심']

// 휴식 선호 입력 → 공공데이터 조회 → AI 웰니스 코스 → 저장
export default function Concierge() {
  const { prefs, setPrefs, result, planning, requestCourse, saveCourse } = useAppStore()

  return (
    <>
      <PageHeader icon="stars" title="AI 웰니스 컨시어지" subtitle="지금 나에게 어떤 휴식이 필요한지 알려 주세요. 오늘의 제주 데이터로 코스를 설계합니다." />
      <Row className="g-4">
        <Col lg={5}>
          <Card>
            <Card.Body>
              <Form onSubmit={(e) => { e.preventDefault(); requestCourse() }} className="d-flex flex-column gap-3">
                <Form.Group>
                  <Form.Label className="fw-bold">1. 휴식 목적</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {PURPOSES.map((p) => (
                      <button type="button" key={p} className={`chip ${prefs.purpose === p ? 'active' : ''}`} onClick={() => setPrefs({ purpose: p })}>{p}</button>
                    ))}
                  </div>
                </Form.Group>
                <Row className="g-2">
                  <Col xs={6}>
                    <Form.Label className="fw-bold">2. 동행</Form.Label>
                    <Form.Select value={prefs.companion} onChange={(e) => setPrefs({ companion: e.target.value })}>
                      {COMPANIONS.map((c) => <option key={c}>{c}</option>)}
                    </Form.Select>
                  </Col>
                  <Col xs={6}>
                    <Form.Label className="fw-bold">3. 위치</Form.Label>
                    <Form.Select value={prefs.place} onChange={(e) => setPrefs({ place: e.target.value })}>
                      <option>제주시</option><option>서귀포시</option>
                    </Form.Select>
                  </Col>
                </Row>
                <Form.Group>
                  <Form.Label className="fw-bold">4. 이용 가능 시간: {prefs.hours}시간</Form.Label>
                  <Form.Range min={2} max={8} step={1} value={prefs.hours} onChange={(e) => setPrefs({ hours: Number(e.target.value) })} />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="fw-bold">5. 실내·실외 선호</Form.Label>
                  <div className="d-flex gap-2">
                    {ENVS.map((v) => (
                      <button type="button" key={v} className={`chip ${prefs.env === v ? 'active' : ''}`} onClick={() => setPrefs({ env: v })}>{v}</button>
                    ))}
                  </div>
                </Form.Group>
                <Form.Group>
                  <Form.Label className="fw-bold">추가 요청 (선택)</Form.Label>
                  <Form.Control as="textarea" rows={2} value={prefs.note} placeholder="예: 많이 걷고 싶지 않아요 / 조용한 곳이면 좋아요"
                    onChange={(e) => setPrefs({ note: e.target.value })} />
                </Form.Group>
                <Button type="submit" size="lg" disabled={planning}>
                  {planning ? <><Spinner size="sm" className="me-2" />데이터 확인하며 설계 중…</> : <><i className="bi bi-magic me-2" />웰니스 코스 만들기</>}
                </Button>
              </Form>
            </Card.Body>
          </Card>
          <div className="mt-3"><ConditionsBar place={prefs.place} /></div>
        </Col>

        <Col lg={7}>
          {result
            ? <CourseResult result={result} onSave={saveCourse} />
            : (
              <Card className="h-100 empty-state"><Card.Body className="d-flex flex-column align-items-center justify-content-center text-center text-muted py-5">
                <i className="bi bi-flower2 display-4 mb-3" />
                {planning
                  ? <>날씨·대기질·장소를 확인하고 있어요.<br />보통 10~20초 걸립니다.</>
                  : <>왼쪽에서 조건을 고르면<br />오늘의 제주 데이터로 코스를 설계해 드려요.</>}
              </Card.Body></Card>
            )}
        </Col>
      </Row>
    </>
  )
}
