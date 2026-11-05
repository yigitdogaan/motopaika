-- Mesajlar v2: birebir sohbet, fotoğraf ve konum mesajı, üye listesi, zengin sohbet listesi.

-- 1) Odalar: grup (sürüş) ya da birebir (dm)
alter table public.chat_rooms add column kind text not null default 'group' check (kind in ('group', 'dm'));
alter table public.chat_rooms add column dm_key text unique;

-- 2) Mesajlar: metin / fotoğraf / konum
alter table public.chat_messages drop constraint if exists chat_messages_body_check;
alter table public.chat_messages alter column body set default '';
alter table public.chat_messages add column kind text not null default 'text' check (kind in ('text', 'image', 'location'));
alter table public.chat_messages add column media_path text;
alter table public.chat_messages add column lat double precision;
alter table public.chat_messages add column lng double precision;
alter table public.chat_messages add constraint chat_messages_icerik_check check (
  char_length(body) <= 1000 and (
    (kind = 'text' and char_length(body) >= 1)
    or (kind = 'image' and media_path is not null)
    or (kind = 'location' and lat is not null and lng is not null)
  )
);

-- 3) Mesaj medyası (fotoğraf): herkese açık okuma (yol tahmin edilemez UUID), yalnız kendi klasörüne yükleme.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-media', 'chat-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
create policy "chat_media_kendi_yukler" on storage.objects for insert to authenticated
  with check (bucket_id = 'chat-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 4) Birebir sohbeti aç (yoksa oluştur). Engelleme varsa reddeder.
create function public.get_or_create_dm(p_other uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := (select auth.uid());
  v_key text;
  v_room uuid;
begin
  if v_me is null then raise exception 'giris gerekli'; end if;
  if p_other is null or p_other = v_me then raise exception 'gecersiz kisi'; end if;
  if exists (
    select 1 from public.user_blocks
    where (blocker_id = v_me and blocked_id = p_other) or (blocker_id = p_other and blocked_id = v_me)
  ) then raise exception 'engelli'; end if;
  v_key := least(v_me::text, p_other::text) || ':' || greatest(v_me::text, p_other::text);
  select id into v_room from public.chat_rooms where dm_key = v_key;
  if v_room is null then
    insert into public.chat_rooms (name, kind, dm_key) values ('Birebir', 'dm', v_key)
      on conflict (dm_key) do nothing returning id into v_room;
    if v_room is null then select id into v_room from public.chat_rooms where dm_key = v_key; end if;
  end if;
  insert into public.chat_members (room_id, user_id) values (v_room, v_me), (v_room, p_other) on conflict do nothing;
  return v_room;
end $$;
revoke all on function public.get_or_create_dm(uuid) from public, anon;
grant execute on function public.get_or_create_dm(uuid) to authenticated;

-- 5) Üye listesi (yalnız odanın üyesi görebilir)
create function public.room_members(p_room uuid)
returns table (user_id uuid, username text, display_name text, avatar_path text, city text, role text, motorcycle text)
language sql stable security definer set search_path = '' as $$
  select pr.id, pr.username, pr.display_name, pr.avatar_path, ct.name, cm.role,
    (select m.brand || ' ' || m.model from public.motorcycles m where m.owner_id = pr.id order by m.created_at limit 1)
  from public.chat_members cm
  join public.profiles pr on pr.id = cm.user_id
  left join public.cities ct on ct.id = pr.city_id
  where cm.room_id = p_room and public.is_room_member(p_room)
  order by (cm.role = 'owner') desc, pr.username;
$$;
revoke all on function public.room_members(uuid) from public, anon;
grant execute on function public.room_members(uuid) to authenticated;

-- 6) Sohbet listesi: tür, son mesaj türü, birebirde karşı kişi
drop function public.my_rooms();
create function public.my_rooms()
returns table (
  id uuid, name text, kind text, post_id uuid, member_count bigint,
  last_body text, last_kind text, last_at timestamptz, unread bigint, pending bigint,
  peer_id uuid, peer_avatar text
)
language sql stable security definer set search_path = '' as $$
  select r.id,
    case when r.kind = 'dm' then coalesce(peer.display_name, peer.username, 'Sürücü') else r.name end,
    r.kind, r.post_id,
    (select count(*) from public.chat_members x where x.room_id = r.id),
    lm.body, lm.kind, lm.created_at,
    (select count(*) from public.chat_messages m
      where m.room_id = r.id and m.sender_id <> cm.user_id and m.created_at > cm.last_read_at),
    case when r.owner_id = cm.user_id
      then (select count(*) from public.ride_requests q where q.post_id = r.post_id and q.status = 'pending')
      else 0 end,
    peer.id, peer.avatar_path
  from public.chat_members cm
  join public.chat_rooms r on r.id = cm.room_id
  left join lateral (
    select body, kind, created_at from public.chat_messages m where m.room_id = r.id order by created_at desc limit 1
  ) lm on true
  left join lateral (
    select p.id, p.username, p.display_name, p.avatar_path
    from public.chat_members o join public.profiles p on p.id = o.user_id
    where r.kind = 'dm' and o.room_id = r.id and o.user_id <> cm.user_id limit 1
  ) peer on true
  where cm.user_id = (select auth.uid())
  order by coalesce(lm.created_at, r.created_at) desc;
$$;
revoke all on function public.my_rooms() from public, anon;
grant execute on function public.my_rooms() to authenticated;
