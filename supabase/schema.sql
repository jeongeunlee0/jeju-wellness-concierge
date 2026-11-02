-- Enable Anonymous Sign-Ins in Supabase Auth. No public nickname-based access.
create table if not exists public.wellness_favorites (
 id bigint generated always as identity primary key,
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 source text not null check (source in ('tour','heritage')),
 item_id text not null, title text not null,
 created_at timestamptz not null default now(), unique(user_id, source, item_id)
);
alter table public.wellness_favorites enable row level security;
grant select, insert, delete on public.wellness_favorites to authenticated;
grant usage, select on sequence public.wellness_favorites_id_seq to authenticated;
drop policy if exists "wellness select own" on public.wellness_favorites;
drop policy if exists "wellness insert own" on public.wellness_favorites;
drop policy if exists "wellness delete own" on public.wellness_favorites;
create policy "wellness select own" on public.wellness_favorites for select to authenticated using ((select auth.uid()) = user_id);
create policy "wellness insert own" on public.wellness_favorites for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "wellness delete own" on public.wellness_favorites for delete to authenticated using ((select auth.uid()) = user_id);
