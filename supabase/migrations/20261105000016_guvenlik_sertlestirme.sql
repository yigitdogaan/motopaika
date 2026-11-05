-- Güvenlik sertleştirme: özel mesaj medyası, hız sınırı, iki yönlü engelleme, profilleri girişe bağlama, hesap silme.

-- ───────────── 1) chat-media artık özel kova ─────────────
update storage.buckets set public = false where id = 'chat-media';
create policy "chat_media_uye_okur" on storage.objects for select to authenticated
  using (
    bucket_id = 'chat-media' and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1 from public.chat_messages m
        join public.chat_members cm on cm.room_id = m.room_id
        where m.media_path = storage.objects.name and cm.user_id = (select auth.uid())
      )
    )
  );

-- ───────────── 2) Hız sınırı ─────────────
create function public.enforce_rate_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_limit integer := tg_argv[0]::integer;
  v_pencere interval := tg_argv[1]::interval;
  v_kolon text := tg_argv[2];
  v_uid uuid;
  v_n integer;
begin
  execute format('select ($1).%I', v_kolon) into v_uid using new;
  execute format('select count(*) from %I.%I where %I = $1 and created_at > now() - $2', tg_table_schema, tg_table_name, v_kolon)
    into v_n using v_uid, v_pencere;
  if v_n >= v_limit then raise exception 'cok hizli' using errcode = 'P0001'; end if;
  return new;
end $$;

create trigger posts_hiz before insert on public.posts
  for each row execute function public.enforce_rate_limit(10, '1 hour', 'author_id');
create trigger yorum_hiz before insert on public.post_comments
  for each row execute function public.enforce_rate_limit(20, '10 minutes', 'author_id');
create trigger mesaj_hiz before insert on public.chat_messages
  for each row execute function public.enforce_rate_limit(30, '1 minute', 'sender_id');
create trigger istek_hiz before insert on public.ride_requests
  for each row execute function public.enforce_rate_limit(10, '1 hour', 'user_id');
create trigger sikayet_hiz before insert on public.post_reports
  for each row execute function public.enforce_rate_limit(20, '1 hour', 'reporter_id');

-- ───────────── 3) İki yönlü engelleme ─────────────
-- user_blocks'u yalnız engelleyen okuyabildiği için karşı yön, security definer yardımcılarla kontrol edilir.
create function public.blocked_between(p_other uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_blocks b
    where (b.blocker_id = (select auth.uid()) and b.blocked_id = p_other)
       or (b.blocker_id = p_other and b.blocked_id = (select auth.uid()))
  );
$$;
revoke all on function public.blocked_between(uuid) from public, anon;
grant execute on function public.blocked_between(uuid) to authenticated;

create function public.room_blocked(p_room uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.chat_rooms r
    join public.chat_members cm on cm.room_id = r.id and cm.user_id <> (select auth.uid())
    where r.id = p_room and r.kind = 'dm' and public.blocked_between(cm.user_id)
  );
$$;
revoke all on function public.room_blocked(uuid) from public, anon;
grant execute on function public.room_blocked(uuid) to authenticated;

-- Engellenen kişinin yorumları görünmez; engelli birebir sohbete mesaj yazılamaz.
drop policy "post_comments_giris_yapan_okur" on public.post_comments;
create policy "post_comments_giris_yapan_okur" on public.post_comments for select to authenticated
  using (not public.blocked_between(author_id));
create policy "engelli_dm_yazamaz" on public.chat_messages as restrictive for insert to authenticated
  with check (not public.room_blocked(room_id));

-- Akış: engelleyen de engellenen de birbirinin gönderisini görmez.
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
where p.removed_at is null
  and not exists (
    select 1 from public.user_blocks b
    where (b.blocker_id = (select auth.uid()) and b.blocked_id = p.author_id)
       or (b.blocker_id = p.author_id and b.blocked_id = (select auth.uid()))
  );

-- ───────────── 4) Profiller ve garaj yalnız giriş yapanlara açık ─────────────
drop policy "profiles_herkes_okur" on public.profiles;
create policy "profiles_giris_yapan_okur" on public.profiles for select to authenticated using (true);
drop policy "motorcycles_herkes_okur" on public.motorcycles;
create policy "motorcycles_giris_yapan_okur" on public.motorcycles for select to authenticated using (true);
drop policy "motor_foto_herkes_okur" on public.motorcycle_photos;
create policy "motor_foto_giris_yapan_okur" on public.motorcycle_photos for select to authenticated using (true);

-- ───────────── 5) Hesabı kalıcı sil ─────────────
-- auth.users satırı silinince profil ve ona bağlı her şey (gönderi, yorum, mesaj, motor, bildirim…) zincirleme silinir.
create function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := (select auth.uid());
  v_rol text;
  v_supers integer;
begin
  if v_me is null then raise exception 'giris gerekli'; end if;
  select role into v_rol from public.staff where user_id = v_me;
  if v_rol = 'super_admin' then
    select count(*) into v_supers from public.staff where role = 'super_admin';
    if v_supers <= 1 then raise exception 'son super yonetici silinemez'; end if;
  end if;
  delete from auth.users where id = v_me;
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
