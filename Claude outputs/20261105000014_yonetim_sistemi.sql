-- Yönetim sistemi: yetkililer ve roller, yaptırımlar (uyarı/askıya alma/yasak), gönderi kaldırma (soft),
-- şikâyet işleme, duyurular, denetim günlüğü ve yönetim paneli RPC'leri.
-- Panel yalnız bu fonksiyonlar ve staff RLS politikaları üzerinden çalışır; service_role anahtarı gerekmez.
--
-- İLK SÜPER YÖNETİCİ: bu dosyayı çalıştırdıktan sonra SQL Editor'de şunu bir kez çalıştır:
--   insert into public.staff (user_id, role)
--   select id, 'super_admin' from auth.users where email = 'yigitdogaan@gmail.com';

-- ───────────────────────── 1) Yetkililer ─────────────────────────
create table public.staff (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  role text not null check (role in ('moderator', 'admin', 'super_admin')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;

create function public.role_rank(p_role text) returns integer
language sql immutable as $$
  select case p_role when 'moderator' then 1 when 'admin' then 2 when 'super_admin' then 3 else 0 end;
$$;

create function public.staff_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.staff where user_id = (select auth.uid());
$$;

create function public.is_staff(p_min text default 'moderator') returns boolean
language sql stable security definer set search_path = '' as $$
  select public.role_rank(public.staff_role()) >= public.role_rank(p_min);
$$;

-- Kendi satırını herkes okur (panel girişte rolünü öğrenir); tüm liste admin+ içindir.
create policy "staff_kendi_ya_da_admin_okur" on public.staff for select to authenticated
  using (user_id = (select auth.uid()) or public.is_staff('admin'));

-- Yetki denetimi (fonksiyonların içinde kullanılır)
create function public._need(p_min text default 'moderator') returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_staff(p_min) then
    raise exception 'yetki yok' using errcode = '42501';
  end if;
end $$;

-- ───────────────────────── 2) Denetim günlüğü ─────────────────────────
create table public.admin_audit (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_created_idx on public.admin_audit (created_at desc);
create index admin_audit_action_idx on public.admin_audit (action, created_at desc);
alter table public.admin_audit enable row level security;
create policy "audit_admin_okur" on public.admin_audit for select to authenticated using (public.is_staff('admin'));

create function public._audit(p_action text, p_type text, p_id text, p_details jsonb default '{}'::jsonb) returns void
language sql security definer set search_path = '' as $$
  insert into public.admin_audit (actor_id, action, target_type, target_id, details)
  values ((select auth.uid()), p_action, p_type, p_id, coalesce(p_details, '{}'::jsonb));
$$;

-- ───────────────────────── 3) Yaptırımlar ─────────────────────────
create table public.user_sanctions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('warning', 'suspension', 'ban')),
  reason text not null check (char_length(reason) between 3 and 500),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  revoked_at timestamptz,
  revoked_by uuid references public.profiles (id) on delete set null,
  revoke_note text,
  created_at timestamptz not null default now()
);
create index user_sanctions_user_idx on public.user_sanctions (user_id, created_at desc);
alter table public.user_sanctions enable row level security;
create policy "sanctions_kendi_ya_da_staff_okur" on public.user_sanctions for select to authenticated
  using (user_id = (select auth.uid()) or public.is_staff());

-- Aktif kısıtlama (askıya alma ya da yasak) var mı?
create function public.is_restricted(p_user uuid default null) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_sanctions s
    where s.user_id = coalesce(p_user, (select auth.uid()))
      and s.kind in ('suspension', 'ban')
      and s.revoked_at is null
      and s.starts_at <= now()
      and (s.ends_at is null or s.ends_at > now())
  );
$$;

