# Ortak temel: kayıt/giriş, profil + garaj — kabul kriterleri (v0.1)

## Kayıt ve giriş
Hikâye: Motorcu olarak e-posta ile kayıt olup topluluğa katılmak isterim.
- [ ] Kullanıcı e-posta, şifre (≥ 8 karakter) ve kullanıcı adı ile kayıt olabilir; alan hatalarını ilgili alanın altında Türkçe görür
- [ ] Kullanıcı adı benzersizdir (3–20 karakter, harf/rakam/alt çizgi); alınmışsa "Bu kullanıcı adı alınmış" görür
- [ ] Kayıtta topluluk kuralları ve gizlilik metni onay kutusu zorunludur; onaysız kayıt tamamlanmaz
- [ ] Kullanıcı e-posta + şifre ile giriş yapabilir; yanlış bilgide hangisinin yanlış olduğunu belirtmeyen genel hata görür
- [ ] Kullanıcı şifre sıfırlama isteyebilir; e-posta kayıtlı olsun olmasın aynı bilgi mesajını görür
- [ ] Oturum uygulama kapanıp açılınca korunur; çıkış yapınca giriş ekranına döner
- [ ] Oturumsuz kullanıcı içerikleri gezebilir; yazma/mesaj/ilan eyleminde giriş ekranına yönlenir, girişten sonra kaldığı yere döner
- [ ] Gönderim sırasında düğme yükleniyor durumunda olur, çift gönderim engellenir

Sosyal giriş ilk sürümde yok (karar kayıtlı).

## Profil
Hikâye: Kendimi tanıtmak ve başkalarının profilini görmek isterim.
- [ ] Kullanıcı avatar, kullanıcı adı, kısa biyografi (≤ 160 karakter) ve şehir (81 il listesinden) düzenleyebilir
- [ ] Profilde puan, rozetler ve garajdaki motorlar görünür
- [ ] Başkasının profilinde "Şikâyet et" ve "Engelle" bulunur; kendi profilinde bulunmaz
- [ ] Engellenen kullanıcının içerik ve mesajları engelleyene görünmez; Ayarlar > Engellenenler'den kaldırılabilir
- [ ] Konum paylaşımı varsayılan kapalıdır; yalnız şehir gösterilir, kesin konum profilde yer almaz
- [ ] Kullanıcı Ayarlar'dan hesap ve veri silme talebi başlatabilir (KVKK)
- [ ] Anonim not duvarında yazarın kimliği diğer kullanıcılara hiçbir ekranda görünmez

## Garaj
Hikâye: Motorlarımı ekleyip içeriğin modelime göre gelmesini isterim.
- [ ] Kullanıcı marka → model (listeden) → yıl seçerek motor ekleyebilir; listede yoksa "Diğer" ile serbest metin girer
- [ ] Kullanıcı bir motoru "ana motorum" yapabilir; forumdaki "Benim motorum" filtresi ana motoru kullanır
- [ ] Kullanıcı motoru düzenleyebilir; silmeden önce onay görür
- [ ] Garaj boşken EmptyState "İlk motorunu ekle" eylemiyle görünür
- [ ] Garaj en fazla 10 motor tutar; sınırda anlaşılır uyarı görünür
- [ ] Motor eklemek zorunlu değildir; kayıt akışında atlanabilir

## Açık noktalar (varsayılanla devam)
- Marka/model listesi kaynağı: seed verisi ile kendi tablomuz; şema kararı CTO'da.
