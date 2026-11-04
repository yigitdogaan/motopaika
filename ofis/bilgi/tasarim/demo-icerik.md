# Demo modu örnek içerik rehberi

Amaç: `EXPO_PUBLIC_SUPABASE_URL` yokken her sekme dolu, gerçekçi ve 390 px'te okunur görünsün. Kural: kurgusal kişi/plaka/telefon; gerçek kişi, marka ağzıyla reklam ve kişisel veri yok. Ton: sen dili, kısa.

## Genel
- Kullanıcılar (8–10): takma adlar, ör. Deniz_R, Kaan34, Ayşegül_MT, Orhan_61, Berk.A. Şehirler: İstanbul, Ankara, İzmir, Trabzon, Eskişehir, Antalya.
- Motorlar (gerçek model adları serbest): Honda CB650R, Yamaha MT-07, Kawasaki Z650, BMW R 1250 GS, Royal Enfield Himalayan, Suzuki V-Strom 650, CFMoto 650NK.
- Her listede 6–10 öğe; en az 1 "çözüldü", 1 uzun başlık (2 satıra taşan), 1 resimsiz öğe olsun (taşma ve yedek durum görülsün).
- Ayrıca her alanda bir boş durum ekranı ulaşılabilir olsun (ör. arama sonucu yok).

## Alan alan
| Sekme | Örnek içerik |
| --- | --- |
| Topluluk (forum) | "İlk motor için 650 mi 400 mü?", "Zincir yağlama aralığı kaç km?", "Kışlık lastik gerekli mi?"; sorun çözümü: "MT-07 rölantide titriyor — çözüldü: buji", "Marş basınca tık sesi (akü)". Etiketler: Bakım, Sorun, Tavsiye, Çözüldü. |
| İkinci el | "2019 Honda CB650R, 24.000 km, 285.000 ₺", "Shoei kask M, 2 yıllık, 4.500 ₺", "Kawasaki Z650 çanta seti". Fiyat `285.000 ₺` biçimi; il + durum Tag'i (Sıfır gibi / Kullanılmış). Dolandırıcılık uyarı şeridi (warning) en üstte. |
| Rotalar | "Şile – Ağva sahil turu (112 km, kolay)", "Bolu Abant – Gölcük (190 km)", "Karadeniz Sahil – Ordu–Trabzon (340 km, zor)". Mesafe, süre, zorluk Tag'i. |
| Etkinlik | "Cumartesi sabah buluşması — Çamlıca, 08:00", "Ankara Eymir gün turu", "Bakım atölyesi: zincir ve fren". Tarih biçimi `Cmt, 14 Kas · 08:00`; katılımcı sayısı "12 kişi gidiyor". |
| Sohbet | Kanallar: Genel, İstanbul, Ankara, İzmir, Teknik. Birkaç kısa mesaj ("Sabah Sarıyer'de yol açık mı?"). |
| Not duvarı | Anonim, kimliksiz: "Kırmızı CB650R, Kadıköy: ışıkta selam verdiğin için sağ ol 🙂". Plaka/telefon asla. |
| Profil/Garaj | Avatar baş harfi, 1–2 motor, rozet (Yeni üye, Yardımsever), puan 120. |

## Görünüm kontrolü (390 px)
- Satır başlığı 2 satırdan fazla taşmaz (`numberOfLines={2}`).
- Dokunma hedefi ≥ 44 px; Tag'ler satıra sığmazsa alta kayar.
- Koyu ve açık temada aynı ekran okunur.
