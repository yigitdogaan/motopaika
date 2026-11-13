-- Otomatik moderasyon, 1. kısım: sunucu tarafı küfür kontrolü + denetim günlüğü.
-- İstemci tarafındaki süzgeç (app/src/lib/moderasyon) API'ye doğrudan istek atanlarca aşılabilir;
-- bu tetikleyici aynı kuralı veritabanında zorlar. Staff ve service_role (auth.uid() boş) etkilenmez.

-- Türkçe karakterleri sadeleştirir, 3+ tekrar eden harfi teke indirir ("siiiktir" → "siktir").
create or replace function public.moderasyon_normallestir(p text) returns text
language sql immutable
as $$
  select regexp_replace(
    translate(lower(coalesce(p, '')), 'ıİşŞçÇğĞöÖüÜ', 'iissccggoouu'),
    '([a-z])\1{2,}', '\1', 'g');
$$;

-- Kesin küfür: kelime sınırlı kökler (masum kelimelerin içinde geçmesin, "Amina" gibi isimler takılmasın).
create or replace function public.moderasyon_kufur_var(p text) returns boolean
language sql immutable
as $$
  select public.moderasyon_normallestir(p) ~
    '\y(amk|aq|amq|aminakoy\w*|amcik\w*|orospu\w*|orosbu\w*|siktir\w*|sikik\w*|sikeyim|sikerim|siktim|yarrak\w*|yarak|piclik|pic ?kurusu|pic ?oglu|ibne\w*|pust\w*|gavat\w*|pezevenk\w*|gotveren\w*|gotunu\w*|ananisikeyim|anani\w* ?sik\w*)\y';
$$;

create or replace function public.moderasyon_metin_kontrol() returns trigger
language plpgsql
as $$
declare
  j jsonb := to_jsonb(new);
begin
  if (select auth.uid()) is null or public.is_staff() then
    return new;
  end if;
  if public.moderasyon_kufur_var(j->>'body') or public.moderasyon_kufur_var(j->>'place') then
    raise exception 'MODERASYON_ENGEL' using errcode = 'P0001',
      hint = 'Küfür ve hakaret içeren içerik paylaşılamaz.';
  end if;
  return new;
end;
$$;

drop trigger if exists posts_moderasyon on public.posts;
create trigger posts_moderasyon before insert on public.posts
  for each row execute function public.moderasyon_metin_kontrol();
drop trigger if exists post_comments_moderasyon on public.post_comments;
create trigger post_comments_moderasyon before insert on public.post_comments
  for each row execute function public.moderasyon_metin_kontrol();
drop trigger if exists chat_messages_moderasyon on public.chat_messages;
create trigger chat_messages_moderasyon before insert on public.chat_messages
  for each row when (new.kind = 'text')
  execute function public.moderasyon_metin_kontrol();

-- Otomatik kararların denetim günlüğü (yanlış pozitifleri incelemek ve geri almak için).
create table if not exists public.auto_moderation_log (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('post_photo', 'chat_photo')),
  ref_id uuid not null,
  user_id uuid references public.profiles (id) on delete set null,
  decision text not null check (decision in ('ENGELLE', 'SERBEST', 'HATA')),
  category text,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists auto_moderation_log_created_idx on public.auto_moderation_log (created_at desc);
alter table public.auto_moderation_log enable row level security;
drop policy if exists "auto_moderation_log_staff_okur" on public.auto_moderation_log;
create policy "auto_moderation_log_staff_okur" on public.auto_moderation_log
  for select to authenticated using (public.is_staff());
