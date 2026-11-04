import { kullaniciAdiGecerli, motorGecerli } from '@/lib/dogrulama';

describe('kullaniciAdiGecerli', () => {
  it.each(['abc', 'a'.repeat(20), 'Ali_34', 'şoför_34', 'ÇĞİÖŞÜ', '___', '123'])(
    '%s geçerli',
    (ad) => expect(kullaniciAdiGecerli(ad)).toBe(true),
  );

  it.each(['', 'ab', 'a'.repeat(21), 'ali veli', 'ali-veli', 'ali.veli', '@ali', 'ali!', ' abc', 'abc\n', 'a😀b'])(
    '%j geçersiz',
    (ad) => expect(kullaniciAdiGecerli(ad)).toBe(false),
  );
});

describe('motorGecerli', () => {
  it('marka ve model dolu olmalı', () => {
    expect(motorGecerli('Honda', 'CB650R')).toBe(true);
    expect(motorGecerli('', 'CB650R')).toBe(false);
    expect(motorGecerli('Honda', '')).toBe(false);
    expect(motorGecerli('  ', '  ')).toBe(false);
  });
});
