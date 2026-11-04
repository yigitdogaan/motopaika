# Tur çalışması (her rol)

Senin rolün komut satırında ROL olarak verildi.

1. `CLAUDE.md` ve `ofis/roller/<ROL>.md` dosyalarını oku. Rol dosyası yoksa hiçbir şey yapmadan dur.
2. `ofis/durum/gorevler.md` içinde rolüne ait bu turun görevlerini bul. Önceki notun varsa oku: `ofis/teslim/<ROL>/` en yeni dosya.
3. Görevlere başlamadan önce ilgili becerileri (`.claude/skills`) kullan — hangi iş için hangi beceri, `CLAUDE.md` tablosunda.
4. Görevleri sırayla yap. Her görev için kanıt topla (komut çıktısı özeti, test sonucu, ekran görüntüsü yolu).
5. Diğer roller seninle AYNI ANDA çalışıyor. Bu yüzden:
   - `ofis/durum/gorevler.md`, `PANO.md`, `ofis/durum/*.json` dosyalarını DEĞİŞTİRME (bunları CEO günceller).
   - Sadece kendi sahip olduğun dosyalara yaz (sahiplik tablosu: `ofis/roller/ceo.md`). Başkasının dosyasında değişiklik gerekiyorsa tur notuna yaz.
   - (Test rolü diğerlerinden sonra çalışır; onların bu turki işini görür.)
6. Tur notunu yaz: `ofis/teslim/<ROL>/tur-<NN>.md` (NN = `ofis/durum/ayarlar.json` içindeki `tur`).
   İçerik: **Görevler** (her görev: `[x]` kanıtıyla / `[~]` eksik kalan + neden), **Diğer rollere** (başka role düşen işler),
   **Sonraki tur önerisi**, **Kurucuya soru** (varsa). En fazla 40 satır.
7. Kurucuya soru gerekiyorsa sadece tur notuna yaz; issue'ya CEO yazar.
8. `git commit`/`push` yapma.
