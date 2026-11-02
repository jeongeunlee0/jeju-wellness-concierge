import { useState } from 'react'
import { Button, Card, Col, Form, Row, Spinner, Badge } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import { useAppStore } from '../store/useAppStore'

const INTENTS=['자연 속 휴식','조용한 시간','문화와 감성','가벼운 산책','혼자만의 시간']
const AREAS=['제주시','서귀포시']
const DURATIONS=['2시간','반나절','하루']
const ENVIRONMENTS=['실내','실외','상관없음']
export default function Agent(){
 const messages=useAppStore(s=>s.messages),loading=useAppStore(s=>s.chatLoading),sendMessage=useAppStore(s=>s.sendMessage)
 const [intent,setIntent]=useState('자연 속 휴식'),[area,setArea]=useState('제주시'),[duration,setDuration]=useState('반나절'),[environment,setEnvironment]=useState('상관없음'),[input,setInput]=useState('')
 const onSubmit=e=>{e.preventDefault();if(loading)return;const prompt=`지역: ${area}\n휴식 목적: ${intent}\n이용 가능 시간: ${duration}\n선호 환경: ${environment}\n추가 요청: ${input.trim()||'없음'}\n실제 공공 API 도구로 필요한 정보를 확인해 제주 웰니스 코스를 추천하고 확인 불가능한 정보는 명확히 표시해줘.`;sendMessage(prompt);setInput('')}
 return <>
 <PageHeader icon="chat-square-heart" title="AI 웰니스 컨시어지" subtitle="나의 목적과 환경에 맞는 제주 휴식 경험을 설계합니다."/>
 <Row className="g-4"><Col lg={5}>
 <Card className="consultation-card"><Card.Body className="p-4"><div className="tiny-overline mb-2">WELLNESS CONSULTATION</div><h4>오늘 어떤 쉼이 필요하신가요?</h4><p className="small text-muted">선호를 선택하면 AI가 공공데이터 도구를 조회해 코스를 구성합니다.</p><Form onSubmit={onSubmit}>
 <Form.Group className="mb-3"><Form.Label>휴식 목적</Form.Label><Form.Select value={intent} onChange={e=>setIntent(e.target.value)}>{INTENTS.map(x=><option key={x}>{x}</option>)}</Form.Select></Form.Group>
 <Form.Group className="mb-3"><Form.Label>선호 지역</Form.Label><Form.Select value={area} onChange={e=>setArea(e.target.value)}>{AREAS.map(x=><option key={x}>{x}</option>)}</Form.Select></Form.Group>
 <Form.Group className="mb-3"><Form.Label>이용 가능 시간</Form.Label><Form.Select value={duration} onChange={e=>setDuration(e.target.value)}>{DURATIONS.map(x=><option key={x}>{x}</option>)}</Form.Select></Form.Group>
 <Form.Group className="mb-3"><Form.Label>선호 환경</Form.Label><Form.Select value={environment} onChange={e=>setEnvironment(e.target.value)}>{ENVIRONMENTS.map(x=><option key={x}>{x}</option>)}</Form.Select></Form.Group>
 <Form.Group className="mb-3"><Form.Label>추가 요청 (선택)</Form.Label><Form.Control as="textarea" rows={3} value={input} onChange={e=>setInput(e.target.value)} placeholder="예: 조용한 곳에서 여유롭게 머물고 싶어요"/></Form.Group>
 <Button type="submit" className="w-100" disabled={loading}>{loading?'큐레이션 중…':'나의 웰니스 코스 추천받기'}</Button>
 </Form></Card.Body></Card></Col>
 <Col lg={7}><Card className="h-100"><Card.Body className="p-4"><div className="d-flex justify-content-between align-items-center mb-3"><h4 className="mb-0">나의 웰니스 제안</h4><Badge bg="light" text="dark">PUBLIC DATA + AI</Badge></div>
 <div className="chat-box">{messages.length===0?<div className="empty-chat"><i className="bi bi-flower2 fs-1"/><p className="mt-2">왼쪽에서 휴식 조건을 선택해 보세요.<br/>AI가 확인된 데이터를 바탕으로 추천 이유를 설명합니다.</p></div>:messages.map((m,i)=><div key={i} className={`msg ${m.role}`}><div className="pre-wrap">{m.text}</div>{m.steps?.length>0&&<div className="tool-log mt-3"><strong><i className="bi bi-tools me-1"/>에이전트가 호출한 도구</strong>{m.steps.map((s,j)=><div key={j} className="small mt-1">{s.tool} · {s.status} · {s.count}건 · {JSON.stringify(s.args)}<details><summary>조회 결과</summary><pre className="pre-wrap">{JSON.stringify(s.result, null, 2)}</pre></details></div>)}</div>}</div>)}{loading&&<p className="text-muted"><Spinner size="sm" className="me-2"/>공공데이터 조회 및 추천 생성 중...</p>}</div>
 <p className="small text-muted mt-3 mb-0">공공데이터의 조회 결과에 없는 정보는 확정적으로 안내하지 않습니다. 영업시간과 현장 이용 가능 여부는 별도 확인이 필요할 수 있습니다.</p></Card.Body></Card></Col></Row>
 </>
}
