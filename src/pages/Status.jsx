import { useEffect, useState } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import { ping } from '../api/client'
import { ensureUser, isSupabaseReady, supabase } from '../lib/supabase'
import PageHeader from '../components/PageHeader'

const ICON = {
  ok: 'check-circle-fill text-success', warn: 'exclamation-circle-fill text-warning',
  fail: 'x-circle-fill text-danger', wait: 'hourglass-split text-muted',
}

function Check({ title, state, msg }) {
  return (
    <Card className="h-100"><Card.Body>
      <div className="fw-bold mb-1"><i className={`bi bi-${ICON[state]} me-2`} />{title}</div>
      <div className="small text-muted">{msg}</div>
    </Card.Body></Card>
  )
}

// 서비스 상태: 화면·데이터베이스·서버 함수가 정상인지 확인하는 점검 페이지 (일반 메뉴에는 노출하지 않음)
export default function Status() {
  const [db, setDb] = useState(isSupabaseReady ? { state: 'wait', msg: '확인 중' } : { state: 'warn', msg: '설정이 없어 브라우저에만 저장돼요' })
  const [api, setApi] = useState({ state: 'wait', msg: '확인 중' })

  useEffect(() => {
    if (isSupabaseReady) {
      ensureUser()
        .then(() => supabase.from('courses').select('id').limit(1))
        .then(({ error }) => setDb(error ? { state: 'fail', msg: error.message } : { state: 'ok', msg: '연결 정상 (익명 사용자 · 사용자별 보안 정책)' }))
        .catch((e) => setDb({ state: 'fail', msg: e.message }))
    }
    ping()
      .then((d) => setApi({
        state: d.hasDataKey && d.hasClaudeKey ? 'ok' : 'warn',
        msg: `서버 함수 정상 · 공공데이터 키 ${d.hasDataKey ? '있음' : '없음'} · AI 키 ${d.hasClaudeKey ? '있음' : '없음'}`,
      }))
      .catch(() => setApi({ state: 'fail', msg: '서버 함수가 응답하지 않아요' }))
  }, [])

  return (
    <>
      <PageHeader icon="shield" title="서비스 상태" subtitle="화면·데이터베이스·서버 함수가 정상인지 확인해요" />
      <Row xs={1} md={3} className="g-3">
        <Col><Check title="화면" state="ok" msg="정상" /></Col>
        <Col><Check title="데이터베이스" {...db} /></Col>
        <Col><Check title="서버 함수" {...api} /></Col>
      </Row>
    </>
  )
}
