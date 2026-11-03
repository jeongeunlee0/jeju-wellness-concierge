import { useEffect, useState } from 'react'
import { Badge, Button, Offcanvas, Spinner } from 'react-bootstrap'
import { fetchGuide } from '../api/client'
import { useAppStore } from '../store/useAppStore'
import Icon from './Icon'
import { VisitJejuPlaceLink } from './Credits'

const cache = new Map()   // 같은 장소를 다시 열 때 바로 보여 주기 (서버도 10분 캐시)
const key = (p) => `${p.name}|${p.lat}|${p.lng}|${p.id ?? ''}`
const NONE = '정보 없음 · 방문 전 확인이 필요해요'
const BASIS = { 날씨: 'info', 공공데이터: 'success', 일반: 'secondary' }
const km = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`)

function Basis({ b }) {
  return <Badge bg={BASIS[b] ?? 'secondary'} className="ms-2 fw-normal basis">{b === '날씨' ? '날씨 기반' : b === '공공데이터' ? '공공데이터' : '일반 안내'}</Badge>
}

function Section({ icon, title, children }) {
  return (
    <section className="guide-sec">
      <h3><span className="guide-ico"><Icon name={icon} size={18} /></span>{title}</h3>
      {children}
    </section>
  )
}

function NearbyList({ items, empty, onAdd, cartNames }) {
  if (!items?.length) return <p className="text-muted small mb-0">{empty}</p>
  return (
    <ul className="list-unstyled m-0 d-grid gap-2">
      {items.map((it) => (
        <li key={it.id ?? it.name} className="near">
          <div className="min-w-0 flex-grow-1">
            <div className="fw-bold text-truncate">{it.name}</div>
            <div className="small text-muted text-truncate">{it.addr}</div>
          </div>
          <Badge bg="light" text="dark" className="border fw-normal flex-shrink-0">{km(it.distM)}</Badge>
          <button type="button" className="icon-btn sm" disabled={cartNames.has(it.name)} onClick={() => onAdd(it)}
            aria-label={`${it.name} ${cartNames.has(it.name) ? '장바구니에 담김' : '장바구니에 담기'}`}>
            <Icon name={cartNames.has(it.name) ? 'check' : 'cart'} size={16} />
          </button>
        </li>
      ))}
    </ul>
  )
}

// 장소 방문 가이드: 지금 날씨에 맞는 옷차림·준비물·주의사항과 주차·운영·주변 맛집·카페·가볼 만한 곳
export default function PlaceGuide() {
  const place = useAppStore((s) => s.guidePlace)
  const close = useAppStore((s) => s.closeGuide)
  const addToCart = useAppStore((s) => s.addToCart)
  const cart = useAppStore((s) => s.cart)
  const [state, setState] = useState({ status: 'idle', data: null, error: '' })

  useEffect(() => {
    if (!place) return undefined
    const k = key(place)
    if (cache.has(k)) { setState({ status: 'ok', data: cache.get(k), error: '' }); return undefined }
    let alive = true
    setState({ status: 'loading', data: null, error: '' })
    fetchGuide(place)
      .then((d) => { cache.set(k, d); if (alive) setState({ status: 'ok', data: d, error: '' }) })
      .catch((e) => alive && setState({ status: 'fail', data: null, error: e.message }))
    return () => { alive = false }
  }, [place])

  const g = place ? state.data : null
  const cartNames = new Set(cart.map((c) => c.name))
  const addNear = (it) => addToCart({ name: it.name, source: 'tour', addr: it.addr, lat: it.lat, lng: it.lng, minutes: it.type === 39 ? 60 : 70 })

  return (
    <Offcanvas show={Boolean(place)} onHide={close} placement="end" className="guide-panel" aria-labelledby="guide-title">
      <Offcanvas.Header>
        <div className="min-w-0">
          <Offcanvas.Title id="guide-title" className="fw-bold text-truncate">{place?.name}</Offcanvas.Title>
          {g && <div className="small text-muted">{g.place.region}{g.place.typeLabel ? ` · ${g.place.typeLabel}` : ''} · 방문 가이드</div>}
        </div>
        <button type="button" className="icon-btn" onClick={close} aria-label="가이드 닫기"><Icon name="close" size={20} /></button>
      </Offcanvas.Header>

      <Offcanvas.Body>
        {state.status === 'loading' && <div className="text-center py-5 text-muted"><Spinner size="sm" className="me-2" />오늘 날씨와 주변 정보를 모으는 중…</div>}
        {state.status === 'fail' && <div className="alert alert-danger" role="alert">{state.error}</div>}

        {g && (
          <>
            {g.now ? (
              <div className="guide-now glass">
                <div className="guide-temp">{g.now.temp}<small>℃</small></div>
                <div className="guide-now-rows">
                  <span>기상청 {g.now.time?.slice(0, 8)} {g.now.time?.slice(-4, -2)}시 예보 · {g.now.locationBasis ?? '지역 예보'}</span>
                  <span><Icon name="thermo" size={15} />{g.now.sky} · 오늘 {g.now.minTemp}~{g.now.maxTemp}℃</span>
                  <span><Icon name="cloud" size={15} />강수확률 {g.now.pop}% · 바람 {g.now.wind}m/s</span>
                  <span><Icon name="sun" size={15} />자외선 {g.uv}{g.air ? ` · 대기질(US AQI) ${g.air.grade}` : ''}</span>
                  <span><Icon name="sunset" size={15} />일출 {g.sun.sunrise} · 일몰 {g.sun.sunset}</span>
                </div>
              </div>
            ) : <div className="alert alert-warning small">날씨 정보를 불러오지 못해 날씨 기반 안내는 건너뛰었어요.</div>}

            {g.outfit && (
              <Section icon="shirt" title="오늘 옷차림">
                <p className="mb-1"><b>체감 약 {g.outfit.feels}℃</b> — {g.outfit.layer}<Basis b="날씨" /></p>
                {g.outfit.extra.length > 0 && <ul className="small text-muted mb-0 ps-3">{g.outfit.extra.map((e) => <li key={e}>{e}</li>)}</ul>}
              </Section>
            )}

            <Section icon="bag" title="준비물">
              <div className="d-flex flex-wrap gap-2">
                {g.bring.map((b) => <span key={b.text} className="chip static">{b.text}<Basis b={b.basis} /></span>)}
              </div>
            </Section>

            <Section icon="alert" title="주의사항">
              {g.caution.length ? (
                <ul className="list-unstyled m-0 d-grid gap-2">
                  {g.caution.map((c) => <li key={c.text} className="note-line">{c.text}<Basis b={c.basis} /></li>)}
                </ul>
              ) : <p className="text-muted small mb-0">오늘 날씨 기준으로 특별히 주의할 점이 없어요.</p>}
            </Section>

            <Section icon="car" title="주차 · 운영 정보">
              <dl className="info-grid">
                <dt>주차</dt><dd>{g.info.parking ?? NONE}{g.info.parkingFee ? ` · ${g.info.parkingFee}` : ''}</dd>
                <dt>이용 시간</dt><dd>{g.info.openHours ?? NONE}</dd>
                <dt>쉬는 날</dt><dd>{g.info.restDay ?? NONE}</dd>
                {g.info.fee && (<><dt>입장료</dt><dd>{g.info.fee}</dd></>)}
                {g.info.spendTime && (<><dt>소요 시간</dt><dd>{g.info.spendTime}</dd></>)}
                {g.info.menu && (<><dt>대표 메뉴</dt><dd>{g.info.menu}</dd></>)}
                {g.info.reservation && (<><dt>예약</dt><dd>{g.info.reservation}</dd></>)}
                <dt>문의</dt><dd>{g.info.phone ?? NONE}</dd>
              </dl>
              <p className="small text-muted mb-0">한국관광공사 공공데이터 기준이며 현장 상황과 다를 수 있어요.</p>
            </Section>

            <Section icon="fork" title="주변 맛집 (3km 이내)">
              <NearbyList items={g.nearby.restaurants} empty="반경 3km 안에 등록된 음식점이 없어요" onAdd={addNear} cartNames={cartNames} />
            </Section>
            <Section icon="cup" title="주변 카페 (3km 이내)">
              <NearbyList items={g.nearby.cafes} empty="반경 3km 안에 등록된 카페가 없어요" onAdd={addNear} cartNames={cartNames} />
            </Section>
            <Section icon="route" title="함께 가보면 좋은 곳 (8km 이내)">
              <NearbyList items={g.nearby.spots} empty="가까운 관광지 정보가 없어요" onAdd={addNear} cartNames={cartNames} />
            </Section>

            {g.tips.length > 0 && (
              <Section icon="spark" title="방문 꿀팁">
                <ul className="list-unstyled m-0 d-grid gap-2">{g.tips.map((t) => <li key={t.text} className="note-line">{t.text}<Basis b={t.basis} /></li>)}</ul>
              </Section>
            )}

            <div className="d-flex flex-wrap gap-2 mt-3">
              {g.links.visitjeju && <a className="btn btn-primary btn-sm" href={g.links.visitjeju} target="_blank" rel="noopener noreferrer"><Icon name="external" size={15} className="me-1" />비짓제주 상세 페이지</a>}
              {!g.links.visitjeju && <VisitJejuPlaceLink name={place.name} className="btn btn-outline-primary btn-sm" />}
              <a className="btn btn-outline-primary btn-sm" href={g.links.map} target="_blank" rel="noopener noreferrer"><Icon name="pin" size={15} className="me-1" />지도에서 보기</a>
              <Button size="sm" variant="outline-secondary" disabled={cartNames.has(place.name)} onClick={() => addToCart({ name: place.name, source: place.id ? 'tour' : 'heritage', lat: place.lat, lng: place.lng, minutes: 60 })}>
                <Icon name={cartNames.has(place.name) ? 'check' : 'cart'} size={15} className="me-1" />{cartNames.has(place.name) ? '담았어요' : '장바구니 담기'}
              </Button>
            </div>

            <p className="small text-muted mt-3 mb-0">
              옷차림·준비물·주의사항은 예보 수치에 정해진 기준을 적용한 안내이고, 의료·안전 조언이 아니에요. 출처:{' '}
              {g.sources.map((s) => `${s.name}${s.ok ? '' : '(실패)'}`).join(' · ')}
            </p>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  )
}
