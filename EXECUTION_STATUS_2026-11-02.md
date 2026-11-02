# JEJU WELLNESS CONCIERGE 최종 보완 검증
검증일: 2026-11-02, Asia/Seoul. 최초 v4에서 실행 검증 후 추가 수정한 결과입니다.

| 항목 | 현재 상태 | 확인한 근거 |
|---|---|---|
| React | 통과 | npm run build 성공. 앱 380.62 kB, Supabase 214.38 kB로 분리. chunk 크기 경고 제거 |
| 자동 검사 | 통과 | npm test 8/8, npm run lint 오류·경고 0 |
| 국가유산청 | 통과 | 실제 API 10건 조회, 화면 표시 및 Claude 도구 결과 전달 |
| Supabase | 통과 | 실제 저장 후 새로고침 조회, 별도 사용자 접근 0건. 앞선 live 검사 JSON 및 화면 증거 |
| Claude 인증 및 tool use | 통과 | 배포 UI에서 실제 Claude 응답 및 get_weather/search_tour_places/search_heritage 호출 기록 표시 |
| Claude 도구 결과 | 통과 | search_heritage 성공 10건. 날씨·관광정보 실패 결과도 구분해서 표시. 실제 성공/실패 혼합 시나리오 확인 |
| 관광공사 | 차단 | DATA_GO_KR_KEY가 아직 없어 정상 upstream 호출 미실행 |
| 기상청 | 차단 | DATA_GO_KR_KEY가 아직 없어 정상 upstream 호출 미실행 |
| GitHub 및 Vercel | 배포 완료 | 새 비공개 저장소 및 production URL 제공 |
| 모바일 | 브라우저 검증 통과 | 앞선 390×844 검사에서 조회/저장/새로고침 및 가로 넘침 없음 확인. 실제 휴대폰 하드웨어 검증은 미실시 |

앱: https://jeju-wellness-concierge.vercel.app
소스: https://github.com/jeongeunlee0/jeju-wellness-concierge (비공개)

## 추가 수정
- 지난 기상 예보를 첫 결과로 보여주던 로직을 현재 시간 이후 예보로 필터링·정렬.
- 국가유산 upstream HTML/오류 응답을 빈 검색 성공으로 처리하던 문제 수정.
- 검색어/조회 건수 검증. GET 전용 API의 다른 메서드는 405.
- 연결 미설정 503, 외부 조회 실패 502, 시간초과 504로 구분. 내부 원문 오류는 숨김.
- AI가 상속된 객체 속성 이름을 도구로 실행할 수 없도록 실제 등록 도구만 허용.
- AI SDK 자동 재시도 제거, 요청당 20초 제한, 루프 최대 3회. 서버 함수 한도 120초.
- 실제 Claude 응답에서 길이 제한으로 잘린 것을 발견해 2048 토큰으로 조정하고 잘림 안내 표시.
- 같은 설정 오류 도구를 반복 호출하지 않도록 지침 추가.
- 데이터가 없을 때 날씨 로딩이 끝나지 않던 문제 및 컴포넌트 해제 뒤 응답 반영 보완.
- Supabase 코드를 별도 chunk로 분리해 build 크기 경고 제거.

## 검사 구분
자동 검사 8개는 모델 전송을 대체한 회귀 검사입니다. 실제 Claude 성공의 근거는 배포 화면에서 관찰한 응답과 도구 기록입니다. 실제 호출에서는 get_weather 2회, search_tour_places 4회가 연결 미설정으로 실패했고 search_heritage 1회가 성공(10건)했습니다. Claude는 실패를 숨기지 않고 국가유산으로 확인된 후보만 제안했습니다. 이 관찰 이후 답변 잘림과 반복 호출 지침을 추가 보완했습니다.

verification-live.json 및 verification-production.json은 최초 검증 당시의 과거 결과입니다. 당시 Claude 미설정 결과를 포함하므로 현재 상태로 오해하지 마세요. 현재 증거는 별도 claude-live-trace.json/화면에 저장했습니다.

## 남은 필수 입력
Vercel production 환경변수 DATA_GO_KR_KEY에 공공데이터포털 Decoding 인증키를 설정해야 두 공공 API를 실제 검증할 수 있습니다. 관광공사와 기상청 활용 승인이 각각 필요합니다. 키를 채팅에 붙이지 말고 직접 설정하세요.

받은 Claude 키는 Vercel sensitive 서버 환경변수에만 저장했습니다. 소스·ZIP·브라우저 코드에 포함하지 않았습니다. 채팅에 공유된 키는 검증 후 재발급을 권장합니다.

## 운영상 제한
- 게스트 저장함은 같은 브라우저의 세션에 연결됩니다. 브라우저 데이터를 삭제하거나 다른 기기에서는 접근할 수 없습니다.
- Supabase guest access advisory는 의도한 익명 로그인 정책에 관한 경고입니다. 다른 사용자의 행 접근이 차단되는 것은 실제 테스트했습니다.
- Vercel GitHub Login Connection이 없어 직접 소스 업로드로 배포했습니다. push 자동 배포는 별도 연결이 필요합니다.
- Vercel이 생성한 런타임에서 Node url.parse deprecation 경고가 관찰됐습니다. 앱의 직접 url.parse 호출은 없습니다.
- AI 호출은 공개 데모 기능입니다. 대규모 운영용 비용 제어·가입 정책은 별도 요구사항입니다.

관광공사·기상청 실제 정상 응답은 아직 미완료이며, 키 없이 전체 완료라고 표시하지 않습니다.
