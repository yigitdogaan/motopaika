import type { KategoriId } from '@/demo/akis';
import type { AkisGonderisi } from './akis';

export type Filtre = 'tumu' | 'anonim' | 'yakin' | KategoriId;
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
  filtre: Filtre;
  ara: string;
  /** Yalnız `yakin` filtresinde: bu mesafeden uzaktaki gönderiler çıkar. null = sınırsız. */
  maksKm: number | null;
  /** null = tüm şehirler. */
  sehir: string | null;
  siralama: Siralama;
};

/** Akış listesini filtre, mesafe, şehir ve aramaya göre süzer; sıralamayı uygular. Girdiyi değiştirmez. */
export function akisiSuz(gonderiler: AkisGonderisi[], s: FiltreSecimi): AkisGonderisi[] {
  let l = gonderiler;
  if (s.filtre === 'anonim') l = l.filter((g) => g.anonim);
  else if (s.filtre === 'yakin') {
    l = l.filter((g) => g.mesafeKm < MESAFE_BILINMIYOR && (s.maksKm == null || g.mesafeKm <= s.maksKm));
  } else if (s.filtre !== 'tumu') l = l.filter((g) => g.kategori === s.filtre);
  if (s.sehir) l = l.filter((g) => g.sehir === s.sehir);
  if (s.ara.trim()) l = l.filter((g) => aramaUyar(g, s.ara));
  if (s.filtre === 'yakin') return [...l].sort((a, b) => a.mesafeKm - b.mesafeKm);
  if (s.siralama === 'selam') return [...l].sort((a, b) => b.selam - a.selam);
  return l;
}
