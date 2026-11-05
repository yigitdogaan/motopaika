export type Sohbet = {
  id: string;
  tur: 'dm' | 'grup';
  ad: string;
  son: string;
  zaman: string;
  okunmamis: number;
  /** Grup sohbetlerinde üye sayısı, birebirde çevrimiçi mi. */
  uye?: number;
  cevrimici?: boolean;
  /** Grup sahibi için bekleyen katılma isteği sayısı. */
  bekleyenIstek?: number;
  /** Gerçek modda: karşı kişi fotoğrafı ve son mesajın türü. */
  avatarUrl?: string;
  sonTur?: 'text' | 'image' | 'location';
};

export const demoSohbetler: Sohbet[] = [
  { id: 's1', tur: 'grup', ad: 'Pazar Şile Kahvaltı Sürüşü', son: 'Elif: Sabah 08:45\'te Caddebostan\'da toplanıyoruz', zaman: '5 dk', okunmamis: 3, uye: 12 },
  { id: 's2', tur: 'dm', ad: 'Elif D.', son: 'Pazar için ben de varım, kaskımı unutma diye hatırlattım :)', zaman: '18 dk', okunmamis: 1, cevrimici: true },
  { id: 's3', tur: 'grup', ad: 'İstanbul Gece Sürücüleri', son: 'Burak: Bu akşam Bebek\'te buluşuyoruz', zaman: '1 sa', okunmamis: 5, uye: 38 },
  { id: 's4', tur: 'dm', ad: 'Mert S.', son: 'Balata markasını yazarım, akşam bakarım', zaman: '3 sa', okunmamis: 0, cevrimici: false },
  { id: 's5', tur: 'grup', ad: 'Enduro Pazar Grubu', son: 'Kerem: Polonezköy rotasını paylaştım', zaman: 'Dün', okunmamis: 0, uye: 21 },
  { id: 's6', tur: 'dm', ad: 'Zeynep A.', son: 'Varyatör için teşekkürler!', zaman: 'Dün', okunmamis: 0, cevrimici: true },
];
