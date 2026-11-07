import type { KategoriId } from '@/demo/akis';
import type { AkisGonderisi } from './akis';

/** Kapsam: tüm gönderiler, yalnız anonim paylaşımlar ("Anonim Duvar") ya da konuma yakın olanlar. Kategoriyle birlikte seçilebilir. */
export type Kapsam = 'hepsi' | 'anonim' | 'yakin';
export type Siralama = 'yeni' | 'selam';

/** "Yakınımdakiler"de seçilebilen mesafeler (km); null = sınırsız. */
export const MESAFELER: (number | null)[] = [5, 10, 25, 50, 100, null];

/** Konumu bilinmeyen gönderilerin `mesafeKm` değeri (akış kütüphanesiyle aynı sabit). */
export const MESAFE_BILINMIYOR = 9999;

/** Aramada Türkçe harf farkını yok sayar: "sile" → "Şile", "ISPARTA" → "ısparta" ile eşleşir. */
export function normalize(t: string): string {
  return t
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u')
    .trim();
}

/** Arama kutusundaki sözcüklerin hepsi (sırasız) gönderinin metin, yazar, motor, konum ya da şehrinde geçmeli. */
export function aramaUyar(g: Pick<AkisGonderisi, 'metin' | 'yazar' | 'motor' | 'konum' | 'sehir'>, sorgu: string): boolean {
  const kelimeler = normalize(sorgu).split(/\s+/).filter(Boolean);
  if (!kelimeler.length) return true;
  const samanlik = normalize([g.metin, g.yazar, g.motor, g.konum, g.sehir ?? ''].join(' '));
  return kelimeler.every((k) => samanlik.includes(k));
}

/** Akışta gönderisi bulunan şehirler, gönderi sayısına göre çoktan aza. */
export function sehirListesi(gonderiler: Pick<AkisGonderisi, 'sehir'>[]): { sehir: string; sayi: number }[] {
  const sayac = new Map<string, number>();
  for (const g of gonderiler) if (g.sehir) sayac.set(g.sehir, (sayac.get(g.sehir) ?? 0) + 1);
  return [...sayac.entries()].map(([sehir, sayi]) => ({ sehir, sayi })).sort((a, b) => b.sayi - a.sayi || a.sehir.localeCompare(b.sehir, 'tr'));
}

export type FiltreSecimi = {
  /** null = tüm kategoriler. */
  kategori: KategoriId | null;
  kapsam: Kapsam;
  ara: string;
  /** Yalnız `yakin` kapsamında: bu mesafeden uzaktaki gönderiler çıkar. null = sınırsız. */
  maksKm: number | null;
  /** null = tüm şehirler. */
  sehir: string | null;
  siralama: Siralama;
};

/** Hiçbir filtre seçili değilken kullanılan başlangıç değerleri. */
export const VARSAYILAN_FILTRE: FiltreSecimi = { kategori: null, kapsam: 'hepsi', ara: '', maksKm: 50, sehir: null, siralama: 'yeni' };

/** Akış listesini kategori, kapsam, mesafe, şehir ve aramaya göre süzer; sıralamayı uygular. Girdiyi değiştirmez. */
export function akisiSuz(gonderiler: AkisGonderisi[], s: FiltreSecimi): AkisGonderisi[] {
  let l = gonderiler;
  if (s.kategori) l = l.filter((g) => g.kategori === s.kategori);
  if (s.kapsam === 'anonim') l = l.filter((g) => g.anonim);
  else if (s.kapsam === 'yakin') {
    l = l.filter((g) => g.mesafeKm < MESAFE_BILINMIYOR && (s.maksKm == null || g.mesafeKm <= s.maksKm));
  }
  if (s.sehir) l = l.filter((g) => g.sehir === s.sehir);
  if (s.ara.trim()) l = l.filter((g) => aramaUyar(g, s.ara));
  if (s.kapsam === 'yakin') return [...l].sort((a, b) => a.mesafeKm - b.mesafeKm);
  if (s.siralama === 'selam') return [...l].sort((a, b) => b.selam - a.selam);
  return l;
}

/**
 * Süresi dolmuş (pasif) gönderileri listenin sonuna taşır; kendi içlerinde ve aktiflerin kendi içindeki sıra korunur.
 * Böylece biten sürüşler yeni içeriği aşağı itmez.
 */
export function bitenleriSona<T>(liste: T[], pasif: (g: T) => boolean): T[] {
  const aktif: T[] = [];
  const biten: T[] = [];
  for (const g of liste) (pasif(g) ? biten : aktif).push(g);
  return [...aktif, ...biten];
}

/** "Filtrele" düğmesindeki rozet: varsayılandan farklı seçilen panel ayarlarının sayısı (kategori çipleri ve arama sayılmaz). */
export function panelFiltreSayisi(s: Pick<FiltreSecimi, 'kapsam' | 'sehir' | 'siralama'>): number {
  return (s.kapsam !== 'hepsi' ? 1 : 0) + (s.sehir ? 1 : 0) + (s.siralama !== 'yeni' ? 1 : 0);
}
