-- RLS testi (pgTAP): `npx supabase test db` ile çalışır. Başkasının profilini güncelleyemez.
begin;
select plan(3);

insert into auth.users (id, instance_id, aud, role, email)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a@example.test'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@example.test');
insert into public.profiles (id, username) values
  ('00000000-0000-0000-0000-0000000000a1', 'kullanici_a'),
  ('00000000-0000-0000-0000-0000000000b2', 'kullanici_b');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);

update public.profiles set display_name = 'hack' where id = '00000000-0000-0000-0000-0000000000b2';
select is((select display_name from public.profiles where id = '00000000-0000-0000-0000-0000000000b2'), null,
  'başkasının profili güncellenemez');

update public.profiles set display_name = 'ben' where id = '00000000-0000-0000-0000-0000000000a1';
select is((select display_name from public.profiles where id = '00000000-0000-0000-0000-0000000000a1'), 'ben',
  'kendi profili güncellenir');

select throws_ok(
  $$ insert into public.motorcycles (owner_id, brand, model) values ('00000000-0000-0000-0000-0000000000b2', 'Honda', 'CB') $$,
  null, null, 'başkası adına motor eklenemez');

select * from finish();
rollback;
