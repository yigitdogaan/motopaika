// Demo içerik (EXPO_PUBLIC_SUPABASE_URL yokken). Bulut veritabanı bağlanınca Supabase'den gelecek.
export type KategoriId = 'uyari' | 'surus' | 'geyik' | 'teknik';

/** Her kategorinin vurgu rengi (koyu temada parlak). Yalnız etiket, şerit ve seçili hapta kullanılır. */
export const kategoriRenkleri: Record<KategoriId, string> = {
  uyari: '#FF5A36', // kırmızı-turuncu: yol güvenliği hemen göze çarpsın
  surus: '#FFB800', // marka sarısı
  geyik: '#A78BFA', // mor
  teknik: '#38BDF8', // mavi
};

export const gonderiKategorileri: { id: KategoriId; ad: string; kisa: string; renk: string; aciklama: string }[] = [
  { id: 'uyari', ad: 'Yol / Trafik Uyarısı', kisa: 'Uyarı', renk: kategoriRenkleri.uyari, aciklama: 'Yoldaki tehlike, kaza, radar, yol çalışması gibi herkesin bilmesi gereken durumlar.' },
  { id: 'surus', ad: 'Sürüş Arkadaşı', kisa: 'Sürüş', renk: kategoriRenkleri.surus, aciklama: 'Birlikte sürmek için buluşma kur; haritada görünür, katılmak isteyenler sana istek gönderir.' },
  { id: 'geyik', ad: 'Geyik / İç Dökme', kisa: 'Geyik', renk: kategoriRenkleri.geyik, aciklama: 'Sohbet, muhabbet, paylaşım. Geyik = motor üzerine rahat sohbet.' },
  { id: 'teknik', ad: 'Teknik Soru', kisa: 'Teknik', renk: kategoriRenkleri.teknik, aciklama: 'Bakım, arıza, aksesuar gibi motoruna dair sorular; toplulukta deneyimli sürücüler yanıtlar.' },
];

export type Yorum = { yazar: string; metin: string };

export type Gonderi = {
  id: string;
  anonim: boolean;
  yazar: string;
  motor: string;
  konum: string;
  zaman: string;
  kategori: KategoriId;
  metin: string;
  gorsel?: boolean;
  /** Bulunduğun yere uzaklık (km) — "Yakınımdakiler" filtresi için. */
  mesafeKm: number;
  selam: number;
  /** Yalnız buluşma (Sürüş Arkadaşı) gönderilerinde. */
  geliyorum?: number;
  yorumSayisi: number;
  yorumlar: Yorum[];
};

/** Demo kullanıcı: profilde ve yeni gönderilerde kullanılır. */
export const ben = { ad: 'Caner K.', kullaniciAdi: 'demo_surucu', motor: 'Yamaha XSR 900', sehir: 'İstanbul' };

