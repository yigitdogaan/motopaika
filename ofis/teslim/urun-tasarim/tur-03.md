# Nehir (urun-tasarim) — Tur 03 (04.11.2026)

## Görevler
- [x] P1 Input, iskelet, hata bileşenleri + testler → `app/src/components/ui/{input,skeleton,error-state}.tsx`, `index.ts`; `app/__tests__/ui-durumlar.test.tsx` (5 test).
  - Kanıt: `npx jest` 4 paket / 12 test geçti; `npx eslint src/components/ui __tests__` temiz; `npx tsc --noEmit` ui/__tests__ için hata yok. `npm ci` çalıştırıldı.
  - API notu güncellendi: `ofis/bilgi/tasarim/ui-api.md`.
- [x] P2 Forum / sorun çözümü / ikinci el kabul kriterleri + telefon akış notları → `ofis/bilgi/tasarim/forum-sorun-ikinci-el.md`.

## Dürüst notlar
- Ekran görüntüsü yok (bileşenler henüz ekranda kullanılmıyor; web önizleme yok, Expo Go'da görülecek).
- `expo export -p android` çalıştırmadım (CTO/Test alanı; bu turda ui dışına dokunmadım).
- `graphify update .` çalıştırılmadı.

## Diğer rollere
- CTO: giriş/kayıt ve profil formlarında `Input`; listelerde `SkeletonList`/`ErrorState`/`EmptyState` kullan. Şablon kalıntıları `constants/theme.ts`, `hooks/use-theme.ts` hâlâ temizlenmeli.
- Test: `forum-sorun-ikinci-el.md` ve `ortak-temel.md` kriterleri teste çevrilebilir.

## Sonraki tur önerisi
- Etkinlik, rotalar, sohbet, not duvarı kabul kriterleri; segment bileşeni (Konular/Sorunlar/Not duvarı).

## Kurucuya soru
Yok.
