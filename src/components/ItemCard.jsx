import { Badge, Button, Card } from 'react-bootstrap'
import { useImages } from '../lib/useImages'
import PixImg from './PixImg'

// API 에 사진이 없는 항목: Pixabay 분위기 사진으로 대신하고 "예시 이미지"임을 표시
function FallbackImage({ topic, index }) {
  const { items } = useImages(topic, 12)
  const p = items.length ? items[index % items.length] : null
  if (!p) return <div className="item-card-img placeholder-img"><i className="bi bi-flower2" /></div>
  return (
    <div className="position-relative">
      <PixImg photo={p} alt={`분위기 참고 이미지: ${p.tags}`} className="card-img-top item-card-img" loading="lazy" />
      <span className="example-tag">예시 이미지 · Pixabay</span>
    </div>
  )
}

// 관광지·유산·저장한 코스 등 "목록의 한 칸"을 모두 이 카드 하나로 표시합니다 (재사용 컴포넌트)
export default function ItemCard({ title, subtitle, image, badge, onSave, action, fallbackTopic, index = 0 }) {
  return (
    <Card className="h-100 item-card">
      {image
        ? <Card.Img variant="top" src={image} alt={title} className="item-card-img" loading="lazy" />
        : fallbackTopic
          ? <FallbackImage topic={fallbackTopic} index={index} />
          : <div className="item-card-img placeholder-img"><i className="bi bi-flower2" /></div>}
      <Card.Body className="d-flex flex-column">
        {badge && <Badge bg="secondary" className="align-self-start mb-2">{badge}</Badge>}
        <Card.Title className="fs-6 fw-bold">{title}</Card.Title>
        {subtitle && <Card.Text className="small text-muted">{subtitle}</Card.Text>}
        {onSave && (
          <Button size="sm" variant="outline-primary" className="mt-auto" onClick={onSave}>
            <i className="bi bi-bookmark-heart me-1" />담기
          </Button>
        )}
        {action && <div className="mt-auto">{action}</div>}
      </Card.Body>
    </Card>
  )
}
