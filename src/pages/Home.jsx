import { lazy, Suspense, useState } from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ConditionsBar from '../components/ConditionsBar'
import MoodGallery from '../components/MoodGallery'
import { PHOTOS } from '../lib/photos'
const Jeju3D = lazy(() => import('../components/Jeju3D'))
const FLOW = [
 ['01', '나의 쉼을 고르고', '휴식 목적과 동행, 머무를 시간을 알려 주세요.'],
 ['02', '오늘의 제주를 확인해', '날씨·대기질과 관광·문화 데이터를 함께 살핍니다.'],
 ['03', '하나의 경험으로', '방문 순서와 추천 이유를 읽고, 코스를 저장하세요.'],
]
export default function Home() {
 const [show3D,setShow3D]=useState(false)
 return <>
  <section className="home-hero">
   <div className="home-hero-copy">
    <div className="eyebrow">WELLNESS EXPERTISE × JEJU OPEN DATA</div>
    <h1>지금 나에게<br />필요한 쉼, <em>제주에서.</em></h1>
    <p className="hero-description">어디를 갈지보다, 어떤 쉼이 필요한지 먼저.<br />나의 선호와 오늘의 제주 데이터를 바탕으로<br className="d-none d-lg-block" /> 휴식의 흐름을 함께 설계합니다.</p>
    <div className="d-flex gap-2 flex-wrap"><Button as={Link} to="/concierge" size="lg">나의 휴식 코스 만들기 <i className="bi bi-arrow-up-right ms-2" /></Button><Button as={Link} to="/places" size="lg" variant="outline-primary">장소 둘러보기</Button></div>
    <p className="hero-footnote">회원가입 없이 시작하고, 마음에 드는 코스를 저장하세요.</p>
   </div>
   <div className="home-hero-art"><div className="map-caption"><span className="live-dot" />제주를 느긋하게 바라보는 시간</div><div className="hero-visual">{show3D?<Suspense fallback={<div className="scene-loading">제주의 풍경을 준비하고 있어요.</div>}><Jeju3D height={430} focusX={0}/></Suspense>:<img src={PHOTOS[1].large} alt={PHOTOS[1].tags} width="640" height="430"/>}</div><div className="hero-visual-controls"><button type="button" onClick={()=>setShow3D(!show3D)} aria-pressed={show3D}>{show3D?'사진으로 보기':'3D 제주 둘러보기'} <i className="bi bi-arrow-up-right"/></button><a href={PHOTOS[1].page} target="_blank" rel="noopener noreferrer">분위기 참고 · {PHOTOS[1].user} / Pixabay</a></div></div>
  </section>
  <div className="conditions-strip"><span className="strip-label">오늘의 제주</span><ConditionsBar place="제주시" /></div>
  <section className="section-block"><div className="section-heading"><div><div className="eyebrow">FROM INFORMATION TO EXPERIENCE</div><h2>나의 속도로 만나는 제주</h2></div><p>장소의 목록에, 휴식의 이유를 더합니다.</p></div><Row xs={1} md={3} className="g-3">{FLOW.map(([n,title,description])=><Col key={n}><Card className="h-100 feature-card"><Card.Body><span className="step-index">{n}</span><h3>{title}</h3><p className="mb-0 text-muted">{description}</p></Card.Body></Card></Col>)}</Row></section>
  <section className="section-block"><MoodGallery topic="jeju" /></section>
  <section className="principles-section"><div><div className="eyebrow">OUR CURATION PRINCIPLES</div><h2>추천의 이유를<br />알 수 있는 여행.</h2></div><div><p>휴식 목적, 환경 적합성, 이동 부담, 경험의 흐름, 정보의 신뢰성. 다섯 가지 기준으로 나에게 맞는 후보를 제안합니다.</p><p className="small mb-0">추천에 사용한 도구와 조회 시점을 확인할 수 있습니다. 운영시간과 현장 이용 가능 여부는 방문 전 공식 정보를 확인해 주세요.</p></div></section>
 </>
}
