import { useEffect, useState } from 'react'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import ItemCard from '../components/ItemCard'
import { Empty, ErrorAlert, Loading } from '../components/Status'
import { fetchHeritage } from '../api/client'

export default function Heritage() {
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
  useEffect(() => { let active=true; fetchHeritage().then(data=>{if(active) setList(data)}).catch(err=>{if(active)setError(err.message)}).finally(()=>{if(active)setLoading(false)});return ()=>{active=false} }, [])

  return (
    <>
      <PageHeader icon="bank" title="문화·유산" subtitle="국가유산청 오픈API — 조용히 거닐며 제주의 시간을 느끼는 코스의 재료" />
      <Form onSubmit={search} className="mb-4">
        <InputGroup>
          <Form.Control aria-label="장소 검색어" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="예: 관덕정, 성읍, 향교" />
          <Button type="submit" aria-label="검색"><i className="bi bi-search" /></Button>
        </InputGroup>
      </Form>
      <ErrorAlert error={error} />
      {loading ? <Loading /> : list.length === 0 ? <Empty /> : (
        <Row xs={1} sm={2} lg={3} className="g-3">
          {list.map((h, i) => (
            <Col key={i}><ItemCard title={h.name} subtitle={h.city} badge={h.kind} fallbackTopic="heritage" index={i} /></Col>
          ))}
        </Row>
      )}
    </>
  )
}
