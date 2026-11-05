-- Kartta gönderi sahibinin motosikleti: gönderide seçili yoksa garajındaki ilk motor gösterilir (anonimde gizli).
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
  p.starts_at
from public.posts p
join public.profiles pr on pr.id = p.author_id
where not exists (
  select 1 from public.user_blocks b
  where b.blocker_id = (select auth.uid()) and b.blocked_id = p.author_id
);
