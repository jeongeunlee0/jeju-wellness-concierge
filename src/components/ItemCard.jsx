import { Badge, Button, Card } from 'react-bootstrap'
import Icon from './Icon'
import { VisitJejuPlaceLink } from './Credits'

// 관광지·유산·저장한 코스 등 "목록의 한 칸"을 모두 이 카드 하나로 표시합니다 (재사용 컴포넌트)
//   image: 공공 API(TourAPI)가 준 사진이 있으면 그대로 사용, 없으면 디자인된 아이콘 면으로 대신합니다 (다른 사이트 사진을 끌어오지 않음)
//   onAddCart / inCart: 장바구니 담기, visit: 비짓제주 검색 링크 표시
export default function ItemCard({ title, subtitle, image, badge, onAddCart, inCart = false, action, art = 'leaf', visit = true, onGuide }) {
  return (
    <Card className="h-100 item-card">
      {image
        ? <Card.Img variant="top" src={image} alt={title} className="item-card-img" loading="lazy" />
        : <div className={`item-card-img placeholder-img art-${art}`} aria-hidden="true"><Icon name={art} size={38} /></div>}
      <Card.Body className="d-flex flex-column">
        {badge && <Badge bg="secondary" className="align-self-start mb-2">{badge}</Badge>}
        <Card.Title className="fs-6 fw-bold">{title}</Card.Title>
        {subtitle && <Card.Text className="small text-muted mb-2">{subtitle}</Card.Text>}
        <div className="card-links mb-2">
          {onGuide && <button type="button" className="act primary" onClick={onGuide}><Icon name="info" size={15} />방문 가이드</button>}
          {visit && <VisitJejuPlaceLink name={title} className="act" />}
        </div>
        {onAddCart && (
          <Button size="sm" variant={inCart ? 'success' : 'outline-primary'} className="mt-auto" onClick={onAddCart} disabled={inCart} aria-label={`${title} ${inCart ? '장바구니에 담김' : '장바구니에 담기'}`}>
            <Icon name={inCart ? 'check' : 'cart'} size={16} className="me-1" />{inCart ? '담았어요' : '장바구니 담기'}
          </Button>
        )}
        {action && <div className="mt-auto">{action}</div>}
      </Card.Body>
    </Card>
  )
}
