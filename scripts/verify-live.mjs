import { createClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';
import { writeFileSync } from 'node:fs';
Object.assign(process.env, loadEnv('development', process.cwd(), ''));
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const results = { timestamp: new Date().toISOString(), base, checks: [] };
for (const path of ['tour', 'weather', 'heritage', 'agent']) {
  try {
    const response = await fetch(`${base}/api/${path}`, path === 'agent' ? {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '제주시 휴식 코스를 추천해 줘. 날씨와 관광지, 국가유산을 각각 실제 도구로 확인해 줘.' }),
      signal: AbortSignal.timeout(90000),
    } : { signal: AbortSignal.timeout(20000) });
    const data = await response.json();
    const check = { name: path, status: response.status, passed: response.ok,
      ...(Array.isArray(data) ? { count: data.length, first: data[0] } : { error: data.error, steps: data.steps }) };
    results.checks.push(check);
  } catch { results.checks.push({ name: path, passed: false, error: 'Network or response error' }); }
}
const url = process.env.VITE_SUPABASE_URL, key = process.env.VITE_SUPABASE_ANON_KEY;
if (url && key) {
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const first = createClient(url, key, options), other = createClient(url, key, options);
  let rowId;
  try {
    const a = await first.auth.signInAnonymously(), b = await other.auth.signInAnonymously();
    if (a.error || b.error) throw new Error('Anonymous session creation failed');
    const itemId = `verification-${Date.now()}`;
    const saved = await first.from('wellness_favorites').insert({ source: 'heritage', item_id: itemId, title: '검증용 장소' }).select().single();
    if (saved.error) throw new Error('Insert failed');
    rowId = saved.data.id;
    const reloaded = createClient(url, key, options);
    const session = await reloaded.auth.setSession({ access_token: a.data.session.access_token, refresh_token: a.data.session.refresh_token });
    if (session.error) throw new Error('Session restoration failed');
    const own = await reloaded.from('wellness_favorites').select('id').eq('id', rowId);
    const hidden = await other.from('wellness_favorites').select('id').eq('id', rowId);
    if (own.error || hidden.error || own.data.length !== 1 || hidden.data.length !== 0) throw new Error('Ownership isolation failed');
    results.checks.push({ name: 'Supabase persistence and RLS', passed: true, ownRows: own.data.length, otherUserRows: hidden.data.length });
  } catch (error) { results.checks.push({ name: 'Supabase persistence and RLS', passed: false, error: error.message }); }
  finally {
    if (rowId) {
      const cleanup = await first.from('wellness_favorites').delete().eq('id', rowId);
      results.checks.push({ name: 'Test row cleanup', passed: !cleanup.error });
    }
    await first.auth.signOut(); await other.auth.signOut();
  }
}
writeFileSync(process.env.TEST_RESULT_PATH || 'verification-live.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
process.exitCode = results.checks.every(check => check.passed) ? 0 : 1;
