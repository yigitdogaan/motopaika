import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';

import Profil from '@/app/(tabs)/profil';
import Giris from '@/app/giris';
import { OturumSaglayici, useOturum } from '@/lib/oturum';

function Uygulama() {
  const { kullanici } = useOturum();
  return kullanici ? <Profil /> : <Giris />;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  await render(
    <OturumSaglayici>
      <Uygulama />
    </OturumSaglayici>,
  );
});

describe('giriş → profil → garaj akışı', () => {
  it('demo girişi, motor ekleme ve silme', async () => {
    await fireEvent.press(await screen.findByText('Demo kullanıcı ile gir'));
    expect(await screen.findByText('demo_surucu')).toBeTruthy();
    expect(screen.getByText('Garajın boş')).toBeTruthy();

    // alanlar boşken ekleme etkisiz
    await fireEvent.press(screen.getByText('Motoru ekle'));
    expect(screen.getByText('Garajın boş')).toBeTruthy();

    await fireEvent.changeText(screen.getByPlaceholderText('ör. Yamaha'), 'Yamaha');
    await fireEvent.changeText(screen.getByPlaceholderText('ör. MT-07'), 'MT-07');
    await fireEvent.press(screen.getByText('Motoru ekle'));
    expect(await screen.findByText('Yamaha MT-07')).toBeTruthy();
    expect(screen.queryByText('Garajın boş')).toBeNull();
    expect(screen.getByPlaceholderText('ör. Yamaha').props.value).toBe('');

    await fireEvent.press(screen.getByLabelText('Yamaha MT-07 sil'));
    expect(await screen.findByText('Garajın boş')).toBeTruthy();
    expect(screen.queryByText('Yamaha MT-07')).toBeNull();
  });

  it('çıkış yapınca giriş ekranına döner', async () => {
    await fireEvent.press(await screen.findByText('Demo kullanıcı ile gir'));
    await fireEvent.press(await screen.findByText('Çıkış yap'));
    expect(await screen.findByText('Demo kullanıcı ile gir')).toBeTruthy();
  });
});
