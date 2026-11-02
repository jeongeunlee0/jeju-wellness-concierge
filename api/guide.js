import { buildGuide } from '../server/placeGuide.js';

// 장소 방문 가이드 — 입력을 엄격히 검증하고, 같은 장소는 10분 캐시, IP 당 호출 수를 제한한다
const cache = new Map();
const hits = new Map();
const TTL = 10 * 60e3;

function limited(ip) {
  const now = Date.now(), WINDOW = 10 * 60e3, MAX = 60;
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > WINDOW) hits.delete(k);
  return list.length > MAX;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  const q = req.query ?? {};
  const lat = Number(q.lat), lng = Number(q.lng);
  const name = String(q.name ?? '').trim().slice(0, 100);
  const id = q.id ? String(q.id) : '';
  const type = q.type ? String(q.type) : '';
  // 제주도 범위 밖 좌표, 형식이 다른 id·type 은 거절 (외부 API 호출 남용 방지)
  if (!name || !(lat >= 33 && lat <= 34.2) || !(lng >= 126 && lng <= 127.2)) return res.status(400).json({ error: '장소 이름과 제주 안의 좌표가 필요해요.' });
  if ((id && !/^\d{1,10}$/.test(id)) || (type && !['12', '14', '15', '28', '32', '38', '39'].includes(type))) return res.status(400).json({ error: '장소 식별 값이 올바르지 않아요.' });
  const ip = String(req.headers?.['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'unknown').split(',')[0].trim();
  if (limited(ip)) return res.status(429).json({ error: '요청이 많아요. 잠시 뒤 다시 시도해 주세요.' });

  const key = `${lat.toFixed(4)},${lng.toFixed(4)}|${id}|${type}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return res.status(200).json(hit.data);
  try {
    const data = await buildGuide({ name, lat, lng, id: id || null, type: type || null });
    cache.set(key, { at: Date.now(), data });
    if (cache.size > 300) cache.delete(cache.keys().next().value);
    res.setHeader?.('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json(data);
  } catch (e) {
    console.error('guide error', e.message);
    res.status(500).json({ error: '방문 가이드를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.' });
  }
}
