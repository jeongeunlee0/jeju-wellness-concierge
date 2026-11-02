import Anthropic from '@anthropic-ai/sdk';
import { searchTour } from '../server/tour.js';
import { getWeather } from '../server/weather.js';
import { searchHeritage } from '../server/heritage.js';
import { getAirQuality } from '../server/airquality.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-5-5';

// ① 도구 설명서: Claude는 이 설명만 보고 "어떤 도구를 언제 쓸지" 결정한다
const tools = [
  {
    name: 'get_weather',
    description: '기상청 단기예보로 제주시/서귀포시의 앞으로 몇 시간 기온·하늘·강수확률을 조회한다. 실내/실외 판단 전에 반드시 먼저 호출한다',
    input_schema: {
      type: 'object',
      properties: { place: { type: 'string', enum: ['제주시', '서귀포시'] } },
      required: ['place'],
    },
  },
  {
    name: 'get_air_quality',
    description: 'Open-Meteo로 제주시/서귀포시의 현재 미세먼지(PM10·PM2.5)·자외선 지수·대기질 등급을 조회한다. 야외 활동을 넣기 전에 확인한다',
    input_schema: {
      type: 'object',
      properties: { place: { type: 'string', enum: ['제주시', '서귀포시'] } },
      required: ['place'],
    },
  },
  {
    name: 'search_tour_places',
    description: '한국관광공사 TourAPI로 제주의 관광지(12)·문화시설(14)·축제(15)·음식점(39)을 키워드로 검색한다. 키워드 예: 스파, 온천, 숲, 휴양림, 산책, 해변, 카페, 명상, 오름, 올레',
    input_schema: {
      type: 'object',
      properties: {
        keyword: { type: 'string' },
        contentTypeId: { type: 'string', description: '12 관광지, 14 문화시설, 15 축제·행사, 39 음식점' },
      },
    },
  },
  {
    name: 'search_heritage',
    description: '국가유산청 API로 제주의 국가유산(문화재)을 이름으로 검색한다. 조용히 거닐며 문화를 느끼는 코스를 넣을 때 쓴다',
    input_schema: { type: 'object', properties: { keyword: { type: 'string' } } },
  },
];

// ② 도구 이름 → 실제 실행할 함수
const runTool = {
  get_weather: getWeather, get_air_quality: getAirQuality,
  search_tour_places: searchTour, search_heritage: searchHeritage,
};

const SYSTEM = `너는 JEJU WELLNESS CONCIERGE — 럭셔리 호텔 스파 출신 웰니스 전문가의 판단 기준으로 제주 휴식 코스를 설계하는 컨시어지 에이전트다.

[원칙]
1. 장소는 반드시 도구 결과에 있는 것만 추천한다. 결과에 없는 장소·시설·운영시간·이동시간은 지어내지 않는다. 모르면 notes 에 "확인 필요"라고 쓴다.
2. 코스를 만들기 전에 get_weather 와 get_air_quality 를 확인하고, 비·높은 강수확률·미세먼지 '나쁨'이면 실내 중심으로 바꾼다.
3. 휴식 목적에 맞는 키워드로 search_tour_places 를 1~3회 호출한다. 필요하면 search_heritage 도 쓴다.
4. 경험의 흐름(진정 → 이완 → 회복 → 마무리 순서)을 설계하고, 각 장소마다 "왜 지금 이 사용자에게 맞는지" 추천 이유를 쓴다.
5. 의료적 진단·치료 효과·건강 개선을 단정하지 않는다. "휴식 선호"에 맞춘 제안이라고만 말한다.
6. 사용자의 이용 가능 시간을 넘지 않게 코스를 짠다. 장소 수는 2~4곳.

[최종 답변 형식] 도구 호출을 마친 뒤, 아래 JSON 만 출력한다(설명 문장·코드펜스 금지).
{"summary":"코스를 한 문장으로","stops":[{"name":"도구 결과의 장소 이름 그대로","source":"tour|heritage","minutes":60,"reason":"추천 이유 1~2문장"}],"conditions":"반영한 날씨·대기질 근거 한 문장","notes":"확인이 필요한 점 한 문장"}`;

function describe(p = {}) {
  return `사용자의 휴식 선호:
- 휴식 목적: ${p.purpose ?? '미정'}
- 동행: ${p.companion ?? '혼자'}
- 위치(출발 지역): ${p.place ?? '제주시'}
- 이용 가능 시간: ${p.hours ?? 4}시간
- 실내·실외 선호: ${p.env ?? '상관없음'}
- 추가 요청: ${p.note || '없음'}
위 조건으로 웰니스 코스를 설계해 줘.`;
}

// JSON 이 아닌 문장이 섞여 와도 첫 {…} 블록을 뽑아 파싱한다
function parseCourse(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { preferences } = req.body ?? {};
  const messages = [{ role: 'user', content: describe(preferences) }];
  const steps = [];   // 화면에 "에이전트가 무엇을 했는지" 보여주기용
  const known = [];   // 도구가 실제로 돌려준 장소들 — 추천이 지어낸 것인지 검증하는 근거

  try {
    // ③ 에이전트 루프: 생각 → 도구 호출 → 결과 확인 → (반복) → 최종 답
    for (let turn = 0; turn < 7; turn++) {
      const r = await client.messages.create({ model: MODEL, max_tokens: 1500, system: SYSTEM, tools, messages });

      if (r.stop_reason !== 'tool_use') {
        const text = r.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
        const course = parseCourse(text);
        if (!course) return res.status(200).json({ course: null, raw: text, steps, generatedAt: new Date().toISOString() });
        // 검증: 추천 장소가 도구 결과에 있는지 대조하고, 있으면 좌표를 붙인다
        course.stops = (course.stops ?? []).map((s) => {
          const hit = known.find((k) => k.name && (k.name === s.name || k.name.includes(s.name) || s.name.includes(k.name)));
          return { ...s, verified: Boolean(hit), lat: hit?.lat ? Number(hit.lat) : null, lng: hit?.lng ? Number(hit.lng) : null, addr: hit?.addr ?? null };
        });
        return res.status(200).json({ course, steps, generatedAt: new Date().toISOString() });
      }

      messages.push({ role: 'assistant', content: r.content });
      const results = [];
      for (const block of r.content) {
        if (block.type !== 'tool_use') continue;
        let result;
        try { result = await runTool[block.name](block.input ?? {}); }
        catch (e) { result = { error: e.message }; }
        if (Array.isArray(result)) {
          for (const it of result) known.push({ name: it.title ?? it.name, lat: it.lat, lng: it.lng, addr: it.addr ?? it.city });
        }
        steps.push({ tool: block.name, args: block.input, count: Array.isArray(result) ? result.length : result?.error ? 0 : 1, error: result?.error });
        results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) });
      }
      messages.push({ role: 'user', content: results });
    }
    res.status(200).json({ course: null, raw: '도구 호출이 너무 많아 중단했어요. 조건을 단순하게 바꿔 보세요.', steps });
  } catch (e) {
    // 429 = 호출 한도 초과, 401 = 키 오류
    res.status(e.status ?? 500).json({ error: e.status === 429 ? '사용량이 많아요. 1분 뒤 다시 시도하세요.' : e.message });
  }
}
