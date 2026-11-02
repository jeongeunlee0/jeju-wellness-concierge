-- Supabase SQL Editor 에서 한 번 실행하세요.
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  nickname text not null default '익명',   -- 로그인이 없어 닉네임을 사용자 구분 키로 사용 (MVP)
  summary text not null,
  preferences jsonb not null,              -- 입력한 휴식 선호
  course jsonb not null,                   -- 추천 코스(장소·순서·추천 이유·검증 여부)
  sources text[] not null default '{}',    -- 호출한 데이터 도구 목록
  created_at timestamptz not null default now()
);

alter table courses enable row level security;
-- 부트캠프 데모용: 누구나 읽기·쓰기·삭제 (실서비스라면 로그인 기반 정책으로 바꾸세요)
create policy "demo all" on courses for all using (true) with check (true);
