-- Anlık ve planlı sürüş: planlıda ileri bir saat (starts_at) seçilir. Aktiflik süresi (12 saat) başlangıçtan sayılır.
alter table public.posts add column ride_type text check (ride_type in ('instant', 'planned'));
alter table public.posts add column starts_at timestamptz;
alter table public.posts add constraint posts_surus_zamanli check (category <> 'surus' or starts_at is not null) not valid;

create or replace view public.feed_posts as
select
  p.id, p.category, p.body, p.place, p.lat, p.lng, p.has_photo, p.is_anonymous, p.created_at,
  case when p.is_anonymous then null else pr.username end as author_username,
  case when p.is_anonymous then null else pr.display_name end as author_name,
  case when m.id is null then null else m.brand || ' ' || m.model end as motorcycle,
  (select count(*) from public.post_salutes s where s.post_id = p.id) as salute_count,
  (select count(*) from public.post_rsvps r where r.post_id = p.id) as rsvp_count,
  (select count(*) from public.post_comments c where c.post_id = p.id) as comment_count,
  exists (select 1 from public.post_salutes s where s.post_id = p.id and s.user_id = (select auth.uid())) as saluted,
  exists (select 1 from public.post_rsvps r where r.post_id = p.id and r.user_id = (select auth.uid())) as rsvped,
  (p.author_id = (select auth.uid())) as is_mine,
  p.photo_path,
  p.city,
  case when p.is_anonymous then null else p.author_id end as author_id,
  case when p.is_anonymous then null else pr.avatar_path end as author_avatar,
  p.ride_type,
  p.starts_at
from public.posts p
join public.profiles pr on pr.id = p.author_id
left join public.motorcycles m on m.id = p.motorcycle_id
where not exists (
  select 1 from public.user_blocks b
  where b.blocker_id = (select auth.uid()) and b.blocked_id = p.author_id
);

create or replace function public.ride_request_ok(p_post uuid, p_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.posts
    where id = p_post and category = 'surus' and author_id <> p_user
      and coalesce(starts_at, created_at) > now() - interval '12 hours'
  );
$$;

create or replace function public.answer_ride_request(p_post uuid, p_user uuid, p_accept boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare v_room uuid;
begin
  if not exists (select 1 from public.posts where id = p_post and author_id = (select auth.uid())) then
    raise exception 'yetkisiz';
  end if;
  if exists (select 1 from public.posts where id = p_post and coalesce(starts_at, created_at) <= now() - interval '12 hours') then
    raise exception 'surus sona erdi';
  end if;
  update public.ride_requests set status = case when p_accept then 'accepted' else 'declined' end
    where post_id = p_post and user_id = p_user and status = 'pending';
  if not found then return; end if;
  if p_accept then
    select id into v_room from public.chat_rooms where post_id = p_post;
    insert into public.chat_members (room_id, user_id) values (v_room, p_user) on conflict do nothing;
  end if;
end $$;
