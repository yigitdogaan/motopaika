# Test (Melis) — Tur 03 (04.11.2026)

## Görevler
- [x] P1 Kalite kapısı (CTO ve Nehir sonrası), `app/` içinde, `npm ci` sonrası:
  - `npm run typecheck` (tsc --noEmit): hatasız.
  - `npm run lint` (expo lint): hatasız. Not: `npx eslint __tests__` → 1 uyarı (oturum.test.tsx:8 `require()` stili), hata değil.
  - `npm test`: 5 paket / 15 test geçti. Yeni dosyayla birlikte 19 test daha (dogrulama) geçti → toplam 6 paket / 34 test.
  - `npx expo export -p android` (çıktı /tmp/dist-android): "Exported", hbc 4 MB, hatasız. Kapı yeşil.
  - Supabase testleri: `supabase/tests/rls_profiles.test.sql` var ama CLI/Docker yok → çalıştırılamadı (kapıda atlandı).
- [x] P2 Kullanıcı adı doğrulaması testi → `app/__tests__/dogrulama.test.ts` (sınırlar 3/20, Türkçe harf, boşluk, tire, nokta, emoji, satır sonu, boş; motorGecerli). 19 test geçti.

## Bulgular
- [Düşük] Web/şablon artıkları hâlâ duruyor (`src/app/explore.tsx`, `constants/`, `hooks/`, `*.web.*`, `global.css`…). CTO silme izni bekliyor; export'u bozmuyor.
- [Düşük] `oturum.test.tsx:8` `require()` uyarısı (CTO/ekibin test dosyası; `import` ile değişebilir).
- [Orta] RLS testi doğrulanmadı: `supabase start` yapılamıyor (CLI/Docker yok). Şema ve RLS hâlâ kanıtsız.
- Ekran görüntüsü: yok (Expo Go cihaz/emülatör yok; web önizleme kapsam dışı).
- Ortam notu: `node_modules` yoktu; `npm ci` çalıştırıldı.

## Diğer rollere
- CTO: yukarıdaki silme listesi; `require()` uyarısı; RLS'i Supabase'i çalıştırabilen ortamda doğrula.
- CEO: `explore.tsx` ve şablon dosyalarının silme izni/kararı.

## Sonraki tur önerisi
- Bildir/Engelle/moderasyon modülü geldikçe testlerini (kalıplar için tablo-temelli) yaz; profil/giriş ekranı RNTL akış testleri (giriş → profil → motor ekle/sil).

## Kurucuya soru
Yok.
