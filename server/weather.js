// 기상청 단기예보 조회서비스 (VilageFcstInfoService_2.0)
const BASE = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
const GRID = { '제주시': [53, 38], '서귀포시': [52, 33] }; // 기상청 격자 좌표(nx, ny)
const SKY = { 1: '맑음', 3: '구름많음', 4: '흐림' };
const PTY = { 0: '없음', 1: '비', 2: '비/눈', 3: '눈', 4: '소나기' };

// 발표시각: 02·05·08·11·14·17·20·23시 (발표 후 약 10분 뒤부터 조회 가능)
function baseDateTime() {
  const kst = new Date(Date.now() + 9 * 3600e3 - 15 * 60e3); // 한국시간, 15분 여유
  let h = [23, 20, 17, 14, 11, 8, 5, 2].find((x) => x <= kst.getUTCHours());
  let day = kst;
  if (h === undefined) { day = new Date(kst.getTime() - 24 * 3600e3); h = 23; }
  return {
    base_date: day.toISOString().slice(0, 10).replaceAll('-', ''),
    base_time: String(h).padStart(2, '0') + '00',
  };
}


export function toWeatherGrid(lat, lng) {
  const rad = Math.PI / 180, re = 6371.00877 / 5;
  const slat1 = 30 * rad, slat2 = 60 * rad, olat = 38 * rad;
  const sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(Math.tan(Math.PI / 4 + slat2 / 2) / Math.tan(Math.PI / 4 + slat1 / 2));
  const sf = Math.pow(Math.tan(Math.PI / 4 + slat1 / 2), sn) * Math.cos(slat1) / sn;
  const ro = re * sf / Math.pow(Math.tan(Math.PI / 4 + olat / 2), sn);
  const ra = re * sf / Math.pow(Math.tan(Math.PI / 4 + lat * rad / 2), sn);
  let theta = (lng - 126) * rad;
  if (theta > Math.PI) theta -= 2 * Math.PI;
  if (theta < -Math.PI) theta += 2 * Math.PI;
  theta *= sn;
  return [Math.floor(ra * Math.sin(theta) + 43.5), Math.floor(ro - ra * Math.cos(theta) + 136.5)];
}

export async function getWeather({ place = '제주시', lat, lng } = {}) {
  if (!process.env.DATA_GO_KR_KEY) throw new Error('DATA_GO_KR_KEY 가 설정되지 않았어요 (.env.local / Vercel 환경변수 확인)');
  const located = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && lat != null && lng != null && Number(lat) >= 33 && Number(lat) <= 34.2 && Number(lng) >= 126 && Number(lng) <= 127.2;
  const [nx, ny] = located ? toWeatherGrid(Number(lat), Number(lng)) : GRID[place] ?? GRID['제주시'];
  const params = new URLSearchParams({
    serviceKey: process.env.DATA_GO_KR_KEY,
    dataType: 'JSON', numOfRows: '1000', pageNo: '1',
    nx: String(nx), ny: String(ny), ...baseDateTime(),
  });
  const r = await fetch(`${BASE}?${params}`);
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error('기상청 응답이 JSON이 아님: ' + text.slice(0, 120)); }

  const err = data?.OpenAPI_ServiceResponse?.cmmMsgHeader;
  if (err) throw new Error('기상청 API 오류: ' + (err.returnAuthMsg ?? err.errMsg) + ' — 공공데이터포털에서 이 API 활용신청·승인을 확인하세요');
  const header = data?.response?.header;
  if (header && header.resultCode !== '00') throw new Error('기상청 API 오류: ' + header.resultMsg);
  const items = data?.response?.body?.items?.item ?? [];
  const slots = {}; // "날짜 시간" → { TMP, SKY, PTY, POP }
  for (const it of items) {
    const key = `${it.fcstDate} ${it.fcstTime}`;
    (slots[key] ??= {})[it.category] = it.fcstValue;
  }
  const kstNow = new Date(Date.now() + 9 * 3600e3);
  const cutoff = kstNow.toISOString().slice(0, 10).replaceAll('-', '') + ' ' + String(kstNow.getUTCHours()).padStart(2, '0') + '00';
  return Object.entries(slots).sort(([a], [b]) => a.localeCompare(b)).filter(([time, v]) => time >= cutoff && v.TMP !== undefined && v.POP !== undefined && v.SKY !== undefined && v.PTY !== undefined).slice(0, 6).map(([time, v]) => ({
    place, time, grid: { nx, ny }, locationBasis: located ? '장소 좌표 기준 약 5km 격자 예보' : '도시 대표 격자 예보', temp: Number(v.TMP), sky: SKY[v.SKY] ?? v.SKY,
    wind: Number(v.WSD), humidity: Number(v.REH), // 풍속(m/s)·습도(%)
    rain: PTY[v.PTY] ?? v.PTY, pop: Number(v.POP), // pop = 강수확률(%)
  }));
}
