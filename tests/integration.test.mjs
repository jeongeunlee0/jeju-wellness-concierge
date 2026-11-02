import test from 'node:test';
import assert from 'node:assert/strict';
import { createAgentHandler } from '../api/agent.js';
import { baseDateTime, weatherSlots } from '../server/weather.js';
import { searchHeritage } from '../server/heritage.js';
import { searchTour } from '../server/tour.js';
import { apiError } from '../server/errors.js';

const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
const request = { method: 'POST', body: { message: '국가유산 확인' } };

test('agent returns actual tool results to model and screen (simulated transport)', async () => {
  let calls = 0;
  const handler = createAgentHandler({ hasKey: () => true,
    createClient: () => ({ messages: { create: async input => {
      if (calls++ === 0) return { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'a', name: 'search_heritage', input: { keyword: '관덕정' } }] };
      assert.match(input.messages.at(-1).content[0].content, /관덕정/);
      return { stop_reason: 'end_turn', content: [{ type: 'text', text: '조회 결과입니다.' }] };
    } } }), toolHandlers: { search_heritage: async () => [{ name: '관덕정' }] } });
  const res = response(); await handler(request, res);
  assert.equal(res.statusCode, 200); assert.equal(res.body.steps[0].status, 'success');
  assert.deepEqual(res.body.steps[0].result, [{ name: '관덕정' }]);
});

test('agent retains failed tool trace when next model request fails', async () => {
  let calls = 0;
  const handler = createAgentHandler({ hasKey: () => true,
    createClient: () => ({ messages: { create: async () => {
      if (calls++) throw Object.assign(new Error('secret upstream text'), { status: 401 });
      return { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'a', name: 'get_weather', input: {} }] };
    } } }), toolHandlers: { get_weather: async () => { throw new Error('날씨 연결 미설정'); } } });
  const res = response(); await handler(request, res);
  assert.equal(res.statusCode, 401); assert.equal(res.body.steps[0].status, 'error');
  assert.doesNotMatch(JSON.stringify(res.body), /secret upstream/);
});

test('agent rejects inherited tool names and bounds execution', async () => {
  const handler = createAgentHandler({ hasKey: () => true,
    createClient: () => ({ messages: { create: async () => ({ stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'a', name: 'toString', input: {} }] }) } }) });
  const res = response(); await handler(request, res);
  assert.equal(res.body.steps.length, 3); assert.ok(res.body.steps.every(s => s.status === 'error'));
});

test('agent rejects invalid messages without calling model', async () => {
  const handler = createAgentHandler({ hasKey: () => true, createClient: () => { throw new Error('must not call'); } });
  const res = response(); await handler({ method: 'POST', body: { message: ' ' } }, res); assert.equal(res.statusCode, 400);
});

test('KMA base time handles KST midnight and publication buffer', () => {
  assert.deepEqual(baseDateTime(Date.parse('2026-11-01T15:05:00Z')), { base_date: '20261101', base_time: '2300' });
  assert.deepEqual(baseDateTime(Date.parse('2026-11-02T05:14:00Z')), { base_date: '20261102', base_time: '1100' });
  assert.deepEqual(baseDateTime(Date.parse('2026-11-02T05:15:00Z')), { base_date: '20261102', base_time: '1400' });
});

test('weather excludes past slots and sorts future slots', () => {
  const items = ['1600', '1200', '1500'].map(fcstTime => ({ fcstDate: '20261102', fcstTime, category: 'TMP', fcstValue: '20' }));
  assert.deepEqual(weatherSlots(items, '제주시', Date.parse('2026-11-02T05:30:00Z')).map(x => x.time), ['20261102 1500', '20261102 1600']);
});

test('heritage rejects HTML upstream instead of reporting empty success', async () => {
  const original = globalThis.fetch;
  try { globalThis.fetch = async () => new Response('<html>failure</html>'); await assert.rejects(searchHeritage(), /오류/); }
  finally { globalThis.fetch = original; }
});

test('search input bounds and API timeout status', async () => {
  await assert.rejects(searchTour({ keyword: [], rows: 10 }), /검색어/);
  await assert.rejects(searchHeritage({ rows: 100000 }), /조회 건수/);
  const res = response(); apiError(res, { name: 'TimeoutError' }); assert.equal(res.statusCode, 504);
});
