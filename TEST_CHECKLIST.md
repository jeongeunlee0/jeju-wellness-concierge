# 발표 전 실사용 검증 체크리스트

- [ ] Node.js 버전 확인 (`node -v`)
- [ ] `npm ci` 성공
- [ ] `npm run build` 성공
- [ ] `npm run lint` 확인 및 오류 수정
- [ ] `.env.local` 실제 API 키 설정 (스크린샷/저장소에 절대 노출 금지)
- [ ] `npx vercel dev`로 `/api/hello` 상태 확인
- [ ] `/api/tour?keyword=오름` 응답에 실제 제주 장소 표시
- [ ] `/api/weather?place=서귀포시` 날짜/예보 응답 확인
- [ ] `/api/heritage?keyword=해녀` 실제 결과 확인
- [ ] Supabase SQL 실행, 장소 저장 후 새로고침 및 조회 확인
- [ ] AI 컨시어지 요청 후 호출한 도구 목록 화면 확인
- [ ] 비/맑음/오류/검색결과없음 조건의 안내 검증
- [ ] 키가 없을 때도 화면이 정상적으로 오류 표시
- [ ] GitHub에 `.env.local` 미포함 확인
- [ ] Vercel URL에서 동일 기능 확인
- [ ] 발표 영상 또는 스크린샷은 실제 성공한 화면만 사용

현재 이 파일의 체크 항목은 미완료 상태이며, 체크 없이 '완료'로 표기하지 않습니다.
