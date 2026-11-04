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
3. Raporu Slack'e gönder: kısa raporu bir dosyaya yaz (en fazla 20 satır, Slack biçimi: *kalın*, • madde) ve
   `python3 ofis/scripts/slack.py post ceo <dosya>` çalıştır. İlk satır: `*Tur <NN> raporu* — <bir cümlelik durum>`.
   Sonunda "Senden istenen" maddeleri (varsa, her biri varsayılan seçeneğiyle) ve şu satır olsun:
   `_Cevabını bu mesajın altına yazabilirsin; bir sonraki turda okunur._`
4. Aynı raporu arşiv için Günlük Raporlar issue'suna da yorum olarak ekle (`gh issue comment <ayarlar.gunluk_raporlar> --body-file <dosya>`);
   burada kimseyi etiketleme. Slack gönderimi hata verdiyse issue'ya `@yigitdogaan` etiketiyle yaz.
5. `kararlar.md`'ye bu turun önemli kararlarını ekle (tarih | kim | karar | gerekçe).
6. `ofis/durum/ekip.json` içinde herkesi `"bosta"` yap, `bu-tur.json`'u `[]` yap.
