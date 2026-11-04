# Motopaika Pano

Son güncelleme: 04.11.2026 16:50 (İstanbul), Tur 01

**Durum:** İlk tur bitti. Tasarım, topluluk kuralları ve test kurulumu hazır; uygulama iskeleti var ama henüz kalite kontrolünden geçmiyor.

## Alanlar

| Alan | İlerleme % | Bu tur | Sıradaki |
| --- | --- | --- | --- |
| Ortak temel | 15 | Tasarım sistemi, gezinme, kayıt/profil/garaj kabul kriterleri yazıldı. Expo iskeleti geldi. | Hataları düzelt, Supabase şeması, giriş ekranları |
| Bilgi ve forum | 3 | Ekran listesi çıktı | Kabul kriterleri, şema |
| Sorun çözümü | 3 | Ekran listesi çıktı | Kabul kriterleri, şema |
| İkinci el | 3 | Dolandırıcılık uyarısı kurallara girdi | Kabul kriterleri, ilan şeması |
| Rotalar | 2 | Ekran listesi çıktı | Harita seçimi ve şema |
| Buluşma ve etkinlik | 2 | Ekran listesi çıktı | Kabul kriterleri |
| Not duvarı | 5 | Hedefleme yasağı ve fotoğrafsız karar | Anonimlik şeması |
| Canlı sohbet | 2 | Ekran listesi çıktı | Realtime tasarımı |
| Moderasyon ve hukuk | 30 | Topluluk kuralları, filtre kalıpları, 5651/KVKK notları | Kullanım koşulları, aydınlatma metni, kod modülü |

## Ekip

| Kişi | Rol | Bu tur yaptığı |
| --- | --- | --- |
| Arda | CEO | Planladı, bu raporu yazdı |
| Nehir | Ürün ve Tasarım | Tasarım sistemi, 5 sekmeli gezinme, ortak temel kriterleri |
| Kaan | CTO | Teslim notu yok. Expo iskeleti `app/` içinde duruyor; görevleri açık |
| Melis | Test ve Kalite | Jest kurdu, ilk test geçti, kalite komutlarını yazdı, 4 hata buldu |
| Tolga | Moderasyon ve Hukuk | Topluluk kuralları, moderasyon kalıpları, hukuk notları |

## Senden istenen

1. **Veri sorumlusu kim olacak (şahıs / dernek)?** Varsayılan: şahıs (kurucu adına); hukuk metinleri buna göre taslak yazılır.
2. **Hukuki iletişim e-posta adresi ve sunucu bölgesi.** Varsayılan: yer tutucu adres, AB bölgesi; yayından önce senin onayınla değişir.
3. **Yaş sınırı 18+ uygun mu?** Varsayılan: 18+.

## Kalite

Jest 1/1 geçti · tip kontrolü 3 hata · lint 1 hata · Supabase testi çalışmadı (`supabase/` yok) → kapı henüz yeşil değil.
