export const normalizeName = value => String(value ?? '').normalize('NFKC').replace(/[\s·.,()-]/g, '').toLowerCase();

// Only exact normalized names from this request's actual tool results can be verified.
export function validateCourse(value, known, hours) {
  if (!value || typeof value.summary !== 'string' || !Array.isArray(value.stops)) return null;
  if (value.stops.length < 1 || value.stops.length > 4) return null;
  const seen = new Set();
  const stops = value.stops.map(stop => {
    if (!stop || typeof stop.name !== 'string' || !normalizeName(stop.name)) return null;
    const hit = known.find(place => normalizeName(place.name) === normalizeName(stop.name) && (!stop.source || stop.source === place.source));
    if (!hit || seen.has(normalizeName(hit.name))) return null;
    seen.add(normalizeName(hit.name));
    const minutes = Number(stop.minutes);
    if (!Number.isInteger(minutes) || minutes < 10 || minutes > 240 || typeof stop.reason !== 'string') return null;
    const lat = Number(hit.lat), lng = Number(hit.lng);
    const verified = Number.isFinite(lat) && Number.isFinite(lng) && lat > 33 && lat < 34 && lng > 126 && lng < 127;
    return { name: hit.name, source: hit.source, minutes, reason: stop.reason.slice(0, 600), verified, lat: verified ? lat : null, lng: verified ? lng : null, addr: hit.addr ?? null };
  });
  if (stops.some(stop => !stop) || stops.reduce((n, stop) => n + stop.minutes, 0) > hours * 60) return null;
  return { summary: value.summary.slice(0, 500), stops, conditions: typeof value.conditions === 'string' ? value.conditions.slice(0, 600) : '', notes: (typeof value.notes === 'string' ? value.notes.slice(0, 600) : '') + ' 체류 시간은 추천값이며 이동시간·영업시간·현장 이용 가능 여부는 별도 확인이 필요합니다.' };
}
