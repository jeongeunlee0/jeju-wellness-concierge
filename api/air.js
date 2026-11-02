import { getAirQuality } from '../server/airquality.js';

export default async function handler(req, res) {
  try {
    res.status(200).json(await getAirQuality({ place: req.query.place }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
