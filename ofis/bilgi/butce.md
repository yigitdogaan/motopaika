# Bütçe — minimum başlangıç

Kurucu kararı: minimum bütçe ile başla, ileride artır. **Şu anki ek aylık maliyet: 0.**

| Kalem | Plan | Maliyet | Sınır / not |
| --- | --- | --- | --- |
| Yapay zekâ ekibi | Kurucunun mevcut Claude aboneliği | Ek yok | Abonelik kullanım limitleri tur sayısını sınırlar |
| GitHub Actions | GitHub Free, özel depo | 0 | Aylık ~$12 değerinde ücretsiz kullanım (~2.000 Linux dakikası). Ödeme yöntemi yoksa aşınca durur, ücret çıkmaz |
| Veritabanı | Geliştirmede yerel Supabase; yayına yakın Supabase Free | 0 | Free: 500 MB veritabanı, 50.000 aylık aktif kullanıcı, 1 GB dosya; 1 hafta işlemsiz kalırsa durdurulur. Pro: aylık $25'ten |
| Uygulama derleme | Expo Free | 0 | Ayda 15 Android + 15 iOS derleme |
| Harita | MapLibre + açık veri | 0 | Ücretli harita API'si yok |
| Mağaza hesapları | Yayına çıkarken | Google Play tek seferlik, Apple yıllık ücret | Yayın kararıyla birlikte güncel fiyat kontrol edilir |
| Alan adı | Yayına yakın | Yıllık küçük ücret | `ofis/bilgi/marka.md` |

Bütçe artırılırsa ilk yapılacaklar: (1) tur sayısını artırmak için depoyu herkese açık yapmak veya Actions kotası, (2) Supabase Pro.
Kaynaklar: docs.github.com (Actions faturalama), supabase.com/pricing, expo.dev/pricing — 04.11.2026'da okundu.
