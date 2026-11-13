-- Kayıt ekranındaki kullanıcı adı ön kontrolü giriş yapmamış kullanıcıyla çalışır; profiles artık
-- yalnız giriş yapanlara okunabildiği için (20261105000016) kontrol hep "müsait" dönüyordu.
-- Yalnız boş/dolu bilgisini veren, profil verisi sızdırmayan bir fonksiyon açıyoruz.
create or replace function public.kullanici_adi_musait(p_username text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles where lower(username) = lower(trim(p_username))
  );
$$;
revoke all on function public.kullanici_adi_musait(text) from public;
grant execute on function public.kullanici_adi_musait(text) to anon, authenticated;

-- "Ali" ve "ali" aynı ad sayılsın (mevcut kayıtlarda büyük/küçük harf çakışması yoksa uygulanır).
do $$
begin
  if not exists (select 1 from public.profiles group by lower(username) having count(*) > 1) then
    create unique index if not exists profiles_username_lower_uniq on public.profiles (lower(username));
  else
    raise notice 'profiles içinde büyük/küçük harf farkıyla çakışan kullanıcı adları var; benzersiz indeks atlandı.';
  end if;
end $$;
