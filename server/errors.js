export function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function apiError(res, error) {
  const timeout = ['TimeoutError', 'AbortError'].includes(error?.name);
  const status = timeout ? 504 : [400, 503].includes(error?.status) ? error.status : 502;
  return res.status(status).json({ error: timeout ? '외부 데이터 응답 시간이 초과됐습니다. 다시 시도해 주세요.' : status === 502 ? '외부 데이터 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.' : error.message });
}

export function searchInput(keyword = '', rows = 10) {
  if (typeof keyword !== 'string' || keyword.length > 80) throw fail('검색어는 80자 이하의 문자열로 입력해 주세요.');
  if (!Number.isInteger(rows) || rows < 1 || rows > 30) throw fail('조회 건수는 1~30 사이여야 합니다.');
  return keyword.trim();
}
