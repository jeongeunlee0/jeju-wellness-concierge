// 국가유산청 국가유산 검색 오픈API (키 불필요, XML 응답)
import { XMLParser } from 'fast-xml-parser';
const parser = new XMLParser();

export async function searchHeritage({ keyword = '', rows = 10 } = {}) {
  const params = new URLSearchParams({ ccbaCtcd: '50', pageUnit: String(rows), pageIndex: '1' }); // 50 = 제주
  if (keyword) params.set('ccbaMnm1', keyword);
  const r = await fetch(`https://www.khs.go.kr/cha/SearchKindOpenapiList.do?${params}`, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`국가유산 API HTTP 오류: ${r.status}`);
  const raw = await r.text();
  const data = parser.parse(raw);
  if (data?.result?.error || data?.OpenAPI_ServiceResponse) throw new Error('국가유산 API 오류 응답');
  const item = data?.result?.item;
  const list = !item ? [] : Array.isArray(item) ? item : [item];
  return list.map((h) => ({
    name: h.ccbaMnm1, kind: h.ccmaName, city: h.ccsiName,
    lat: h.latitude, lng: h.longitude,
  }));
}
