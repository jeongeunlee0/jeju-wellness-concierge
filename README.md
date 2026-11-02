# JEJU WELLNESS CONCIERGE
제주 공공데이터와 Claude 도구 호출을 이용해 목적에 맞는 휴식 장소를 탐색·추천·저장하는 React 앱입니다.

## 실행
Node.js 22 이상에서 npm ci 후 .env.example을 .env.local로 복사해 설정합니다.
- npm run dev: http://127.0.0.1:5173 에서 화면과 서버 API 실행
- npm run build: 배포용 빌드
- npm run lint: 코드 검사
- npm test: 회귀 검사 8개
- npm run preflight: 핵심 파일·문법·환경변수 설정 여부 확인 (키 값 출력 안 함)
- node scripts/verify-live.mjs: 실제 외부 API와 DB 연결 검사. TEST_BASE_URL로 배포 URL 지정 가능

## 설정
VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY는 공개 가능한 브라우저 설정입니다.
DATA_GO_KR_KEY / ANTHROPIC_API_KEY는 서버 전용 비밀키입니다. VITE_를 붙이지 마세요.
ANTHROPIC_MODEL 기본값 claude-sonnet-5-5의 실제 호출을 확인했습니다.
Supabase에서 Anonymous Sign-Ins를 켜고 supabase/schema.sql을 적용합니다. 이 앱은 wellness_favorites 전용 테이블과 사용자별 RLS를 사용합니다.
.env.local과 .vercel은 GitHub/ZIP에 포함하지 않습니다. 배포 키는 Vercel에 직접 등록합니다.

## 배포 및 실제 검증
앱: https://jeju-wellness-concierge.vercel.app
관광공사 10건·기상청 6개 시간대·국가유산 10건 실제 200 응답을 확인했습니다.
Claude가 세 도구를 직접 선택·호출하고 실제 결과를 화면에 표시하는 것을 검증했습니다.
모바일 브라우저에서 관광지 저장 후 새로고침 조회 및 사용자별 DB 접근 차단을 확인했습니다.
전체 근거와 한계는 VERIFICATION_REPORT.md를 확인하세요. 오래된 verification-*.json은 키 설정 전 과거 결과입니다.

## 사용자 안내
게스트 저장함은 같은 브라우저 세션에서 유지되며, 브라우저 데이터를 삭제하거나 기기를 바꾸면 접근할 수 없습니다.
의료적 진단·치료를 제공하지 않습니다. 영업시간, 실제 혼잡, 이동시간은 별도 확인이 필요합니다.
GitHub push 자동 배포는 별도 Login Connection이 필요하며 현재는 직접 업로드 배포입니다.
