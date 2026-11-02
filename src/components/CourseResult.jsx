import { lazy, Suspense, useState } from 'react'
import { Alert, Badge, Button, Card } from 'react-bootstrap'
import { Loading } from './Status'
import { PixabayCredit, VisitJejuLink } from './Credits'
import { useImages } from '../lib/useImages'
import PixImg from './PixImg'
import Icon from './Icon'
import { useAppStore } from '../store/useAppStore'

const Jeju3D = lazy(() => import('./Jeju3D'))

const TOOL_LABEL = {
  get_weather: '기상청 날씨', get_air_quality: 'Open-Meteo 대기질',
  search_tour_places: '한국관광공사 TourAPI', search_heritage: '국가유산청',
}
// 휴식 목적 → Pixabay 분위기 사진 주제
const MOOD = { '스트레스 해소': 'forest', '숙면·재충전': 'sunset', '몸 풀기·가벼운 활동': 'oreum', '감정 정리·사색': 'sea', '미식과 함께하는 휴식': 'tea' }

function MoodHeader({ purpose }) {
  const { items } = useImages(MOOD[purpose] ?? 'jeju', 3)
  if (!items.length) return null
  return (
    <div className="mood-header">
      <PixImg photo={items[0]} large alt={`분위기 참고 이미지: ${items[0].tags}`} />
      <PixabayCredit className="mood-credit" />
    </div>
  )
}

const mapUrl = (s) => `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`

// 에이전트가 만든 코스: 분위기 사진 + 3D 동선 + 단계별 추천 이유 + 근거(호출한 도구·조회 시점)
export default function CourseResult({ result, onSave, showMap = true, purpose }) {
  const [copied, setCopied] = useState(false)
  const addToCart = useAppStore((st) => st.addToCart)
  const cart = useAppStore((st) => st.cart)
  const { course, steps = [], generatedAt, raw, mode } = result
  if (!course) return <Alert variant="warning">{raw ?? '코스를 만들지 못했어요. 다시 시도해 주세요.'}</Alert>
  const total = course.stops.reduce((a, s) => a + (Number(s.minutes) || 0), 0)

  async function copy() {
    const text = [course.summary, ...course.stops.map((s, i) => `${i + 1}. ${s.name} (${s.minutes}분) - ${s.reason}`), course.notes].filter(Boolean).join('\n')
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* 클립보드 권한이 없으면 무시 */ }
  }

  return (
    <div className="d-flex flex-column gap-3">
      {mode === 'rules' && (
        <Alert variant="info" className="mb-0 small" role="status">
          <Icon name="shield" size={16} className="me-1" /><b>AI 없이 만든 기본 추천</b>이에요. 지금은 AI 컨시어지를 쓸 수 없어, 같은 공공데이터(날씨·대기질·관광·국가유산)에서 정해진 규칙으로 골랐어요. 장소는 모두 실제 데이터에 있는 곳입니다.
        </Alert>
      )}
      <Card className="course-summary glass overflow-hidden">
        {purpose && <MoodHeader purpose={purpose} />}
        <Card.Body>
          <div className="small text-uppercase text-muted mb-1">추천 코스 · 약 {total}분 · {course.stops.length}곳</div>
          <h4 className="fw-bold mb-2">{course.summary}</h4>
          {course.conditions && <div className="small"><i className="bi bi-cloud-sun me-1" />{course.conditions}</div>}
        </Card.Body>
      </Card>

      {showMap && (
        <div className="map-frame">
          {/* 코스가 바뀌면 카메라를 다시 맞추도록 key 로 3D 장면을 새로 만든다 */}
          <Suspense fallback={<Loading text="3D 제주를 그리는 중…" />}>
            <Jeju3D key={course.stops.map((s) => s.name).join('|')} stops={course.stops} height={360} />
          </Suspense>
        </div>
      )}

      <ol className="course-list list-unstyled mb-0">
        {course.stops.map((s, i) => (
          <li key={i} className="course-stop">
            <span className="course-num">{i + 1}</span>
            <div className="flex-grow-1">
              <div className="fw-bold">
                {s.name}
                <Badge bg="light" text="dark" className="ms-2 border fw-normal">{s.minutes}분</Badge>
                {s.verified
                  ? <Badge bg="success" className="ms-1 fw-normal"><i className="bi bi-patch-check me-1" />API 확인</Badge>
                  : <Badge bg="warning" text="dark" className="ms-1 fw-normal">확인 필요</Badge>}
              </div>
              {s.addr && <div className="small text-muted">{s.addr}</div>}
              <div className="mt-1">{s.reason}</div>
              {s.verified && s.lat && s.lng && (
                <a className="small me-3" href={mapUrl(s)} target="_blank" rel="noopener noreferrer"><Icon name="pin" size={14} className="me-1" />지도에서 보기</a>
              )}
              <button type="button" className="btn btn-sm btn-link p-0 stop-cart" disabled={cart.some((c) => c.name === s.name)}
                onClick={() => addToCart({ name: s.name, source: 'course', addr: s.addr, lat: s.lat, lng: s.lng, minutes: s.minutes })}>
                <Icon name={cart.some((c) => c.name === s.name) ? 'check' : 'cart'} size={14} className="me-1" />{cart.some((c) => c.name === s.name) ? '담았어요' : '장바구니 담기'}
              </button>
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

      <div className="d-flex flex-wrap gap-2">
        {onSave && <Button variant="primary" onClick={onSave}><Icon name="bookmark" size={18} className="me-1" />이 코스 저장하기</Button>}
        <Button variant="outline-primary" onClick={copy}><Icon name={copied ? 'check' : 'copy'} size={18} className="me-1" />{copied ? '복사했어요' : '코스 복사'}</Button>
        <VisitJejuLink>비짓제주 공식 정보</VisitJejuLink>
      </div>
    </div>
  )
}
