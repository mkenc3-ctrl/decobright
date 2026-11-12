-- 데코브라이트 앱 서버 규칙 (2026-11-12, 서울 프로젝트 decobright)
-- 팀원 명단: 여기 있는 이메일로 로그인한 사람만 자료를 보고 씁니다
create table if not exists public.members (email text primary key, name text);
alter table public.members enable row level security;
drop policy if exists "본인 확인" on public.members;
create policy "본인 확인" on public.members for select to authenticated using (email = auth.jwt()->>'email');

create or replace function public.is_member() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where email = auth.jwt()->>'email');
$$;

-- 모든 자료 (coll: quotes, customers, orders, events, partners, memos, prices, settings)
-- 지운 자료는 data 에 _del:true 로 남겨 다른 기기에도 지워지게 합니다
create table if not exists public.records (
  coll text not null, id text not null, data jsonb not null,
  updated_at timestamptz not null default now(), updated_by text,
  primary key (coll, id));
create index if not exists records_updated on public.records (updated_at);
alter table public.records enable row level security;
drop policy if exists "팀원 읽기" on public.records;
drop policy if exists "팀원 쓰기" on public.records;
drop policy if exists "팀원 고치기" on public.records;
create policy "팀원 읽기" on public.records for select to authenticated using (public.is_member());
create policy "팀원 쓰기" on public.records for insert to authenticated with check (public.is_member());
create policy "팀원 고치기" on public.records for update to authenticated using (public.is_member()) with check (public.is_member());

-- 고친 시각·고친 사람은 서버가 직접 적습니다
create or replace function public.records_touch() returns trigger language plpgsql as $$
begin new.updated_at := clock_timestamp(); new.updated_by := auth.jwt()->>'email'; return new; end $$;
drop trigger if exists records_touch on public.records;
create trigger records_touch before insert or update on public.records for each row execute function public.records_touch();

-- 현장 사진 보관함 (비공개, 다음 단계에서 사용)
insert into storage.buckets (id, name, public) values ('photos', 'photos', false) on conflict do nothing;
drop policy if exists "팀원 사진 읽기" on storage.objects;
drop policy if exists "팀원 사진 올리기" on storage.objects;
drop policy if exists "팀원 사진 지우기" on storage.objects;
create policy "팀원 사진 읽기" on storage.objects for select to authenticated using (bucket_id = 'photos' and public.is_member());
create policy "팀원 사진 올리기" on storage.objects for insert to authenticated with check (bucket_id = 'photos' and public.is_member());
create policy "팀원 사진 지우기" on storage.objects for delete to authenticated using (bucket_id = 'photos' and public.is_member());

-- 팀원 등록 (동업자는 나중에 한 줄 추가: insert into public.members (email, name) values ('이메일', '이름');)
insert into public.members (email, name) values ('decobright@naver.com', '데코브라이트') on conflict do nothing;
