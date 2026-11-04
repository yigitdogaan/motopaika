import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { kullaniciAdiGecerli, motorGecerli } from '@/lib/dogrulama';
import { OturumSaglayici, useOturum } from '@/lib/oturum';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('doğrulama', () => {
  it('kullanıcı adı 3–20 harf/rakam/_ olmalı', () => {
    expect(kullaniciAdiGecerli('ab')).toBe(false);
    expect(kullaniciAdiGecerli('abc')).toBe(true);
    expect(kullaniciAdiGecerli('şoför_34')).toBe(true);
    expect(kullaniciAdiGecerli('a'.repeat(21))).toBe(false);
    expect(kullaniciAdiGecerli('ali veli')).toBe(false);
    expect(kullaniciAdiGecerli('ali-veli')).toBe(false);
  });
  it('motor için marka ve model gerekir', () => {
    expect(motorGecerli('Yamaha', ' ')).toBe(false);
    expect(motorGecerli('Yamaha', 'MT-07')).toBe(true);
  });
});

function Deneme() {
  const o = useOturum();
  return (
    <>
      <Text>{o.kullanici ? `giris:${o.kullanici.ad}` : 'cikis'}</Text>
      <Text>{`motor:${o.motorlar.map((m) => m.marka + m.model).join(',')}`}</Text>
      <Text onPress={o.girisYap}>gir</Text>
      <Text onPress={() => o.motorEkle('Honda', 'CB650R')}>ekle</Text>
    </>
  );
}

describe('oturum (demo)', () => {
  it('demo girişi yapar ve garaja motor ekler', async () => {
    await render(
      <OturumSaglayici>
        <Deneme />
      </OturumSaglayici>,
    );
    expect(await screen.findByText('cikis')).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByText('gir')));
    expect(await screen.findByText('giris:demo_surucu')).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByText('ekle')));
    expect(await screen.findByText('motor:HondaCB650R')).toBeTruthy();
  });
});
