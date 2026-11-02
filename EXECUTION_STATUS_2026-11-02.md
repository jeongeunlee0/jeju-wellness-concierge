# 실행 검증 현황 — 2026-11-02

## 확인된 결과
- Node.js v22.16.0, npm 10.9.2 실행 확인.
- `npm ci --no-audit --no-fund`는 60초 내 완료되지 않음.
- `curl https://registry.npmjs.org/vite`는 `Could not resolve host`를 반환함. 이 실행 환경에서는 npm 레지스트리 DNS 접속 불가.
- `npm run build`와 `npm run lint`는 `vite: not found`, `oxlint: not found`로 실패. 빌드 통과 증거 없음.
- 공공데이터·Supabase·Anthropic 인증키 미설정 상태. 실제 호출 및 DB 저장 테스트 미실행.
- GitHub 사용자 계정과 Vercel 팀 존재는 확인했으나 실제 저장소 생성 및 배포 미완료. 모바일 실기 테스트 미완료.

## 이 버전의 개선
- 3개 데이터 조회 모듈의 HTTP 오류 처리를 보강함.
- `npm run preflight`로 파일/JS 문법/비밀키 설정 여부를 키 값 출력 없이 검사할 수 있음.

## 인터넷 접속 가능한 Windows PC의 검증 단계
1. `npm ci` 실행 및 `npm run build`, `npm run lint`, `npm run preflight` 확인.
2. `.env.example`을 `.env.local`로 복사하여 개인 인증키 입력(스크린샷/채팅/깃 업로드 금지).
3. Supabase에서 `supabase/schema.sql` 적용하되 교육용 공개 접근 정책을 실서비스에 사용하지 말 것.
4. `npx vercel dev`로 `/api/tour`, `/api/weather`, `/api/heritage` 실제 응답 검사.
5. `/agent`에서 상담→도구 호출 기록 표시 확인. 최소 3종 도구 각각 테스트.
6. DB 저장 후 새로고침/재조회 확인.
7. GitHub 푸시 후 Vercel 배포 URL에서 모바일 화면 및 동작 확인.

검증하지 못한 단계를 완료로 표기하지 않는다.
