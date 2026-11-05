-- Sürüş (buluşma) gönderileri anonim olamaz. Eski kayıtlar etkilenmesin diye NOT VALID: yalnız yeni/güncellenen satırlar denetlenir.
alter table public.posts add constraint posts_surus_anonim_degil check (category <> 'surus' or not is_anonymous) not valid;
