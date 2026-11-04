# Tur çalışması (her rol)

Senin rolün komut satırında ROL olarak verildi.

1. `CLAUDE.md` ve `ofis/roller/<ROL>.md` dosyalarını oku. Rol dosyası yoksa hiçbir şey yapmadan dur.
2. `ofis/durum/gorevler.md` içinde rolüne ait bu turun görevlerini bul. Önceki notun varsa oku: `ofis/teslim/<ROL>/` en yeni dosya.
3. Görevlere başlamadan önce ilgili becerileri (`.claude/skills`) kullan — hangi iş için hangi beceri, `CLAUDE.md` tablosunda.
4. Görevleri sırayla yap. Her görev için kanıt topla (komut çıktısı özeti, test sonucu, ekran görüntüsü yolu).
5. `ofis/durum/gorevler.md`'de kendi satırlarını güncelle: `[x]` (kanıtlı), `[~]` (eksik kalan + neden).
   Başka role iş düşüyorsa yeni satır ekle (rolü belirterek); başkasının satırını değiştirme.
6. Tur notunu yaz: `ofis/teslim/<ROL>/tur-<NN>.md` (NN = `ofis/durum/ayarlar.json` içindeki `tur`).
   İçerik: yapılanlar, kanıtlar, açık kalanlar, sonraki tur için öneri, kurucuya soru (varsa). En fazla 40 satır.
7. Kurucuya soru gerekiyorsa sadece tur notuna yaz; issue'ya CEO yazar.
8. `git commit`/`push` yapma.
