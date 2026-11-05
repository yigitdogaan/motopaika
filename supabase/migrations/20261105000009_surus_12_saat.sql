-- Sürüş (buluşma) gönderileri 12 saat sonra pasif olur: yeni katılma isteği alınmaz, bekleyen istekler kabul edilemez.
create or replace function public.ride_request_ok(p_post uuid, p_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.posts
    where id = p_post and category = 'surus' and author_id <> p_user
      and created_at > now() - interval '12 hours'
  );
$$;

create or replace function public.answer_ride_request(p_post uuid, p_user uuid, p_accept boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare v_room uuid;
begin
  if not exists (select 1 from public.posts where id = p_post and author_id = (select auth.uid())) then
    raise exception 'yetkisiz';
  end if;
  if exists (select 1 from public.posts where id = p_post and created_at <= now() - interval '12 hours') then
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
