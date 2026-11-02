import { useEffect } from 'react'
import { Col, Row } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import ItemCard from '../components/ItemCard'
import { Empty, Loading } from '../components/Status'
import { useAppStore } from '../store/useAppStore'

// 즐겨찾기 — store 의 favorites 를 그대로 보여줍니다 (STEP 5)
export default function My() {
  const { favorites, favLoading, loadFavorites } = useAppStore()

  useEffect(() => { loadFavorites() }, [loadFavorites])

  return (
    <>
      <PageHeader icon="star" title="저장한 장소" subtitle="이 브라우저에서 저장한 나만의 제주 장소" />
      <p className="text-muted small">새로고침 후에도 저장이 유지됩니다. 브라우저 데이터를 삭제하면 게스트 저장함에 다시 접근할 수 없습니다.</p>
      {favLoading ? <Loading /> : favorites.length === 0 ? <Empty text="아직 저장한 항목이 없어요" /> : (
        <Row xs={1} sm={2} lg={3} className="g-3">
          {favorites.map((f) => (
            <Col key={f.id}><ItemCard title={f.title} badge={f.source} subtitle={new Date(f.created_at).toLocaleString('ko-KR')} /></Col>
          ))}
        </Row>
      )}
    </>
  )
}
