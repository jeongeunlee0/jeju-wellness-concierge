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
