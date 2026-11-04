# Görevler

Biçim: `[ ]` yapılacak · `[~]` sürüyor/kanıt eksik · `[x]` bitti — `P1 | rol | iş → hedef`

## Tur 1 — temel kurulum (planlandı: 04.11.2026 16:37)

### Ürün ve Tasarım (Nehir)
[x] P1 | urun-tasarim | Tasarım sistemi belgesi: renkler (ana #F25C05), tipografi, boşluk, koyu/açık tema → ofis/bilgi/tasarim/sistem.md
[x] P1 | urun-tasarim | Uygulama gezinme yapısı (sekmeler) ve yedi alanın ekran listesi → ofis/bilgi/tasarim/gezinme.md
[x] P2 | urun-tasarim | Ortak temel kabul kriterleri: kayıt/giriş, profil + garaj → ofis/bilgi/tasarim/ortak-temel.md

### CTO (Kaan)
[ ] P1 | cto | Expo projesini oluştur (TypeScript, Expo Router), tsc + lint çalışır → app/
[ ] P1 | cto | Yerel Supabase projesi + ilk şema: profiles, motorcycles (garaj), cities; RLS açık → supabase/
[ ] P2 | cto | Sekmeli gezinme iskeleti (yedi alan için boş ekranlar) → app/app/

### Moderasyon ve Hukuk (Tolga)
[x] P1 | moderasyon-hukuk | Topluluk kuralları ilk taslak → ofis/bilgi/topluluk-kurallari.md (belge oluşturuldu; avukat kontrolü yayın öncesi)
[x] P2 | moderasyon-hukuk | Moderasyon kalıp listesi (küfür, kişisel veri, dolandırıcılık) → ofis/bilgi/hukuk/moderasyon-kaliplari.md (regex'ler CTO testinde doğrulanacak)
[ ] P2 | moderasyon-hukuk | Kullanım koşulları, KVKK aydınlatma, açık rıza taslakları → ofis/bilgi/hukuk/ (veri sorumlusu kararı bekliyor; ön not: 5651-kvkk-magaza-notlari.md yazıldı)
[ ] P2 | cto | Moderasyon modülü: normalleştirme + kalıplar + MASKELE/ENGELLE/İNCELEME, testlerle → app/src/lib/moderasyon/ (kural: ofis/bilgi/hukuk/moderasyon-kaliplari.md)
[ ] P2 | cto | Her içerikte Bildir, her profilde Engelle, uygulama içi hesap silme (mağaza kuralı) → şema + ekranlar

### Tur 1 ek satırlar (urun-tasarim tarafından eklendi)
[ ] P2 | cto | Tasarım tokenları ve temel bileşenler, sistem.md'ye göre → app/src/theme/, app/src/components/ui/
[ ] P2 | cto | Sekme iskeleti gezinme.md'ye göre (Topluluk/İkinci el/Rotalar/Etkinlik/Sohbet) → app/app/
[ ] P2 | test | ortak-temel.md kabul kriterlerini teste çevir → app/__tests__/

### Test (Melis)
[x] P1 | test | Jest kurulumu ve ilk duman testi; kalite kapısı komutlarını belgeye yaz → app/__tests__/, ofis/teslim/test/ (jest: 1/1 geçti; komutlar kalite-kapisi.md)
[ ] P1 | cto | [Yüksek] `npx expo lint` 1 hata: src/hooks/use-color-scheme.web.ts:11 effect içinde setState (react-hooks/set-state-in-effect) → düzelt
[ ] P1 | cto | [Yüksek] `tsc --noEmit` 3 hata: animated-icon.web.tsx (*.module.css tipi yok), app-tabs.web.tsx:38 ref tipi, constants/theme.ts '@/global.css' tipi yok → css d.ts ekle / şablon dosyaları sadeleştir
[ ] P2 | cto | [Orta] supabase/ klasörü yok; Supabase testleri çalıştırılamıyor (kapıda boş)
[ ] P2 | test | Kapı yeşil olunca ortak-temel.md testleri ve Playwright 390 px ekran görüntüleri → ofis/teslim/test/ekran/

## Tur 2 — çalışan uygulama + Vercel önizleme (planlandı: 04.11.2026 18:18)
Kurucu yeni talimat: yok (Slack boş; GitHub'da yigitdogaan yorumu yok). Öncelik: CLAUDE.md — önce çalışan uygulama, hukuk sona.
Not: Tur 1'in "tasarım tokenları/ui" satırı dosya sahipliği gereği urun-tasarim'e devredildi. moderasyon-hukuk bu turda dinleniyor.

### CTO (Kaan) — app/ (theme ve components/ui hariç), supabase/, vercel.json
[x] P1 | cto | tsc 3 hata + lint 1 hata düzelt; kapı yeşil → app/src/ (tsc, lint temiz; Melis doğruladı)
[x] P1 | cto | vercel.json ve `npx expo export -p web` → app/vercel.json, app/app.json (export başarılı; Vercel Root Directory = app ayarı doğrulanmadı)
[x] P1 | cto | Demo modu: 5 sekme örnek verilerle açılıyor → app/src/demo/, app/src/lib/veri.ts (harita yedeği aşağıda)
[~] P2 | cto | supabase/ ilk şema: profiles, motorcycles, cities; RLS açık → supabase/migrations/ (yazıldı; `supabase start` ile doğrulanmadı, RLS testi yok)

### Ürün ve Tasarım (Nehir) — theme/, components/ui/, ofis/bilgi/tasarim/
[x] P1 | urun-tasarim | Tema tokenları + Button, Card, ListItem, Tag, Avatar, EmptyState; API notu → app/src/components/ui/, ofis/bilgi/tasarim/ui-api.md (jest 6 test, eslint temiz)
[x] P2 | urun-tasarim | Demo modu örnek içerik rehberi → ofis/bilgi/tasarim/demo-icerik.md

### Test (Melis) — CTO ve tasarım bittikten sonra
[x] P1 | test | Kapıyı çalıştır → ofis/teslim/test/tur-02.md (tsc, lint temiz; jest 7/7; export başarılı)
[~] P2 | test | Playwright 390 px ekran görüntüleri → ofis/teslim/test/ekran/ (betik hazır: ekran-cek.mjs; tarayıcı indirme izni verilmedi, görüntü yok)
[~] P2 | test | ortak-temel.md testlerinden uygulanabilenler → app/__tests__/ (kayıt/giriş/profil/garaj ekranları henüz yok)

### Tur 2'den devreden / yeni (CEO işledi, 04.11.2026 18:30)
[ ] P1 | cto | Auth (demo kullanıcı) + profil/garaj ekranı → app/src/app/
[ ] P1 | cto | Harita: MapLibre + .web.tsx yedeği (Rotalar) → app/src/
[ ] P2 | cto | Şablon artıklarını sil (explore rotası, themed-*, app-tabs*, constants/, hooks/, animated-icon*, web-badge, hint-row, external-link, global.css; @/theme ile çakışan constants/theme.ts ve hooks/use-theme.ts dahil) → app/src/
[ ] P2 | cto | liste-ekrani.tsx geçici kart yerine Card/ListItem kullan → app/src/components/
[ ] P2 | cto | supabase start ile şemayı doğrula + supabase/tests/ içinde RLS testi (başkasının profilini güncelleyemez)
[ ] P2 | urun-tasarim | Input, iskelet (yükleniyor), hata (Tekrar dene) bileşenleri; forum/sorun çözümü/ikinci el kabul kriterleri → app/src/components/ui/, ofis/bilgi/tasarim/
[ ] P2 | test | Playwright tarayıcısı hazır olunca 390 px ekran görüntüleri (açık/koyu) → ofis/teslim/test/ekran/
[ ] P2 | test | Kullanıcı adı doğrulaması (3–20, harf/rakam/_) saf fonksiyon gelince test → app/__tests__/

## Tur 3 — Expo Go uyumu + ortak temel (planlandı: 04.11.2026 19:50)
Kurucu yeni talimat: yok. CLAUDE.md yeni önceliği: Expo Go, web yok, react-native-maps, Vercel yok. Yukarıdaki MapLibre, web export, Vercel, Playwright satırları geçersiz/ertelendi; aşağıdakiler bağlayıcıdır.

### CTO (Kaan) — app/ (theme, components/ui hariç), supabase/
[~] P1 | cto | runtimeVersion sdkVersion yapıldı, `expo export -p android` hatasız; web artıkları SİLİNEMEDİ (rm izni yok) → app/ (silinecekler: explore.tsx, themed-*, app-tabs*, animated-icon*, web-badge, hint-row, external-link, constants/, hooks/, global.css, css.d.ts, ui/collapsible.tsx)
[x] P1 | cto | Demo kullanıcı girişi + profil/garaj ekranı (marka/model) → app/src/app/ (testler geçti; ekran görüntüsü yok)
[x] P1 | cto | Rotalar: react-native-maps haritası + demo işaretçiler → app/src/ (cihazda görsel doğrulama yok)
[x] P2 | cto | liste-ekrani.tsx → ListItem + Tag → app/src/components/
[~] P2 | cto | RLS testi yazıldı (supabase/tests/rls_profiles.test.sql); CLI/Docker yok, çalıştırılamadı

### Ürün ve Tasarım (Nehir) — theme/, components/ui/, ofis/bilgi/tasarim/
[x] P1 | urun-tasarim | Input, iskelet, hata bileşenleri + testler → app/src/components/ui/ (jest geçti, lint temiz)
[x] P2 | urun-tasarim | Forum/sorun çözümü/ikinci el kabul kriterleri + telefon akış notları → ofis/bilgi/tasarim/forum-sorun-ikinci-el.md

### Test (Melis)
[x] P1 | test | Kapı: tsc, lint, jest 6 paket/34 test, `expo export -p android` yeşil → ofis/teslim/test/tur-03.md
[x] P2 | test | Kullanıcı adı doğrulaması testi → app/__tests__/dogrulama.test.ts (19 test)

### Tur 3'ten devreden / yeni (CEO işledi, 04.11.2026 20:00)
[ ] P1 | cto | Web/şablon artıklarını sil (yukarıdaki liste; izin sorunu sürerse CEO'ya bildir)
[ ] P1 | cto | Giriş/profil formunda Input, listelerde SkeletonList/ErrorState/EmptyState kullan → app/src/
[ ] P2 | cto | oturum.test.tsx:8 require() uyarısını import ile düzelt → app/__tests__/
[ ] P2 | cto | RLS testini Supabase çalışan ortamda doğrula (CLI/Docker yok)
[ ] P2 | cto | Şikâyet/engelleme (Bildir/Engelle) + temel moderasyon modülü → app/src/lib/moderasyon/
[ ] P2 | urun-tasarim | Etkinlik, rotalar, sohbet, not duvarı kabul kriterleri; segment bileşeni → ofis/bilgi/tasarim/, app/src/components/ui/
[ ] P2 | test | Giriş → profil → motor ekle/sil RNTL akış testleri; ortak-temel.md ve forum-sorun-ikinci-el.md kriterlerini teste çevir → app/__tests__/

## Tur 4 — temizlik + ekranlarda yeni bileşenler + Bildir/Engelle (planlandı: 04.11.2026 20:55)
Kurucu yeni talimat: yok (Slack ve GitHub boş). Tur 3 devreden satırları bağlayıcıdır; moderasyon-hukuk dinlenir (modül kodunu CTO yazar).
[ ] P1 | cto | Web/şablon artıklarını sil (Tur 3 listesi); izin yoksa teslim notuna yaz → app/src/
[ ] P1 | cto | giris/profil formunda Input; liste ekranlarında SkeletonList/ErrorState/EmptyState → app/src/
[ ] P2 | cto | Moderasyon modülü + Bildir/Engelle (demo modda yerel) → app/src/lib/moderasyon/
[ ] P2 | urun-tasarim | Etkinlik, rotalar, sohbet, not duvarı kabul kriterleri; Segment bileşeni → ofis/bilgi/tasarim/, app/src/components/ui/
[ ] P1 | test | Kapı (tsc, lint, jest, export android) + giriş→profil→motor ekle/sil RNTL akışı; oturum.test.tsx require() → import → app/__tests__/, ofis/teslim/test/tur-04.md

### Ertelendi (kurucu kararı: uygulama sonrası)
[ ] P3 | moderasyon-hukuk | Kullanım koşulları, KVKK aydınlatma, açık rıza taslakları
