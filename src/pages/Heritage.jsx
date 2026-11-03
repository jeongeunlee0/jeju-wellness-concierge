import { useEffect, useState } from 'react'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import ItemCard from '../components/ItemCard'
import { Empty, ErrorAlert, Loading } from '../components/Status'
import { fetchHeritage } from '../api/client'
import { useAppStore } from '../store/useAppStore'
import Icon from '../components/Icon'
import HeritageArt from '../components/HeritageArt'

export default function Heritage() {
  const addToCart = useAppStore((s) => s.addToCart)
  const openGuide = useAppStore((s) => s.openGuide)
  const cart = useAppStore((s) => s.cart)
  const [keyword, setKeyword] = useState('')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function search(e) {
    e?.preventDefault()
    setLoading(true); setError('')
    try { setList(await fetchHeritage(keyword)) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { search() }, [])

  return (
    <>
      <PageHeader icon="landmark" title="문화·유산" subtitle="조용히 거닐며 제주의 시간을 느낄 수 있는 국가유산" />
      <Form onSubmit={search} className="mb-4">
        <InputGroup>
          <Form.Control value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="예: 관덕정, 성읍, 향교" />
          <Button type="submit" aria-label="검색"><Icon name="arrow" size={18} /></Button>
        </InputGroup>
      </Form>
      <ErrorAlert error={error} />
      {loading ? <Loading /> : list.length === 0 ? <Empty /> : (
        <Row xs={1} sm={2} lg={3} className="g-3">
          {list.map((h, i) => (
            <Col key={i}><ItemCard title={h.name} subtitle={h.city} badge={h.kind} art="landmark" illustration={<HeritageArt kind={h.kind} />}
                onGuide={h.lat && h.lng ? () => openGuide({ name: h.name, lat: Number(h.lat), lng: Number(h.lng) }) : undefined}
                onAddCart={() => addToCart({ name: h.name, source: 'heritage', addr: h.city, lat: h.lat, lng: h.lng, minutes: 40 })}
                inCart={cart.some((c) => c.source === 'heritage' && c.name === h.name)} /></Col>
          ))}
        </Row>
      )}
    </>
  )
}