-- Uygulama için: bende aktif kısıtlama varsa türü, nedeni ve bitişi.
create function public.my_restriction() returns table (kind text, reason text, ends_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select s.kind, s.reason, s.ends_at
  from public.user_sanctions s
  where s.user_id = (select auth.uid())
    and s.kind in ('suspension', 'ban')
    and s.revoked_at is null
    and s.starts_at <= now()
    and (s.ends_at is null or s.ends_at > now())
  order by (s.kind = 'ban') desc, s.ends_at desc nulls first
  limit 1;
$$;
revoke all on function public.my_restriction() from public, anon;
grant execute on function public.my_restriction() to authenticated;

-- Kısıtlı hesap içerik üretemez: kısıtlayıcı (AND'lenen) politikalar.
create policy "kisitli_post_yazamaz" on public.posts as restrictive for insert to authenticated with check (not public.is_restricted());
create policy "kisitli_yorum_yazamaz" on public.post_comments as restrictive for insert to authenticated with check (not public.is_restricted());
create policy "kisitli_selam_veremez" on public.post_salutes as restrictive for insert to authenticated with check (not public.is_restricted());
create policy "kisitli_rsvp_yapamaz" on public.post_rsvps as restrictive for insert to authenticated with check (not public.is_restricted());
create policy "kisitli_istek_atamaz" on public.ride_requests as restrictive for insert to authenticated with check (not public.is_restricted());
create policy "kisitli_mesaj_atamaz" on public.chat_messages as restrictive for insert to authenticated with check (not public.is_restricted());

-- Birebir sohbet açma da kısıtlı hesaba kapalı.
create or replace function public.get_or_create_dm(p_other uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := (select auth.uid());
  v_key text;
  v_room uuid;
begin
  if v_me is null then raise exception 'giris gerekli'; end if;
  if p_other is null or p_other = v_me then raise exception 'gecersiz kisi'; end if;
  if public.is_restricted(v_me) then raise exception 'kisitli'; end if;
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

-- ───────────────────────── 4) Gönderi kaldırma (soft) ─────────────────────────
alter table public.posts add column removed_at timestamptz;
alter table public.posts add column removed_by uuid references public.profiles (id) on delete set null;
alter table public.posts add column removed_reason text;
create index posts_removed_idx on public.posts (removed_at) where removed_at is not null;

create policy "posts_staff_okur" on public.posts for select to authenticated using (public.is_staff());

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
    where b.blocker_id = (select auth.uid()) and b.blocked_id = p.author_id
  );

-- Kaldırılmış sürüşe katılma isteği gönderilemez.
create or replace function public.ride_request_ok(p_post uuid, p_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.posts
    where id = p_post and category = 'surus' and author_id <> p_user and removed_at is null
      and coalesce(starts_at, created_at) > now() - interval '12 hours'
  );
$$;

-- ───────────────────────── 5) Şikâyetler: işlem durumu ─────────────────────────
alter table public.post_reports add column status text not null default 'open' check (status in ('open', 'actioned', 'dismissed'));
alter table public.post_reports add column handled_by uuid references public.profiles (id) on delete set null;
alter table public.post_reports add column handled_at timestamptz;
alter table public.post_reports add column handler_note text;
create index post_reports_status_idx on public.post_reports (status, created_at desc);
create policy "reports_staff_okur" on public.post_reports for select to authenticated using (public.is_staff());

-- ───────────────────────── 6) Bildirimler: yönetim kaynaklı türler ─────────────────────────
alter table public.notifications add column body text;
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (
  type in ('ride_request', 'ride_accepted', 'ride_declined', 'salute', 'comment', 'warning', 'post_removed', 'account_suspended', 'account_banned')
);

-- ───────────────────────── 7) Duyurular ─────────────────────────
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  body text not null check (char_length(body) between 1 and 500),
  level text not null default 'info' check (level in ('info', 'warning', 'critical')),
  active boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
create policy "duyuru_herkes_aktifi_okur" on public.announcements for select to authenticated
  using ((active and starts_at <= now() and (ends_at is null or ends_at > now())) or public.is_staff('admin'));

-- ───────────────────────── 8) Panel RPC'leri ─────────────────────────

