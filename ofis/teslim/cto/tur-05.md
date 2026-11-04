# CTO tur-05 (04.11.2026)

## Görevler
- [~] P1 Web/şablon artıklarını sil: `rm` komutu bu ortamda onay istiyor ve verilmedi (Tur 3'ten beri aynı). SİLİNEMEDİ. Kullanılmıyorlar; tsc/lint/jest/export etkilenmiyor. Silinecekler: `src/app/explore.tsx`, `src/components/{themed-text,themed-view,app-tabs,app-tabs.web,animated-icon,animated-icon.web,web-badge,hint-row,external-link}.tsx`, `src/components/animated-icon.module.css`, `src/{constants,hooks}/`, `src/global.css`, `src/css.d.ts`, `src/components/ui/collapsible.tsx`. **CEO:** `rm` izni ver ya da iş akışı adımında bu dosyalar silinsin.
- [x] P1 Input + yükleme/hata: `profil.tsx` marka/model artık `Input`; `liste-ekrani.tsx` SkeletonList → ErrorState (Tekrar dene) → EmptyState → liste akışı. `giris.tsx` formsuz (demo tek düğme), Input gerekmedi.
- [x] P2 Moderasyon modülü: `src/lib/moderasyon/index.ts` (`normallestir`, `tcKimlikGecerli`, `denetle(metin, baglam)` → SERBEST/MASKELE/INCELEME/ENGELLE; telefon, e-posta, IBAN, TC, plaka, tehdit, bahis, önce-ödeme, kapora, yasaklı ürün). Kaynak: moderasyon-kaliplari.md §7 örnekleri testte.
- [x] P2 Bildir: `src/lib/moderasyon/sikayet.ts` (AsyncStorage, demo modda yerel) + liste öğelerinde "Bildir" düğmesi. **Eksik:** "Engelle" (profil/kullanıcı ekranı yok, `engelle()` kancası hazır, arayüze bağlanmadı); `denetle` henüz hiçbir yazma ekranına bağlı değil (yazma ekranı yok); küfür listesi yazılmadı.
- [x] Jest: `jest.setup.js` ile AsyncStorage mock'u ortak (package.json `setupFiles`).

## Kanıt
`npx tsc --noEmit` temiz · `npx expo lint` temiz · `npx jest` 8 suite / 44 test geçti (yeni: `__tests__/moderasyon.test.ts`, 8 test) · `npx expo export -p android` "Exported: dist". Ekran görüntüsü yok (cihaz/emülatör yok).

## Diğer rollere
- test: `oturum.test.tsx` kendi AsyncStorage mock'unu tutuyor; artık `jest.setup.js` var, o satır silinebilir. require() uyarısı bu yüzden kalkar.
- moderasyon-hukuk: küfür listesini CTO yazmaz (belgede "kendimiz yazarız" deniyor); kelime listesi gelirse `moderasyon/index.ts` KURALLARA eklenir.
- urun-tasarim: liste öğelerinde Bildir düğmesi sağda Tag yanında; yerleşim görüşü isteriz.

## Sonraki tur önerisi
Silme izni çözülünce artıklar; Engelle (profil/kullanıcı kartı); `denetle`yi ilk yazma ekranına (forum konusu aç) bağlamak; supabase CLI varsa şema/RLS doğrulama.

## Kurucuya soru
Yok.
