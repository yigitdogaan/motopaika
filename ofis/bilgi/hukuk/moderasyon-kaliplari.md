# Moderasyon Kalıp Listesi — Taslak 1

Amaç: `app/src/lib/moderasyon/` modülünü (CTO) besleyecek kural tanımı. Kod CTO'nundur. Kalıplar ilk tahmindir; gerçek veriyle ayarlanmalı, hukuki sonuç doğuran kararlar avukata sorulacak.

## İlkeler
- Üç sonuç: **MASKELE** (yayınlanır, kısım `***`), **ENGELLE** (yayınlanmaz, neden söylenir), **İNCELEME** (moderatör kuyruğu).
- Önce normalleştir: Türkçe küçük harf (`İ/ı`), `ı/i` ve `ş/s` varyantları, tekrar eden harfi sadeleştir, harf arası boşluk/nokta/tire/`*` sil ("k a p o r a").
- Yanlış pozitif için tam kelime eşleşmesi + istisna listesi.
- Not duvarı ve sohbet en sıkı; forum/ilan açıklaması orta.
- İlk iki hafta yalnızca İNCELEME modunda çalıştırıp hata payını ölçmek önerilir.

## 1. Kişisel veri
| Tür | Kalıp (özet) | Sonuç |
| --- | --- | --- |
| Telefon | `(\+?90\|0)?\s*5\d{2}[\s.\-]*\d{3}[\s.\-]*\d{2}[\s.\-]*\d{2}`; yazıyla rakam İNCELEME | MASKELE |
| E-posta | `[\w.+-]+@[\w-]+\.[\w.]+`, "(at)" varyantı | MASKELE |
| TC kimlik | 11 hane, ilk hane ≠ 0, sağlama algoritması geçerse | MASKELE |
| IBAN | `TR\d{2}(\s?\d{4}){5}\s?\d{2}` | MASKELE (+ dolandırıcılık sinyaliyle İNCELEME) |
| Plaka | `\b(0[1-9]\|[1-7]\d\|8[01])\s?[A-ZÇĞİÖŞÜ]{1,3}\s?\d{2,4}\b` | Forum/ilan: MASKELE; not duvarı: ENGELLE |
| Adres | "mah./mahallesi", "sokak/sk.", "no:" birlikte | İNCELEME |
| Şasi (VIN) | `[A-HJ-NPR-Z0-9]{17}` | MASKELE |
| Koordinat | `\d{2}\.\d{4,},\s*\d{2}\.\d{4,}` | MASKELE (rota/etkinlik toplanma noktası alanı hariç) |
| Dış hesap | `@\w+`, instagram.com/…, wa.me/…, "wp/whatsapp" + numara | İlanda İNCELEME |

Görsellerde yüz/plaka bulanıklaştırma ilk sürümde otomatik değil; bildirimle incelenir (CTO'ya not).

## 2. Küfür, hakaret, nefret, tehdit
- Küfür listesini bu açık belgeye yazmıyoruz; CTO modülde `kufur-listesi` dosyası (çekim ekleriyle) tutulur, hazır liste kopyalanmaz, kendimiz yazarız.
- Ağır küfür, hedefli nefret söylemi → ENGELLE.
- Hafif argo tek başına serbest; bir kişiye yöneltilmişse ("sen/siz" + hakaret) İNCELEME.
- Tehdit: "seni bulurum", "öldüreceğim", "kafanı kırarım", "yolda yakalarım" → ENGELLE + öncelikli kuyruk.
- Kendine zarar ("intihar", "kendimi öldüreceğim") → engelleme yok, yardım bilgisi göster + acil İNCELEME. Yardım hattı bilgisi doğrulanacak (112 Acil).

## 3. Dolandırıcılık (ikinci el, sohbet)
| Sinyal | Örnek | Sonuç |
| --- | --- | --- |
| Kapora | kapora, kaparo, depozito, rezerve ücreti | İNCELEME + ilanda uyarı |
| Önce ödeme | "önce havale", "eft yap sonra", "ödeme yap kargo" | İlan: ENGELLE; özel mesaj: İNCELEME |
| Ödeme linki | kısaltılmış link (bit.ly vb.), "ödeme linki", bilinmeyen alan adı | ENGELLE |
| Dışarı çekme | "whatsapp'tan yaz", "telegram", ilk 3 mesajda numara | İNCELEME |
| Fiyat anomalisi | Piyasanın %50 altı (fiyat verisi sonra) | İNCELEME |
| Aciliyet hikâyesi | "askerliğe gidiyorum acil", "yurt dışına taşınıyorum" + düşük fiyat | İNCELEME |
| Kopya ilan | Aynı foto/metin birden çok hesapta | İNCELEME |

İlan sayfasında sabit uyarı: "Ödemeyi görmeden yapma, kapora gönderme. Uygulama ödeme aracılığı yapmaz."

## 4. Spam
- Aynı mesaj 5 dk içinde 3 kez → engelle. Sohbette dakikada 10 mesaj sınırı.
- Aynı bağlantı 3+ kez → İNCELEME. Büyük harf >%70 (20+ karakter) → yalnızca uyarı.
- "bahis", "casino", "bonus", "kripto kazan", "yatırım garanti" → ENGELLE.

## 5. Not duvarı ek kuralları
- Kullanıcı adı birebir geçmesi veya `@ad` → ENGELLE.
- Plaka, telefon, açık ad-soyad → ENGELLE; belirsizse yayınlanmadan İNCELEME.
- Fotoğraf ilk sürümde **yok** (hedefleme riskini baştan kapatır). Karar `kararlar.md`'de.
- 24 saatten yeni hesap not yazamaz; saatte en fazla 3 not (öneri).
- 3 şikâyet → otomatik gizle, moderatör bakar.
- Yazar kimliği moderatör ekranında da varsayılan gizli; açılması erişim günlüğüne yazılır (KVKK).

## 6. Yasaklı ürün/konu (ikinci el, İNCELEME)
Silah/mühimmat, "evraksız", "plakasız", "ruhsatsız", "km düşürme", "şasi kazıma"; "egzoz delik/katalizör iptal", "hız sınırlayıcı iptal" (kapsam avukata sorulacak).

## 7. Test örnekleri (CTO modül testine girdi)
| Girdi | Beklenen |
| --- | --- |
| "Beni ara 0532 123 45 67" | MASKELE |
| "k a p o r a gönder" | İNCELEME |
| "34 ABC 123 plakalı adam sıkıştırdı" (not duvarı) | ENGELLE |
| "34 ABC 123 benim motorum" (forum) | MASKELE |
| "Anadolu'da güzel rota" | serbest |
| "önce havale yap sonra kargo" (ilan) | ENGELLE |
| "10000000146" (geçerli TC sağlaması) | MASKELE |
| "Ankara 06 saatte gidilir" | serbest (plaka yanlış pozitifi sınanır) |
