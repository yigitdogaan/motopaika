-- Uygulama içi bildirimler: katılma isteği/yanıtı, selam, yorum. Satırları yalnız tetikleyiciler yazar.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('ride_request', 'ride_accepted', 'ride_declined', 'salute', 'comment')),
  actor_id uuid references public.profiles (id) on delete set null,
  post_id uuid references public.posts (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
-- Aynı kişinin selam/istek bildirimi tekrar tekrar birikmesin.
create unique index notifications_tekil_idx on public.notifications (user_id, type, actor_id, post_id)
  where type in ('salute', 'ride_request', 'ride_accepted', 'ride_declined');
alter table public.notifications enable row level security;
create policy "notifications_kendi_okur" on public.notifications for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "notifications_kendi_gunceller" on public.notifications for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "notifications_kendi_siler" on public.notifications for delete to authenticated
  using ((select auth.uid()) = user_id);

create function public.bildirim_istek() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_sahip uuid;
begin
  select author_id into v_sahip from public.posts where id = new.post_id;
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, type, actor_id, post_id) values (v_sahip, 'ride_request', new.user_id, new.post_id)
      on conflict (user_id, type, actor_id, post_id) where type in ('salute', 'ride_request', 'ride_accepted', 'ride_declined')
      do update set read_at = null, created_at = now();
  elsif new.status <> old.status and new.status in ('accepted', 'declined') then
    insert into public.notifications (user_id, type, actor_id, post_id)
      values (new.user_id, case when new.status = 'accepted' then 'ride_accepted' else 'ride_declined' end, v_sahip, new.post_id)
      on conflict (user_id, type, actor_id, post_id) where type in ('salute', 'ride_request', 'ride_accepted', 'ride_declined')
      do update set read_at = null, created_at = now();
  end if;
  return new;
end $$;
create trigger ride_requests_bildirim after insert or update of status on public.ride_requests
  for each row execute function public.bildirim_istek();

create function public.bildirim_selam() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_sahip uuid;
begin
  select author_id into v_sahip from public.posts where id = new.post_id;
  if v_sahip is not null and v_sahip <> new.user_id then
    insert into public.notifications (user_id, type, actor_id, post_id) values (v_sahip, 'salute', new.user_id, new.post_id)
      on conflict (user_id, type, actor_id, post_id) where type in ('salute', 'ride_request', 'ride_accepted', 'ride_declined') do nothing;
  end if;
  return new;
end $$;
create trigger post_salutes_bildirim after insert on public.post_salutes
  for each row execute function public.bildirim_selam();

create function public.bildirim_yorum() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_sahip uuid;
begin
  select author_id into v_sahip from public.posts where id = new.post_id;
  if v_sahip is not null and v_sahip <> new.author_id then
    insert into public.notifications (user_id, type, actor_id, post_id) values (v_sahip, 'comment', new.author_id, new.post_id);
  end if;
  return new;
end $$;
create trigger post_comments_bildirim after insert on public.post_comments
  for each row execute function public.bildirim_yorum();

alter publication supabase_realtime add table public.notifications;
