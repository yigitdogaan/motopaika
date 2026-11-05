export type Bulusma = {
  id: string;
  ad: string;
  yer: string;
  zaman: string;
  motorcu: number;
  enlem: number;
  boylam: number;
  /** Mesajlar'daki grup sohbetinin adı ("Sohbete Katıl" için). */
  sohbet: string;
};

export const demoBulusmalar: Bulusma[] = [
  { id: 'b1', ad: 'Caddebostan Sahil · Kahve Buluşması', yer: 'Caddebostan Sahil', zaman: 'Şimdi', motorcu: 4, enlem: 40.9667, boylam: 29.06, sohbet: 'Pazar Şile Kahvaltı Sürüşü' },
  { id: 'b2', ad: 'Şile Feneri · Kahvaltı Sürüşü', yer: 'Şile Feneri', zaman: 'Pazar 09:00', motorcu: 12, enlem: 41.1767, boylam: 29.6122, sohbet: 'Pazar Şile Kahvaltı Sürüşü' },
  { id: 'b3', ad: 'Belgrad Ormanı · Akşam Turu', yer: 'Belgrad Ormanı girişi', zaman: 'Bugün 19:30', motorcu: 6, enlem: 41.1857, boylam: 28.9792, sohbet: 'İstanbul Gece Sürücüleri' },
  { id: 'b4', ad: 'Bebek Sahil · Gece Turu', yer: 'Bebek Sahil', zaman: 'Bugün 21:00', motorcu: 9, enlem: 41.0766, boylam: 29.0436, sohbet: 'İstanbul Gece Sürücüleri' },
  { id: 'b5', ad: 'Polonezköy · Mola ve Orman Yolu', yer: 'Polonezköy', zaman: 'Yarın 10:00', motorcu: 15, enlem: 41.1131, boylam: 29.2178, sohbet: 'Enduro Pazar Grubu' },
];
