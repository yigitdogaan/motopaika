import { kmCoz, kmYazi, rozetleriHesapla } from '../rozetler';

describe('rozetleriHesapla', () => {
  it('hiçbir şey yokken hiçbir rozet kazanılmaz', () => {
    expect(rozetleriHesapla({ selam: 0, gonderi: 0, bulusma: 0, motor: 0 }).some((r) => r.kazanildi)).toBe(false);
  });
  it('eşiğe ulaşınca kazanılır, altında kazanılmaz', () => {
    const r = Object.fromEntries(rozetleriHesapla({ selam: 100, gonderi: 1, bulusma: 0, motor: 1 }).map((x) => [x.id, x.kazanildi]));
    expect(r['selam-ustasi']).toBe(true);
    expect(r['yollarin-selami']).toBe(false);
    expect(r['ilk-ses']).toBe(true);
    expect(r['yol-sohbetcisi']).toBe(false);
    expect(r['garaj-sahibi']).toBe(true);
    expect(r['koleksiyoncu']).toBe(false);
  });
  it('ilerlemeyi verir', () => {
    const x = rozetleriHesapla({ selam: 40, gonderi: 0, bulusma: 0, motor: 0 }).find((r) => r.id === 'selam-ustasi')!;
    expect(x.ilerleme).toEqual({ mevcut: 40, hedef: 100 });
  });
});

describe('km', () => {
  it('okunur yazar', () => {
    expect(kmYazi(null)).toBeNull();
    expect(kmYazi(950)).toBe('950 km');
    expect(kmYazi(12400)).toMatch(/^12[. ]?400 km$/);
  });
  it('metni çözer', () => {
    expect(kmCoz('')).toBeNull();
    expect(kmCoz('12.400')).toBe(12400);
    expect(kmCoz('12 400')).toBe(12400);
    expect(kmCoz('abc')).toBeUndefined();
    expect(kmCoz('-5')).toBeUndefined();
    expect(kmCoz('3000000')).toBeUndefined();
  });
});
