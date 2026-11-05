// Demo gönderiler (EXPO_PUBLIC_SUPABASE_URL yokken). Sıra = yenilik sırası (en yeni üstte).
export type GonderiTuru = 'Makale' | 'Soru' | 'Deneyim' | 'Duyuru';

export type Gonderi = {
  id: string;
  /** Kanal anahtarı: "<kategori>:<id>" */
  kanal: string;
  tur: GonderiTuru;
  sabit?: boolean;
  yazar: string;
  baslik: string;
  ozet: string;
  zaman: string;
  yorum: number;
  begeni: number;
};

export const gonderiTurleri: GonderiTuru[] = ['Makale', 'Soru', 'Deneyim', 'Duyuru'];

export const demoBildirim = { zil: 3, sohbet: 3 };

export const demoGonderiler: Gonderi[] = [
  {
    id: 'g1', kanal: 'sosyal:yeni', tur: 'Makale', sabit: true, yazar: 'Elif Demir',
    baslik: 'İlk motorunu almadan önce bilmen gereken 7 şey',
    ozet: 'Ehliyet sınıfından sigortaya, ekipmandan ilk bakıma kadar yeni başlayanların en sık sorduğu soruları tek yazıda topladık.',
    zaman: '2 sa önce', yorum: 24, begeni: 112,
  },
  {
    id: 'g2', kanal: 'markalar:honda', tur: 'Soru', yazar: 'Burak Tan',
    baslik: 'CB650R için en iyi lastik hangisi?',
    ozet: 'Şehir içi ağırlıklı kullanıyorum, hafta sonları da Şile yoluna çıkıyorum. Islak zeminde güven veren bir lastik arıyorum.',
    zaman: '3 sa önce', yorum: 18, begeni: 9,
  },
  {
    id: 'g3', kanal: 'sehirler:34', tur: 'Duyuru', yazar: 'İstanbul Moderatör',
    baslik: 'Pazar sabahı Şile kahvaltı sürüşü',
    ozet: '09 Kasım, 08:00 Kadıköy buluşma. Tahmini dönüş saati 14:00. Yağış ihtimaline karşı yağmurluğunu yanına al.',
    zaman: '5 sa önce', yorum: 31, begeni: 64,
  },
  {
    id: 'g4', kanal: 'markalar:yamaha', tur: 'Deneyim', yazar: 'Mert Sönmez',
    baslik: 'MT-07 ile 12.000 km: neleri değiştirdim?',
    ozet: 'Süspansiyon ayarı, ön balata ve egzoz değişikliğinin sürüşe etkisini rakamlarla ve fotoğraflarla anlatıyorum.',
    zaman: 'Dün', yorum: 42, begeni: 187,
  },
  {
    id: 'g5', kanal: 'sosyal:bakim', tur: 'Makale', yazar: 'Ahmet Kaya',
    baslik: 'Kış öncesi akü bakımı: 10 dakikada yap',
    ozet: 'Soğuk havalarda aküyü korumanın en kolay yolu. Gerekli ekipman, şarj döngüsü ve saklama önerileri.',
    zaman: 'Dün', yorum: 15, begeni: 76,
  },
  {
    id: 'g6', kanal: 'markalar:kawasaki', tur: 'Soru', yazar: 'Selin Aras',
    baslik: 'Versys 650 rölantide titriyor, normal mi?',
    ozet: 'Soğukken çalıştırınca birkaç dakika titreme var, ısınınca geçiyor. Aynı durumu yaşayan var mı?',
    zaman: 'Dün', yorum: 11, begeni: 4,
  },
  {
    id: 'g7', kanal: 'sehirler:06', tur: 'Duyuru', yazar: 'Ankara Moderatör',
    baslik: 'Eymir Gölü buluşması 15 Kasım',
    ozet: 'Saat 11:00, giriş kapısı otoparkı. Katılım ücretsiz; sıcak içecek bizden.',
    zaman: '2 gün önce', yorum: 20, begeni: 58,
  },
  {
    id: 'g8', kanal: 'sosyal:enduro', tur: 'Deneyim', yazar: 'Kerem Yıldız',
    baslik: 'Kazdağları enduro rotası: 85 km çamur ve keyif',
    ozet: 'Lastik basıncı, mola noktaları ve geçilmesi zor iki dere geçişi için notlarım.',
    zaman: '2 gün önce', yorum: 27, begeni: 143,
  },
  {
    id: 'g9', kanal: 'markalar:bmw', tur: 'Makale', yazar: 'Deniz Acar',
    baslik: 'R 1250 GS uzun yol bagaj düzeni',
    ozet: 'Yan çanta, üst çanta ve tank çantası ağırlık dağılımı; 3 haftalık Balkan turundan kalan dersler.',
    zaman: '2 gün önce', yorum: 33, begeni: 129,
  },
  {
    id: 'g10', kanal: 'sehirler:35', tur: 'Soru', yazar: 'Cem Kurt',
    baslik: 'İzmir’de güvenilir zincir-dişli servisi önerir misiniz?',
    ozet: 'Karşıyaka tarafında arıyorum. Fiyat ve işçilik açısından deneyimi olan var mı?',
    zaman: '3 gün önce', yorum: 14, begeni: 6,
  },
  {
    id: 'g11', kanal: 'sosyal:kamp', tur: 'Deneyim', yazar: 'Zeynep Ay',
    baslik: 'Motorla kamp: 20 litrelik çantaya ne sığar?',
    ozet: 'Çadır, uyku tulumu ve mutfak seti dahil minimal liste; hafta sonu Abant kampından fotoğraflarla.',
    zaman: '3 gün önce', yorum: 19, begeni: 91,
  },
  {
    id: 'g12', kanal: 'markalar:ktm', tur: 'Soru', yazar: 'Oğuz Er',
    baslik: '390 Adventure için en iyi koruma ekipmanı?',
    ozet: 'Karter koruma ve el koruyucu markaları arasında kararsız kaldım, kullananların yorumunu duymak isterim.',
    zaman: '3 gün önce', yorum: 8, begeni: 5,
  },
  {
    id: 'g13', kanal: 'sosyal:kadin', tur: 'Duyuru', yazar: 'Kadın Sürücüler',
    baslik: 'Aylık buluşma: yeni üyelere açık kahvaltı',
    ozet: 'Sürüş tecrübesi fark etmeksizin herkes davetli. Tanışma ve rota paylaşımı için buluşuyoruz.',
    zaman: '4 gün önce', yorum: 22, begeni: 98,
  },
  {
    id: 'g14', kanal: 'sehirler:16', tur: 'Deneyim', yazar: 'Hasan Çelik',
    baslik: 'Uludağ yolu: virajlar, mola ve en güzel gün batımı',
    ozet: 'Hafta içi sabah erken saatlerde trafik az ve yol kuru; çıkış ve iniş için önerdiğim noktalar.',
    zaman: '4 gün önce', yorum: 16, begeni: 72,
  },
  {
    id: 'g15', kanal: 'markalar:suzuki', tur: 'Makale', yazar: 'Barış Öz',
    baslik: 'V-Strom 650 yıllık bakım maliyeti nedir?',
    ozet: 'Yağ, filtre, zincir, lastik ve periyodik servisin gerçek rakamlarla dökümü.',
    zaman: '5 gün önce', yorum: 12, begeni: 54,
  },
  {
    id: 'g16', kanal: 'sosyal:uzunyol', tur: 'Soru', yazar: 'Naz Polat',
    baslik: 'Karadeniz turu için kaç günlük plan yapmalıyım?',
    ozet: 'İstanbul çıkışlı, Rize’ye kadar gidip dönmeyi düşünüyorum. Günlük mesafe önerisi var mı?',
    zaman: '5 gün önce', yorum: 29, begeni: 17,
  },
  {
    id: 'g17', kanal: 'markalar:triumph', tur: 'Deneyim', yazar: 'Tuna Eren',
    baslik: 'Street Triple 765 ilk 5.000 km izlenimleri',
    ozet: 'Motorun karakteri, şehir içi konfor ve beklemediğim iki küçük sorun.',
    zaman: '6 gün önce', yorum: 21, begeni: 88,
  },
  {
    id: 'g18', kanal: 'sehirler:07', tur: 'Duyuru', yazar: 'Antalya Moderatör',
    baslik: 'Kış sezonu Akdeniz sahil turu',
    ozet: 'Kaş–Kalkan–Demre hattında hafta sonu sürüşü; yakıt ve mola noktaları listesi yorumlarda.',
    zaman: '6 gün önce', yorum: 10, begeni: 37,
  },
  {
    id: 'g19', kanal: 'sosyal:gece', tur: 'Makale', yazar: 'Ece Yalın',
    baslik: 'Gece sürüşünde görüş mesafesi: far, kask ve vizör',
    ozet: 'Gece güvenliği için ışık, yansıtıcı ekipman ve doğru vizör seçimi hakkında pratik öneriler.',
    zaman: '1 hafta önce', yorum: 13, begeni: 66,
  },
  {
    id: 'g20', kanal: 'sosyal:pist', tur: 'Duyuru', yazar: 'Pist Günleri',
    baslik: 'Kasım pist günü kayıtları açıldı',
    ozet: 'Sınırlı kontenjan, ilk pist deneyimi için eğitmen eşliğinde grup ayrı olacak.',
    zaman: '1 hafta önce', yorum: 18, begeni: 52,
  },
];
