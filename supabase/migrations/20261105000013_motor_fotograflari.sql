-- Garajdaki motorların fotoğrafları: motor başına en çok 8 fotoğraf, ilki (position en küçük) kapak.

create table public.motorcycle_photos (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  path text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index motorcycle_photos_motor_idx on public.motorcycle_photos (motorcycle_id, position, created_at);
alter table public.motorcycle_photos enable row level security;

-- Garajlar herkese açık görünür (motorcycles tablosu gibi).
create policy "motor_foto_herkes_okur" on public.motorcycle_photos for select using (true);
create policy "motor_foto_sahibi_ekler" on public.motorcycle_photos for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (select 1 from public.motorcycles m where m.id = motorcycle_id and m.owner_id = (select auth.uid()))
  );
create policy "motor_foto_sahibi_gunceller" on public.motorcycle_photos for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "motor_foto_sahibi_siler" on public.motorcycle_photos for delete to authenticated
  using ((select auth.uid()) = owner_id);

-- Motor başına 8 fotoğraf sınırı.
create function public.motor_foto_siniri() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.motorcycle_photos where motorcycle_id = new.motorcycle_id) >= 8 then
    raise exception 'Bir motora en fazla 8 fotoğraf eklenebilir';
  end if;
  return new;
end $$;
create trigger motor_foto_siniri_tetik before insert on public.motorcycle_photos
  for each row execute function public.motor_foto_siniri();

-- Depo: herkes görür, yalnız kendi klasörüne (<uid>/...) yazılır ve silinir.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('motor-photos', 'motor-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "motor_photos_kendi_yukler" on storage.objects for insert to authenticated
  with check (bucket_id = 'motor-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "motor_photos_kendi_siler" on storage.objects for delete to authenticated
  using (bucket_id = 'motor-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
