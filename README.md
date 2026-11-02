# JEJU WELLNESS CONCIERGE
제주 공공데이터를 기반으로 휴식 목적에 맞는 장소를 탐색하고 저장하는 React 앱입니다.

## 실행
Node.js 22 이상을 사용하세요.
1. npm ci
2. .env.example을 .env.local로 복사하고 환경변수를 설정합니다.
3. npm run dev
4. http://127.0.0.1:5173 에서 UI와 /api를 함께 확인합니다.

npm run build / npm run lint / npm run preflight 로 검증합니다. preflight는 .env.local을 읽고 설정 여부만 출력합니다. 환경변수 미설정은 외부 연동 미완료를 의미합니다.

## 환경변수
- VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY: 브라우저용 공개 설정
- DATA_GO_KR_KEY: 서버 전용 공공데이터포털 Decoding 키. TourAPI와 기상청 각각 활용 승인이 필요합니다.
- ANTHROPIC_API_KEY: 서버 전용 Claude 키
- ANTHROPIC_MODEL: 계정에서 접근 가능한 모델 ID. v4의 강사 지정 claude-sonnet-5-5를 기본값으로 보존했으나 실제 모델 접근은 미검증입니다.

.env.local은 GitHub와 배포 소스에서 제외됩니다. Vercel 환경변수에도 별도 등록해야 합니다. 비밀키에 VITE_ 접두사를 붙이지 마세요.

## 저장
Supabase Auth의 Anonymous Sign-Ins와 supabase/schema.sql이 필요합니다. wellness_favorites는 auth.uid() 기준 사용자별 RLS를 사용합니다. 게스트 세션은 새로고침 후 유지되지만 브라우저 데이터를 지우거나 다른 기기에서 접속하면 기존 저장함에 접근할 수 없습니다. 이전 v4의 공개 favorites 테이블은 사용하지 않습니다.

## AI
Claude가 search_tour_places, get_weather, search_heritage 중 필요한 도구를 선택합니다. 도구 이름·입력·성공/실패·건수·결과를 화면에서 펼쳐 볼 수 있습니다. 모델 요청이 도중 실패해도 이미 실행한 기록을 보존합니다. 실제 Claude 호출 성공은 아직 검증되지 않았습니다.

## 2026-11-02 확인 결과
- npm ci: 149개 설치, audit 0 vulnerabilities
- npm run build: 성공
- npm run lint: 경고/오류 없이 성공
- 로컬 브라우저: 홈 및 국가유산 화면 표시
- 국가유산청: 실제 10건 응답, 제주 관덕정 표시
- Supabase: 제주 관덕정 저장 후 브라우저 새로고침 조회 성공
- TourAPI/기상청/Claude: 키 미설정으로 정상 응답 미검증
- GitHub/Vercel/모바일: 최신 VERIFICATION_REPORT.md 참조

의료적 진단과 치료를 제공하지 않습니다. 추천 중 영업시간·혼잡도·정확한 이동시간은 해당 도구로 확인되지 않습니다.

## 배포 주소
https://jeju-wellness-concierge.vercel.app

실제 응답 재검증: node scripts/verify-live.mjs. 현재 3개 키 연동이 미완료여서 exit 1을 반환합니다. 자세한 성공·차단 근거는 VERIFICATION_REPORT.md와 verification-production.json에 기록했습니다.
