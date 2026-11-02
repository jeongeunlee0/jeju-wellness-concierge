import { Fragment, lazy, Suspense, useState } from 'react'
import { Alert, Badge, Button, Card } from 'react-bootstrap'
import { Loading } from './Status'
import { VisitJejuLink, VisitJejuPlaceLink } from './Credits'
import { VISITJEJU } from '../lib/visitjeju'
import { driveMinutes, haversineKm } from '../lib/geo'
import Icon from './Icon'
import { useAppStore } from '../store/useAppStore'

const Jeju3D = lazy(() => import('./Jeju3D'))

const TOOL_LABEL = {
  get_weather: '기상청 날씨', get_air_quality: 'Open-Meteo 대기질',
  search_tour_places: '한국관광공사 관광정보', search_heritage: '국가유산청',
}
// 휴식 목적 → 색면과 아이콘
const MOOD = {
  '스트레스 해소': { cls: 'mood-forest', icon: 'leaf' },
  '숙면·재충전': { cls: 'mood-dusk', icon: 'cloud' },
  '몸 풀기·가벼운 활동': { cls: 'mood-oreum', icon: 'pin' },
  '감정 정리·사색': { cls: 'mood-sea', icon: 'compass' },
  '미식과 함께하는 휴식': { cls: 'mood-tea', icon: 'spark' },
}

function MoodHeader({ purpose }) {
  const m = MOOD[purpose] ?? MOOD['스트레스 해소']
  return (
    <div className={`mood-art ${m.cls}`} aria-hidden="true">
      <Icon name={m.icon} size={40} />
      <span>{purpose}</span>
    </div>
  )
}

const mapUrl = (s) => `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`

// 두 장소 사이: 직선거리와 차량 이동시간(추정)
function Leg({ from, to }) {
  if (!(from?.lat && from?.lng && to?.lat && to?.lng)) return null
  const km = haversineKm(from, to)
  return (
    <li className="course-leg" aria-label={`다음 장소까지 직선 ${km.toFixed(1)}킬로미터`}>
      <Icon name="car" size={15} />
      <span>다음 장소까지 직선 {km.toFixed(1)}km · 차로 약 {driveMinutes(km)}분 <small>(추정)</small></span>
    </li>
  )
}

