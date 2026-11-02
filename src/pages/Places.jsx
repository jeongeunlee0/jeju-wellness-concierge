import { useEffect, useState } from 'react'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import ItemCard from '../components/ItemCard'
import { Empty, ErrorAlert, Loading } from '../components/Status'
import { fetchPlaces } from '../api/client'
import { useAppStore } from '../store/useAppStore'
import Icon from '../components/Icon'

const TYPES = { 12: '관광지', 14: '문화시설', 15: '축제·행사', 39: '음식점' }
const ART = { 12: 'leaf', 14: 'landmark', 15: 'spark', 39: 'pin' }
const QUICK = ['스파', '온천', '숲', '해변', '산책', '카페', '명상', '오름']

export default function Places() {
  const addToCart = useAppStore((s) => s.addToCart)
  const openGuide = useAppStore((s) => s.openGuide)
  const cart = useAppStore((s) => s.cart)
  const [keyword, setKeyword] = useState('숲')
  const [type, setType] = useState('12')
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function search(e, kw = keyword) {
    e?.preventDefault()
    setLoading(true); setError('')
    try { setPlaces(await fetchPlaces(kw, type)) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { search() }, [])

  return (
    <>
      <PageHeader icon="leaf" title="장소 찾기" subtitle="휴식 키워드로 제주의 장소를 찾고, 방문 전 날씨별 옷차림과 주차 정보를 확인하세요" />
      <Form onSubmit={search} className="mb-2">
        <InputGroup>
          <Form.Select value={type} onChange={(e) => setType(e.target.value)} style={{ maxWidth: 140 }}>
            {Object.entries(TYPES).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </Form.Select>
          <Form.Control value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="예: 스파, 숲, 해변" />
          <Button type="submit" aria-label="검색"><Icon name="arrow" size={18} /></Button>
        </InputGroup>
      </Form>
      <div className="d-flex flex-wrap gap-2 mb-4">
        {QUICK.map((q) => <button key={q} className="chip" onClick={() => { setKeyword(q); search(null, q) }}>{q}</button>)}
      </div>
      <ErrorAlert error={error} />
      {loading ? <Loading /> : places.length === 0 ? <Empty /> : (
        <Row xs={1} sm={2} lg={3} className="g-3">
          {places.map((p) => (
            <Col key={p.id}>
              <ItemCard title={p.title} subtitle={p.addr} image={p.image} badge={TYPES[p.type]} art={ART[p.type] ?? 'leaf'}
                onGuide={() => openGuide({ name: p.title, lat: Number(p.lat), lng: Number(p.lng), id: p.id, type: p.type })}
                onAddCart={() => addToCart({ name: p.title, source: 'tour', addr: p.addr, lat: p.lat, lng: p.lng, minutes: p.type === '39' ? 60 : 70 })}
                inCart={cart.some((c) => c.source === 'tour' && c.name === p.title)} />
            </Col>
          ))}
        </Row>
      )}
    </>
  )
}
