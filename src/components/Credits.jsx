import Icon from './Icon'
import { VISITJEJU, visitJejuSearch } from '../lib/visitjeju'

// 비짓제주(공식 관광정보 포털)로 나가는 링크 — 새 창으로 열고 referrer 를 넘기지 않습니다
const EXT = { target: '_blank', rel: 'noopener noreferrer' }

export function VisitJejuLink({ children = '비짓제주 공식 관광정보', href = VISITJEJU.home, className = '' }) {
  return (
    <a className={`btn btn-sm btn-outline-primary ${className}`} href={href} {...EXT}>
      <Icon name="external" size={14} className="me-1" />{children}
    </a>
  )
}

// 특정 장소를 비짓제주 검색에서 이어서 찾아보기 (사진·소개글은 비짓제주에서 확인)
export function VisitJejuPlaceLink({ name, className = '' }) {
  return (
    <a className={`small ${className}`} href={visitJejuSearch(name)} {...EXT} aria-label={`${name} 비짓제주에서 찾아보기 (새 창)`}>
      <Icon name="external" size={13} className="me-1" />비짓제주에서 찾기
    </a>
  )
}
