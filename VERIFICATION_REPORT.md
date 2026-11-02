# 실행 검증 보고서 — 2026-11-02

## 확인된 사실
- Node.js v22.16.0, npm 10.9.2 실행 가능.
- `npm ci --offline` 실패: `zustand-5.0.16.tgz` 로컬 캐시에 없음 (ENOTCACHED).
- `npm ci` 온라인 시도 실패: npm `Exit handler never called!`.
- `api/*.js`, `server/*.js` 에 대한 `node --check` 구문 검사 통과.
- GitHub 연결된 계정은 `jeongeunlee0`로 확인됨.
- Vercel 연결된 팀은 확인됐으나 linkedProjects는 비어 있음.

## 완료로 표기할 수 없는 항목
- React 빌드 및 실제 브라우저 실행: 의존성 설치 실패로 미검증.
- 공공데이터 3종 실시간 성공 응답: 인증키/연결 환경 미확인, 미검증.
- Supabase INSERT/SELECT 및 새로고침 지속성: 프로젝트 연결/인증 미확인, 미검증.
- Anthropic 도구 호출: 수업 전용 키 미확인, 미검증.
- GitHub 업로드와 Vercel 배포, 모바일 UI: 미완료.

## 현장 검증 명령 (키는 코드·스크린샷에 기록하지 않기)
```powershell
node -v
npm ci
npm run build
npm run lint
Copy-Item .env.example .env.local
npx vercel login
npx vercel link
npx vercel dev
```

## 실제 검증 체크리스트
1. `/api/hello` 요청으로 서버 환경 설정 존재 여부 확인(값 자체는 출력 금지).
2. `/api/tour?keyword=숲` 에서 실제 JSON 장소 리스트 확인.
3. `/api/weather?place=서귀포시` 에서 현재 발효된 예보 확인.
4. `/api/heritage?keyword=제주` 에서 국가유산 검색 응답 확인.
5. Supabase에서 비식별 테스트 장소 1개 저장 후 브라우저 새로고침하여 조회 확인.
6. 상담에서 질문 1회 전송 후 `steps` 배열에 실제 `get_weather`, `search_tour_places`, `search_heritage` 호출 기록 확인. AI가 실제로 어떤 도구를 호출했는지 기록; 모든 질문에 3개를 강제 호출할 필요 없음.
7. 배포 후 모바일 뷰포트에서 메뉴, 상담 입력, 추천 카드, 로딩/오류 화면 확인.

## 개인정보 보호
현재 `supabase/schema.sql`은 실습용 공개 정책입니다. 제3자가 모든 기록을 읽을 수 있으므로 개인정보·건강정보를 저장해서는 안 됩니다. 실서비스에는 인증 및 사용자별 RLS가 필수입니다.

## 상태
현 버전은 **배포 완료본이 아닌 소스 코드/점검 자료**입니다. 검증되지 않은 항목을 성공으로 표현하지 마세요.
