-- Gönderide birden fazla fotoğraf (en çok 4). `photo_path` ilk fotoğraf olarak kalır (yönetim paneli ve eski sürümler için).
alter table public.posts add column photo_paths text[] not null default '{}';
update public.posts set photo_paths = array[photo_path] where photo_path is not null;
alter table public.posts add constraint posts_photo_paths_en_cok_4 check (cardinality(photo_paths) <= 4);

-- Akış görünümü: aynı tanım, sonuna photo_paths eklendi (create or replace yalnız sona sütun eklemeye izin verir).
create or replace view public.feed_posts as
select
  p.id, p.category, p.body, p.place, p.lat, p.lng, p.has_photo, p.is_anonymous, p.created_at,
  case when p.is_anonymous then null else pr.username end as author_username,
  case when p.is_anonymous then null else pr.display_name end as author_name,
  case when p.is_anonymous then null
       else coalesce(
         (select m2.brand || ' ' || m2.model from public.motorcycles m2 where m2.id = p.motorcycle_id),
         (select m3.brand || ' ' || m3.model from public.motorcycles m3 where m3.owner_id = p.author_id order by m3.created_at limit 1)
       ) end as motorcycle,
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
  p.starts_at,
  p.photo_paths
from public.posts p
join public.profiles pr on pr.id = p.author_id
where p.removed_at is null
  and not exists (
    select 1 from public.user_blocks b
    where (b.blocker_id = (select auth.uid()) and b.blocked_id = p.author_id)
       or (b.blocker_id = p.author_id and b.blocked_id = (select auth.uid()))
  );