export const demoGonderiler: Gonderi[] = [
  {
    id: 'g1', anonim: false, yazar: 'Caner K.', motor: 'Yamaha XSR 900', konum: 'Şile Otoyolu', zaman: '12 dk önce',
    kategori: 'uyari', mesafeKm: 22, selam: 48, yorumSayisi: 3,
    metin: 'Şile çıkışında 38. km civarı virajda yolda kum var. Arka lastik hafif kaydı, ucuz atlattım. Akşam dönenler dikkat.',
    yorumlar: [
      { yazar: 'Elif D.', metin: 'Teşekkürler, yarın o yoldan dönüyorum.' },
      { yazar: 'Anonim Sürücü', metin: 'Belediye ekipleri sabah temizliyordu, hâlâ kalmış demek.' },
    ],
  },
  {
    id: 'g2', anonim: true, yazar: 'Anonim Sürücü', motor: 'Honda CB650R', konum: 'Beşiktaş', zaman: '34 dk önce',
    kategori: 'geyik', mesafeKm: 9, selam: 132, yorumSayisi: 2,
    metin: 'Kask içinde yüksek sesle şarkı söyleyip kırmızı ışıkta yanımdaki arabaya el sallayan tek ben miyim? Sonuç: arabadaki amca da el salladı.',
    yorumlar: [{ yazar: 'Mert S.', metin: 'Tek sen değilsin, her sabah repertuvarım var.' }],
  },
  {
    id: 'g3', anonim: false, yazar: 'Elif D.', motor: 'Kawasaki Z650', konum: 'Caddebostan Sahil', zaman: '1 sa önce',
    kategori: 'surus', gorsel: true, mesafeKm: 3, selam: 27, geliyorum: 4, yorumSayisi: 2,
    metin: 'Pazar 09:00 Caddebostan çıkışlı Şile kahvaltı sürüşü. Tempo rahat, şu an 4 kişiyiz, yer var. Kask ve eldiven şart.',
    yorumlar: [{ yazar: 'Burak T.', metin: 'Ben varım, sahilde görüşürüz.' }],
  },
  {
    id: 'g4', anonim: false, yazar: 'Mert S.', motor: 'Peugeot XP400', konum: 'Kilyos', zaman: '2 sa önce',
    kategori: 'teknik', mesafeKm: 31, selam: 11, yorumSayisi: 2,
    metin: 'XP400 ile 8.000 km oldu, ön balatadan ses geliyor. Orijinal balata mı almalıyım yoksa aftermarket önerisi var mı?',
    yorumlar: [
      { yazar: 'Caner K.', metin: 'Ben sinterli aftermarket taktım, sorunsuz. Marka önerebilirim.' },
      { yazar: 'Anonim Sürücü', metin: 'Önce disk yüzeyine bak, ses ondan da olabilir.' },
    ],
  },
  {
    id: 'g5', anonim: true, yazar: 'Anonim Sürücü', motor: 'BMW R 1250 GS', konum: 'Belgrad Ormanı', zaman: '3 sa önce',
    kategori: 'uyari', mesafeKm: 18, selam: 76, yorumSayisi: 1,
    metin: 'Belgrad Ormanı girişinde mobil radar var, hız sınırı 50. Hafta sonu kalabalık, yaya ve bisikletliye dikkat.',
    yorumlar: [{ yazar: 'Elif D.', metin: 'Teşekkürler, bu sabah ceza yememiş olmam sayende.' }],
  },
  {
    id: 'g6', anonim: false, yazar: 'Burak T.', motor: 'Triumph Street Triple', konum: 'Bebek', zaman: '5 sa önce',
    kategori: 'surus', mesafeKm: 12, selam: 39, geliyorum: 7, yorumSayisi: 0,
    metin: 'Bu akşam 21:00 Bebek sahilden Sarıyer\'e gece turu. Işıklı ekipman şart, tempo sakin, mola Emirgan.',
    yorumlar: [],
  },
  {
    id: 'g7', anonim: true, yazar: 'Anonim Sürücü', motor: 'Suzuki V-Strom 650', konum: 'Polonezköy', zaman: 'Dün',
    kategori: 'geyik', gorsel: true, mesafeKm: 34, selam: 204, yorumSayisi: 4,
    metin: 'Hafta sonu çamurlu yolda motoru yatırdım, kalkarken yardıma gelen herkes motoru kaldırıp benim gülmemi bekledi. Mutlu son.',
    yorumlar: [{ yazar: 'Zeynep A.', metin: 'Bu camiada kimse yalnız kalmaz.' }],
  },
  {
    id: 'g8', anonim: false, yazar: 'Zeynep A.', motor: 'Honda Forza 350', konum: 'Kadıköy', zaman: 'Dün',
    kategori: 'teknik', mesafeKm: 2, selam: 8, yorumSayisi: 1,
    metin: 'Forza 350\'de varyatör ve kayış değişimi kaç kilometrede yapılıyor? Servis 20.000 diyor, forumda 12.000 yazıyor.',
    yorumlar: [{ yazar: 'Mert S.', metin: 'Kullanıma göre 15.000 civarı, rulmanlara da bak.' }],
  },
];
