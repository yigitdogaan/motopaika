-- Sürüş grubu: buluşma ("Sürüş Arkadaşı") gönderisi paylaşılınca grup sohbeti otomatik açılır,
-- sahibi odanın yöneticisidir. Diğer sürücüler katılma isteği gönderir; sahibi profile bakıp kabul eder.

alter table public.chat_rooms add column owner_id uuid references public.profiles (id) on delete cascade;
alter table public.chat_members add column role text not null default 'member' check (role in ('owner', 'member'));

-- Eski serbest katılım kalkıyor: odaya yalnız kabul ile girilir.
drop function if exists public.join_post_room(uuid);

-- 1) Sürüş gönderisi atılınca oda + sahibi üye
create function public.create_ride_room() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_room uuid;
begin
  insert into public.chat_rooms (name, post_id, owner_id)
  values (left(coalesce(nullif(new.place, ''), new.body), 60), new.id, new.author_id)
  returning id into v_room;
  insert into public.chat_members (room_id, user_id, role) values (v_room, new.author_id, 'owner');
  return new;
end $$;
create trigger posts_create_ride_room after insert on public.posts
  for each row when (new.category = 'surus') execute function public.create_ride_room();

-- Mevcut sürüş gönderileri için oda aç
with yeni as (
  insert into public.chat_rooms (name, post_id, owner_id)
  select left(coalesce(nullif(p.place, ''), p.body), 60), p.id, p.author_id
  from public.posts p
  where p.category = 'surus' and not exists (select 1 from public.chat_rooms r where r.post_id = p.id)
  returning id, owner_id
)
insert into public.chat_members (room_id, user_id, role) select id, owner_id, 'owner' from yeni on conflict do nothing;
update public.chat_rooms r set owner_id = p.author_id from public.posts p where r.post_id = p.id and r.owner_id is null;
update public.chat_members m set role = 'owner' from public.chat_rooms r where r.id = m.room_id and r.owner_id = m.user_id;

-- 2) Katılma istekleri
create table public.ride_requests (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.ride_requests enable row level security;

create function public.ride_request_ok(p_post uuid, p_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.posts where id = p_post and category = 'surus' and author_id <> p_user);
$$;
revoke all on function public.ride_request_ok(uuid, uuid) from public, anon;
grant execute on function public.ride_request_ok(uuid, uuid) to authenticated;

create policy "ride_requests_kendi_okur" on public.ride_requests for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "ride_requests_kendi_ister" on public.ride_requests for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'pending' and public.ride_request_ok(post_id, user_id));
create policy "ride_requests_bekleyen_geri_al" on public.ride_requests for delete to authenticated
  using ((select auth.uid()) = user_id and status = 'pending');

-- Sahibin istek listesi: istekçinin profili (ad, şehir, garajı)
create function public.my_ride_requests(p_post uuid)
returns table (user_id uuid, username text, display_name text, city text, motorcycles text, status text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select rr.user_id, pr.username, pr.display_name, c.name,
    (select string_agg(m.brand || ' ' || m.model, ', ') from public.motorcycles m where m.owner_id = pr.id),
    rr.status, rr.created_at
  from public.ride_requests rr
  join public.profiles pr on pr.id = rr.user_id
  left join public.cities c on c.id = pr.city_id
  where rr.post_id = p_post
    and exists (select 1 from public.posts p where p.id = p_post and p.author_id = (select auth.uid()))
  order by (rr.status = 'pending') desc, rr.created_at;
$$;
revoke all on function public.my_ride_requests(uuid) from public, anon;
grant execute on function public.my_ride_requests(uuid) to authenticated;

-- Sahip kabul / red; kabulde istekçi odaya üye olur
create function public.answer_ride_request(p_post uuid, p_user uuid, p_accept boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare v_room uuid;
begin
  if not exists (select 1 from public.posts where id = p_post and author_id = (select auth.uid())) then
    raise exception 'yetkisiz';
  end if;
  update public.ride_requests set status = case when p_accept then 'accepted' else 'declined' end
    where post_id = p_post and user_id = p_user and status = 'pending';
  if not found then return; end if;
  if p_accept then
    select id into v_room from public.chat_rooms where post_id = p_post;
    insert into public.chat_members (room_id, user_id) values (v_room, p_user) on conflict do nothing;
  end if;
end $$;
revoke all on function public.answer_ride_request(uuid, uuid, boolean) from public, anon;
grant execute on function public.answer_ride_request(uuid, uuid, boolean) to authenticated;

-- Sohbet listesi: sahibi için bekleyen istek sayısı da gelir
drop function public.my_rooms();
create function public.my_rooms()
returns table (id uuid, name text, member_count bigint, last_body text, last_at timestamptz, unread bigint, pending bigint)
language sql stable security definer set search_path = '' as $$
  select r.id, r.name,
    (select count(*) from public.chat_members x where x.room_id = r.id),
    lm.body, lm.created_at,
    (select count(*) from public.chat_messages m
      where m.room_id = r.id and m.sender_id <> cm.user_id and m.created_at > cm.last_read_at),
    case when r.owner_id = cm.user_id
      then (select count(*) from public.ride_requests q where q.post_id = r.post_id and q.status = 'pending')
      else 0 end
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
