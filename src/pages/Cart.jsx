import { useEffect, useState } from 'react'
import { Badge, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import { Empty, Loading } from '../components/Status'
import { useAppStore } from '../store/useAppStore'

const SOURCE = { tour: '관광공사', heritage: '국가유산', course: 'AI 코스' }
const fmt = (min) => (min >= 60 ? `${Math.floor(min / 60)}시간${min % 60 ? ` ${min % 60}분` : ''}` : `${min}분`)

// 장바구니: 가고 싶은 장소를 모아 시간을 가늠하고, 담은 장소로 AI 코스를 다시 짜 달라고 요청합니다. (예약·결제는 없음)
export default function Cart() {
  const { cart, cartLoading, loadCart, removeFromCart, clearCart, prefs, setPrefs, toast, openGuide } = useAppStore()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  useEffect(() => { loadCart() }, [loadCart])

  const total = cart.reduce((a, c) => a + (Number(c.minutes) || 0), 0)
  const budget = prefs.hours * 60
  const over = total > budget

  function planWithCart() {
    // 담은 장소 이름을 추가 요청에 넣어 컨시어지로 보냅니다 (에이전트가 도구로 확인한 장소만 코스에 넣습니다)
    const names = cart.slice(0, 6).map((c) => c.name).join(', ')
    setPrefs({ note: `장바구니 장소를 우선 검토해 줘: ${names}`.slice(0, 200) })
    navigate('/concierge')
  }

  async function copyList() {
    const text = cart.map((c, i) => `${i + 1}. ${c.name} (${fmt(c.minutes)})${c.addr ? ` - ${c.addr}` : ''}`).join('\n')
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    catch { toast('복사 권한이 없어요', 'warning') }
  }

  return (
    <>
      <PageHeader icon="cart" title="장바구니" subtitle="가고 싶은 장소를 담아 두고 하루 시간에 맞는지 확인하세요" />

      {cartLoading && cart.length === 0 ? <Loading /> : cart.length === 0 ? (
        <div className="text-center py-5">
          <Empty text="아직 담은 장소가 없어요" />
          <div className="d-flex gap-2 justify-content-center">
            <Button as={Link} to="/places" variant="primary"><Icon name="leaf" size={18} className="me-1" />장소 둘러보기</Button>
            <Button as={Link} to="/concierge" variant="outline-primary"><Icon name="spark" size={18} className="me-1" />AI 코스 만들기</Button>
          </div>
        </div>
      ) : (
        <div className="cart-grid">
          <ul className="cart-list list-unstyled mb-0" aria-label="장바구니 목록">
            {cart.map((c) => (
              <li key={c.id} className="glass cart-item">
                <span className="cart-source"><Icon name={c.source === 'heritage' ? 'landmark' : c.source === 'course' ? 'spark' : 'leaf'} size={22} /></span>
                <div className="flex-grow-1 min-w-0">
                  <div className="fw-bold text-truncate">{c.name}</div>
                  <div className="small text-muted text-truncate">{c.addr || '주소 정보 없음'}</div>
                  <div className="mt-1 d-flex flex-wrap gap-1 align-items-center">
                    <Badge bg="light" text="dark" className="border fw-normal">{SOURCE[c.source] ?? c.source}</Badge>
                    <Badge bg="light" text="dark" className="border fw-normal"><Icon name="clock" size={12} className="me-1" />{fmt(c.minutes)}</Badge>
                    {c.lat && c.lng && (
                      <button type="button" className="act primary" onClick={() => openGuide({ name: c.name, lat: c.lat, lng: c.lng })}><Icon name="info" size={13} />방문 가이드</button>
                    )}
                    {c.lat && c.lng && (
                      <a className="small ms-1" href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`} target="_blank" rel="noopener noreferrer">
                        <Icon name="pin" size={13} className="me-1" />지도
                      </a>
                    )}
                  </div>
                </div>
                <button type="button" className="icon-btn danger" onClick={() => removeFromCart(c.id)} aria-label={`${c.name} 빼기`}><Icon name="trash" size={19} /></button>
              </li>
            ))}
          </ul>

          <aside className="glass cart-summary" aria-label="장바구니 요약">
            <div className="small text-muted">담은 장소 {cart.length}곳</div>
            <div className="cart-total">{fmt(total)}</div>
            <div className={`small ${over ? 'text-danger' : 'text-muted'}`}>
              {over
                ? `내 이용 시간(${prefs.hours}시간)보다 ${fmt(total - budget)} 많아요. 일부를 빼거나 시간을 늘려 보세요.`
                : `내 이용 시간(${prefs.hours}시간) 안에 들어와요.`}
            </div>
            <div className="meter" role="img" aria-label={`이용 시간의 ${Math.min(100, Math.round((total / budget) * 100))}%`}>
              <span className={over ? 'over' : ''} style={{ width: `${Math.min(100, (total / budget) * 100)}%` }} />
            </div>
            <div className="d-grid gap-2 mt-3">
              <Button variant="primary" onClick={planWithCart}><Icon name="spark" size={18} className="me-1" />이 장소로 AI 코스 만들기</Button>
              <Button variant="outline-primary" onClick={copyList}><Icon name={copied ? 'check' : 'copy'} size={18} className="me-1" />{copied ? '복사했어요' : '목록 복사'}</Button>
              <Button variant="outline-secondary" onClick={clearCart}><Icon name="trash" size={18} className="me-1" />모두 비우기</Button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
