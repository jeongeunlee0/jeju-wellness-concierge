import { apiError } from '../server/errors.js';
import { searchHeritage } from '../server/heritage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  try {
    res.status(200).json(await searchHeritage({ keyword: req.query.keyword }));
  } catch (e) {
    return apiError(res, e);
  }
}
