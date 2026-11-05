-- Anlık bildirim (push) için cihaz jetonları. Gönderimi `push` Edge Function'ı yapar (service_role ile okur).
create table public.push_tokens (
  token text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);
create index push_tokens_user_idx on public.push_tokens (user_id);
alter table public.push_tokens enable row level security;

create policy "push_kendi_okur" on public.push_tokens for select to authenticated using (user_id = (select auth.uid()));
create policy "push_kendi_ekler" on public.push_tokens for insert to authenticated with check (user_id = (select auth.uid()));
create policy "push_kendi_gunceller" on public.push_tokens for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "push_kendi_siler" on public.push_tokens for delete to authenticated using (user_id = (select auth.uid()));

-- Aynı cihaz başka hesapla girerse jeton yeni hesaba devredilir.
create function public.register_push_token(p_token text, p_platform text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'giris gerekli'; end if;
  insert into public.push_tokens (token, user_id, platform) values (p_token, (select auth.uid()), p_platform)
    on conflict (token) do update set user_id = excluded.user_id, platform = excluded.platform, updated_at = now();
end $$;
revoke all on function public.register_push_token(text, text) from public, anon;
grant execute on function public.register_push_token(text, text) to authenticated;

-- Çıkışta bu cihazın jetonunu sil.
create function public.unregister_push_token(p_token text) returns void
language sql security definer set search_path = '' as $$
  delete from public.push_tokens where token = p_token and user_id = (select auth.uid());
$$;
revoke all on function public.unregister_push_token(text) from public, anon;
grant execute on function public.unregister_push_token(text) to authenticated;

-- Sonraki adım (panelden, SQL değil): Database → Webhooks → yeni webhook
--   Tablo: public.notifications, Olay: INSERT, Tür: Supabase Edge Functions → `push`
