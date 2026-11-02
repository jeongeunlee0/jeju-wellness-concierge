import { getTopicImages } from '../server/pixabay.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  try {
    const items = await getTopicImages({ topic: req.query.topic, count: req.query.count });
    res.setHeader('Cache-Control', 'public, s-maxage=86400');
    res.status(200).json(items);
  } catch (e) {
    res.status(e.message.includes('허용되지') ? 400 : 500).json({ error: e.message });
  }
}
