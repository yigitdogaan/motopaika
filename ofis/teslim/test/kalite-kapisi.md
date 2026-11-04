# Kalite kapısı komutları

Hepsi `app/` içinde çalışır (Supabase testleri repo kökünden).

| Kontrol | Komut | Not |
| --- | --- | --- |
| Tip | `npm run typecheck` (= `npx tsc --noEmit`) | `tsconfig.json` `types: ["jest","node"]` (TS 6 varsayılanı boş) |
| Lint | `npx expo lint` | |
| Birim/bileşen | `npm test` (= `npx jest`) | jest-expo + RNTL 14; `render` **async** → `await render(...)` |
| Supabase | `npx supabase start`, sonra `npx supabase test db` | testler `supabase/tests/` (henüz yok) |
| Web ekran | `npx expo export --platform web`, Playwright 390 px | çıktı `ofis/teslim/test/ekran/` |

Kurallar
- Test dosyaları `app/__tests__/*.test.tsx`; `@/` takma adı `src/` e gider.
- Kapı yeşil sayılması için ilk dört satır hatasız olmalı.
