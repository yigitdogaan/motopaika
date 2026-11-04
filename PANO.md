# Motopaika Pano

Son güncelleme: 04.11.2026 18:30 (İstanbul), Tur 02

**Durum:** Uygulama artık açılıyor: beş sekme örnek (demo) verilerle gezilebiliyor ve web derlemesi başarılı. Ekran görüntüsü ve harita henüz yok.

## Alanlar

| Alan | İlerleme % | Bu tur | Sıradaki |
| --- | --- | --- | --- |
| Ortak temel | 35 | Hatalar düzeldi, web derlemesi ve demo modu çalışıyor, tasarım bileşenleri hazır, ilk veritabanı şeması yazıldı | Giriş, profil ve garaj ekranları; şemayı denemek |
| Bilgi ve forum | 8 | Demo listede örnek konular görünüyor | Kabul kriterleri, konu detayı |
| Sorun çözümü | 6 | Demo listede örnek sorunlar | Kabul kriterleri |
| İkinci el | 6 | Demo listede örnek ilanlar | Kabul kriterleri, ilan şeması |
| Rotalar | 5 | Şimdilik liste olarak açılıyor | Harita (MapLibre) |
| Buluşma ve etkinlik | 5 | Demo listede örnek etkinlikler | Kabul kriterleri |
| Not duvarı | 5 | Değişiklik yok | Anonimlik şeması |
| Canlı sohbet | 4 | Sohbet sekmesi demo içerikle açılıyor | Gerçek zamanlı sohbet tasarımı |
| Moderasyon ve hukuk | 30 | Dinlendi (öncelik uygulamada) | Şikâyet/engelleme, küfür süzme modülü |

## Ekip

| Kişi | Rol | Bu tur yaptığı |
| --- | --- | --- |
| Arda | CEO | Planladı, görevleri işledi, bu raporu yazdı |
| Nehir | Ürün ve Tasarım | Düğme, kart, liste satırı, etiket, avatar bileşenleri; demo içerik rehberi |
| Kaan | CTO | Tip ve lint hatalarını düzeltti, vercel.json ve web derlemesi, demo modu, Supabase ilk şema |
| Melis | Test ve Kalite | Kalite kapısını çalıştırdı; ekran betiği hazır ama tarayıcı izni olmadığı için görüntü alamadı |
| Tolga | Moderasyon ve Hukuk | Bu tur dinlendi |

## Senden istenen

1. **Vercel'de proje kök klasörü (Root Directory) `app` olmalı.** Varsayılan: sen Vercel panelinde ayarlarsın; ayarlanmazsa önizleme açılmaz.
2. **Ekran görüntüsü için tarayıcı indirme izni (Playwright).** Varsayılan: izin verilir; yoksa ekran görüntüsü alınamaz.

## Kalite

Tip kontrolü temiz · lint temiz · Jest 7/7 geçti · web derlemesi başarılı · Supabase testi yok (şema henüz çalıştırılıp denenmedi) · ekran görüntüsü yok.
