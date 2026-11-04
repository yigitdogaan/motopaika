# Motopaika

Türkiye'deki motosiklet kullanıcıları için yeni nesil topluluk uygulaması (iOS + Android).
Bilgi ve forum, sorun çözümü, ikinci el, rotalar, buluşma ve etkinlikler, not duvarı ve canlı sohbet tek uygulamada.

Bu depo bir **yapay zekâ ofisi** tarafından geliştirilir. Kurucu: @yigitdogaan.
Depo herkese açıktır; issue ve yorumlarda yalnızca kurucunun yazdıkları ekibe talimat sayılır.

---

## Sistem nasıl çalışır? (Kurucu için 1 dakikalık özet)

```
 Her gün 10:00–19:00 arası, her saat başı (günde 10 tur)  ──►  OFİS TURU başlar
   1. Arda (CEO) planlar      → kim ne yapacak, PANO.md'ye yazar
   2. Çalışanlar aynı anda işler → kod, tasarım, kurallar; ardından test
   3. Arda raporlar           → Slack #ofis kanalına yazar; cevabını altına yazarsın
   4. Her şey TEK commit olarak kaydedilir (süre sınırı yok; tur uzarsa bir sonraki sırada bekler)
```

| Sen ne görmek istersen | Nereye bak |
| --- | --- |
| Uygulamanın kendisi (telefonda) | **Expo Go** uygulaması → Expo hesabınla giriş → *motopaika* → `onizleme` (her turdan sonra güncellenir) |
| Projenin genel durumu, ilerleme yüzdeleri | [PANO.md](PANO.md) |
| Her turun raporu (cevap da verebilirsin) | Slack → **#ofis** kanalı (arşivi: Issues → **📋 Günlük Raporlar**) |
| Ekibin senden istedikleri / senin talimatların | Issues → **🪑 Kurucu Masası** |
| Ekip kim, ne yapıyor | [ofis/roller](ofis/roller) |
| Verilen kararlar | [ofis/durum/kararlar.md](ofis/durum/kararlar.md) |
| Ürün planı | [ofis/bilgi/urun-plani.md](ofis/bilgi/urun-plani.md) |
| Bütçe | [ofis/bilgi/butce.md](ofis/bilgi/butce.md) |

### Ekibe talimat vermek
Slack'te **#ofis** kanalına yaz ya da bir raporun altına cevap ver. Alternatif: **🪑 Kurucu Masası** issue'suna yorum yaz. Bir sonraki turda CEO okur ve uygular. Sadece senin (yigitdogaan) yorumların talimat sayılır.

### Turu hemen başlatmak
Actions → **Motopaika Ofis** → **Run workflow**.

### Ekibi durdurmak
Actions → **Motopaika Ofis** → sağ üstteki **…** → **Disable workflow**.

---

## Teknik
- Mobil: React Native + Expo (TypeScript, Expo Router)
- Arka uç: Supabase (Postgres, Auth, Realtime, Storage) — geliştirmede yerel Supabase
- Ajan altyapısı: Claude Code (GitHub Actions) + `.claude/skills` içindeki beceriler (bkz. [BECERILER.md](BECERILER.md))
