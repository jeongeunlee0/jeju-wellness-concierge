// 기상청 단기예보 조회서비스 (VilageFcstInfoService_2.0)
const BASE = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
import { fail } from './errors.js';
const GRID = { '제주시': [53, 38], '서귀포시': [52, 33] }; // 기상청 격자 좌표(nx, ny)
const SKY = { 1: '맑음', 3: '구름많음', 4: '흐림' };
const PTY = { 0: '없음', 1: '비', 2: '비/눈', 3: '눈', 4: '소나기' };

// 발표시각: 02·05·08·11·14·17·20·23시 (발표 후 약 10분 뒤부터 조회 가능)
export function baseDateTime(now = Date.now()) {
  const kst = new Date(now + 9 * 3600e3 - 15 * 60e3); // 한국시간, 15분 여유
  let h = [23, 20, 17, 14, 11, 8, 5, 2].find((x) => x <= kst.getUTCHours());
  let day = kst;
  if (h === undefined) { day = new Date(kst.getTime() - 24 * 3600e3); h = 23; }
  return {
    base_date: day.toISOString().slice(0, 10).replaceAll('-', ''),
    base_time: String(h).padStart(2, '0') + '00',
  };
}

export async function getWeather({ place = '제주시' } = {}) {
  if (!Object.hasOwn(GRID, place)) throw fail('지원하지 않는 지역입니다.');
  if (!process.env.DATA_GO_KR_KEY) throw fail('날씨 연결이 아직 준비되지 않았습니다.', 503);
  const [nx, ny] = GRID[place];
  const params = new URLSearchParams({
    serviceKey: process.env.DATA_GO_KR_KEY,
    dataType: 'JSON', numOfRows: '300', pageNo: '1',
    nx: String(nx), ny: String(ny), ...baseDateTime(),
  });
  const r = await fetch(`${BASE}?${params}`, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`기상청 API HTTP 오류: ${r.status}`);
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error('기상청 API가 JSON 대신 오류를 반환했습니다.'); }

  if (data?.response?.header?.resultCode !== '00') throw new Error('기상청 API 오류: ' + (data?.response?.header?.resultMsg ?? '응답 확인 필요'));
  const items = data?.response?.body?.items?.item;
  if (!Array.isArray(items)) throw new Error('기상청 예보 형식 오류');
  return weatherSlots(items, place);
}

export function weatherSlots(items, place, now = Date.now()) {
  const slots = {}; // "날짜 시간" → { TMP, SKY, PTY, POP }
  for (const it of items) {
    const key = `${it.fcstDate} ${it.fcstTime}`;
    (slots[key] ??= {})[it.category] = it.fcstValue;
  }
  const current = new Date(now + 9 * 3600e3).toISOString();
  const cutoff = `${current.slice(0, 10).replaceAll('-', '')} ${current.slice(11, 13)}00`;
  return Object.entries(slots).filter(([time]) => time >= cutoff).sort(([a], [b]) => a.localeCompare(b)).slice(0, 6).map(([time, v]) => ({
    place, time, temp: v.TMP === undefined ? null : Number(v.TMP), sky: SKY[v.SKY] ?? v.SKY,
    rain: PTY[v.PTY] ?? v.PTY, pop: v.POP === undefined ? null : Number(v.POP), // pop = 강수확률(%)
  }));
}
