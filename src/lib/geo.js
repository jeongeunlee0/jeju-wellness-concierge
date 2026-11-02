// 좌표 계산 — 직선거리(km)와 차량 이동시간 "추정"
export function haversineKm(a, b) {
  const R = 6371, rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

// 직선거리에 도로 굴곡(×1.35)과 평균 시속 45km 를 적용한 대략적인 차량 이동시간(분). 실제 길 안내가 아니라 가늠용 추정치입니다.
export const driveMinutes = (km) => Math.max(1, Math.round(((km * 1.35) / 45) * 60))
