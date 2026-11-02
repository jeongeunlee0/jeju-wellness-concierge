# JEJU WELLNESS CONCIERGE 최종 검증 완료
검증일: 2026-11-02 (Asia/Seoul)

| 요청 항목 | 결과 | 실제 근거 |
|---|---|---|
| React 설치·빌드·실행 | 통과 | npm ci 성공, npm run build 성공, 로컬 및 배포 브라우저 표시 |
| 코드 자동 검사 | 통과 | npm test 8/8, npm run lint 오류·경고 0 |
| 관광공사 TourAPI | 통과 | 배포 /api/tour HTTP 200, 10건. 화면 검색 '해녀' 1건 표시 |
| 기상청 | 통과 | 배포 /api/weather HTTP 200, 6개 시간대. 실제 15~20시 예보 표시 |
| 국가유산청 | 통과 | 배포 /api/heritage HTTP 200, 10건 |
| Supabase 저장·새로고침 | 통과 | 모바일 화면에서 관광지 저장 후 새로고침해도 제주해녀항일운동기념탑 조회. 국가유산 저장도 유지 |
| Supabase 사용자 격리 | 통과 | 실제 별도 게스트 세션 조회 0건, 본인 세션 복원 조회 1건. 검증용 행 삭제 성공 |
| Claude 실제 tool use | 통과 | get_weather 성공 6건, search_tour_places 성공 2건, search_heritage 성공 10건을 각각 1회 호출 |
| 도구 기록 화면 | 통과 | 도구명·입력·상태·건수·실제 결과 펼침 표시. 성공/실패 혼합 흐름도 실제 확인 |
| GitHub | 완료 | 비공개 저장소에 전체 소스·lockfile·검사 코드 업로드 |
| Vercel | 완료 | production READY 및 공개 앱 URL |
| 모바일 브라우저 | 통과 | 390×844에서 메뉴·관광지 조회·저장·새로고침 확인. 실제 휴대폰 하드웨어는 미검사 |

앱: https://jeju-wellness-concierge.vercel.app
저장소: https://github.com/jeongeunlee0/jeju-wellness-concierge (비공개)
세 API 정상 응답 및 세 도구 성공 확인 배포: dpl_DCtMH39QaC9naV7isJPHNtCPdR7y
이후 간결한 답변 지침을 추가한 보완본을 같은 production 주소에 배포합니다.

## 실제 실행 증거
- public-api-final.json: 관광공사 10건/기상청 6개 시간대/국가유산 10건의 200 응답
- claude-all-tools-final.json: 실제 Claude가 선택한 세 도구 및 결과
- mobile-saved-final.png: 관광지·국가유산 저장 후 모바일 새로고침 유지
- 최종 source의 tests/integration.test.mjs: 회귀 검사 8개. 모델 전송을 대체한 자동 검사이며 실제 외부 호출 근거와 구분합니다.

## 해결한 오류 및 보완
- UI와 서버 API를 함께 제공하는 npm run dev 추가.
- 공개 nickname 기반 DB 저장을 사용자별 guest Auth + auth.uid() RLS로 교체.
- 날씨 예보의 과거 시간 제외·정렬 및 KST 날짜 경계 처리 검사.
- 국가유산 HTML 오류를 빈 검색 성공으로 처리하던 문제 해결.
- 검색어/건수 검증, GET 전용 처리, 설정 미완료 503/외부 실패 502/시간초과 504 구분.
- 도구 실행 실패와 후속 모델 오류에도 기록 보존, 미등록 도구 실행 차단.
- AI 요청 자동 재시도 제거, 요청당 20초 제한, 최대 3회 모델 루프.
- 실제 출력 잘림을 발견해 답변 한도 확대 및 잘림 안내 표시. 추가로 최종 답변 600자 이내, 도구 기록 중복 제외 지침 적용.
- 바람·특보를 제공하지 않는 도구로 경보 유무를 단정하지 않도록 AI 지침 보완.
- Supabase 코드를 별도 파일로 나눠 500 kB 이상 build 경고 제거. 최종 앱 JS 380.62 kB, Supabase 214.38 kB.
- 빈 날씨 결과에서 끝나지 않던 로딩 및 페이지 해제 뒤 응답 반영 문제 보완.

## 키 및 배포 설정
받은 비밀키 두 개는 Vercel sensitive 서버 환경변수로만 저장했습니다. GitHub·ZIP·브라우저 코드에 포함하지 않았습니다. 로컬 배포 소스에는 .env.example만 제공합니다. 로컬 외부 API 테스트가 필요하면 .env.local에 별도 설정해야 합니다.
채팅에 공유된 키는 검증 후 재발급을 권장합니다.

## 남아 있는 운영상 제한
- 요구한 기능의 검증을 막는 필수 차단 항목은 없습니다.
- Vercel 배포는 소스 직접 업로드 방식입니다. GitHub push 자동 배포는 계정 Login Connection을 별도 연결해야 합니다.
- 게스트 저장함은 같은 브라우저 세션에 연결됩니다. 브라우저 데이터를 삭제하거나 다른 기기에서 접속하면 접근할 수 없습니다.
- Supabase의 guest access advisory는 의도한 익명 로그인 정책에 관한 경고입니다. 사용자별 행 격리는 실제 테스트했습니다.
- Vercel 생성 런타임의 Node url.parse deprecation 경고는 관찰됐습니다. 앱에 직접 url.parse 호출은 없습니다.
- 오래된 verification-live.json/verification-production.json은 키 설정 전 과거 결과입니다. 현재 상태의 근거는 이 보고서와 final 증거 파일입니다.
- 영업시간·현장 혼잡·정확한 이동시간·의료적 효능은 이 앱의 도구로 검증하지 않습니다.
