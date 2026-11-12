-- Şikâyet sistemi geliştirmesi: serbest not alanı, profil şikâyeti, çoklu şikâyette otomatik gizleme.

-- 1) Gönderi şikâyetine isteğe bağlı açıklama notu (neden `reason` içinde kalır, yönetim paneli gruplaması bozulmaz).
alter table public.post_reports add column if not exists detail text check (char_length(detail) <= 300);

-- 2) Profil şikâyetleri
create table if not exists public.user_reports (
  reported_id uuid not null references public.profiles (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text check (char_length(reason) <= 100),
  detail text check (char_length(detail) <= 300),
  status text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  handled_by uuid references public.profiles (id) on delete set null,
  handled_at timestamptz,
  handler_note text,
  created_at timestamptz not null default now(),
  primary key (reported_id, reporter_id),
  check (reported_id <> reporter_id)
);
create index if not exists user_reports_status_idx on public.user_reports (status, created_at desc);
alter table public.user_reports enable row level security;
drop policy if exists "user_reports_kendi_ekler" on public.user_reports;
create policy "user_reports_kendi_ekler" on public.user_reports for insert to authenticated
  with check ((select auth.uid()) = reporter_id);
drop policy if exists "user_reports_kendi_okur" on public.user_reports;
create policy "user_reports_kendi_okur" on public.user_reports for select to authenticated
  using ((select auth.uid()) = reporter_id or public.is_staff());

-- 3) Yönetim paneli: profil şikâyetleri (kullanıcı bazında gruplu) ve reddetme
create or replace function public.admin_user_reports(p_status text default 'open', p_limit integer default 30, p_offset integer default 0)
returns table (user_id uuid, username text, display_name text, avatar_path text, report_count bigint, open_count bigint,
               reasons jsonb, details jsonb, last_report_at timestamptz, total_count bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._need('moderator');
  return query
  with g as (
    select r.reported_id as uid, count(*) as n, count(*) filter (where r.status = 'open') as n_open, max(r.created_at) as son
    from public.user_reports r group by r.reported_id
  ), f as (
    select g.*, count(*) over () as toplam from g
    where p_status = 'all' or (p_status = 'open' and g.n_open > 0) or (p_status = 'handled' and g.n_open = 0)
  )
  select f.uid, pr.username, pr.display_name, pr.avatar_path, f.n, f.n_open,
    coalesce((select jsonb_object_agg(q.r, q.c) from (
      select coalesce(nullif(x.reason, ''), 'Belirtilmedi') as r, count(*) as c from public.user_reports x where x.reported_id = f.uid group by 1) q), '{}'::jsonb),
    coalesce((select jsonb_agg(x.detail order by x.created_at desc) from public.user_reports x where x.reported_id = f.uid and x.detail is not null), '[]'::jsonb),
    f.son, f.toplam
  from f join public.profiles pr on pr.id = f.uid
  order by (f.n_open > 0) desc, f.n_open desc, f.son desc
  limit greatest(least(p_limit, 100), 1) offset greatest(p_offset, 0);
end $$;

create or replace function public.admin_dismiss_user_reports(p_user uuid, p_note text default null) returns integer
language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  perform public._need('moderator');
  update public.user_reports set status = 'dismissed', handled_by = (select auth.uid()), handled_at = now(), handler_note = left(p_note, 300)
    where reported_id = p_user and status = 'open';
  get diagnostics n = row_count;
  perform public._audit('user_report.dismiss', 'user', p_user::text, jsonb_build_object('count', n, 'note', p_note));
  return n;
end $$;

revoke all on function public.admin_user_reports(text, integer, integer) from public, anon;
grant execute on function public.admin_user_reports(text, integer, integer) to authenticated;
revoke all on function public.admin_dismiss_user_reports(uuid, text) from public, anon;
grant execute on function public.admin_dismiss_user_reports(uuid, text) to authenticated;

-- 4) Şikâyet ayrıntısına not alanı eklendi (dönüş tipi değiştiği için yeniden oluşturulur).
drop function if exists public.admin_report_details(uuid);
create function public.admin_report_details(p_post uuid)
returns table (reporter_id uuid, reporter_username text, reason text, status text, created_at timestamptz,
               handled_by_username text, handled_at timestamptz, handler_note text, detail text)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._need('moderator');
  return query
  select r.reporter_id, rp.username, r.reason, r.status, r.created_at, hp.username, r.handled_at, r.handler_note, r.detail
  from public.post_reports r
  join public.profiles rp on rp.id = r.reporter_id
  left join public.profiles hp on hp.id = r.handled_by
  where r.post_id = p_post
  order by r.created_at desc;
end $$;
revoke all on function public.admin_report_details(uuid) from public, anon;
grant execute on function public.admin_report_details(uuid) to authenticated;

-- 5) Aynı gönderiye 3+ farklı kişi şikâyet ederse gönderi otomatik gizlenir (moderatör panelden geri açabilir).
create or replace function public.post_report_otomatik_gizle() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_n integer;
  v_author uuid;
begin
  select count(distinct reporter_id) into v_n from public.post_reports where post_id = new.post_id and status = 'open';
  if v_n >= 3 then
    update public.posts set removed_at = now(), removed_reason = 'Otomatik: çok sayıda şikâyet, inceleme bekliyor'
      where id = new.post_id and removed_at is null
      returning author_id into v_author;
    if v_author is not null then
      insert into public.notifications (user_id, type, post_id, body)
      values (v_author, 'post_removed', new.post_id,
        'Gönderin birden fazla şikâyet aldığı için geçici olarak gizlendi. Ekibimiz inceleyecek; hata varsa gönderin geri açılır.');
    end if;
  end if;
  return new;
end $$;
drop trigger if exists post_reports_otomatik_gizle on public.post_reports;
create trigger post_reports_otomatik_gizle after insert on public.post_reports
  for each row execute function public.post_report_otomatik_gizle();
