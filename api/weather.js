import { apiError } from '../server/errors.js';
import { getWeather } from '../server/weather.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  try {
    res.status(200).json(await getWeather({ place: req.query.place }));
  } catch (e) {
    return apiError(res, e);
  }
}
