import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { ping } from '../api/client'
import { isSupabaseReady, supabase, ensureUser } from '../lib/supabase'
import WeatherBadge from '../components/WeatherBadge'

const pillars = [
  {icon:'heart-pulse',title:'나에게 맞는 쉼',description:'방문지가 아닌 휴식의 목적을 먼저 생각합니다.'},
  {icon:'cloud-sun',title:'지금 제주에 맞는 선택',description:'실제 날씨·관광·문화 데이터를 확인합니다.'},
  {icon:'signpost-split',title:'경험으로 이어지는 추천',description:'장소 선택의 이유와 휴식의 흐름을 설명합니다.'},
]
export default function Home(){
 const [db,setDb]=useState(isSupabaseReady?{ok:null,msg:'확인 중'}:{ok:false,msg:'Supabase 환경변수 필요'})
 const [api,setApi]=useState({ok:null,msg:'확인 중'})
 useEffect(()=>{
  if(isSupabaseReady) ensureUser().then(() => supabase.from('wellness_favorites').select('id').limit(1)).then(({error})=>setDb({ok:!error,msg:error?.message || '연결 정상'})).catch(() => setDb({ok:false,msg:'저장 연결을 확인해 주세요'}))
  ping().then(d=>setApi({ok:true,msg:`서버 정상 · 공공데이터 키 ${d.hasDataKey?'설정':'미설정'} · AI 키 ${d.hasClaudeKey?'설정':'미설정'}`})).catch(()=>setApi({ok:false,msg:'서버 함수 확인 필요: 로컬에서는 vercel dev 사용'}))
 },[])
 return <>
  <section className="wellness-hero rounded-4 p-4 p-md-5 mb-4">
   <Badge bg="light" text="dark" className="mb-3">JEJU IP × WELLNESS × AI AGENT</Badge>
   <div className="hero-kicker mb-2">FROM INFORMATION TO EXPERIENCE</div>
   <h1 className="display-5 fw-semibold">JEJU WELLNESS<br/>CONCIERGE</h1>
   <p className="lead mb-2">지금 나에게 필요한 쉼을, 제주에서.</p>
   <p className="hero-copy">휴식 목적과 선호도에 따라 제주 공공데이터를 조회하고, AI가 웰니스 경험을 제안합니다.</p>
   <div className="d-flex gap-2 flex-wrap mt-4"><Button as={Link} to="/agent" variant="dark" size="lg">나만의 웰니스 코스 찾기 <i className="bi bi-arrow-right ms-1"/></Button><Button as={Link} to="/places" variant="outline-dark" size="lg">쉼의 장소 탐색</Button></div>
   <div className="mt-4"><WeatherBadge place="서귀포시"/></div>
  </section>
  <Row xs={1} md={3} className="g-3 mb-4">{pillars.map(x=><Col key={x.title}><Card className="h-100 pillar-card"><Card.Body className="p-4"><i className={`bi bi-${x.icon} fs-3`}/><h5 className="mt-3">{x.title}</h5><p className="text-muted small mb-0">{x.description}</p></Card.Body></Card></Col>)}</Row>
  <section className="p-4 rounded-4 bg-white border mb-4"><h4>웰니스 경험 설계 원칙</h4><p className="text-muted mb-0">휴식 목적 · 환경 적합성 · 이동 편안함 · 경험의 흐름 · 정보 신뢰성. 추천은 의료적 판단이 아닌 여행·휴식 선택을 돕는 정보입니다.</p></section>
  <details className="mb-4"><summary className="fw-semibold">개발 점검용 연결 상태</summary><Row xs={1} md={2} className="g-3 mt-1"><Col><Status title="Supabase" {...db}/></Col><Col><Status title="Vercel API" {...api}/></Col></Row></details>
 </>
}
function Status({title,ok,msg}){return <Card><Card.Body><strong>{ok===true?'✓':ok===false?'!':'…'} {title}</strong><p className="text-muted small mb-0">{msg}</p></Card.Body></Card>}
