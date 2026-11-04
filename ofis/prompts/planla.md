# Tur planlama (Arda, CEO)

1. `CLAUDE.md`, `ofis/roller/ceo.md`, `ofis/durum/gorevler.md`, `ofis/durum/kararlar.md`, `PANO.md` dosyalarını oku.
   Önceki turun teslim notlarına bak: `ofis/teslim/*/` altındaki en yeni dosyalar.
2. Tur numarası: `ofis/durum/ayarlar.json` içindeki `tur` değerini 1 artır ve kaydet.
3. Kurucu talimatlarını oku (iki kanal):
   a) Slack: `python3 ofis/scripts/slack.py kurucu <ayarlar.son_slack_ts>` (alan yoksa `0` kullan).
      Çıktının son satırındaki `SON_TS=` değerini `ayarlar.json` → `son_slack_ts` olarak kaydet.
   b) GitHub: `gh issue view <ayarlar.kurucu_masasi> --comments --json comments` — sadece `author.login == "yigitdogaan"`
      ve `ayarlar.son_okunan_yorum` tarihinden yeni yorumlar; sonra `son_okunan_yorum`'u güncelle.
   Her talimatı uygula ya da görev listesine ekle; `kararlar.md`'ye "kurucu" satırı olarak işle.
   Kurucu bir işe alımı onayladıysa rol dosyasını ve `ekip.json` kaydını oluştur.
   Slack komutu hata verirse (anahtar yok vb.) sadece GitHub ile devam et.
4. ÖNCELİK: `CLAUDE.md` başındaki öncelik bölümüne uy (önce telefonda Expo Go ile çalışan uygulama; hukuk en sona).
   `ofis/durum/gorevler.md`'yi güncelle: biten işleri işaretle, bu tur için her role 1–3 somut görev ver (P1/P2/P3, hedef dosya ile).
   Roller AYNI ANDA çalışır: aynı dosyayı iki role verme. Test rolü diğerleri bittikten sonra çalışır.
5. Bu turda çalışacak rolleri sırasıyla `ofis/durum/bu-tur.json` dosyasına yaz, örnek:
   `["urun-tasarim","cto","moderasyon-hukuk","test"]` (CEO listede olmaz).
6. `ofis/durum/ekip.json` içinde ilgili rollerin `durum` alanını `"calisiyor"`, `is` alanını görev başlığı yap.
7. Uzun açıklama yazma; plan dosyalarda olsun.
