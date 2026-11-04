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