// 추천 코스: 요약 + 3D 동선 + 장소별 카드(이유·방문 가이드·지도·담기) + 분석에 쓴 데이터
export default function CourseResult({ result, onSave, showMap = true, purpose }) {
  const [copied, setCopied] = useState(false)
  const addToCart = useAppStore((st) => st.addToCart)
  const openGuide = useAppStore((st) => st.openGuide)
  const cart = useAppStore((st) => st.cart)
  const { course, steps = [], generatedAt, raw, mode } = result
  if (!course) return <Alert variant="warning">{raw ?? '코스를 만들지 못했어요. 다시 시도해 주세요.'}</Alert>
  const total = course.stops.reduce((a, s) => a + (Number(s.minutes) || 0), 0)
  const inCart = (name) => cart.some((c) => c.name === name)

  async function copy() {
    const text = [course.summary, ...course.stops.map((s, i) => `${i + 1}. ${s.name} (${s.minutes}분) - ${s.reason}`), course.notes].filter(Boolean).join('\n')
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* 클립보드 권한이 없으면 무시 */ }
  }

  return (
    <div className="d-flex flex-column gap-3">
      {mode === 'rules' && (
        <Alert variant="info" className="mb-0 small" role="status">
          <Icon name="info" size={16} className="me-1" />지금은 AI 컨시어지를 쓸 수 없어, 공공데이터를 바탕으로 한 <b>기본 추천</b>이에요.
        </Alert>
      )}
      <Card className="course-summary glass overflow-hidden">
        {purpose && <MoodHeader purpose={purpose} />}
        <Card.Body>
          <div className="small text-muted mb-1">약 {Math.floor(total / 60) ? `${Math.floor(total / 60)}시간 ` : ''}{total % 60 ? `${total % 60}분` : ''} · {course.stops.length}곳</div>
          <h2 className="h4 fw-bold mb-2">{course.summary}</h2>
          {course.conditions && <p className="small mb-0"><Icon name="cloud" size={15} className="me-1" />{course.conditions}</p>}
        </Card.Body>
      </Card>

      {showMap && (
        <div className="map-frame">
          {/* 코스가 바뀌면 카메라를 다시 맞추도록 key 로 3D 장면을 새로 만든다 */}
          <Suspense fallback={<Loading text="지도를 그리는 중…" />}>
            <Jeju3D key={course.stops.map((s) => s.name).join('|')} stops={course.stops} height={340} />
          </Suspense>
        </div>
      )}

      <ol className="course-list list-unstyled mb-0">
        {course.stops.map((s, i) => (
          <Fragment key={i}>
            <li className="course-stop glass">
              <span className="course-num">{i + 1}</span>
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <h3 className="h6 fw-bold mb-0">{s.name}</h3>
                  <Badge bg="light" text="dark" className="border fw-normal"><Icon name="clock" size={12} className="me-1" />{s.minutes}분</Badge>
                  {s.verified
                    ? <Badge bg="success" className="fw-normal"><Icon name="shield" size={12} className="me-1" />실제 데이터 확인</Badge>
                    : <Badge bg="warning" text="dark" className="fw-normal">확인 필요</Badge>}
                </div>
                {s.addr && <div className="small text-muted">{s.addr}</div>}
                <p className="mt-1 mb-2">{s.reason}</p>
                <div className="stop-actions">
                  {s.lat && s.lng && (
                    <button type="button" className="act primary" onClick={() => openGuide({ name: s.name, lat: s.lat, lng: s.lng, id: s.id, type: s.type })}>
                      <Icon name="info" size={15} />방문 가이드
                    </button>
                  )}
                  {s.verified && s.lat && s.lng && <a className="act" href={mapUrl(s)} target="_blank" rel="noopener noreferrer"><Icon name="pin" size={15} />지도</a>}
                  <VisitJejuPlaceLink name={s.name} className="act" />
                  <button type="button" className="act" disabled={inCart(s.name)} onClick={() => addToCart({ name: s.name, source: 'course', addr: s.addr, lat: s.lat, lng: s.lng, minutes: s.minutes })}>
                    <Icon name={inCart(s.name) ? 'check' : 'cart'} size={15} />{inCart(s.name) ? '담았어요' : '담기'}
                  </button>
                </div>
              </div>
            </li>
            {i < course.stops.length - 1 && <Leg from={s} to={course.stops[i + 1]} />}
          </Fragment>
        ))}
      </ol>

      {course.notes && <p className="small text-muted mb-0"><Icon name="info" size={14} className="me-1" />{course.notes}</p>}

      {/* 과제 필수 확인 항목: 에이전트가 호출한 도구 목록을 화면에 보여 준다 (기본으로 펼침) */}
      <details className="data-used small" open>
        <summary>{mode === 'rules' ? `추천에 쓴 데이터 (${steps.length})` : `AI 에이전트가 호출한 도구 (${steps.length})`}</summary>
        <div className="mt-2">
          {steps.map((s, i) => (
            <Badge key={i} bg={s.error ? 'danger' : 'secondary'} className="me-1 mb-1 fw-normal" title={JSON.stringify(s.args)}>
              {TOOL_LABEL[s.tool] ?? s.tool} · {s.error ? '오류' : `${s.count}건`}
            </Badge>
          ))}
          {generatedAt && <div className="text-muted mt-1">조회 시점 {new Date(generatedAt).toLocaleString('ko-KR')} · 휴식 선호에 맞춘 제안이며 의료적 조언이 아니에요.</div>}
        </div>
      </details>

      <div className="d-flex flex-wrap gap-2">
        {onSave && <Button variant="primary" onClick={onSave}><Icon name="bookmark" size={18} className="me-1" />코스 저장</Button>}
        <Button variant="outline-primary" onClick={copy}><Icon name={copied ? 'check' : 'copy'} size={18} className="me-1" />{copied ? '복사했어요' : '코스 복사'}</Button>
        <VisitJejuLink href={VISITJEJU.wellness}>비짓제주 웰니스 여행</VisitJejuLink>
      </div>
    </div>
  )
}
