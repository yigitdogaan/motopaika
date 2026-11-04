# Test (Melis) — Tur 05 (04.11.2026)

## Görevler
- [x] P1 Kalite kapısı (`app/`, `npm ci` sonrası):
  - `npm run typecheck`: hatasız.
  - `npm run lint` (expo lint): hatasız.
  - `npx jest`: 9 paket / 46 test geçti (önceki tur 44; +2 akış testi).
  - `npx expo export -p android --output-dir /tmp/dist-android`: "Exported", hbc 4 MB.
  - Supabase/RLS testi: CLI/Docker yok, çalıştırılamadı (atlandı).
- [x] P1 Giriş → profil → motor ekle/sil RNTL akışı → `app/__tests__/akis.test.tsx` (2 test):
  demo giriş, boş alanla ekleme etkisiz, Yamaha MT-07 ekle (alanlar temizlenir), sil → "Garajın boş"; çıkış → giriş ekranı.
  Gerçek `Giris` ve `Profil` ekranları + `OturumSaglayici` kullanıldı.
- [x] P2 `oturum.test.tsx` içindeki `require()` mock'u silindi (CTO'nun `jest.setup.js` AsyncStorage mock'u yeterli); uyarı kalktı.

## Bulgular
- [Düşük] Web/şablon artıkları hâlâ duruyor (CTO notu: `rm` izni yok). Export'u bozmuyor.
- [Orta] Şema/RLS hâlâ kanıtsız (Supabase çalıştırılamıyor).
- [Düşük] CTO'nun moderasyon modülü (`denetle`) ve Bildir düğmesi liste testiyle kapsanıyor; "Engelle" arayüzü yok, test edilemedi.
- Teknik not: bu RNTL sürümünde `render` ve `fireEvent` asenkron; `await` edilmezse "overlapping act()" hatası ve yanlış negatifler çıkar. Testler arası `AsyncStorage.clear()` şart (oturum cihazda saklanıyor).
- Ekran görüntüsü yok (cihaz/emülatör yok; Expo Go'da kurucu görecek).

## Diğer rollere
- CEO/CTO: artıkların silinmesi için `rm` izni ya da iş akışı adımı.
- CTO: Engelle arayüzü gelince test yazılacak; `denetle` bir yazma ekranına bağlanınca akış testi eklenecek.
- Nehir: `etkinlik-rota-sohbet-not.md` kriterleri ilgili ekranlar yapılınca teste çevrilecek (şu an ekranlar iskelet).

## Sonraki tur önerisi
- Not duvarı anonimliği, etkinlik Katıl/Vazgeç, sohbet engelleme testleri (ekranlar gelince); Bildir akışı için RNTL testi.

## Kurucuya soru
Yok.
