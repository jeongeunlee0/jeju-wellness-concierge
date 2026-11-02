-- Supabase SQL Editor 에서 한 번 실행하세요. (여러 번 실행해도 안전)
-- 선행 조건: Authentication → Sign In / Providers → "Allow anonymous sign-ins" 켜기
-- 로그인 없이도 브라우저마다 익명 사용자(auth.uid())가 생기고, 그 사용자 본인의 행만 읽고 쓸 수 있습니다.

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nickname text not null default '익명',   -- 화면 표시용 이름 (접근 권한과 무관)
  summary text not null,
  preferences jsonb not null,              -- 입력한 휴식 선호
  course jsonb not null,                   -- 추천 코스(장소·순서·추천 이유·검증 여부)
  sources text[] not null default '{}',    -- 호출한 데이터 도구 목록
  created_at timestamptz not null default now()
);

-- 이전 데모 버전(공개 정책)에서 올라온 소유자 없는 행 정리
alter table public.courses add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
delete from public.courses where user_id is null;
alter table public.courses alter column user_id set not null;

alter table public.courses enable row level security;
revoke all on public.courses from anon;
grant select, insert, delete on public.courses to authenticated;

drop policy if exists "demo all" on public.courses;
drop policy if exists "courses select own" on public.courses;
drop policy if exists "courses insert own" on public.courses;
drop policy if exists "courses delete own" on public.courses;
create policy "courses select own" on public.courses for select to authenticated using ((select auth.uid()) = user_id);
create policy "courses insert own" on public.courses for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "courses delete own" on public.courses for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists courses_user_created_idx on public.courses (user_id, created_at desc);

-- ── 장바구니: 마음에 드는 장소를 담아 두는 곳 (예약·결제 없음) ──
create table if not exists public.wellness_cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  source text not null check (source in ('tour', 'heritage', 'course')),
  addr text,
  lat double precision,
  lng double precision,
  minutes int not null default 60 check (minutes between 10 and 480),
  created_at timestamptz not null default now(),
  unique (user_id, source, name)
);
alter table public.wellness_cart enable row level security;
revoke all on public.wellness_cart from anon;
grant select, insert, delete on public.wellness_cart to authenticated;
drop policy if exists "wellness_cart select own" on public.wellness_cart;
drop policy if exists "wellness_cart insert own" on public.wellness_cart;
drop policy if exists "wellness_cart delete own" on public.wellness_cart;
create policy "wellness_cart select own" on public.wellness_cart for select to authenticated using ((select auth.uid()) = user_id);
create policy "wellness_cart insert own" on public.wellness_cart for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "wellness_cart delete own" on public.wellness_cart for delete to authenticated using ((select auth.uid()) = user_id);
create index if not exists wellness_cart_user_idx on public.wellness_cart (user_id, created_at desc);

-- ── 방명록: 누구나 읽고, 로그인(익명 포함)한 사용자가 쓰고, 본인 글만 지움 ──
create table if not exists public.guestbook (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 20),
  message text not null check (char_length(message) between 2 and 300),
  rating int check (rating between 1 and 5),
  place text check (place is null or char_length(place) <= 60),
  created_at timestamptz not null default now()
);
alter table public.guestbook enable row level security;
revoke all on public.guestbook from anon;
grant select on public.guestbook to anon;
grant select, insert, delete on public.guestbook to authenticated;
drop policy if exists "guestbook read all" on public.guestbook;
drop policy if exists "guestbook insert own" on public.guestbook;
drop policy if exists "guestbook delete own" on public.guestbook;
create policy "guestbook read all" on public.guestbook for select to anon, authenticated using (true);
-- 도배 방지: 같은 사용자는 30초에 한 번만 쓸 수 있음
create policy "guestbook insert own" on public.guestbook for insert to authenticated with check (
  (select auth.uid()) = user_id
  and not exists (select 1 from public.guestbook g where g.user_id = (select auth.uid()) and g.created_at > now() - interval '30 seconds')
);
create policy "guestbook delete own" on public.guestbook for delete to authenticated using ((select auth.uid()) = user_id);
create index if not exists guestbook_created_idx on public.guestbook (created_at desc);
