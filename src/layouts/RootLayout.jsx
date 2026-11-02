import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Toast, ToastContainer } from 'react-bootstrap'
import { NAV_ITEMS } from '../router'
import { useAppStore } from '../store/useAppStore'
import { initLiquidGlass } from '../lib/liquidGlass'
import GlassFilters from '../components/GlassFilters'
import Icon from '../components/Icon'
import Logo from '../components/Logo'

// 모바일 하단 탭: 가장 자주 쓰는 5곳
const TABS = [
  { to: '/', label: '홈', icon: 'home', end: true },
  { to: '/concierge', label: '컨시어지', icon: 'spark' },
  { to: '/places', label: '장소', icon: 'leaf' },
  { to: '/cart', label: '장바구니', icon: 'cart' },
  { to: '/login', label: '내 정보', icon: 'user' },
]

export default function RootLayout() {
  const toasts = useAppStore((s) => s.toasts)
  const user = useAppStore((s) => s.user)
  const cartCount = useAppStore((s) => s.cart.length)
  const initAuth = useAppStore((s) => s.initAuth)
  const { pathname } = useLocation()

  useEffect(() => { initAuth() }, [initAuth])
  useEffect(() => initLiquidGlass(), [])
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])   // 페이지를 옮기면 맨 위로

  const signedIn = user && !user.isAnonymous

  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <GlassFilters />
      <a className="skip-link" href="#main">본문으로 건너뛰기</a>

      <header className="app-header">
        <div className="glass glass-distort nav-pill">
          <NavLink to="/" className="brand" aria-label="JEJU WELLNESS CONCIERGE 홈"><Logo /></NavLink>

          <nav className="nav-links" aria-label="주요 메뉴">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className="nav-link-pill">
                <Icon name={item.icon} size={18} /><span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <NavLink to="/cart" className="icon-btn" aria-label={`장바구니 ${cartCount}개`}>
              <Icon name="cart" size={21} />
              {cartCount > 0 && <span className="badge-dot" aria-hidden="true">{cartCount > 9 ? '9+' : cartCount}</span>}
            </NavLink>
            <NavLink to="/login" className="icon-btn account-btn" aria-label={signedIn ? `내 정보 (${user.email})` : '로그인'}>
              <Icon name={signedIn ? 'user' : 'login'} size={21} />
              {signedIn && <span className="account-name">{user.email.split('@')[0]}</span>}
            </NavLink>
          </div>
        </div>
      </header>

      <main id="main" className="flex-grow-1 app-main">
        <div className="container-lg"><Outlet /></div>
      </main>

      <footer className="app-footer">
        <div className="container-lg small text-muted">
          제주대 청년도약 부트캠프 1기 · 데이터 출처: 기상청·한국관광공사·국가유산청·Open-Meteo · 사진:{' '}
          <a href="https://pixabay.com" target="_blank" rel="noopener noreferrer">Pixabay</a> · 관광정보:{' '}
          <a href="https://www.visitjeju.net/kr" target="_blank" rel="noopener noreferrer">비짓제주</a> · 휴식 선호에 맞춘 제안이며 의료적 조언이 아닙니다
        </div>
      </footer>

      <nav className="tabbar glass" aria-label="하단 메뉴">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className="tab">
            <span className="tab-icon">
              <Icon name={t.icon} size={22} />
              {t.to === '/cart' && cartCount > 0 && <span className="badge-dot" aria-hidden="true">{cartCount > 9 ? '9+' : cartCount}</span>}
            </span>
            <span className="tab-label">{t.label}</span>
          </NavLink>
        ))}
      </nav>

      <ToastContainer position="bottom-center" className="p-3 position-fixed toast-lift" role="status" aria-live="polite">
        {toasts.map((t) => (
          <Toast key={t.id} className={`glass toast-glass toast-${t.variant}`}>
            <Toast.Body>{t.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </div>
  )
}
