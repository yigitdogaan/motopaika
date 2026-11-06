import { akisiSuz, aramaUyar, normalize, sehirListesi, type FiltreSecimi } from '../akis-filtre';
import { sorguyuTemizle } from '../surucu-ara';
import type { AkisGonderisi } from '../akis';

jest.mock('../supabase', () => ({ supabase: null }));

const g = (o: Partial<AkisGonderisi>): AkisGonderisi =>
  ({ id: 'x', anonim: false, yazar: 'Ali', motor: 'Honda CB500', konum: 'Şile', zaman: '', kategori: 'uyari', metin: 'Yolda kum var', mesafeKm: 9999, selam: 0, yorumSayisi: 0, yorumlar: [], selamVerdi: false, geliyorumDedi: false, ...o }) as AkisGonderisi;

const temel: FiltreSecimi = { filtre: 'tumu', ara: '', maksKm: null, sehir: null, siralama: 'yeni' };

describe('normalize / arama', () => {
  it('Türkçe harfleri sadeleştirir', () => {
    expect(normalize('ŞİLE Ağva ıspanak')).toBe('sile agva ispanak');
  });
  it('"sile" araması "Şile" konumunu bulur, sözcük sırası önemsizdir', () => {
    expect(aramaUyar(g({ konum: 'Şile' }), 'sile')).toBe(true);
    expect(aramaUyar(g({ metin: 'Kum var', konum: 'Şile' }), 'şile kum')).toBe(true);
    expect(aramaUyar(g({ konum: 'Bolu' }), 'sile')).toBe(false);
  });
  it('boş arama her şeyi geçirir', () => {
    expect(aramaUyar(g({}), '   ')).toBe(true);
  });
});

describe('akisiSuz', () => {
  const liste = [
    g({ id: 'a', mesafeKm: 3, sehir: 'İstanbul', selam: 5, kategori: 'surus' }),
    g({ id: 'b', mesafeKm: 40, sehir: 'Kocaeli', selam: 50, kategori: 'uyari' }),
    g({ id: 'c', mesafeKm: 9999, sehir: 'İstanbul', selam: 1, anonim: true, kategori: 'geyik' }),
  ];
  it('kategori filtresi', () => {
    expect(akisiSuz(liste, { ...temel, filtre: 'surus' }).map((x) => x.id)).toEqual(['a']);
  });
  it('anonim duvar', () => {
    expect(akisiSuz(liste, { ...temel, filtre: 'anonim' }).map((x) => x.id)).toEqual(['c']);
  });
  it('yakınımdakiler: konumsuzlar girmez, mesafeye göre sıralanır, km sınırı uygulanır', () => {
    expect(akisiSuz(liste, { ...temel, filtre: 'yakin' }).map((x) => x.id)).toEqual(['a', 'b']);
    expect(akisiSuz(liste, { ...temel, filtre: 'yakin', maksKm: 10 }).map((x) => x.id)).toEqual(['a']);
  });
  it('şehir filtresi', () => {
    expect(akisiSuz(liste, { ...temel, sehir: 'İstanbul' }).map((x) => x.id)).toEqual(['a', 'c']);
  });
  it('en çok selama göre sıralar, girdiyi bozmaz', () => {
    expect(akisiSuz(liste, { ...temel, siralama: 'selam' }).map((x) => x.id)).toEqual(['b', 'a', 'c']);
    expect(liste.map((x) => x.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('sehirListesi', () => {
  it('sayıya göre çoktan aza sıralar, şehirsizleri atlar', () => {
    expect(sehirListesi([{ sehir: 'Bursa' }, { sehir: 'İstanbul' }, { sehir: 'İstanbul' }, { sehir: undefined }])).toEqual([
      { sehir: 'İstanbul', sayi: 2 },
      { sehir: 'Bursa', sayi: 1 },
    ]);
  });
});

describe('sorguyuTemizle', () => {
  it('PostgREST ve LIKE özel karakterlerini temizler', () => {
    expect(sorguyuTemizle('a%b,c(d)_e')).toBe('a b c d e');
    expect(sorguyuTemizle('  ali   veli ')).toBe('ali veli');
  });
});
