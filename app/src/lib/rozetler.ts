export type RozetGirdisi = { selam: number; gonderi: number; bulusma: number; motor: number };
export type Rozet = {
  id: string;
  ad: string;
  aciklama: string;
  kazanildi: boolean;
  /** Bir sonraki eşiğe ilerleme (mevcut, hedef); kazanıldıysa mevcut >= hedef. */
  ilerleme: { mevcut: number; hedef: number };
};

type Tanim = { id: string; ad: string; aciklama: string; alan: keyof RozetGirdisi; hedef: number };

/** Rozetler profildeki sayılardan hesaplanır; ayrı bir veritabanı tablosu gerekmez. */
const TANIMLAR: Tanim[] = [
  { id: 'garaj-sahibi', ad: 'Garaj Sahibi', aciklama: 'Garajına ilk motorunu ekle', alan: 'motor', hedef: 1 },
  { id: 'koleksiyoncu', ad: 'Koleksiyoncu', aciklama: 'Garajında 3 motor bulundur', alan: 'motor', hedef: 3 },
  { id: 'ilk-ses', ad: 'İlk Ses', aciklama: 'İlk gönderini paylaş', alan: 'gonderi', hedef: 1 },
  { id: 'yol-sohbetcisi', ad: 'Yol Sohbetçisi', aciklama: '10 gönderi paylaş', alan: 'gonderi', hedef: 10 },
  { id: 'selam-toplayici', ad: 'Selam Toplayıcı', aciklama: 'Toplam 10 selam al', alan: 'selam', hedef: 10 },
  { id: 'selam-ustasi', ad: 'Selam Ustası', aciklama: 'Toplam 100 selam al', alan: 'selam', hedef: 100 },
  { id: 'yollarin-selami', ad: 'Yolların Selamı', aciklama: 'Toplam 500 selam al', alan: 'selam', hedef: 500 },
  { id: 'bulusma-kurucusu', ad: 'Buluşma Kurucusu', aciklama: 'İlk sürüş buluşmanı kur', alan: 'bulusma', hedef: 1 },
  { id: 'konvoy-basi', ad: 'Konvoy Başı', aciklama: '5 sürüş buluşması kur', alan: 'bulusma', hedef: 5 },
];

export function rozetleriHesapla(g: RozetGirdisi): Rozet[] {
  return TANIMLAR.map((t) => ({
    id: t.id,
    ad: t.ad,
    aciklama: t.aciklama,
    kazanildi: g[t.alan] >= t.hedef,
    ilerleme: { mevcut: g[t.alan], hedef: t.hedef },
  }));
}

/** Kilometreyi okunur yazar: 12400 → "12.400 km". */
export function kmYazi(km: number | null | undefined): string | null {
  if (km == null) return null;
  return `${new Intl.NumberFormat('tr-TR').format(km)} km`;
}

/** Kilometre kutusundaki metni sayıya çevirir. Boş → null; geçersiz → undefined. */
export function kmCoz(metin: string): number | null | undefined {
  const t = metin.replace(/[.\s]/g, '');
  if (!t) return null;
  if (!/^\d+$/.test(t)) return undefined;
  const n = Number(t);
  return n <= 2_000_000 ? n : undefined;
}
