import { akisiSuz, aramaUyar, bitenleriSona, normalize, panelFiltreSayisi, sehirListesi, VARSAYILAN_FILTRE, type FiltreSecimi } from '../akis-filtre';
import { sorguyuTemizle } from '../surucu-ara';
import type { AkisGonderisi } from '../akis';

jest.mock('../supabase', () => ({ supabase: null }));

const g = (o: Partial<AkisGonderisi>): AkisGonderisi =>
  ({ id: 'x', anonim: false, yazar: 'Ali', motor: 'Honda CB500', konum: 'Şile', zaman: '', kategori: 'uyari', metin: 'Yolda kum var', mesafeKm: 9999, selam: 0, yorumSayisi: 0, yorumlar: [], selamVerdi: false, geliyorumDedi: false, ...o }) as AkisGonderisi;

const temel: FiltreSecimi = { kategori: null, kapsam: 'hepsi', ara: '', maksKm: null, sehir: null, siralama: 'yeni' };

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
    expect(akisiSuz(liste, { ...temel, kategori: 'surus' }).map((x) => x.id)).toEqual(['a']);
  });
  it('anonim duvar', () => {
    expect(akisiSuz(liste, { ...temel, kapsam: 'anonim' }).map((x) => x.id)).toEqual(['c']);
  });
  it('yakınımdakiler: konumsuzlar girmez, mesafeye göre sıralanır, km sınırı uygulanır', () => {
    expect(akisiSuz(liste, { ...temel, kapsam: 'yakin' }).map((x) => x.id)).toEqual(['a', 'b']);
    expect(akisiSuz(liste, { ...temel, kapsam: 'yakin', maksKm: 10 }).map((x) => x.id)).toEqual(['a']);
  });
  it('kategori ile kapsam birlikte çalışır', () => {
    expect(akisiSuz(liste, { ...temel, kategori: 'geyik', kapsam: 'anonim' }).map((x) => x.id)).toEqual(['c']);
    expect(akisiSuz(liste, { ...temel, kategori: 'surus', kapsam: 'anonim' }).map((x) => x.id)).toEqual([]);
    expect(akisiSuz(liste, { ...temel, kategori: 'uyari', kapsam: 'yakin' }).map((x) => x.id)).toEqual(['b']);
  });
  it('şehir filtresi', () => {
    expect(akisiSuz(liste, { ...temel, sehir: 'İstanbul' }).map((x) => x.id)).toEqual(['a', 'c']);
  });
  it('en çok selama göre sıralar, girdiyi bozmaz', () => {
    expect(akisiSuz(liste, { ...temel, siralama: 'selam' }).map((x) => x.id)).toEqual(['b', 'a', 'c']);
    expect(liste.map((x) => x.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('bitenleriSona', () => {
  it('pasifleri sona taşır, her grubun içindeki sırayı korur ve girdiyi bozmaz', () => {
    const l = [
      { id: 1, p: true },
      { id: 2, p: false },
      { id: 3, p: true },
      { id: 4, p: false },
    ];
    expect(bitenleriSona(l, (x) => x.p).map((x) => x.id)).toEqual([2, 4, 1, 3]);
    expect(l.map((x) => x.id)).toEqual([1, 2, 3, 4]);
  });
  it('hepsi aktifse ya da liste boşsa aynen döner', () => {
    expect(bitenleriSona([1, 2, 3], () => false)).toEqual([1, 2, 3]);
    expect(bitenleriSona([], () => true)).toEqual([]);
  });
});

describe('panelFiltreSayisi', () => {
  it('yalnız panel ayarlarını sayar', () => {
    expect(panelFiltreSayisi(VARSAYILAN_FILTRE)).toBe(0);
    expect(panelFiltreSayisi({ kapsam: 'yakin', sehir: 'Bursa', siralama: 'selam' })).toBe(3);
    expect(panelFiltreSayisi({ kapsam: 'hepsi', sehir: null, siralama: 'selam' })).toBe(1);
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
