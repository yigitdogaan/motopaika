-- İlk şema: şehirler, profiller, garaj (motosikletler). Her tabloda RLS açık.

create table public.cities (
  id smallint generated always as identity primary key,
  name text not null unique
);
alter table public.cities enable row level security;
create policy "cities_herkes_okur" on public.cities for select using (true);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 30),
  display_name text,
  city_id smallint references public.cities (id),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_herkes_okur" on public.profiles for select using (true);
create policy "profiles_kendi_ekler" on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "profiles_kendi_gunceller" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles_kendi_siler" on public.profiles for delete to authenticated
  using ((select auth.uid()) = id);

create table public.motorcycles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  brand text not null,
  model text not null,
  year smallint check (year between 1950 and 2100),
  created_at timestamptz not null default now()
);
create index motorcycles_owner_id_idx on public.motorcycles (owner_id);
alter table public.motorcycles enable row level security;
create policy "motorcycles_herkes_okur" on public.motorcycles for select using (true);
create policy "motorcycles_sahibi_ekler" on public.motorcycles for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy "motorcycles_sahibi_gunceller" on public.motorcycles for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "motorcycles_sahibi_siler" on public.motorcycles for delete to authenticated
  using ((select auth.uid()) = owner_id);
