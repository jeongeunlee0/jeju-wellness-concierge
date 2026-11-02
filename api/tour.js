import { apiError } from '../server/errors.js';
import { searchTour } from '../server/tour.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  try {
    const { keyword = '', type = '12' } = req.query;
    res.status(200).json(await searchTour({ keyword, contentTypeId: type }));
  } catch (e) {
    return apiError(res, e);
  }
}
