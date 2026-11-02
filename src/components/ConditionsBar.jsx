import { useEffect, useState } from 'react'
import { Badge, Spinner } from 'react-bootstrap'
import { fetchAir, fetchWeather } from '../api/client'

const SKY_ICON = { 맑음: 'sun', 구름많음: 'cloud-sun', 흐림: 'clouds' }
const AIR_BG = { 좋음: 'success', 보통: 'info', '민감군 주의': 'warning', 나쁨: 'danger' }

// 오늘의 제주 컨디션 = 기상청(날씨) + Open-Meteo(대기질·자외선) 두 API 를 한 줄로
export default function ConditionsBar({ place = '제주시' }) {
  const [w, setW] = useState({ state: 'wait', place })
  const [air, setAir] = useState({ state: 'wait' })

  useEffect(() => {
    let active=true
    fetchWeather(place)
      .then((l) => active && setW(l[0] ? { state: 'ok', d: l[0], place } : { state: 'fail', place, msg: '예보 데이터가 비어 있어요 (키 승인 대기 또는 발표 직후)' }))
      .catch((e) => active && setW({ state: 'fail', msg: e.message }))
    fetchAir(place).then((d) => active && setAir({ state: 'ok', d, place })).catch((e) => active && setAir({ state: 'fail', msg: e.message }))
    return ()=>{active=false}
  }, [place])

  return (
    <div className="d-flex flex-wrap gap-2 align-items-center">
      {(w.place !== place || w.state === 'wait') && <Spinner size="sm" />}
      {w.state === 'fail' && <Badge bg="secondary" title={w.msg} className="fw-normal"><i className="bi bi-cloud-slash me-1" />날씨 정보 없음</Badge>}
      {w.place === place && w.state === 'ok' && (
        <Badge bg="light" text="dark" className="fs-6 fw-normal border">
          <i className={`bi bi-${w.d.rain !== '없음' ? 'cloud-rain' : SKY_ICON[w.d.sky] ?? 'cloud'} me-1`} />
          {place} {w.d.temp}℃ {w.d.sky} · 강수 {w.d.pop}%
        </Badge>
      )}
      {air.state === 'fail' && <Badge bg="secondary" title={air.msg} className="fw-normal">대기질 정보 없음</Badge>}
      {air.place === place && air.state === 'ok' && (
        <>
          <Badge bg={AIR_BG[air.d.grade] ?? 'secondary'} className="fs-6 fw-normal">
            <i className="bi bi-wind me-1" />공기 {air.d.grade} (모델) · PM2.5 {Math.round(air.d.pm25)}μg/m³
          </Badge>
          <Badge bg="light" text="dark" className="fs-6 fw-normal border"><i className="bi bi-brightness-high me-1" />자외선 {air.d.uv}</Badge>
        </>
      )}
    </div>
  )
}
