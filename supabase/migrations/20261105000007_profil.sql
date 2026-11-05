-- Profil özellikleri: bio, avatar, şehir listesi (81 il), yazar kimliği/avatarı akışta (anonimde gizli).

alter table public.profiles add column bio text check (char_length(bio) <= 160);
alter table public.profiles add column avatar_path text;

insert into public.cities (name) values
  ('Adana'),
  ('Adıyaman'),
  ('Afyonkarahisar'),
  ('Ağrı'),
  ('Aksaray'),
  ('Amasya'),
  ('Ankara'),
  ('Antalya'),
  ('Ardahan'),
  ('Artvin'),
  ('Aydın'),
  ('Balıkesir'),
  ('Bartın'),
  ('Batman'),
  ('Bayburt'),
  ('Bilecik'),
  ('Bingöl'),
  ('Bitlis'),
  ('Bolu'),
  ('Burdur'),
  ('Bursa'),
  ('Çanakkale'),
  ('Çankırı'),
  ('Çorum'),
  ('Denizli'),
  ('Diyarbakır'),
  ('Düzce'),
  ('Edirne'),
  ('Elazığ'),
  ('Erzincan'),
  ('Erzurum'),
  ('Eskişehir'),
  ('Gaziantep'),
  ('Giresun'),
  ('Gümüşhane'),
  ('Hakkâri'),
  ('Hatay'),
  ('Iğdır'),
  ('Isparta'),
  ('İstanbul'),
  ('İzmir'),
  ('Kahramanmaraş'),
  ('Karabük'),
  ('Karaman'),
  ('Kars'),
  ('Kastamonu'),
  ('Kayseri'),
  ('Kırıkkale'),
  ('Kırklareli'),
  ('Kırşehir'),
  ('Kilis'),
  ('Kocaeli'),
  ('Konya'),
  ('Kütahya'),
  ('Malatya'),
  ('Manisa'),
  ('Mardin'),
  ('Mersin'),
  ('Muğla'),
  ('Muş'),
  ('Nevşehir'),
  ('Niğde'),
  ('Ordu'),
  ('Osmaniye'),
  ('Rize'),
  ('Sakarya'),
  ('Samsun'),
  ('Siirt'),
  ('Sinop'),
  ('Sivas'),
  ('Şanlıurfa'),
  ('Şırnak'),
  ('Tekirdağ'),
  ('Tokat'),
  ('Trabzon'),
  ('Tunceli'),
  ('Uşak'),
  ('Van'),
  ('Yalova'),
  ('Yozgat'),
  ('Zonguldak')
on conflict (name) do nothing;

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
  p.photo_path,
  p.city,
  case when p.is_anonymous then null else p.author_id end as author_id,
  case when p.is_anonymous then null else pr.avatar_path end as author_avatar
from public.posts p
join public.profiles pr on pr.id = p.author_id
left join public.motorcycles m on m.id = p.motorcycle_id
where not exists (
  select 1 from public.user_blocks b
  where b.blocker_id = (select auth.uid()) and b.blocked_id = p.author_id
);

-- Avatar deposu: herkes görür, yalnız kendi klasörüne (<uid>/...) yazılır.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "avatars_kendi_yukler" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars_kendi_gunceller" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars_kendi_siler" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
