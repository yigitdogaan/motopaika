# Tur planlama (Arda, CEO)

1. `CLAUDE.md`, `ofis/roller/ceo.md`, `ofis/durum/gorevler.md`, `ofis/durum/kararlar.md`, `PANO.md` dosyalarını oku.
   Önceki turun teslim notlarına bak: `ofis/teslim/*/` altındaki en yeni dosyalar.
2. Tur numarası: `ofis/durum/ayarlar.json` içindeki `tur` değerini 1 artır ve kaydet.
3. Kurucu talimatlarını oku:
   `gh issue view <ayarlar.kurucu_masasi> --comments --json comments`
   Sadece `author.login == "yigitdogaan"` olan ve `ayarlar.son_okunan_yorum` tarihinden yeni yorumları dikkate al.
   Her talimatı uygula ya da görev listesine ekle; `kararlar.md`'ye "kurucu" satırı olarak işle. `son_okunan_yorum`'u güncelle.
   Kurucu bir işe alımı onayladıysa rol dosyasını ve `ekip.json` kaydını oluştur.
4. `ofis/durum/gorevler.md`'yi güncelle: biten işleri işaretle, bu tur için her role 1–3 somut görev ver (P1/P2/P3, hedef dosya ile).
   Sıra kuralı: aynı dosyaya iki rol dokunmaz. Test rolü her tur en sonda çalışır.
5. Bu turda çalışacak rolleri sırasıyla `ofis/durum/bu-tur.json` dosyasına yaz, örnek:
   `["urun-tasarim","cto","moderasyon-hukuk","test"]` (CEO listede olmaz).
6. `ofis/durum/ekip.json` içinde ilgili rollerin `durum` alanını `"calisiyor"`, `is` alanını görev başlığı yap.
7. Uzun açıklama yazma; plan dosyalarda olsun.
