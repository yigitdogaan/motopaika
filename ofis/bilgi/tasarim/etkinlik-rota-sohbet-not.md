# Etkinlik, rotalar, sohbet, not duvarı — kabul kriterleri (v0.1)
Her listede üç durum: yükleniyor (`SkeletonList`), boş (`EmptyState`), hata (`ErrorState` + Tekrar dene).
Harita: `react-native-maps` (CLAUDE.md kararı; `gezinme.md`'deki "MapLibre" ifadesi geçersiz sayılır). Konum varsayılan kapalı, istenince izin sorulur.

## Rotalar (sekme: Rotalar)
Hikâye: Güzel yolları bulmak ve kendi rotamı paylaşmak isterim.
- [ ] Kullanıcı rotaları liste ve harita görünümü arasında Segment ile değiştirir; satırda ad, mesafe (km), süre, şehir, Tag ile tür (Viraj/Manzara/Mola) görür
- [ ] Kullanıcı rota detayında başlangıç/bitiş ve mola noktalarını haritada, açıklama ve yorumları listede görür
- [ ] Kullanıcı rota ekleyebilir: ad (≥ 3 karakter), başlangıç ve bitiş noktası zorunlu; eksikse hata alanın altında görünür
- [ ] Kullanıcı rotaya "Yol durumu" notu (açık/çalışma var/tehlikeli) ekleyebilir; not tarihiyle görünür
- [ ] Oturumsuz kullanıcı rotaları okur; ekleme/yorum girişe yönlendirir
- [ ] Rota detayında "Şikâyet et" bulunur
- Boş: "Henüz rota yok" + "İlk rotayı ekle".

## Buluşma ve etkinlik (sekme: Etkinlik)
Hikâye: Yakınımdaki buluşma ve sürüşlere katılmak, kendiminkini düzenlemek isterim.
- [ ] Kullanıcı etkinlikleri tarihe göre sıralı görür; satırda başlık, tarih-saat, şehir, katılımcı sayısı vardır; geçmiş etkinlikler "Geçmiş" Tag'iyle ayrı gruptadır
- [ ] Kullanıcı şehir filtresi uygulayabilir
- [ ] Kullanıcı "Katıl" ile katılır, "Vazgeç" ile ayrılır; sayı anında güncellenir; oturumsuzsa girişe yönlenir
- [ ] Detayda toplanma noktası haritada işaretli görünür, katılımcı listesi (kullanıcı adı + Avatar) vardır
- [ ] Etkinlik oluştururken başlık, tarih-saat (gelecekte), şehir, toplanma noktası zorunlu; geçmiş tarih kabul edilmez
- [ ] Düzenleyen etkinliği iptal edebilir; iptal edilen etkinlik "İptal" Tag'i ile görünür ve "Katıl" kaybolur
- [ ] Katılımcının tam konumu değil yalnızca toplanma noktası görünür
- [ ] Etkinlik detayında "Şikâyet et" bulunur; etkinlik sohbeti için Sohbet'e bağlantı vardır
- Boş: "Yakında etkinlik yok" + "Etkinlik oluştur".

## Canlı sohbet (sekme: Sohbet)
Hikâye: Şehrimdeki sürücülerle anlık yazışmak isterim.
- [ ] Kullanıcı Segment ile "Odalar" ve "Mesajlar" arasında geçer
- [ ] Odalar listesinde kullanıcının şehrine ait oda üstte "Önerilen" Tag'iyle görünür
- [ ] Kullanıcı odada mesajları eskiden yeniye okur; yeni mesaj gelince liste en alta kayar (okuma sırasında yukarıdaysa kaymaz, "Yeni mesaj" düğmesi çıkar)
- [ ] Mesaj kutusu boşken gönder düğmesi pasiftir; en çok 500 karakter; gönderince kutu temizlenir
- [ ] Gönderilemeyen mesaj satırında "Gönderilemedi — Tekrar dene" görünür
- [ ] Mesaja uzun basınca "Şikâyet et" ve "Kullanıcıyı engelle" çıkar; engellenen kullanıcının mesajları gizlenir
- [ ] Birebir mesaj için kullanıcı profilinden "Mesaj gönder" kullanılır; engelleyen/engellenen birbirine yazamaz
- [ ] Sohbette reklam yoktur
- Boş oda: "Henüz mesaj yok, ilk mesajı sen yaz".

## Not duvarı (Topluluk > Not duvarı)
Hikâye: Kimliğimi göstermeden kısa bir şey paylaşmak isterim.
- [ ] Kullanıcı notları yeniden eskiye görür; her notta metin, göreli zaman, tepki sayısı vardır; yazar adı/avatarı **hiçbir yerde** görünmez
- [ ] Kullanıcı not yazarken 1–280 karakter girer; sayaç kalan karakteri gösterir; boş not gönderilemez
- [ ] Yazma ekranında "Kişi veya plaka hedefleme yasak" hatırlatması görünür
- [ ] Yasaklı ifade içeren not yayınlanmaz; kullanıcı nedenini kısa mesajla görür
- [ ] Kullanıcı nota tek tepki verebilir (👍/🏍️/😂) ve geri alabilir
- [ ] Her notta "Şikâyet et" bulunur; yazar engellenemez (kimlik gizli), şikâyet moderasyona gider
- [ ] Kendi notunu silebilir (sistem kimliği eşleştirir; arayüzde "Senin notun" ibaresi sadece yazara görünür)
- [ ] Not duvarında reklam yoktur
- Boş: "Henüz not yok" + "İlk notu yaz".

## Segment bileşeni (kullanım)
`<Segment options={[{value,label}]} value onChange />` — Topluluk (Konular · Sorunlar · Not duvarı), Rotalar (Liste · Harita), Sohbet (Odalar · Mesajlar). 2–3 seçenek; her biri ≥ 44 px, `tab` rolü + `selected` durumu; seçili olan dolgu + metin rengiyle ayırt edilir.
