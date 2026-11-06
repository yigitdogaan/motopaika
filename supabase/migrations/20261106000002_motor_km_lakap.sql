-- Motor kartına kilometre ve lakap. İkisi de isteğe bağlı; sahibi kendi motorunu güncelleyebilir (mevcut RLS update politikası).
alter table public.motorcycles add column km integer check (km between 0 and 2000000);
alter table public.motorcycles add column nickname text check (char_length(nickname) between 1 and 30);
