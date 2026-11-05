# Roteri Yönetim Paneli

Çok yetkililli (moderatör / yönetici / süper yönetici) web yönetim paneli. Yalnızca Supabase **anon** anahtarıyla çalışır;
tüm yetki denetimi veritabanındadır (RLS + `admin_*` fonksiyonları). `service_role` anahtarı **asla** panele konmaz.

## Kurulum
1. Supabase SQL Editor'de `supabase/migrations/20261105000014_yonetim_sistemi.sql` dosyasını çalıştır
   (11, 12, 13 numaralılar daha önce çalıştırılmamışsa önce onlar).
2. İlk süper yöneticiyi ata (e-postayı kendininkiyle değiştir):
   ```sql
   insert into public.staff (user_id, role)
   select id, 'super_admin' from auth.users where email = 'yigitdogaan@gmail.com';
   ```
   Not: kullanıcı önce uygulamadan kayıt olmuş olmalı. Diğer yetkilileri panelde **Yetkililer** sayfasından eklersin.
3. Terminal:
   ```bash
   cd admin
   cp .env.example .env        # URL ve anon anahtarı doldur
   npm install
   npm run dev                 # http://localhost:5173
   ```
   `.env` yoksa panel **demo modunda** (sahte veri) açılır.
4. Yayınlamak için `npm run build` → `dist/` klasörünü Netlify / Vercel / Cloudflare Pages gibi bir statik barındırıcıya yükle.
   Hash tabanlı yönlendirme kullanıldığı için özel yönlendirme ayarı gerekmez.

## Sayfalar ve roller
| Sayfa | Moderatör | Yönetici | Süper |
|---|---|---|---|
| Genel bakış, Şikâyetler, Gönderiler, Kullanıcılar, Sürüşler | ✓ | ✓ | ✓ |
| Uyarı, ≤7 gün askıya alma | ✓ | ✓ | ✓ |
| >7 gün askı, kalıcı yasak, yaptırım kaldırma, e-posta görme | | ✓ | ✓ |
| Duyurular, Denetim günlüğü | | ✓ | ✓ |
| Yetkili ekle / çıkar / rol değiştir | | | ✓ |

Her işlem `admin_audit` tablosuna yazılır (silinemez). Yetkililer kendilerine ya da eşit/üst yetkiliye yaptırım uygulayamaz;
son süper yönetici düşürülemez.

## Güvenlik notları
- Panele yalnızca `staff` tablosunda olan hesaplar girebilir; diğerleri "Yetkin yok" görür.
- Oturum `sessionStorage`'da tutulur (sekme kapanınca biter).
- Barındırırken panele ek olarak IP kısıtı / Cloudflare Access gibi ikinci bir kapı eklemen önerilir.
- Gönderi ve avatar kovaları herkese açık olduğundan panel fotoğrafları doğrudan açık adresten gösterir.
