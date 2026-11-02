import Icon from './Icon'
import { VISITJEJU, WELLNESS_TOPICS, visitJejuSearch } from '../lib/visitjeju'

// 비짓제주(공식 관광정보 포털)의 웰니스 콘텐츠로 바로 이동하는 입구. 사진·소개글은 가져오지 않고 링크로만 연결합니다.
export default function WellnessTopics({ compact = false }) {
  return (
    <div className={`topic-grid ${compact ? 'compact' : ''}`}>
      <a className="glass topic topic-main" href={VISITJEJU.wellness} target="_blank" rel="noopener noreferrer">
        <span className="topic-ico"><Icon name="compass" size={26} /></span>
        <span className="topic-body">
          <b>제주웰니스 관광지 <Icon name="external" size={14} /></b>
          <span>제주관광공사가 선정한 웰니스 관광지를 비짓제주 공식 페이지에서 확인해요</span>
        </span>
      </a>
      {WELLNESS_TOPICS.map((t) => (
        <a key={t.q} className="glass topic" href={visitJejuSearch(t.q)} target="_blank" rel="noopener noreferrer" aria-label={`${t.label} — 비짓제주 검색 결과 (새 창)`}>
          <span className="topic-ico"><Icon name={t.icon} size={22} /></span>
          <span className="topic-body"><b>{t.label} <Icon name="external" size={13} /></b><span>{t.desc}</span></span>
        </a>
      ))}
    </div>
  )
}
