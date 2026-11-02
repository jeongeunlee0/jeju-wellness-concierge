import { lazy, Suspense } from 'react'
import { Alert, Badge, Button, Card } from 'react-bootstrap'
import { Loading } from './Status'

const Jeju3D = lazy(() => import('./Jeju3D'))

const TOOL_LABEL = {
  get_weather: '기상청 날씨', get_air_quality: 'Open-Meteo 대기질',
  search_tour_places: '한국관광공사 TourAPI', search_heritage: '국가유산청',
}

// 에이전트가 만든 코스: 3D 동선 + 단계별 추천 이유 + 근거(호출한 도구·조회 시점)
export default function CourseResult({ result, onSave, showMap = true }) {
  const { course, steps = [], generatedAt, raw } = result
  if (!course) return <Alert variant="warning">{raw ?? '코스를 만들지 못했어요. 다시 시도해 주세요.'}</Alert>
  const total = course.stops.reduce((a, s) => a + (Number(s.minutes) || 0), 0)

  return (
    <div className="d-flex flex-column gap-3">
      <Card className="course-summary">
        <Card.Body>
          <div className="small text-uppercase text-muted mb-1">추천 코스 · 약 {total}분</div>
          <h4 className="fw-bold mb-2">{course.summary}</h4>
          {course.conditions && <div className="small"><i className="bi bi-cloud-sun me-1" />{course.conditions}</div>}
        </Card.Body>
      </Card>

      {showMap && (
        <div className="map-frame">
          <Suspense fallback={<Loading text="3D 제주를 그리는 중…" />}>
            <Jeju3D stops={course.stops} height={360} />
          </Suspense>
        </div>
      )}

      <ol className="course-list list-unstyled mb-0">
        {course.stops.map((s, i) => (
          <li key={i} className="course-stop">
            <span className="course-num">{i + 1}</span>
            <div>
              <div className="fw-bold">
                {s.name}
                <Badge bg="light" text="dark" className="ms-2 border fw-normal">{s.minutes}분</Badge>
                {s.verified
                  ? <Badge bg="success" className="ms-1 fw-normal"><i className="bi bi-patch-check me-1" />API 확인</Badge>
                  : <Badge bg="warning" text="dark" className="ms-1 fw-normal">확인 필요</Badge>}
              </div>
              {s.addr && <div className="small text-muted">{s.addr}</div>}
              <div className="mt-1">{s.reason}</div>
            </div>
          </li>
        ))}
      </ol>

      {course.notes && <Alert variant="light" className="border mb-0 small"><i className="bi bi-info-circle me-1" />{course.notes}</Alert>}

      <div className="small text-muted">
        <i className="bi bi-tools me-1" />에이전트가 호출한 도구:{' '}
        {steps.map((s, i) => (
          <Badge key={i} bg={s.error ? 'danger' : 'secondary'} className="me-1 fw-normal" title={JSON.stringify(s.args)}>
            {TOOL_LABEL[s.tool] ?? s.tool} → {s.error ? '오류' : `${s.count}건`}
          </Badge>
        ))}
        {generatedAt && <div className="mt-1">조회 시점 {new Date(generatedAt).toLocaleString('ko-KR')} · 휴식 선호에 맞춘 제안이며 의료적 조언이 아닙니다.</div>}
      </div>

      {onSave && <Button variant="primary" className="align-self-start" onClick={onSave}><i className="bi bi-bookmark-heart me-1" />이 코스 저장하기</Button>}
    </div>
  )
}