-- Genel sayılar
create function public.admin_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare r jsonb;
begin
  perform public._need('moderator');
  select jsonb_build_object(
    'users_total', (select count(*) from public.profiles),
    'users_7d', (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'users_prev_7d', (select count(*) from public.profiles where created_at <= now() - interval '7 days' and created_at > now() - interval '14 days'),
    'posts_total', (select count(*) from public.posts where removed_at is null),
    'posts_7d', (select count(*) from public.posts where created_at > now() - interval '7 days'),
    'posts_prev_7d', (select count(*) from public.posts where created_at <= now() - interval '7 days' and created_at > now() - interval '14 days'),
    'posts_removed', (select count(*) from public.posts where removed_at is not null),
    'comments_total', (select count(*) from public.post_comments),
    'comments_7d', (select count(*) from public.post_comments where created_at > now() - interval '7 days'),
    'messages_7d', (select count(*) from public.chat_messages where created_at > now() - interval '7 days'),
    'active_rides', (select count(*) from public.posts where category = 'surus' and removed_at is null
                       and coalesce(starts_at, created_at) > now() - interval '12 hours'),
    'reports_open', (select count(distinct post_id) from public.post_reports where status = 'open'),
    'reports_7d', (select count(*) from public.post_reports where created_at > now() - interval '7 days'),
    'sanctions_active', (select count(*) from public.user_sanctions s
                           where s.kind in ('suspension', 'ban') and s.revoked_at is null and (s.ends_at is null or s.ends_at > now())),
    'staff_count', (select count(*) from public.staff),
    'by_category', coalesce((select jsonb_object_agg(c, n) from (
                      select category::text c, count(*) n from public.posts
                      where created_at > now() - interval '30 days' and removed_at is null group by 1) q), '{}'::jsonb),
    'top_cities', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'count', n) order by n desc) from (
                      select ct.name, count(*) n from public.profiles pr join public.cities ct on ct.id = pr.city_id
                      group by ct.name order by n desc limit 6) q), '[]'::jsonb)
  ) into r;
  return r;
end $$;

