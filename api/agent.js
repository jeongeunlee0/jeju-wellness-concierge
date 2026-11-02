import Anthropic from '@anthropic-ai/sdk';
import { searchTour } from '../server/tour.js';
import { getWeather } from '../server/weather.js';
import { searchHeritage } from '../server/heritage.js';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

// ① 도구 설명서: Claude는 이 설명만 보고 "어떤 도구를 언제 쓸지" 결정한다
const tools = [
  {
    name: 'search_tour_places',
    description: '한국관광공사 TourAPI로 제주의 관광지·문화시설·축제·음식점을 검색한다',
    input_schema: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: '검색어 (예: 해녀, 오름, 돌하르방)' },
        contentTypeId: { type: 'string', description: '12 관광지, 14 문화시설, 15 축제·행사, 39 음식점' },
      },
    },
  },
  {
    name: 'get_weather',
    description: '기상청 단기예보로 제주시/서귀포시의 앞으로 몇 시간 기온·하늘·강수를 조회한다',
    input_schema: {
      type: 'object',
      properties: { place: { type: 'string', enum: ['제주시', '서귀포시'] } },
      required: ['place'],
    },
  },
  {
    name: 'search_heritage',
    description: '국가유산청 API로 제주의 국가유산(문화재)을 이름으로 검색한다',
    input_schema: { type: 'object', properties: { keyword: { type: 'string' } } },
  },
];

// ② 도구 이름 → 실제 실행할 함수
const runTool = { search_tour_places: searchTour, get_weather: getWeather, search_heritage: searchHeritage };

const SYSTEM = `너는 JEJU WELLNESS CONCIERGE의 제주 웰니스 경험 큐레이터다.
목표: 사용자가 원하는 휴식 목적에 적합한 제주 자연·문화 경험을 공공데이터 근거로 제안한다.
전문가 판단 기준: (1) Wellness Intent 목적 적합성 (2) Environment 실제 날씨 (3) Comfort 이동 부담 (4) Experience Flow 방문 흐름 (5) Reliability 출처 신뢰성.
- 장소·날씨·국가유산 정보는 필요할 때 제공된 API 도구로 직접 확인한다. 단순 장소명이나 추측으로 대체하지 않는다.
- 정보를 확인하지 못했거나 API가 실패했다면 사실을 명시하고 임의 데이터를 생성하지 않는다.
- 도구 결과에 없는 영업시간, 실제 혼잡도, 실내 여부, 정확한 이동시간을 확정적으로 말하지 않는다.
- 사용자가 지정한 지역과 시간, 환경 선호를 우선 반영한다. 거리·이동 시간 계산 도구가 없으므로 소요시간은 검증되지 않았다고 알린다.
- 비/강풍 등이 확인되면 실내 대안을 고려하고, 실내 여부는 검증되지 않았다면 확인 필요라고 표기한다.
- 감정/스트레스 표현은 취향과 휴식 목적을 파악하는 데만 사용한다. 치료·진단·효과 보장은 하지 않는다.
- 추천은 2~3개 장소 후보와 각 장소의 추천 이유, 데이터로 확인된 사항, 별도 확인이 필요한 사항으로 구분한다.
- 답변은 한국어로 간결하게 하되 확인된 자료와 추천 의견을 구별한다.`;

export function createAgentHandler({ createClient = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 20000, maxRetries: 0 }), toolHandlers = runTool, hasKey = () => Boolean(process.env.ANTHROPIC_API_KEY) } = {}) {
return async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!hasKey()) return res.status(503).json({ error: 'AI API 키가 설정되지 않았습니다.' });
  const { message, history = [] } = req.body ?? {};
  if (typeof message !== 'string' || !message.trim() || message.length > 1800 || !Array.isArray(history)) return res.status(400).json({ error: '요청 형식을 확인해 주세요.' });
  const safeHistory = history.slice(-10).filter((m) => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string').map((m) => ({ role: m.role, content: m.content.slice(0, 1800) }));
  const messages = [...safeHistory, { role: 'user', content: message.trim() }]; // 최근 10개만 보내 비용 절약
  const steps = []; // 화면에 "에이전트가 무엇을 했는지" 보여주기용

  try {
    const client = createClient();
    // ③ 에이전트 루프: 생각 → 도구 호출 → 결과 확인 → (반복) → 최종 답
    for (let turn = 0; turn < 3; turn++) {
      const r = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM,
        tools,
        messages,
      });

      if (r.stop_reason !== 'tool_use') {
        const answer = r.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
        if (!answer.trim()) return res.status(502).json({ error: 'AI가 답변을 반환하지 않았습니다. 다시 시도해 주세요.', steps });
        return res.status(200).json({ answer, steps, truncated: r.stop_reason === 'max_tokens' });
      }

      messages.push({ role: 'assistant', content: r.content }); // Claude의 도구 호출 요청을 대화에 기록
      const results = [];
      for (const block of r.content) {
        if (block.type !== 'tool_use') continue;
        let result;
        try { result = Object.hasOwn(toolHandlers, block.name) && block.input && typeof block.input === 'object' && !Array.isArray(block.input) ? await toolHandlers[block.name](block.input) : { error: '지원하지 않는 도구' }; }
        catch (e) { result = { error: e.message }; }
        steps.push({ tool: block.name, args: block.input, status: result?.error ? 'error' : 'success', count: Array.isArray(result) ? result.length : 0, result });
        results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result), is_error: Boolean(result?.error) });
      }
      messages.push({ role: 'user', content: results }); // 도구 결과를 Claude에게 돌려줌
    }
    res.status(200).json({ answer: '도구 호출이 너무 많아 중단했어요. 질문을 좁혀 주세요.', steps });
  } catch (e) {
    // 429 = 호출 한도 초과, 401 = 키 오류
    const status = [401, 403, 404, 429].includes(e.status) ? e.status : e.name?.includes('Timeout') ? 504 : 502;
    res.status(status).json({ steps, error: status === 429 ? 'AI API 사용 한도를 확인해 주세요.' : status === 401 ? 'AI API 인증에 실패했습니다. 서버에 유효한 API 키를 설정해 주세요.' : [403, 404].includes(status) ? 'AI 모델 접근 권한과 모델 설정을 확인해 주세요.' : status === 504 ? 'AI 응답 시간이 초과됐습니다. 다시 시도해 주세요.' : 'AI 요청에 실패했습니다. 서버 설정과 로그를 확인해 주세요.' });
  }
}

}
export default createAgentHandler();
