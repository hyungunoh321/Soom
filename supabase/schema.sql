-- 숨표(SOOM) Supabase 스키마
-- 대시보드 SQL Editor에서 전체 실행하면 됩니다.
-- 스팟은 앱에 내장된 큐레이션 데이터(spot_id 문자열)를 그대로 쓰고,
-- 사용자 생성 데이터(후기·좋아요·신고·북마크·리스트·혼잡도 제보)만 서버에 둡니다.

-- ─────────────────────────────────────────────
-- 프로필 (auth.users 1:1)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '숨표 사용자',
  bio text not null default '조용한 산책을 좋아해요',
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles
  for select using (true);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- 가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- 후기
-- ─────────────────────────────────────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  text text not null,
  tags text[] not null default '{}',
  photos text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_spot_idx on public.reviews (spot_id, created_at desc);
create index if not exists reviews_user_idx on public.reviews (user_id, created_at desc);

alter table public.reviews enable row level security;

create policy "reviews_select_all" on public.reviews
  for select using (true);
create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = user_id);
create policy "reviews_update_own" on public.reviews
  for update using (auth.uid() = user_id);
create policy "reviews_delete_own" on public.reviews
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 후기 좋아요 (도움돼요)
-- ─────────────────────────────────────────────
create table if not exists public.review_likes (
  review_id uuid not null references public.reviews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

alter table public.review_likes enable row level security;

create policy "review_likes_select_all" on public.review_likes
  for select using (true);
create policy "review_likes_insert_own" on public.review_likes
  for insert with check (auth.uid() = user_id);
create policy "review_likes_delete_own" on public.review_likes
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 후기 신고 (신고자에게는 숨김, 운영 검토용)
-- ─────────────────────────────────────────────
create table if not exists public.review_reports (
  review_id uuid not null references public.reviews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

alter table public.review_reports enable row level security;

create policy "review_reports_select_own" on public.review_reports
  for select using (auth.uid() = user_id);
create policy "review_reports_insert_own" on public.review_reports
  for insert with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 북마크
-- ─────────────────────────────────────────────
create table if not exists public.bookmarks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  spot_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);

alter table public.bookmarks enable row level security;

create policy "bookmarks_select_own" on public.bookmarks
  for select using (auth.uid() = user_id);
create policy "bookmarks_insert_own" on public.bookmarks
  for insert with check (auth.uid() = user_id);
create policy "bookmarks_delete_own" on public.bookmarks
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 힐링 리스트
-- ─────────────────────────────────────────────
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.lists enable row level security;

create policy "lists_select_own" on public.lists
  for select using (auth.uid() = user_id);
create policy "lists_insert_own" on public.lists
  for insert with check (auth.uid() = user_id);
create policy "lists_update_own" on public.lists
  for update using (auth.uid() = user_id);
create policy "lists_delete_own" on public.lists
  for delete using (auth.uid() = user_id);

create table if not exists public.list_spots (
  list_id uuid not null references public.lists (id) on delete cascade,
  spot_id text not null,
  created_at timestamptz not null default now(),
  primary key (list_id, spot_id)
);

alter table public.list_spots enable row level security;

create policy "list_spots_select_own" on public.list_spots
  for select using (exists (select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid()));
create policy "list_spots_insert_own" on public.list_spots
  for insert with check (exists (select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid()));
create policy "list_spots_delete_own" on public.list_spots
  for delete using (exists (select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid()));

-- ─────────────────────────────────────────────
-- 혼잡도 제보 (전체 사용자 크라우드소싱, 최근 2시간만 유효)
-- ─────────────────────────────────────────────
create table if not exists public.congestion_reports (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  level text not null check (level in ('low', 'mid', 'high')),
  created_at timestamptz not null default now()
);

create index if not exists congestion_spot_idx on public.congestion_reports (spot_id, created_at desc);

alter table public.congestion_reports enable row level security;

create policy "congestion_select_all" on public.congestion_reports
  for select using (true);
create policy "congestion_insert_own" on public.congestion_reports
  for insert with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 사진 스토리지 (후기 사진 · 프로필 아바타)
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "photos_public_read" on storage.objects
  for select using (bucket_id = 'photos');
create policy "photos_auth_upload" on storage.objects
  for insert with check (bucket_id = 'photos' and auth.role() = 'authenticated');