-- Günlük seri (grafik için)
create function public.admin_daily(p_days integer default 14)
returns table (day date, users bigint, posts bigint, comments bigint, reports bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._need('moderator');
  return query
  select d::date,
    (select count(*) from public.profiles x where (x.created_at at time zone 'Europe/Istanbul')::date = d::date),
    (select count(*) from public.posts x where (x.created_at at time zone 'Europe/Istanbul')::date = d::date),
    (select count(*) from public.post_comments x where (x.created_at at time zone 'Europe/Istanbul')::date = d::date),
    (select count(*) from public.post_reports x where (x.created_at at time zone 'Europe/Istanbul')::date = d::date)
  from generate_series(
    (now() at time zone 'Europe/Istanbul')::date - (greatest(least(p_days, 90), 1) - 1),
    (now() at time zone 'Europe/Istanbul')::date,
    interval '1 day') d
  order by 1;
end $$;

-- Şikâyet kuyruğu: gönderi bazında gruplu
create function public.admin_reports(p_status text default 'open', p_limit integer default 30, p_offset integer default 0)
returns table (
  post_id uuid, body text, category text, place text, photo_path text, post_created_at timestamptz, removed_at timestamptz,
  author_id uuid, author_username text, author_name text, author_avatar text, is_anonymous boolean,
  report_count bigint, open_count bigint, reasons jsonb, first_report_at timestamptz, last_report_at timestamptz, total_count bigint
)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._need('moderator');
  return query
  with g as (
    select r.post_id as pid,
      count(*) as n, count(*) filter (where r.status = 'open') as n_open,
      min(r.created_at) as ilk, max(r.created_at) as son
    from public.post_reports r group by r.post_id
  ), f as (
    select g.*, count(*) over () as toplam from g
    where (p_status = 'all')
       or (p_status = 'open' and g.n_open > 0)
       or (p_status = 'handled' and g.n_open = 0)
  )
  select p.id, p.body, p.category::text, p.place, p.photo_path, p.created_at, p.removed_at,
    p.author_id, pr.username, pr.display_name, pr.avatar_path, p.is_anonymous,
    f.n, f.n_open,
    coalesce((select jsonb_object_agg(q.r, q.c) from (
      select coalesce(nullif(x.reason, ''), 'Belirtilmedi') as r, count(*) as c from public.post_reports x where x.post_id = p.id group by 1) q), '{}'::jsonb),
    f.ilk, f.son, f.toplam
  from f
  join public.posts p on p.id = f.pid
  join public.profiles pr on pr.id = p.author_id
  order by (f.n_open > 0) desc, f.n_open desc, f.son desc
  limit greatest(least(p_limit, 100), 1) offset greatest(p_offset, 0);
end $$;

-- Bir gönderinin şikâyet ayrıntıları
create function public.admin_report_details(p_post uuid)
returns table (reporter_id uuid, reporter_username text, reason text, status text, created_at timestamptz,
               handled_by_username text, handled_at timestamptz, handler_note text)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._need('moderator');
  return query
  select r.reporter_id, rp.username, r.reason, r.status, r.created_at, hp.username, r.handled_at, r.handler_note
  from public.post_reports r
  join public.profiles rp on rp.id = r.reporter_id
  left join public.profiles hp on hp.id = r.handled_by
  where r.post_id = p_post
  order by r.created_at desc;
end $$;

-- Şikâyetleri reddet (gönderi kalır)
create function public.admin_dismiss_reports(p_post uuid, p_note text default null) returns integer
language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  perform public._need('moderator');
  update public.post_reports set status = 'dismissed', handled_by = (select auth.uid()), handled_at = now(), handler_note = left(p_note, 300)
    where post_id = p_post and status = 'open';
  get diagnostics n = row_count;
  perform public._audit('report.dismiss', 'post', p_post::text, jsonb_build_object('count', n, 'note', p_note));
  return n;
end $$;

-- Gönderiyi kaldır (soft): akıştan ve haritadan çıkar, açık şikâyetler "işlem yapıldı" olur, yazara bildirim gider.
create function public.admin_remove_post(p_post uuid, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_author uuid; v_body text;
begin
  perform public._need('moderator');
  if p_reason is null or char_length(trim(p_reason)) < 3 then raise exception 'neden gerekli'; end if;
  update public.posts set removed_at = now(), removed_by = (select auth.uid()), removed_reason = left(trim(p_reason), 300)
    where id = p_post and removed_at is null
    returning author_id, body into v_author, v_body;
  if v_author is null then raise exception 'gonderi bulunamadi ya da zaten kaldirilmis'; end if;
  update public.post_reports set status = 'actioned', handled_by = (select auth.uid()), handled_at = now()
    where post_id = p_post and status = 'open';
  insert into public.notifications (user_id, type, post_id, body) values (v_author, 'post_removed', p_post, left(trim(p_reason), 300));
  perform public._audit('post.remove', 'post', p_post::text, jsonb_build_object('reason', p_reason, 'author_id', v_author, 'body', left(v_body, 280)));
end $$;

create function public.admin_restore_post(p_post uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public._need('moderator');
  update public.posts set removed_at = null, removed_by = null, removed_reason = null where id = p_post and removed_at is not null;
  if not found then raise exception 'gonderi kaldirilmis degil'; end if;
  perform public._audit('post.restore', 'post', p_post::text);
end $$;

-- Gönderi listesi (arama + süzgeç)
create function public.admin_posts(p_search text default null, p_category text default null, p_state text default 'all',
                                   p_limit integer default 30, p_offset integer default 0)
returns table (
  id uuid, body text, category text, place text, photo_path text, is_anonymous boolean, created_at timestamptz,
  removed_at timestamptz, removed_reason text,
  author_id uuid, author_username text, author_name text, author_avatar text,
  report_count bigint, open_reports bigint, comment_count bigint, salute_count bigint, total_count bigint
)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._need('moderator');
  return query
  with f as (
    select p.*, count(*) over () as toplam,
      (select count(*) from public.post_reports r where r.post_id = p.id) as n_rep,
      (select count(*) from public.post_reports r where r.post_id = p.id and r.status = 'open') as n_open
    from public.posts p
    join public.profiles pr on pr.id = p.author_id
    where (p_category is null or p_category = '' or p.category::text = p_category)
      and (p_search is null or p_search = ''
           or p.body ilike '%' || p_search || '%' or p.place ilike '%' || p_search || '%'
           or pr.username ilike '%' || p_search || '%' or pr.display_name ilike '%' || p_search || '%')
      and (p_state = 'all'
           or (p_state = 'visible' and p.removed_at is null)
           or (p_state = 'removed' and p.removed_at is not null)
           or (p_state = 'anonymous' and p.is_anonymous)
           or (p_state = 'reported' and exists (select 1 from public.post_reports r where r.post_id = p.id)))
  )
  select f.id, f.body, f.category::text, f.place, f.photo_path, f.is_anonymous, f.created_at, f.removed_at, f.removed_reason,
    f.author_id, pr.username, pr.display_name, pr.avatar_path,
    f.n_rep, f.n_open,
    (select count(*) from public.post_comments c where c.post_id = f.id),
    (select count(*) from public.post_salutes s where s.post_id = f.id),
    f.toplam
  from f join public.profiles pr on pr.id = f.author_id
  order by f.created_at desc
  limit greatest(least(p_limit, 100), 1) offset greatest(p_offset, 0);
end $$;

-- Gönderi yorumları
create function public.admin_post_comments(p_post uuid)
returns table (id uuid, author_id uuid, author_username text, author_name text, body text, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._need('moderator');
  return query
  select c.id, c.author_id, pr.username, pr.display_name, c.body, c.created_at
  from public.post_comments c join public.profiles pr on pr.id = c.author_id
  where c.post_id = p_post order by c.created_at;
end $$;

create function public.admin_delete_comment(p_comment uuid, p_reason text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare v_body text; v_author uuid; v_post uuid;
begin
  perform public._need('moderator');
  delete from public.post_comments where id = p_comment returning body, author_id, post_id into v_body, v_author, v_post;
  if v_author is null then raise exception 'yorum bulunamadi'; end if;
  perform public._audit('comment.delete', 'comment', p_comment::text,
    jsonb_build_object('reason', p_reason, 'author_id', v_author, 'post_id', v_post, 'body', v_body));
end $$;

-- Kullanıcı listesi
create function public.admin_users(p_search text default null, p_filter text default 'all',
                                   p_limit integer default 30, p_offset integer default 0)
returns table (
  id uuid, username text, display_name text, avatar_path text, city text, created_at timestamptz, email text,
  posts_count bigint, reports_against bigint, active_sanction text, sanction_ends timestamptz, staff_role text, total_count bigint
)
language plpgsql stable security definer set search_path = '' as $$
declare v_admin boolean;
begin
  perform public._need('moderator');
  v_admin := public.is_staff('admin');
  return query
  with f as (
    select pr.id as uid, pr.username as uname, pr.display_name as dname, pr.avatar_path as av, ct.name as cname, pr.created_at as cat,
      au.email::text as mail,
      (select count(*) from public.posts p where p.author_id = pr.id) as np,
      (select count(*) from public.post_reports r join public.posts p on p.id = r.post_id where p.author_id = pr.id) as nr,
      (select s.kind from public.user_sanctions s
        where s.user_id = pr.id and s.kind in ('suspension', 'ban') and s.revoked_at is null and (s.ends_at is null or s.ends_at > now())
        order by (s.kind = 'ban') desc limit 1) as sk,
      (select s.ends_at from public.user_sanctions s
        where s.user_id = pr.id and s.kind in ('suspension', 'ban') and s.revoked_at is null and (s.ends_at is null or s.ends_at > now())
        order by (s.kind = 'ban') desc limit 1) as se,
      st.role as srole
    from public.profiles pr
    left join public.cities ct on ct.id = pr.city_id
    left join auth.users au on au.id = pr.id
    left join public.staff st on st.user_id = pr.id
    where (p_search is null or p_search = ''
           or pr.username ilike '%' || p_search || '%' or pr.display_name ilike '%' || p_search || '%'
           or (v_admin and au.email ilike '%' || p_search || '%'))
  ), g as (
    select f.*, count(*) over () as toplam from f
    where (p_filter = 'all')
       or (p_filter = 'restricted' and f.sk is not null)
       or (p_filter = 'reported' and f.nr > 0)
       or (p_filter = 'new' and f.cat > now() - interval '7 days')
       or (p_filter = 'staff' and f.srole is not null)
  )
  select g.uid, g.uname, g.dname, g.av, g.cname, g.cat, case when v_admin then g.mail else null end,
    g.np, g.nr, g.sk, g.se, g.srole, g.toplam
  from g order by g.cat desc
  limit greatest(least(p_limit, 100), 1) offset greatest(p_offset, 0);
end $$;

-- Kullanıcı ayrıntısı
create function public.admin_user_detail(p_user uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare r jsonb; v_admin boolean;
begin
  perform public._need('moderator');
  v_admin := public.is_staff('admin');
  select jsonb_build_object(
    'id', pr.id, 'username', pr.username, 'display_name', pr.display_name, 'bio', pr.bio, 'avatar_path', pr.avatar_path,
    'city', ct.name, 'created_at', pr.created_at,
    'email', case when v_admin then au.email else null end,
    'last_sign_in_at', case when v_admin then au.last_sign_in_at else null end,
    'staff_role', (select st.role from public.staff st where st.user_id = pr.id),
    'counts', jsonb_build_object(
      'posts', (select count(*) from public.posts p where p.author_id = pr.id),
      'posts_removed', (select count(*) from public.posts p where p.author_id = pr.id and p.removed_at is not null),
      'comments', (select count(*) from public.post_comments c where c.author_id = pr.id),
      'salutes_given', (select count(*) from public.post_salutes s where s.user_id = pr.id),
      'reports_against', (select count(*) from public.post_reports x join public.posts p on p.id = x.post_id where p.author_id = pr.id),
      'reports_made', (select count(*) from public.post_reports x where x.reporter_id = pr.id),
      'rooms', (select count(*) from public.chat_members m where m.user_id = pr.id),
      'blocked_by', (select count(*) from public.user_blocks b where b.blocked_id = pr.id)
    ),
    'motorcycles', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'brand', m.brand, 'model', m.model, 'year', m.year) order by m.created_at)
                              from public.motorcycles m where m.owner_id = pr.id), '[]'::jsonb),
    'sanctions', coalesce((select jsonb_agg(jsonb_build_object(
                    'id', s.id, 'kind', s.kind, 'reason', s.reason, 'starts_at', s.starts_at, 'ends_at', s.ends_at,
                    'revoked_at', s.revoked_at, 'revoke_note', s.revoke_note,
                    'by', (select x.username from public.profiles x where x.id = s.created_by),
                    'active', (s.kind in ('suspension', 'ban') and s.revoked_at is null and (s.ends_at is null or s.ends_at > now()))
                  ) order by s.created_at desc) from public.user_sanctions s where s.user_id = pr.id), '[]'::jsonb),
    'recent_posts', coalesce((select jsonb_agg(jsonb_build_object(
                    'id', p.id, 'body', p.body, 'category', p.category, 'created_at', p.created_at,
                    'removed_at', p.removed_at, 'is_anonymous', p.is_anonymous) order by p.created_at desc)
                  from (select * from public.posts x where x.author_id = pr.id order by x.created_at desc limit 10) p), '[]'::jsonb),
    'recent_comments', coalesce((select jsonb_agg(jsonb_build_object(
                    'id', c.id, 'body', c.body, 'post_id', c.post_id, 'created_at', c.created_at) order by c.created_at desc)
                  from (select * from public.post_comments x where x.author_id = pr.id order by x.created_at desc limit 10) c), '[]'::jsonb)
  ) into r
  from public.profiles pr
  left join public.cities ct on ct.id = pr.city_id
  left join auth.users au on au.id = pr.id
  where pr.id = p_user;
  if r is null then raise exception 'kullanici bulunamadi'; end if;
  return r;
end $$;

-- Yaptırım: uyarı / askıya alma (gün) / yasak
create function public.admin_sanction(p_user uuid, p_kind text, p_reason text, p_days integer default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := (select auth.uid());
  v_id uuid;
  v_end timestamptz;
  v_target_rank integer;
  v_my_rank integer := public.role_rank(public.staff_role());
  v_msg text;
begin
  perform public._need('moderator');
  if p_user = v_me then raise exception 'kendine yaptirim uygulanamaz'; end if;
  if p_reason is null or char_length(trim(p_reason)) < 3 then raise exception 'neden gerekli'; end if;
  if p_kind not in ('warning', 'suspension', 'ban') then raise exception 'gecersiz tur'; end if;
  select public.role_rank(role) into v_target_rank from public.staff where user_id = p_user;
  if coalesce(v_target_rank, 0) >= v_my_rank then raise exception 'ayni ya da ustun yetkiliye yaptirim uygulanamaz'; end if;
  if p_kind = 'ban' and v_my_rank < 2 then raise exception 'yasak icin admin yetkisi gerekir'; end if;
  if p_kind = 'suspension' then
    if p_days is null or p_days < 1 then raise exception 'gun sayisi gerekli'; end if;
    if p_days > 7 and v_my_rank < 2 then raise exception '7 gunden uzun askiya alma icin admin yetkisi gerekir'; end if;
    if p_days > 365 then raise exception 'en fazla 365 gun'; end if;
    v_end := now() + make_interval(days => p_days);
  end if;
  insert into public.user_sanctions (user_id, kind, reason, ends_at, created_by)
    values (p_user, p_kind, trim(p_reason), v_end, v_me) returning id into v_id;
  v_msg := case p_kind
    when 'warning' then trim(p_reason)
    when 'suspension' then trim(p_reason) || ' (' || p_days || ' gün)'
    else trim(p_reason) end;
  insert into public.notifications (user_id, type, body)
    values (p_user, case p_kind when 'warning' then 'warning' when 'suspension' then 'account_suspended' else 'account_banned' end, v_msg);
  perform public._audit('sanction.' || p_kind, 'user', p_user::text, jsonb_build_object('reason', p_reason, 'days', p_days, 'sanction_id', v_id));
  return v_id;
end $$;

create function public.admin_revoke_sanction(p_sanction uuid, p_note text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  perform public._need('admin');
  update public.user_sanctions set revoked_at = now(), revoked_by = (select auth.uid()), revoke_note = left(p_note, 300)
    where id = p_sanction and revoked_at is null returning user_id into v_user;
  if v_user is null then raise exception 'yaptirim bulunamadi ya da zaten kaldirilmis'; end if;
  perform public._audit('sanction.revoke', 'user', v_user::text, jsonb_build_object('sanction_id', p_sanction, 'note', p_note));
end $$;

-- Sürüşler
create function public.admin_rides(p_state text default 'active', p_limit integer default 30, p_offset integer default 0)
returns table (
  post_id uuid, body text, place text, city text, ride_type text, starts_at timestamptz, created_at timestamptz,
  state text, removed_at timestamptz,
  owner_id uuid, owner_username text, owner_name text,
  accepted bigint, pending bigint, declined bigint, room_id uuid, member_count bigint, total_count bigint
)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._need('moderator');
  return query
  with f as (
    select p.*,
      case when p.removed_at is not null then 'removed'
           when now() > coalesce(p.starts_at, p.created_at) + interval '12 hours' then 'past'
           when p.starts_at is not null and p.starts_at > now() then 'planned'
           else 'active' end as durum
    from public.posts p where p.category = 'surus'
  ), g as (
    select f.*, count(*) over () as toplam from f where p_state = 'all' or f.durum = p_state
  )
  select g.id, g.body, g.place, g.city, g.ride_type, g.starts_at, g.created_at, g.durum, g.removed_at,
    g.author_id, pr.username, pr.display_name,
    (select count(*) from public.ride_requests q where q.post_id = g.id and q.status = 'accepted'),
    (select count(*) from public.ride_requests q where q.post_id = g.id and q.status = 'pending'),
    (select count(*) from public.ride_requests q where q.post_id = g.id and q.status = 'declined'),
    (select cr.id from public.chat_rooms cr where cr.post_id = g.id),
    (select count(*) from public.chat_members cm join public.chat_rooms cr on cr.id = cm.room_id where cr.post_id = g.id),
    g.toplam
  from g join public.profiles pr on pr.id = g.author_id
  order by case g.durum when 'active' then 0 when 'planned' then 1 else 2 end, coalesce(g.starts_at, g.created_at) desc
  limit greatest(least(p_limit, 100), 1) offset greatest(p_offset, 0);
end $$;

-- Duyurular
create function public.admin_announcement_save(p_id uuid, p_title text, p_body text, p_level text, p_active boolean, p_ends_at timestamptz)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  perform public._need('admin');
  if p_id is null then
    insert into public.announcements (title, body, level, active, ends_at, created_by)
      values (trim(p_title), trim(p_body), p_level, coalesce(p_active, true), p_ends_at, (select auth.uid())) returning id into v_id;
    perform public._audit('announcement.create', 'announcement', v_id::text, jsonb_build_object('title', p_title, 'level', p_level));
  else
    update public.announcements set title = trim(p_title), body = trim(p_body), level = p_level, active = coalesce(p_active, true), ends_at = p_ends_at
      where id = p_id returning id into v_id;
    if v_id is null then raise exception 'duyuru bulunamadi'; end if;
    perform public._audit('announcement.update', 'announcement', v_id::text, jsonb_build_object('title', p_title, 'active', p_active));
  end if;
  return v_id;
end $$;

create function public.admin_announcement_delete(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_title text;
begin
  perform public._need('admin');
  delete from public.announcements where id = p_id returning title into v_title;
  if v_title is null then raise exception 'duyuru bulunamadi'; end if;
  perform public._audit('announcement.delete', 'announcement', p_id::text, jsonb_build_object('title', v_title));
end $$;

-- Yetkili yönetimi (yalnız süper yönetici)
create function public.admin_staff_list()
returns table (user_id uuid, username text, display_name text, email text, role text, created_at timestamptz, created_by_username text)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._need('admin');
  return query
  select s.user_id, pr.username, pr.display_name,
    case when public.is_staff('super_admin') then au.email::text else null end,
    s.role, s.created_at, cb.username
  from public.staff s
  join public.profiles pr on pr.id = s.user_id
  left join auth.users au on au.id = s.user_id
  left join public.profiles cb on cb.id = s.created_by
  order by public.role_rank(s.role) desc, s.created_at;
end $$;

create function public.admin_staff_set(p_username text, p_role text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_old text; v_supers integer;
begin
  perform public._need('super_admin');
  if p_role not in ('moderator', 'admin', 'super_admin') then raise exception 'gecersiz rol'; end if;
  select id into v_user from public.profiles where lower(username) = lower(trim(p_username));
  if v_user is null then raise exception 'kullanici bulunamadi'; end if;
  select role into v_old from public.staff where user_id = v_user;
  if v_old = 'super_admin' and p_role <> 'super_admin' then
    select count(*) into v_supers from public.staff where role = 'super_admin';
    if v_supers <= 1 then raise exception 'son super yonetici dusurulemez'; end if;
  end if;
  insert into public.staff (user_id, role, created_by) values (v_user, p_role, (select auth.uid()))
    on conflict (user_id) do update set role = excluded.role;
  perform public._audit('staff.set', 'user', v_user::text, jsonb_build_object('role', p_role, 'previous', v_old));
end $$;

create function public.admin_staff_remove(p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_old text; v_supers integer;
begin
  perform public._need('super_admin');
  select role into v_old from public.staff where user_id = p_user;
  if v_old is null then raise exception 'yetkili degil'; end if;
  if v_old = 'super_admin' then
    select count(*) into v_supers from public.staff where role = 'super_admin';
    if v_supers <= 1 then raise exception 'son super yonetici kaldirilamaz'; end if;
  end if;
  delete from public.staff where user_id = p_user;
  perform public._audit('staff.remove', 'user', p_user::text, jsonb_build_object('role', v_old));
end $$;

-- Denetim günlüğü
create function public.admin_audit_list(p_action text default null, p_actor uuid default null, p_limit integer default 50, p_offset integer default 0)
returns table (id bigint, created_at timestamptz, actor_id uuid, actor_username text, action text, target_type text, target_id text, details jsonb, total_count bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._need('admin');
  return query
  select a.id, a.created_at, a.actor_id, pr.username, a.action, a.target_type, a.target_id, a.details, count(*) over ()
  from public.admin_audit a left join public.profiles pr on pr.id = a.actor_id
  where (p_action is null or p_action = '' or a.action like p_action || '%')
    and (p_actor is null or a.actor_id = p_actor)
  order by a.created_at desc
  limit greatest(least(p_limit, 200), 1) offset greatest(p_offset, 0);
end $$;

-- ───────────────────────── 9) İzinler ─────────────────────────
-- Yardımcılar yalnız fonksiyonlar arası kullanılır; istemciye yalnız admin_* ve is_staff/staff_role/my_restriction açılır.
revoke all on function public._need(text) from public, anon, authenticated;
revoke all on function public._audit(text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.role_rank(text) from public, anon;
revoke all on function public.staff_role() from public, anon;
revoke all on function public.is_staff(text) from public, anon;
revoke all on function public.is_restricted(uuid) from public, anon;
grant execute on function public.role_rank(text) to authenticated;
grant execute on function public.staff_role() to authenticated;
grant execute on function public.is_staff(text) to authenticated;
grant execute on function public.is_restricted(uuid) to authenticated;

do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'admin\_%'
  loop
    execute format('revoke all on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated', f.sig);
  end loop;
end $$;
