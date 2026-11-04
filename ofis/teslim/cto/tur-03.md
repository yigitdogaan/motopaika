# CTO tur-03 (04.11.2026)

## Görevler
- [~] P1 Expo Go uyumu: `app.json` → `runtimeVersion: {"policy":"sdkVersion"}` eklendi; `expo-updates`, `react-native-maps`, `@react-native-async-storage/async-storage` `expo install` ile kuruldu. `npx expo export -p android` → "Exported: dist" (hbc 4MB). **Eksik:** web artıkları SİLİNEMEDİ (rm izni verilmedi, bu turda da). Kullanılmıyorlar; tsc/lint temiz. İzinle silinecek dosyalar: `src/app/explore.tsx`, `src/components/{themed-text,themed-view,app-tabs,app-tabs.web,animated-icon,animated-icon.web,web-badge,hint-row,external-link}.tsx`, `animated-icon.module.css`, `src/{constants,hooks}/`, `src/global.css`, `src/css.d.ts`, `src/components/ui/collapsible.tsx` (Nehir'in klasörü).
- [x] P1 Demo girişi + profil/garaj: `src/lib/oturum.tsx` (demo kullanıcı, AsyncStorage'da saklanır), `src/app/giris.tsx`, `src/app/(tabs)/profil.tsx` (6. sekme: marka/model ekle-sil, çıkış), `Stack.Protected` ile giriş koruması, `src/lib/dogrulama.ts` (kullaniciAdiGecerli 3–20 harf/rakam/_, motorGecerli). Testler: `__tests__/oturum.test.tsx`. Ekran görüntüsü yok (Expo Go cihaz/emülatör yok).
- [x] P1 Rotalar haritası: `rotalar.tsx` react-native-maps `MapView` + demo rotalar için `Marker` (demo veride `konum`), altında liste. Cihazda görsel doğrulama yok.
- [x] P2 `liste-ekrani.tsx` → `ListItem` + `Tag` kullanıyor.
- [~] P2 RLS testi: `supabase/tests/rls_profiles.test.sql` (pgTAP, 3 assertion) yazıldı; `supabase` CLI kurulu değil, `supabase start` çalıştırılamadı → doğrulanmadı.

## Kanıt
`npx tsc --noEmit` temiz · `npx expo lint` temiz · `npx jest` 4 suite / 10 test geçti · `npx expo export -p android` başarılı.

## Kararlar (CEO kararlar.md'ye işlesin)
- Profil, 6. sekme olarak eklendi (gezinme.md 5 sekme diyor; Nehir üst çubuğa taşımak isterse değiştirilir).
- Demo oturumu cihazda AsyncStorage ile saklanır; gerçek auth Supabase bağlanınca değişir.
- Profil formu şimdilik düz `TextInput`; Nehir'in `Input` bileşeni gelince değiştirilecek.

## Diğer rollere
- urun-tasarim: `Input` bileşeni gelince `profil.tsx` ona geçecek.
- test: `kullaniciAdiGecerli` hazır (`src/lib/dogrulama.ts`, test eklendi). Cihazda ekran görüntüsü için Expo Go gerekir.
- CEO: dosya silme izni (yukarıdaki liste) veya kurucudan onay; `package.json`'daki `react-native-web`/`react-dom` Expo Router bağımlılığı olduğundan kaldırılmadı.

## Sonraki tur önerisi
Artık silme, supabase CLI ile şema + RLS doğrulama, moderasyon modülü, Bildir/Engelle.

## Kurucuya soru
Yok.
