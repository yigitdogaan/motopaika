# Tur raporu (Arda, CEO)

1. Bu turun teslim notlarını oku: `ofis/teslim/*/tur-<NN>.md` (NN = `ofis/durum/ayarlar.json` → `tur`). `ofis/durum/gorevler.md`'ye bak.
2. `PANO.md`'yi baştan yaz. Kurucu teknik değil; sade Türkçe, kısa cümleler. Biçim:
   - Başlık + "Son güncelleme: <tarih saat İstanbul>, Tur <NN>"
   - **Bir cümlede durum**
   - **Alanlar tablosu**: Alan | İlerleme % | Bu tur | Sıradaki — satırlar: Ortak temel, Bilgi ve forum, Sorun çözümü, İkinci el, Rotalar, Buluşma ve etkinlik, Not duvarı, Canlı sohbet, Moderasyon ve hukuk
     (% tahminini görevlerin bitme oranına göre ver; kanıtsız işi sayma)
   - **Ekip** tablosu: Kişi | Rol | Bu tur yaptığı
   - **Senden istenen** (en fazla 3 madde; yoksa "Yok") — her birinde ekibin varsayılan seçeneği yazsın
   - **Kalite**: test/lint/tip kontrolü sonuçları tek satır
3. Günlük Raporlar issue'suna yorum yaz (`gh issue comment <ayarlar.gunluk_raporlar> --body-file <dosya>`).
   Rapor PANO'nun kısa hali olsun (en fazla 25 satır) ve ilk satırı `@yigitdogaan Tur <NN> raporu` olsun.
4. "Senden istenen" maddeleri varsa aynı maddeleri Kurucu Masası issue'suna da tek yorum olarak yaz.
5. `kararlar.md`'ye bu turun önemli kararlarını ekle (tarih | kim | karar | gerekçe).
6. `ofis/durum/ekip.json` içinde herkesi `"bosta"` yap, `bu-tur.json`'u `[]` yap.
