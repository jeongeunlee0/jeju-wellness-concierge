// 제주관광공사 비짓제주(VISIT JEJU) 관광정보 OPEN API
// 공식 가이드: https://www.visitjeju.net/kr/visitjejuapi
// 키는 서버 환경변수 VISITJEJU_API_KEY 에만 저장합니다.
const BASE = 'https://api.visitjeju.net/vsjApi/contents/searchlist';

export async function searchTour({ keyword = '', rows = 10 } = {}) {
  const key = process.env.VISITJEJU_API_KEY;
  if (!key) throw new Error('VISITJEJU_API_KEY 미설정: 비짓제주 공식 사이트에서 별도 API 키를 신청하고 Vercel 환경변수에 등록하세요');
  const limit = Math.max(1, Math.min(30, Number(rows) || 10));
  const query = String(keyword || '').trim().toLocaleLowerCase('ko');
  const found = [];
  // 공식 API는 keyword 검색 파라미터가 문서화되지 않아 서버에서 검색합니다.
  // 검색 범위는 최대 5페이지(페이지당 최대 100건)이며 전체 데이터 검색을 보장하지 않습니다.
  for (let page = 1; page <= 5 && found.length < limit; page++) {
    const params = new URLSearchParams({ apikey: key, locale: 'kr', page: String(page) });
    const response = await fetch(`${BASE}?${params}`, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`비짓제주 API HTTP ${response.status}`);
    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); }
    catch { throw new Error('비짓제주 API가 JSON이 아닌 응답을 반환했습니다'); }
    if (!['00', '0'].includes(String(data?.result))) {
      throw new Error('비짓제주 API 오류: ' + (data?.resultMessage || data?.result || '응답 확인 필요'));
    }
    const items = Array.isArray(data.items) ? data.items : [];
    for (const p of items) {
      const searchable = [p.title, p.tag, p.alltag, p.introduction, p.address].filter(Boolean).join(' ').toLocaleLowerCase('ko');
      if (query && !searchable.includes(query)) continue;
      const photo = p.repPhoto?.photoid;
      const image = typeof photo === 'object' ? photo?.thumbnailpath || photo?.imgpath : '';
      found.push({
        id: p.contentsid, title: p.title || '', addr: p.roadaddress || p.address || '',
        image: /^https:\/\//.test(image || '') ? image : '',
        lng: p.longitude, lat: p.latitude, type: p.contentscd?.value || 'c1',
        introduction: p.introduction || '', tags: p.tag || '',
        source: 'VISITJEJU',
      });
      if (found.length >= limit) break;
    }
    if (items.length === 0 || page >= Number(data.pageCount || 1)) break;
  }
  return found;
}
