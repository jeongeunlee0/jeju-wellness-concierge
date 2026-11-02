import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ping } from '../api/client'
import { ensureUser, isSupabaseReady, supabase } from '../lib/supabase'

// 동작 체크(작게): 화면 · 데이터베이스 · 서버 함수 — 자세한 내용은 /status
const DOT = { ok: 'ok', warn: 'warn', fail: 'fail', wait: 'wait' }

export default function HealthStrip() {
  const [db, setDb] = useState(isSupabaseReady ? 'wait' : 'warn')
  const [api, setApi] = useState('wait')

  useEffect(() => {
    let alive = true
    if (isSupabaseReady) {
      ensureUser().then(() => supabase.from('courses').select('id').limit(1))
        .then(({ error }) => alive && setDb(error ? 'fail' : 'ok'))
        .catch(() => alive && setDb('fail'))
    }
    ping().then((d) => alive && setApi(d.hasDataKey && d.hasClaudeKey ? 'ok' : 'warn')).catch(() => alive && setApi('fail'))
    return () => { alive = false }
  }, [])

  const item = (label, s) => <span className="hs-item"><i className={`hs-dot ${DOT[s]}`} aria-hidden="true" />{label}</span>
  return (
    <Link to="/status" className="health-strip" aria-label="서비스 동작 상태 자세히 보기">
      <span className="fw-bold">동작 체크</span>
      {item('화면·라우터', 'ok')}
      {item('데이터베이스', db)}
      {item('서버 함수', api)}
    </Link>
  )
}
