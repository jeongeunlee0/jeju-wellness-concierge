import { useEffect, useState } from 'react'
import { Badge, Spinner } from 'react-bootstrap'
import { fetchWeather } from '../api/client'

const ICON = { 맑음: 'sun', 구름많음: 'cloud-sun', 흐림: 'clouds' }

export default function WeatherBadge({ place = '제주시' }) {
  const [w, setW] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchWeather(place).then((list) => {
      if (!active) return
      setError(list.length ? '' : '표시할 예보가 없습니다.')
      setW(list[0] ?? null)
    }).catch((e) => { if (active) setError(e.message) })
    return () => { active = false }
  }, [place])

  if (error) return <Badge bg="secondary" className="text-wrap text-start">{error}</Badge>
  if (!w) return <Spinner size="sm" />
  const icon = w.rain !== '없음' ? 'cloud-rain' : ICON[w.sky] ?? 'cloud'
  return (
    <Badge bg="light" text="dark" className="fs-6 fw-normal">
      <i className={`bi bi-${icon} me-1`} />{place} {w.temp}℃ {w.sky} · 강수 {w.pop}%
    </Badge>
  )
}
