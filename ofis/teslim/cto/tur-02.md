# CTO tur-02 (04.11.2026)

## Görevler
- [x] P1 tsc + lint düzelt → `npx tsc --noEmit` ve `npx expo lint` çıktısız (temiz). Düzeltmeler: `use-color-scheme.web.ts` sadeleşti (effect/setState kalktı), `src/css.d.ts` eklendi, `app-tabs.web.tsx` ref tip uyumsuzluğu `props as object` ile aşıldı.
- [x] P1 vercel.json + web export → `app/vercel.json` (buildCommand, outputDirectory `dist`, `/index.html` rewrites), `app.json` web.output `single`. `npx expo export -p web` → "Exported: dist".
- [x] P1 Demo modu → `src/demo/veri.ts` (Türkçe örnek içerik), `src/lib/veri.ts` (`demoModu`, `ogeleriGetir`), `src/components/liste-ekrani.tsx`; 5 sekme listeyle açılıyor. Jest 2/2 geçti (`__tests__/liste.test.tsx` yeni).
- [~] P1 Harita `.web.tsx` yedeği: harita henüz yok, Rotalar şimdilik liste. MapLibre sonraki tur.
- [x] P2 Supabase ilk şema → `supabase/migrations/20261104000001_ilk_sema.sql` (cities, profiles, motorcycles; RLS hepsinde açık). `supabase start` ile çalıştırılıp doğrulanmadı → ekran/test kanıtı eksik, [~].
- Ekran görüntüsü alınmadı (Playwright test rolünde).

## Notlar
- `vercel.json` kök yerine `app/` içinde: Vercel kök klasörü `app/` olmalı (rol dosyası böyle diyor). CEO/kurucu Vercel proje ayarında Root Directory = `app` olduğunu doğrulamalı.
- Şablon artıkları (explore.tsx, themed-*, app-tabs*, constants/, hooks/, animated-icon*, web-badge, hint-row, external-link, global.css) kullanılmıyor ama silinemedi (silme izni verilmedi); tsc/lint temiz. Silinmesi onay bekliyor.

## Diğer rollere
- urun-tasarim: `liste-ekrani.tsx` geçici kart kullanıyor; Card/ListItem hazır olunca değiştirilecek.
- test: kapı komutları çalışıyor; Playwright için `npx expo export -p web` + `dist` sunulabilir.

## Sonraki tur önerisi
Auth (demo kullanıcı) + profil/garaj ekranı, şablon artıklarını silme, supabase start ile şema testi, MapLibre + .web.tsx.

## Kurucuya soru
Yok.
