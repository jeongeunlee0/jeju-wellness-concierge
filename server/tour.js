// 한국관광공사 TourAPI (국문 관광정보 서비스 KorService2)
const BASE = 'https://apis.data.go.kr/B551011/KorService2';
import { fail, searchInput } from './errors.js';

export async function searchTour({ keyword = '', contentTypeId = '12', rows = 10 } = {}) {
  keyword = searchInput(keyword, rows);
  if (!['12','14','15','25','39'].includes(String(contentTypeId))) throw fail('지원하지 않는 관광정보 유형입니다.');
  if (!process.env.DATA_GO_KR_KEY) throw fail('관광정보 연결이 아직 준비되지 않았습니다.', 503);
  const params = new URLSearchParams({
    serviceKey: process.env.DATA_GO_KR_KEY, // ★ Decoding 키
    MobileOS: 'ETC',
    MobileApp: 'JejuIP',
    _type: 'json',
    numOfRows: String(rows),
    pageNo: '1',
    areaCode: '39', // 39 = 제주
  });
  if (contentTypeId) params.set('contentTypeId', contentTypeId);
  const op = keyword ? 'searchKeyword2' : 'areaBasedList2';
  if (keyword) params.set('keyword', keyword);

  const r = await fetch(`${BASE}/${op}?${params}`, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`관광공사 API HTTP 오류: ${r.status}`);
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error('TourAPI가 JSON 대신 오류를 반환했습니다.'); }

  if (data?.response?.header?.resultCode !== '0000') throw new Error('관광정보 API 오류: ' + (data?.response?.header?.resultMsg ?? '응답 확인 필요'));
  const item = data?.response?.body?.items?.item;
  const list = !item ? [] : Array.isArray(item) ? item : [item];
  return list.map((p) => ({
    id: p.contentid, title: p.title, addr: p.addr1,
    image: p.firstimage, lng: p.mapx, lat: p.mapy, type: p.contenttypeid,
  }));
}
