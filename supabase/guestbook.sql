create table if not exists public.wellness_guestbook (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 nickname text not null default '여행자' check(char_length(nickname) between 1 and 20),
 message text not null check(char_length(message) between 5 and 300),
 created_at timestamptz not null default now()
);
alter table public.wellness_guestbook enable row level security;
create index if not exists wellness_guestbook_owner_time on public.wellness_guestbook(user_id,created_at desc);
grant select on public.wellness_guestbook to anon,authenticated;
grant insert,delete on public.wellness_guestbook to authenticated;
create policy "guestbook_public_read" on public.wellness_guestbook for select to anon,authenticated using(true);
create policy "guestbook_owner_insert" on public.wellness_guestbook for insert to authenticated with check (
 (select auth.uid()) = user_id
 and created_at between now()-interval '10 seconds' and now()+interval '10 seconds'
 and not exists(select 1 from public.wellness_guestbook previous where previous.user_id=(select auth.uid()) and previous.created_at>now()-interval '60 seconds')
);
create policy "guestbook_owner_delete" on public.wellness_guestbook for delete to authenticated using((select auth.uid())=user_id);
