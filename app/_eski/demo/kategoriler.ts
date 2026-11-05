import type { IkonAdi } from '@/components/ikon';

import { markalar } from './markalar';
import { sehirler } from './sehirler';
import { sosyal } from './sosyal';

export type KategoriOgesi = { id: string; ad: string; kisa: string; renk: string };
export type KategoriId = 'markalar' | 'sehirler' | 'sosyal';

/** Ana sayfadaki üç ana kategori. Favori anahtarı: "<kategori>:<id>". */
export const kategoriler: { id: KategoriId; ad: string; ikon: IkonAdi; ogeler: KategoriOgesi[] }[] = [
  { id: 'markalar', ad: 'Markalar', ikon: 'motor', ogeler: markalar },
  { id: 'sehirler', ad: 'Şehirler', ikon: 'konum', ogeler: sehirler },
  { id: 'sosyal', ad: 'Sosyal', ikon: 'grup', ogeler: sosyal },
];

export const favoriAnahtari = (k: KategoriId, id: string) => `${k}:${id}`;

/** "kategori:id" anahtarından kanalı (ad, kategori, ikon) bulur. */
export function kanalBul(anahtar: string) {
  const [kid, id] = anahtar.split(':');
  const k = kategoriler.find((x) => x.id === kid);
  const oge = k?.ogeler.find((o) => o.id === id);
  return k && oge ? { kategori: k, oge } : undefined;
}
