# JEJU WELLNESS CONCIERGE 실행 검증 결과

검증일: 2026-11-02 (Asia/Seoul). 기준: 다운로드한 v4 ZIP을 별도 작업 사본으로 수정.

| 항목 | 결과 | 실제 근거 |
|---|---|---|
| 의존성 설치 | 통과 | npm ci: 149 packages, audit 0 vulnerabilities |
| React build | 통과 | npm run build exit 0, dist 생성 |
| 린트 | 통과 | npm run lint: 오류·경고 0 |
| 브라우저 | 통과 | 로컬 홈/국가유산/저장함 및 배포 상담 화면 표시 |
| 국가유산청 | 통과 | 로컬·배포 /api/heritage HTTP 200, 10건, 제주 관덕정 포함 |
| TourAPI | 차단 | 로컬·배포 /api/tour HTTP 500: DATA_GO_KR_KEY 미설정. 실제 upstream 호출 미실행 |
| 기상청 | 차단 | 로컬·배포 /api/weather HTTP 500: DATA_GO_KR_KEY 미설정. 실제 upstream 호출 미실행 |
| Supabase | 통과 | 실제 장소 저장, 브라우저 새로고침 후 조회. 별도 세션 복원 테스트 ownRows=1 |
| 사용자별 접근 | 통과 | 다른 게스트 사용자 조회 otherUserRows=0. 테스트 행 삭제 성공 |
| Claude 실제 도구 호출 | 차단 | /api/agent HTTP 503: ANTHROPIC_API_KEY 미설정. 모델 접근과 실제 tool use 미검증 |
| 도구 기록 화면 | 코드 수정 | 도구명·입력·상태·건수·결과 표시, 중간 실패 시 기록 보존. 실제 Claude 결과 화면 검증은 미완료 |
| GitHub | 통과 | 새 비공개 저장소에 앱 전체 소스 및 lockfile 업로드 |
| Vercel | 통과 | production READY, 공개 URL에서 실제 앱·국가유산 API 확인 |
| 모바일 | 통과(브라우저 크기 검증) | 390×844에서 홈/메뉴/목록/상담 및 저장 새로고침 확인. page=viewport=390, 가로 넘침 없음 |
| Git 자동 배포 연결 | 차단 | Vercel 응답: GitHub Login Connection 필요. 현재는 소스 직접 업로드 배포 |

## 배포
- 앱: https://jeju-wellness-concierge.vercel.app
- GitHub: https://github.com/jeongeunlee0/jeju-wellness-concierge (비공개)
- 배포 ID: dpl_8pnw8qNBJXf5NDrqxmX7bHWDRthK
- 최초 배포 코드 commit: 240c233664f80964559c73cf0273103005ec8da0
- production READY, Vite, remote build 약 19초. 서버 함수 실제 지역 icn1.
- 이후 문서·검증 스크립트 커밋은 배포 앱의 동작 코드를 바꾸지 않습니다.

## 수정 내용
- npm run dev가 Vite 화면과 /api 함수를 함께 제공합니다. Vercel 로그인 없이 로컬 실행 가능.
- preflight가 .env.local을 읽어 실제 설정 여부를 출력합니다. 값은 출력하지 않습니다.
- Supabase 공개 nickname 접근을 없애고 전용 wellness_favorites + auth.uid() 소유권 정책 적용.
- 게스트 세션을 브라우저에 유지. 세션을 지우거나 기기를 바꾸면 저장함을 복구할 수 없는 제한을 화면에 안내.
- AI tool trace에 실제 결과와 성공/실패 상태를 추가하고 후속 모델 오류에도 이미 호출한 기록을 보존.
- ANTHROPIC_MODEL 환경변수로 모델 ID 설정 가능. v4 강사 지정 기본값은 유지했으며 실제 유효성은 미검증.
- 외부 공공 API 15초 제한, 원문 오류 응답 일부를 사용자에게 전달하던 동작 제거.
- 초기 검색 effect의 경고, 사용하지 않는 import 정리.
- .env 및 .vercel 제외 강화. ZIP과 GitHub에 비밀키·세션 토큰을 포함하지 않음.

## 남은 필수 입력 및 재검증
1. .env.local에 DATA_GO_KR_KEY와 ANTHROPIC_API_KEY를 직접 설정합니다. 키 값을 채팅에 붙이지 마세요.
2. TourAPI와 기상청 서비스의 활용 승인을 각각 확인합니다. 계정에서 허용된 ANTHROPIC_MODEL을 설정합니다.
3. Vercel 프로젝트의 production/preview 환경변수에도 서버 키를 직접 등록하고 재배포합니다.
4. node scripts/verify-live.mjs 실행. TEST_BASE_URL을 배포 URL로 바꾸면 배포 API를 검사합니다. 성공 항목을 위조하지 않고 모든 실제 연동이 통과할 때만 exit 0이 됩니다.
5. 실제 Claude 호출이 세 도구의 결과를 화면에 표시하는지 확인합니다. 현재 trace 코드를 추가한 사실은 실제 실행 성공의 증거가 아닙니다.
6. Vercel 계정에서 GitHub Login Connection을 연결해야 push 자동 배포가 가능합니다.

## 한계와 관찰
- 실제 스마트폰 하드웨어 검증은 하지 않았습니다. 데스크톱 Chrome의 모바일 viewport 검증입니다.
- 최종 로컬 build에는 약 595 kB JS chunk 크기 경고가 있으나 build는 성공했습니다.
- Vercel 런타임 로그에 Node 26 url.parse() deprecation 경고 3건을 확인했습니다. 예외 종료를 관찰하지 않았으며, 키 미설정 500/503은 미완료 연동 상태입니다.
- Supabase 기존 다른 앱의 익명 접근/비밀번호 보호 advisories는 변경하지 않았습니다. wellness_favorites에는 의도한 게스트 사용자 접근에 관한 Anonymous Access Policies 경고가 있습니다. 실제 사용자별 격리는 테스트로 확인했습니다. 참고: https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0012_auth_allow_anonymous_sign_ins
- DB에는 화면 검증으로 저장한 실제 공개 장소 제주 관덕정이 남아 있습니다. 자동 검증용 행은 삭제했습니다. 자동 테스트가 만든 게스트 Auth 계정은 유지됩니다.
- 공개 배포의 AI 기능은 현재 키 미설정으로 비활성입니다. 실제 키를 넣기 전 호출 비용·접근 제한 정책 검토가 남아 있습니다.

전체 개발 완료라고 주장하지 않습니다. 실행·배포·국가유산·저장 검증은 통과했고, 관광공사·기상청·Claude 실제 호출은 키가 없어 남았습니다.
