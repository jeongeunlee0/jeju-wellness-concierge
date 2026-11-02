import { useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import { authMessage, useAppStore } from '../store/useAppStore'
import { isSupabaseReady } from '../lib/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// 간단한 로그인: 이메일 + 비밀번호. 로그인하지 않아도 앱은 그대로 쓸 수 있어요(익명 계정).
export default function Login() {
  const { user, authBusy, signIn, signUp, signOut, toast } = useAppStore()
  const [mode, setMode] = useState('in')            // 'in' | 'up'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const signedIn = user && !user.isAnonymous

  async function submit(e) {
    e.preventDefault()
    setError(''); setInfo('')
    if (!EMAIL_RE.test(email.trim())) return setError('이메일 형식을 확인해 주세요')
    if (password.length < 8) return setError('비밀번호는 8자 이상으로 입력해 주세요')
    try {
      if (mode === 'in') {
        await signIn(email.trim(), password)
        toast('로그인했어요')
        setPassword('')
      } else {
        const { needsConfirm } = await signUp(email.trim(), password)
        setInfo(needsConfirm
          ? '인증 메일을 보냈어요. 메일의 링크를 누르면 가입이 끝나고, 지금까지 저장한 코스·장바구니가 그대로 이어져요.'
          : '가입했어요. 이제 이 계정으로 저장돼요.')
        setPassword('')
      }
    } catch (err) {
      setError(authMessage(err))
    }
  }

  if (!isSupabaseReady) {
    return (
      <>
        <PageHeader icon="user" title="내 정보" subtitle="로그인" />
        <Alert variant="warning">Supabase 설정(.env.local)이 없어 로그인을 쓸 수 없어요. 코스와 장바구니는 이 브라우저에만 저장돼요.</Alert>
      </>
    )
  }

  return (
    <>
      <PageHeader icon="user" title="내 정보" subtitle="로그인하면 어느 기기에서든 내 코스와 장바구니를 이어서 볼 수 있어요" />

      <div className="auth-grid">
        <section className="glass auth-card" aria-labelledby="auth-title">
          {signedIn ? (
            <>
              <div className="auth-avatar"><Icon name="user" size={30} /></div>
              <h2 id="auth-title" className="h5 fw-bold mb-1">{user.email}</h2>
              <p className="text-muted small mb-3">로그인됨 · 저장한 코스와 장바구니는 이 계정에 보관돼요</p>
              <div className="d-flex flex-wrap gap-2">
                <Button as={Link} to="/my" variant="primary"><Icon name="bookmark" size={18} className="me-1" />저장한 코스</Button>
                <Button as={Link} to="/cart" variant="outline-primary"><Icon name="cart" size={18} className="me-1" />장바구니</Button>
                <Button variant="outline-secondary" onClick={signOut} disabled={authBusy}><Icon name="logout" size={18} className="me-1" />로그아웃</Button>
              </div>
            </>
          ) : (
            <Form onSubmit={submit} noValidate>
              <div className="seg mb-3" role="tablist" aria-label="로그인 또는 가입">
                <button type="button" role="tab" aria-selected={mode === 'in'} className={mode === 'in' ? 'on' : ''} onClick={() => { setMode('in'); setError(''); setInfo('') }}>로그인</button>
                <button type="button" role="tab" aria-selected={mode === 'up'} className={mode === 'up' ? 'on' : ''} onClick={() => { setMode('up'); setError(''); setInfo('') }}>가입</button>
              </div>
              <h2 id="auth-title" className="visually-hidden">{mode === 'in' ? '로그인' : '가입'}</h2>

              <Form.Group className="mb-3" controlId="auth-email">
                <Form.Label className="fw-bold small"><Icon name="mail" size={16} className="me-1" />이메일</Form.Label>
                <Form.Control type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="auth-password">
                <Form.Label className="fw-bold small"><Icon name="lock" size={16} className="me-1" />비밀번호 (8자 이상)</Form.Label>
                <Form.Control type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </Form.Group>

              {error && <Alert variant="danger" className="py-2 small" role="alert">{error}</Alert>}
              {info && <Alert variant="success" className="py-2 small" role="status">{info}</Alert>}

              <Button type="submit" className="w-100" size="lg" disabled={authBusy}>
                {authBusy ? <Spinner size="sm" className="me-2" /> : <Icon name={mode === 'in' ? 'login' : 'plus'} size={18} className="me-2" />}
                {mode === 'in' ? '로그인' : '가입하기'}
              </Button>
              <p className="small text-muted mt-3 mb-0">
                {mode === 'in'
                  ? '로그인하지 않아도 이 브라우저에서는 계속 쓸 수 있어요.'
                  : '지금 쓰던 계정에 이메일을 연결하므로 저장한 코스와 장바구니가 사라지지 않아요.'}
              </p>
            </Form>
          )}
        </section>

        <aside className="auth-side">
          <div className="glass perk"><Icon name="shield" size={22} /><div><b>내 것만 보여요</b><span>보안 정책(RLS)으로 다른 사람의 코스·장바구니는 볼 수 없어요</span></div></div>
          <div className="glass perk"><Icon name="cart" size={22} /><div><b>기기를 옮겨도 그대로</b><span>로그인하면 휴대폰과 노트북에서 같은 장바구니를 써요</span></div></div>
          <div className="glass perk"><Icon name="clock" size={22} /><div><b>가입은 선택</b><span>비밀번호는 암호화되어 저장되고, 앱은 비밀번호를 보관하지 않아요</span></div></div>
        </aside>
      </div>
    </>
  )
}
