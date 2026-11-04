# Test tur-02 (04.11.2026)

## Görevler
- [x] P1 Kapı çalıştırıldı (`app/`, `npm ci` sonrası):
  - `npx tsc --noEmit` → çıktısız, temiz
  - `npx expo lint` → çıktısız, temiz
  - `npx jest` → 3 paket / 7 test geçti (duman, liste, ui)
  - `npx expo export -p web` → "Exported: dist" (13 web paketi; rotalar: index, topluluk, ikinci-el, rotalar, etkinlik, sohbet, explore)
  - Supabase testleri: `supabase/tests/` yok; `supabase start` bu ortamda denenmedi → kapıda boş (Orta, açık).
- [~] P2 Playwright 390 px ekran görüntüleri: ALINAMADI. Playwright paketi /tmp'ye kuruldu ama `playwright install chromium` (tarayıcı indirme) onay istedi, verilmedi. Hazır betik: `ofis/teslim/test/ekran-cek.mjs` (açık/koyu tema, 6 rota). `ofis/teslim/test/ekran/` boş. Tarayıcı hazır olunca bir komutla çalışır.
- [~] P2 ortak-temel.md testleri: uygulanabilir olan yok — kayıt/giriş, profil, garaj ekranları henüz yok (yalnız şema var). Auth/profil/garaj ekranları gelince yazılacak. Teste çevrilebilecek ilk madde: kullanıcı adı doğrulaması (3–20, harf/rakam/_) saf fonksiyon olarak CTO'dan gelirse.

## Bulgular
- [Düşük] `explore` rotası export'ta hâlâ var (şablon artığı, 895 KB paket); sekme listesinde yok ama URL ile açılır. CTO silsin.
- [Düşük] Şablon artıkları (themed-*, app-tabs*, constants/, hooks/, animated-icon*, web-badge...) kullanılmıyor; tasarım notu da `constants/theme.ts` ile `@/theme` çakışmasını söylüyor.
- [Orta] Vercel Root Directory = `app` olmalı (vercel.json `app/` içinde); kök dizinde vercel.json yok. Proje ayarı doğrulanmadı.
- [Orta] Supabase şema migrasyonu çalıştırılıp doğrulanmadı (CTO notu); RLS testi yok.

## Diğer rollere
- CTO: yukarıdaki Düşük/Orta bulgular; `supabase/tests/` içine en az bir RLS testi (başkasının profilini güncelleyemez).
- CEO/kurucu: Vercel Root Directory = `app`; Playwright tarayıcı indirme izni (ya da CI'da çalıştırma).

## Sonraki tur önerisi
Tarayıcı izniyle ekran görüntüleri; auth demo + profil/garaj gelince ortak-temel testleri; RLS testi.

## Kurucuya soru
Yok.
