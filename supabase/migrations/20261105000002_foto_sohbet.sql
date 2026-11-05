-- Gönderi fotoğrafı (Storage) ve grup sohbetleri (buluşma başına bir oda). Her tabloda RLS açık.

-- 1) Fotoğraf: dosya yolu rastgele UUID'dir (yazarın kimliğini sızdırmaz).
alter table public.posts add column photo_path text;

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
  p.photo_path
from public.posts p
join public.profiles pr on pr.id = p.author_id
left join public.motorcycles m on m.id = p.motorcycle_id
where not exists (
  select 1 from public.user_blocks b
  where b.blocker_id = (select auth.uid()) and b.blocked_id = p.author_id
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-photos', 'post-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "post_photos_giris_yapan_yukler" on storage.objects for insert to authenticated
  with check (bucket_id = 'post-photos');

-- 2) Sohbet odaları
create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  post_id uuid unique references public.posts (id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.chat_members (
  room_id uuid not null references public.chat_rooms (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index chat_messages_room_idx on public.chat_messages (room_id, created_at desc);
create index chat_members_user_idx on public.chat_members (user_id);
alter table public.chat_rooms enable row level security;
alter table public.chat_members enable row level security;
alter table public.chat_messages enable row level security;

-- RLS özyinelemesini önlemek için üyelik denetimi SECURITY DEFINER fonksiyonda.
create function public.is_room_member(p_room uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.chat_members where room_id = p_room and user_id = (select auth.uid()));
$$;
revoke all on function public.is_room_member(uuid) from public, anon;
grant execute on function public.is_room_member(uuid) to authenticated;

create policy "chat_rooms_uye_okur" on public.chat_rooms for select to authenticated
  using (public.is_room_member(id));
create policy "chat_members_oda_okur" on public.chat_members for select to authenticated
  using (public.is_room_member(room_id));
create policy "chat_members_kendi_okundu" on public.chat_members for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "chat_members_kendi_ayrilir" on public.chat_members for delete to authenticated
  using ((select auth.uid()) = user_id);
create policy "chat_messages_uye_okur" on public.chat_messages for select to authenticated
  using (public.is_room_member(room_id));
create policy "chat_messages_uye_yazar" on public.chat_messages for insert to authenticated
  with check ((select auth.uid()) = sender_id and public.is_room_member(room_id));

-- Buluşma gönderisinin odasına katıl (yoksa oluşturur). Oda id döner.
create function public.join_post_room(p_post uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_room uuid;
  v_name text;
begin
  if (select auth.uid()) is null then raise exception 'giris gerekli'; end if;
  select id into v_room from public.chat_rooms where post_id = p_post;
  if v_room is null then
    select left(coalesce(nullif(place, ''), body), 60) into v_name from public.posts where id = p_post;
    if v_name is null then raise exception 'gonderi yok'; end if;
    insert into public.chat_rooms (name, post_id) values (v_name, p_post)
      on conflict (post_id) do nothing returning id into v_room;
    if v_room is null then select id into v_room from public.chat_rooms where post_id = p_post; end if;
  end if;
  insert into public.chat_members (room_id, user_id) values (v_room, (select auth.uid()))
    on conflict do nothing;
  return v_room;
end $$;
revoke all on function public.join_post_room(uuid) from public, anon;
grant execute on function public.join_post_room(uuid) to authenticated;

-- Sohbet listesi: son mesaj, okunmamış ve üye sayısı.
create function public.my_rooms()
returns table (id uuid, name text, member_count bigint, last_body text, last_at timestamptz, unread bigint)
language sql stable security definer set search_path = '' as $$
  select r.id, r.name,
    (select count(*) from public.chat_members x where x.room_id = r.id),
    lm.body, lm.created_at,
    (select count(*) from public.chat_messages m
      where m.room_id = r.id and m.sender_id <> cm.user_id and m.created_at > cm.last_read_at)
  from public.chat_members cm
  join public.chat_rooms r on r.id = cm.room_id
  left join lateral (
    select body, created_at from public.chat_messages m where m.room_id = r.id order by created_at desc limit 1
  ) lm on true
  where cm.user_id = (select auth.uid())
  order by coalesce(lm.created_at, r.created_at) desc;
$$;
revoke all on function public.my_rooms() from public, anon;
grant execute on function public.my_rooms() to authenticated;

alter publication supabase_realtime add table public.chat_messages;
