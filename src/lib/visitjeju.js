// 비짓제주(제주관광공사 공식 관광정보 포털) 연결 주소 — 2026-11-02 에 실제로 열리는 것을 확인한 형식만 씁니다.
//  · 제주웰니스 관광지 공식 페이지
//  · 사이트 검색:  https://www.visitjeju.net/kr/search?q=검색어   (예: '웰니스' 76건)
// 비짓제주 이용약관은 게시 자료의 무단 복제·배포를 금지하므로, 사진·소개글을 가져오지 않고 링크로만 연결합니다.
// (공식 JEJU TourAPI 는 별도 apiKey 승인이 필요합니다 — README 참고)
export const VISITJEJU = {
  home: 'https://www.visitjeju.net/kr',
  wellness: 'https://www.visitjeju.net/kr/jejuStory/wellness?menuId=DOM_200000000010680&cate1cd=cate0000000002',
  api: 'https://www.visitjeju.net/kr/visitJejuApi',
}

export const visitJejuSearch = (query) => `${VISITJEJU.home}/search?q=${encodeURIComponent(String(query).trim())}`

// 웰니스 여행 입구: 라벨 + 검색어 (검색어를 누르면 비짓제주 검색 결과로 이동)
export const WELLNESS_TOPICS = [
  { label: '웰니스', q: '웰니스', desc: '웰니스 관광지·숙박·행사·테마여행을 한꺼번에', icon: 'leaf' },
  { label: '스파·온천', q: '스파', desc: '몸의 긴장을 풀어 주는 스파와 온천', icon: 'cloud' },
  { label: '명상·요가', q: '명상', desc: '조용히 마음을 가라앉히는 명상·요가 프로그램', icon: 'spark' },
  { label: '숲길·산책', q: '숲길', desc: '곶자왈·휴양림·올레길 걷기', icon: 'leaf' },
  { label: '힐링 숙소', q: '힐링', desc: '쉬는 데 집중하는 숙소와 리트릿', icon: 'home' },
  { label: '로컬 미식', q: '로컬푸드', desc: '천천히 먹으며 쉬어 가는 제주의 맛', icon: 'pin' },
]
