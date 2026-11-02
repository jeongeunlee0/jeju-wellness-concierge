<div align="center">

# 🌿 JEJU WELLNESS CONCIERGE

**오늘의 제주에 맞는 휴식 코스를 만들어 주는 웰니스 컨시어지**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-3D-000000?logo=threedotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-RLS-3ECF8E?logo=supabase&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-Agent-D97757)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

**[🌐 서비스](https://jeju-wellness-concierge-seven.vercel.app)** · **[📦 GitHub](https://github.com/jeongeunlee0/jeju-wellness-concierge)** · **[🎤 발표자료](docs/index.html)** · **[✅ 검증 보고서](VERIFICATION_REPORT.md)**

</div>

---

## 기획 의도

**"지금 나에게 어떤 휴식이 필요한가?"** 에서 출발해, 휴식 목적·동행·지역·시간을 고르면 그날의 날씨·대기질과 제주 관광·문화 데이터로 **가까운 곳끼리 이어지는 웰니스 코스**를 만들고, 장소마다 **방문객이 알아야 할 정보**(옷차림·준비물·주의사항·주차·주변 맛집·카페)를 실제 데이터로 알려 줍니다.

| 일반적인 장소 추천 | 이 서비스 |
|---|---|
| 장소 검색 중심 | 휴식 목적 중심 |
| 개별 관광지 | 동선이 이어지는 코스(장소 간 거리 표시) |
| 인기·평점 | 오늘 날씨·대기질과 개인 선호 반영 |
| 정보 나열 | 추천 이유 + 방문 가이드 + 근거 표시 |

## 주요 기능

| 기능 | 설명 |
|---|---|
| ✨ **코스 만들기** | Claude 에이전트가 날씨·대기질·관광·국가유산 도구를 스스로 골라 호출해 코스를 설계. 호출한 도구 목록을 화면에 표시 |
| 🛟 **AI 장애 대비 기본 추천** | AI 를 쓸 수 없을 때(크레딧 소진·장애)도 같은 공공데이터로 코스를 만들고 "기본 추천"이라고 표시 (`mode: "rules"`) |
| 🧭 **방문 가이드** | 장소별 오늘 옷차림(체감온도)·준비물·주의사항·일출/일몰, 주차·이용시간·쉬는 날·문의, 주변 맛집·카페(3km)·함께 가볼 곳(8km)과 실제 거리, 방문 꿀팁. 모든 안내에 근거(날씨 기반·공공데이터·일반 안내) 표시 |
| 🚗 **이동거리** | 코스의 장소 사이 직선거리와 차량 이동시간(추정) |
| 🛒 **장바구니** | 장소를 담아 합계 시간을 이용 시간과 비교, 담은 장소로 코스 재요청 (예약·결제 없음) |
| 📝 **방명록** | 다녀온 곳·별점·후기를 남기는 공개 게시판 (본인 글만 삭제, 30초 도배 방지) |
| 🔐 **로그인** | 로그인 없이 익명으로 사용, 이메일로 가입하면 같은 계정에 코스·장바구니가 이어짐 |
| 🗺 **비짓제주 연결** | 장소별 비짓제주 상세 페이지(TourAPI 가 제공하는 공식 주소)·검색 링크, 웰니스 공식 페이지 |
| 🏝 **3D 제주** | Three.js 로 그린 제주 지형 위에 코스 동선 표시 |
| 🪟 **리퀴드 글래스 디자인** | 직접 그린 SVG 아이콘·로고, 유리 질감 내비·카드·모바일 하단 탭 |

## 사용한 데이터 · 외부 연동

| 출처 | 쓰는 곳 | 비고 |
|---|---|---|
| **기상청 단기예보** | 코스·방문 가이드의 기온·강수확률·풍속 | 공공데이터포털 키 |
| **한국관광공사 TourAPI** (검색·위치기반·상세) | 장소 검색, 주변 맛집·카페·관광지와 거리, 주차·이용시간·쉬는 날 | 공공데이터포털 키 |
| **국가유산청 국가유산 검색** | 문화·유산, 코스 시작 장소 | 키 불필요 |
| **Open-Meteo 대기질** | 미세먼지·자외선 → 실내/실외 판단, 준비물 | 키 불필요 |
| **비짓제주** | 공식 상세 페이지·검색·웰니스 페이지 **링크** | 이용약관상 무단 복제가 금지되어 사진·글을 가져오지 않음. 공식 JEJU TourAPI 는 별도 키(담당자 승인)가 필요해 아직 미연동 |
| **Supabase** | 코스·장바구니·방명록 저장, 익명 로그인·이메일 로그인 | RLS 로 본인 데이터만 접근 |
| **Claude API** | 코스 설계 에이전트 | 서버 함수에서만 호출 |

## 과제 필수 조건 점검

| 조건 (안내서) | 상태 | 근거 |
|---|---|---|
| React(Vite) + Router + Store 구조 | ✅ | `src/pages` · `components` · `store`(Zustand) · `api` 분리 |
| 제주 콘텐츠·문화 IP 주제, 첫 화면 기획 의도 | ✅ | 홈 첫 문장. 국가유산·관광 데이터를 코스에 사용 |
| 공공데이터 API 3개 이상 실제 호출 | ✅ | 기상청·TourAPI·국가유산청(+Open-Meteo). 배포본 자동 검증 통과 |
| Supabase 저장·조회, 새로고침 후 유지 | ✅ | 코스·장바구니·방명록. 자동 검증 통과 |
| AI 에이전트가 도구를 골라 호출, 호출 목록 표시 | ⚠️ | 코드·화면 완료, 크레딧 소진 전 40/40 검증 통과. **현재 Anthropic 크레딧 소진으로 AI 호출이 거절됨 → 충전 필요** |
| (선택) Three.js 3D | ✅ | 3D 제주 + 코스 핀 |
| 체크포인트 1: 동작 체크·새로고침·404·닉네임 유지 | ✅ | 홈 하단 "동작 체크"(자세히 `/status`), `/abc` → 404, 내 정보의 표시 이름이 메뉴에 표시·유지 |
| 체크포인트 5: 저장 → 다른 브라우저에서도 보임 | ✅(변경) | 닉네임 대신 **로그인 계정**으로 이어짐 (닉네임만으로 남의 데이터를 볼 수 있는 보안 문제를 피함) |
| 체크포인트 6: 에이전트 테스트 캡처 | ⚠️ | 크레딧 충전 후 캡처 필요 (텍스트 결과는 검증 보고서에 기록) |
| 비밀 키 비노출 | ✅ | 키는 서버 함수에서만 사용, 빌드 결과물·저장소 스캔에서 키 없음 |

## 구조

```
api/          Vercel 서버 함수 — agent(코스) · guide(방문 가이드) · tour · weather · heritage · air · hello
server/       공공데이터 호출 · placeGuide(방문 가이드) · fallbackCourse(기본 추천)
src/
  pages/      Home · Concierge · Places · Heritage · Wellness(비짓제주) · Guestbook · Cart · My · Login · Status
  components/ CourseResult · PlaceGuide · ItemCard · Jeju3D · Icon · Logo · HealthStrip …
  store/      Zustand — 선호·코스·장바구니·방명록·로그인·알림
  lib/        supabase · visitjeju(링크) · geo(거리) · liquidGlass
supabase/schema.sql   courses · wellness_cart · guestbook + RLS
scripts/      verify-live.mjs(자동 검증) · make-report.mjs
```

## 실행

```bash
npm install
cp .env.example .env.local     # 값 채우기
npm run dev                    # http://localhost:5173 (화면 + /api 함께 동작)
```

| 변수 | 설명 |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Supabase (브라우저용 공개 값) |
| `DATA_GO_KR_KEY` | 공공데이터포털 Decoding 키 (서버 전용) — 기상청 단기예보·TourAPI 활용 승인 필요 |
| `ANTHROPIC_API_KEY` | Claude 키 (서버 전용) |
| `ANTHROPIC_MODEL` | (선택) 기본 `claude-sonnet-5-5` |

Supabase: Authentication 에서 **Anonymous sign-ins** 를 켜고, SQL Editor 에서 [`supabase/schema.sql`](supabase/schema.sql) 을 실행합니다(여러 번 실행해도 안전). 같은 프로젝트의 다른 과제 테이블(`cart_items` 등)은 건드리지 않습니다.

배포: Vercel 에 위 환경변수를 등록하고 `vercel deploy --prod` (비밀 키는 `--sensitive` 권장).

## 보안

- 비밀 키는 `/api` 서버 함수에서만 사용하고 브라우저 코드는 공공 API·Claude 를 직접 부르지 않습니다. `.env*` 는 Git 에서 제외됩니다.
- RLS: 코스·장바구니는 본인만 조회·저장·삭제, 방명록은 공개 읽기·본인 쓰기/삭제·30초 도배 방지. 로그인 없는 쓰기와 남의 id 위조는 거절됩니다.
- 서버 함수 입력 검증: 코스는 화면의 선택지 값만(그 밖은 400), 방문 가이드는 제주 범위 좌표·숫자 id 만 허용. IP 당 호출 제한(서버 인스턴스 단위 best-effort).

## 검증

`node scripts/verify-live.mjs <배포주소>` → `node scripts/make-report.mjs` 로 [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md) 를 만듭니다.

**배포본 2026-11-02: 79/83 통과.** 실패 4건은 모두 "Claude 에이전트가 직접 생성(mode=ai)" 항목으로, 원인은 Anthropic 크레딧 소진입니다(앱 결함 아님). 크레딧 소진 전 실행에서는 AI 시나리오를 포함해 40/40 이었습니다.

| 영역 | 확인한 것 |
|---|---|
| 환경변수·외부 연동 | 키 보유, 기상청·TourAPI·국가유산청·Open-Meteo 실제 응답, 비짓제주 링크 응답 |
| 방문 가이드 (환각 방지) | **주차·쉬는 날이 TourAPI 원본과 일치**, 옷차림이 예보 수치로 계산한 체감온도와 일치, 주변 장소가 반경 안·가까운 순, 일출/일몰 범위, 모든 안내에 근거 표시 |
| 코스 (환각 방지) | 추천 장소를 공공 API 에 다시 조회해 실재 확인, 없는 시설("블루문 스파") 비추천, 영업시간·전화번호 미생성, 의료 효과 단정 없음 |
| 코스 품질 | 장소 간 직선거리 20km 이내, 이용 시간 안에 들어옴 |
| Supabase | 코스·장바구니·방명록 RLS (로그인 없는 쓰기 차단, 타인 조회/삭제 불가, 위조 차단, 도배 방지) |

**검증하지 못한 것:** AI 가 직접 만든 코스(크레딧 충전 후 재검증), 가입·로그인 성공 경로(실제 이메일 필요), 비·미세먼지 나쁨 날의 실내 전환(검증 시점 날씨가 맑음), 비짓제주 검색 결과 내용(브라우저에서 렌더링되어 수동 확인: "웰니스" 76건).

## 한계

- 이동 시간은 직선거리 기반 **추정**이며 실제 길 안내가 아닙니다.
- 옷차림·준비물은 예보 수치에 정해진 기준을 적용한 일반 안내입니다.
- 이용시간·주차 등은 한국관광공사 공공데이터 기준이며 현장과 다를 수 있습니다.

---

<sub>데이터 출처: 기상청 · 한국관광공사 · 국가유산청 · Open-Meteo · 비짓제주(링크) · 제주대 청년도약 부트캠프 1기 개인 프로젝트</sub>
