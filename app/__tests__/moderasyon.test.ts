import { denetle, normallestir, tcKimlikGecerli } from '@/lib/moderasyon';

describe('moderasyon', () => {
  it('normalleştirir', () => {
    expect(normallestir('K A P O R A gönder')).toContain('kapora');
    expect(normallestir('KAPOORRRA')).toBe('kapoora');
  });
  it('telefonu maskeler', () => {
    const s = denetle('Beni ara 0532 123 45 67', 'forum');
    expect(s.karar).toBe('MASKELE');
    expect(s.metin).toBe('Beni ara ***');
  });
  it('geçerli TC kimliği maskeler, rastgele 11 haneyi bırakır', () => {
    expect(tcKimlikGecerli('10000000146')).toBe(true);
    expect(denetle('10000000146', 'forum').karar).toBe('MASKELE');
    expect(denetle('12345678901', 'forum').karar).toBe('SERBEST');
  });
  it('kapora yazımı incelemeye düşer', () => {
    expect(denetle('k a p o r a gönder', 'ilan').karar).toBe('INCELEME');
  });
  it('plaka: forumda maskele, not duvarında engelle', () => {
    expect(denetle('34 ABC 123 benim motorum', 'forum').karar).toBe('MASKELE');
    expect(denetle('34 ABC 123 plakalı adam sıkıştırdı', 'notDuvari').karar).toBe('ENGELLE');
  });
  it('önce ödeme: ilanda engelle, sohbette incelemeye', () => {
    expect(denetle('önce havale yap sonra kargo', 'ilan').karar).toBe('ENGELLE');
    expect(denetle('önce havale yap sonra kargo', 'sohbet').karar).toBe('INCELEME');
  });
  it('yanlış pozitif yok', () => {
    expect(denetle('Anadolu’da güzel rota', 'forum').karar).toBe('SERBEST');
    expect(denetle('Ankara 06 saatte gidilir', 'forum').karar).toBe('SERBEST');
  });
  it('tehdit engellenir', () => {
    expect(denetle('seni bulurum', 'sohbet')).toMatchObject({ karar: 'ENGELLE', metin: '' });
  });
});
