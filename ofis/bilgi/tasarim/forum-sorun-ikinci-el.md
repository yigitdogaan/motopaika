# Forum, sorun çözümü, ikinci el — kabul kriterleri (v0.1)
Her listede üç durum: yükleniyor (`SkeletonList`), boş (`EmptyState`), hata (`ErrorState` + Tekrar dene).

## Bilgi ve forum (Topluluk > Konular)
Hikâye: Modelime uygun konuları bulup tartışmak isterim.
- [ ] Kullanıcı konu listesini görür; her satırda başlık, yazar, yorum sayısı, etiket vardır
- [ ] Kullanıcı "Benim motorum", etiket ve şehir filtresi uygulayabilir; garajı boşsa "Benim motorum" yerine garaja motor ekleme önerisi görür
- [ ] Kullanıcı konu detayında yorumları okur, yorum yazar, oy verir; oturumsuzsa girişe yönlenir
- [ ] Başlık (≥ 5 karakter) veya içerik boşsa gönderilemez, hata alanın altında görünür
- [ ] Her konu ve yorumda "Şikâyet et" bulunur; yasaklı içerik gönderimde maskelenir/engellenir

## Sorun çözümü (Topluluk > Sorunlar)
Hikâye: Arızamın çözümünü bulmak, çözdüğümü paylaşmak isterim.
- [ ] Liste Açık / Çözüldü sekmeleriyle ayrılır; satırda Tag ile durum görünür
- [ ] Kullanıcı motor (garajdan), belirti metni ve en çok 3 fotoğrafla sorun sorabilir
- [ ] Sorunun sahibi bir yorumu "Çözüm" işaretleyebilir; başkası işaretleyemez; sorun Çözüldü olur
- [ ] Çözülen sorunlar model sayfasında bilgi bankası olarak aranabilir
- [ ] Servis/ücret önerisinde dolandırıcılık uyarısı görünür

## İkinci el
Hikâye: Güvenle motor/parça/ekipman alıp satmak isterim.
- [ ] Liste kartında fotoğraf, fiyat (₺), şehir, kategori (Motor/Parça/Ekipman) görünür
- [ ] Filtre: kategori, fiyat aralığı, şehir, marka/model
- [ ] İlan verirken başlık, fiyat, kategori, şehir, ≥ 1 fotoğraf zorunlu; motor ilanında ruhsat/şasi hatırlatması görür
- [ ] Alıcı "Mesaj gönder" ile satıcıya yazar; kendi ilanında düğme yoktur
- [ ] İlan detayında "Şikâyet et" ve "Satıcıyı engelle" bulunur; uygulamanın ödeme aracılığı yapmadığını belirten uyarı görünür
- [ ] Satıcı ilanını "Satıldı" yapabilir; satılan ilan listeden kalkar

## Telefon (Expo Go) ekran akışı notları
- Hedef genişlik 360–430 px; tek elle kullanım: ana eylemler altta, dokunma alanı ≥ 44 px.
- Liste: aşağı çekerek yenile; sonsuz yükleme, uçta "Hepsi bu kadar".
- Form: klavye açılınca alan görünür kalır (KeyboardAvoidingView), gönder düğmesi klavyenin üstünde.
- Varsayılan koyu tema; açık tema sistem ayarını izler. Demo modunda üstte "Demo verisi" etiketi.
- Akış: Liste → Detay (stack push) → Oluştur (alttan modal). Geri hareketi her yerde çalışır.
