import { NavLink, Outlet } from 'react-router-dom'
import { Container, Nav, Navbar, Toast, ToastContainer } from 'react-bootstrap'
import { NAV_ITEMS } from '../router'
import { useAppStore } from '../store/useAppStore'

export default function RootLayout() {
  const toasts = useAppStore((s) => s.toasts)
  const nickname = useAppStore((s) => s.nickname)

  return (
    <div className="d-flex flex-column min-vh-100">
      <a href="#main-content" className="skip-link">본문으로 바로가기</a>
      <Navbar expand="lg" className="app-nav" collapseOnSelect sticky="top">
        <Container>
          <Navbar.Brand as={NavLink} to="/" className="fw-bold">
            <i className="bi bi-flower2 brand-mark" aria-hidden="true" /><span className="brand-copy">JEJU WELLNESS<small>CONCIERGE</small></span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              {NAV_ITEMS.map((item) => (
                <Nav.Link key={item.to} as={NavLink} to={item.to} end={item.to === '/'} eventKey={item.to}>
                  <i className={`bi bi-${item.icon} me-1`} />{item.label}
                </Nav.Link>
              ))}
            </Nav>
            {nickname && <Navbar.Text><i className="bi bi-person-circle me-1" />{nickname}</Navbar.Text>}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main id="main-content" className="flex-grow-1 py-4" tabIndex={-1}>
        <Container><Outlet /></Container>
      </main>

      <footer className="py-3 border-top">
        <Container className="small text-muted">
          제주대 청년도약 부트캠프 1기 · 데이터 출처: 기상청·한국관광공사·국가유산청·Open-Meteo · 사진: <a href="https://pixabay.com" target="_blank" rel="noopener noreferrer">Pixabay</a> · 관광정보: <a href="https://www.visitjeju.net/kr" target="_blank" rel="noopener noreferrer">비짓제주</a> · 휴식 선호에 맞춘 제안이며 의료적 조언이 아닙니다
        </Container>
      </footer>

      <ToastContainer position="bottom-end" className="p-3 position-fixed">
        {toasts.map((t) => (
          <Toast key={t.id} bg={t.variant}><Toast.Body className="text-white">{t.message}</Toast.Body></Toast>
        ))}
      </ToastContainer>
    </div>
  )
}
