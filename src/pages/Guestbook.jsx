import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import { Empty, Loading } from '../components/Status'
import { useAppStore } from '../store/useAppStore'
import { isSupabaseReady } from '../lib/supabase'

const ago = (iso) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return '방금 전'
  if (s < 3600) return `${Math.floor(s / 60)}분 전`
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}일 전`
  return new Date(iso).toLocaleDateString('ko-KR')
}

function Stars({ value, size = 15 }) {
  return (
    <span className="gb-stars" role="img" aria-label={`별점 ${value}점`}>
      {[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= value ? '' : 'gb-stars off'}><Icon name="star" size={size} /></span>)}
    </span>
  )
}

// 방명록: 다녀온 곳과 느낌을 남기는 공개 게시판
export default function Guestbook() {
  const { guestbook, guestbookCount, guestbookLoading, loadGuestbook, addGuestbook, deleteGuestbook, user, nickname, toast, cart, courses } = useAppStore()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(0)
  const [place, setPlace] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadGuestbook() }, [loadGuestbook])
  useEffect(() => {
    if (!name) setName(nickname || (user && !user.isAnonymous ? user.email.split('@')[0].slice(0, 20) : ''))
  }, [nickname, user]) // eslint-disable-line react-hooks/exhaustive-deps

  // 내가 담은·저장한 장소를 방문 장소 후보로 제안
  const suggestions = useMemo(() => [...new Set([...cart.map((c) => c.name), ...courses.flatMap((c) => c.course?.stops?.map((s) => s.name) ?? [])])].slice(0, 12), [cart, courses])
  const avg = useMemo(() => {
    const rated = guestbook.filter((g) => g.rating)
    return rated.length ? (rated.reduce((a, g) => a + g.rating, 0) / rated.length).toFixed(1) : null
  }, [guestbook])

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (name.trim().length < 1) return setError('이름을 입력해 주세요')
    if (message.trim().length < 2) return setError('2자 이상 남겨 주세요')
    setBusy(true)
    try {
      await addGuestbook({ nickname: name, message, rating, place })
      setMessage(''); setRating(0); setPlace('')
      toast('방명록을 남겼어요')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!isSupabaseReady) {
    return (<><PageHeader icon="book" title="방명록" /><Alert variant="warning">방명록을 쓰려면 서버 설정이 필요해요.</Alert></>)
  }

  return (
    <>
      <PageHeader icon="book" title="방명록" subtitle="다녀온 곳과 느낌을 남겨 주세요" />
      <div className="gb-grid">
        <Form className="glass gb-form" onSubmit={submit} noValidate>
          <h2 className="h6 fw-bold mb-3">방명록 남기기</h2>
          <Form.Group className="mb-3" controlId="gb-name">
            <Form.Label className="small fw-bold">이름</Form.Label>
            <Form.Control value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="표시할 이름" autoComplete="nickname" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="gb-place">
            <Form.Label className="small fw-bold">다녀온 곳 (선택)</Form.Label>
            <Form.Control value={place} maxLength={60} list="gb-places" onChange={(e) => setPlace(e.target.value)} placeholder="예: 화순곶자왈 생태탐방숲길" />
            <datalist id="gb-places">{suggestions.map((n) => <option key={n} value={n} />)}</datalist>
          </Form.Group>
          <div className="mb-3">
            <div className="small fw-bold mb-1">별점 (선택)</div>
            <div className="star-pick" role="radiogroup" aria-label="별점">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n}점`} className={n <= rating ? 'on' : ''} onClick={() => setRating(rating === n ? 0 : n)}>
                  <Icon name="star" size={26} />
                </button>
              ))}
            </div>
          </div>
          <Form.Group className="mb-3" controlId="gb-msg">
            <Form.Label className="small fw-bold d-flex justify-content-between"><span>남기고 싶은 말</span><span className="text-muted fw-normal">{message.length}/300</span></Form.Label>
            <Form.Control as="textarea" rows={4} maxLength={300} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="오늘 코스는 어땠나요?" />
          </Form.Group>
          {error && <Alert variant="danger" className="py-2 small" role="alert">{error}</Alert>}
          <Button type="submit" className="w-100" disabled={busy}>
            {busy ? <Spinner size="sm" className="me-2" /> : <Icon name="send" size={17} className="me-2" />}남기기
          </Button>
        </Form>

        <section aria-label="방명록 목록">
          <div className="d-flex justify-content-between align-items-center mb-3 small text-muted">
            <span>{guestbookCount}개의 글</span>
            {avg && <span className="d-flex align-items-center gap-1"><Stars value={Math.round(avg)} size={14} />평균 {avg}</span>}
          </div>
          {guestbookLoading && guestbook.length === 0 ? <Loading /> : guestbook.length === 0 ? <Empty text="아직 글이 없어요. 첫 방명록을 남겨 보세요" /> : (
            <>
              <ul className="list-unstyled m-0">
                {guestbook.map((g) => (
                  <li key={g.id} className="glass gb-item">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="fw-bold">{g.nickname}</span>
                      {g.rating ? <Stars value={g.rating} /> : null}
                      <span className="text-muted small ms-auto">{ago(g.created_at)}</span>
                      {user?.id === g.user_id && (
                        <button type="button" className="icon-btn danger sm" onClick={() => deleteGuestbook(g.id)} aria-label="내 글 지우기"><Icon name="trash" size={15} /></button>
                      )}
                    </div>
                    {g.place && <span className="chip static mt-1 d-inline-flex"><Icon name="pin" size={13} />{g.place}</span>}
                    <p className="gb-msg">{g.message}</p>
                  </li>
                ))}
              </ul>
              {guestbook.length < guestbookCount && (
                <div className="text-center"><Button variant="outline-primary" onClick={() => loadGuestbook(true)} disabled={guestbookLoading}>{guestbookLoading ? <Spinner size="sm" /> : '더 보기'}</Button></div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  )
}
