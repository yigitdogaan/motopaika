-- Akış gönderileri, selam, "Ben de geliyorum", yorum, şikâyet ve engelleme. Her tabloda RLS açık.
-- Anonim gönderide yazarın kimliği sızmasın diye `posts` tablosu yalnız yazarına açık;
-- herkes akışı `feed_posts` görünümünden okur (anonimse yazar alanları boş gelir).

create type public.post_category as enum ('uyari', 'surus', 'geyik', 'teknik');

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  is_anonymous boolean not null default false,
  category public.post_category not null,
  body text not null check (char_length(body) between 1 and 280),
  place text check (char_length(place) <= 120),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  has_photo boolean not null default false,
  motorcycle_id uuid references public.motorcycles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index posts_created_at_idx on public.posts (created_at desc);
create index posts_author_id_idx on public.posts (author_id);
alter table public.posts enable row level security;
create policy "posts_yazar_okur" on public.posts for select to authenticated
  using ((select auth.uid()) = author_id);
create policy "posts_yazar_ekler" on public.posts for insert to authenticated
  with check ((select auth.uid()) = author_id);
create policy "posts_yazar_siler" on public.posts for delete to authenticated
  using ((select auth.uid()) = author_id);

-- Selam Ver
create table public.post_salutes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.post_salutes enable row level security;
create policy "post_salutes_kendi_okur" on public.post_salutes for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "post_salutes_kendi_ekler" on public.post_salutes for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "post_salutes_kendi_siler" on public.post_salutes for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Ben de Geliyorum!
create table public.post_rsvps (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.post_rsvps enable row level security;
create policy "post_rsvps_kendi_okur" on public.post_rsvps for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "post_rsvps_kendi_ekler" on public.post_rsvps for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "post_rsvps_kendi_siler" on public.post_rsvps for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Yorumlar (yorumcu adı görünür)
create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 280),
  created_at timestamptz not null default now()
);
create index post_comments_post_id_idx on public.post_comments (post_id, created_at);
alter table public.post_comments enable row level security;
create policy "post_comments_giris_yapan_okur" on public.post_comments for select to authenticated
  using (true);
create policy "post_comments_kendi_ekler" on public.post_comments for insert to authenticated
  with check ((select auth.uid()) = author_id);
create policy "post_comments_kendi_siler" on public.post_comments for delete to authenticated
  using ((select auth.uid()) = author_id);

-- Şikâyet ve engelleme (kritik güvenlik: kurucu önceliği)
create table public.post_reports (
  post_id uuid not null references public.posts (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text check (char_length(reason) <= 300),
  created_at timestamptz not null default now(),
  primary key (post_id, reporter_id)
);
alter table public.post_reports enable row level security;
create policy "post_reports_kendi_okur" on public.post_reports for select to authenticated
  using ((select auth.uid()) = reporter_id);
create policy "post_reports_kendi_ekler" on public.post_reports for insert to authenticated
  with check ((select auth.uid()) = reporter_id);

create table public.user_blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
alter table public.user_blocks enable row level security;
create policy "user_blocks_kendi_okur" on public.user_blocks for select to authenticated
  using ((select auth.uid()) = blocker_id);
create policy "user_blocks_kendi_ekler" on public.user_blocks for insert to authenticated
  with check ((select auth.uid()) = blocker_id);
create policy "user_blocks_kendi_siler" on public.user_blocks for delete to authenticated
  using ((select auth.uid()) = blocker_id);

-- Akış görünümü: sayaçlar, "ben verdim mi" bayrakları, anonimlikte yazar gizleme, engellenenleri süzme.
create view public.feed_posts as
select
  p.id,
  p.category,
  p.body,
  p.place,
  p.lat,
  p.lng,
  p.has_photo,
  p.is_anonymous,
  p.created_at,
  case when p.is_anonymous then null else pr.username end as author_username,
  case when p.is_anonymous then null else pr.display_name end as author_name,
  case when m.id is null then null else m.brand || ' ' || m.model end as motorcycle,
  (select count(*) from public.post_salutes s where s.post_id = p.id) as salute_count,
  (select count(*) from public.post_rsvps r where r.post_id = p.id) as rsvp_count,
  (select count(*) from public.post_comments c where c.post_id = p.id) as comment_count,
  exists (select 1 from public.post_salutes s where s.post_id = p.id and s.user_id = (select auth.uid())) as saluted,
  exists (select 1 from public.post_rsvps r where r.post_id = p.id and r.user_id = (select auth.uid())) as rsvped,
  (p.author_id = (select auth.uid())) as is_mine
from public.posts p
join public.profiles pr on pr.id = p.author_id
left join public.motorcycles m on m.id = p.motorcycle_id
where not exists (
  select 1 from public.user_blocks b
  where b.blocker_id = (select auth.uid()) and b.blocked_id = p.author_id
);
revoke all on public.feed_posts from anon;
grant select on public.feed_posts to authenticated;
