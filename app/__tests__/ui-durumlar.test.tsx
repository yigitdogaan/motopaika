import { fireEvent, render, screen } from '@testing-library/react-native';

import { ErrorState, Input, SkeletonList } from '@/components/ui';

describe('Input, iskelet, hata', () => {
  it('Input etiketi gösterir ve metin değişimini iletir', async () => {
    const onChangeText = jest.fn();
    await render(<Input label="Kullanıcı adı" onChangeText={onChangeText} />);
    await fireEvent.changeText(screen.getByLabelText('Kullanıcı adı'), 'motorcu_34');
    expect(onChangeText).toHaveBeenCalledWith('motorcu_34');
  });
  it('Input hata mesajını uyarı olarak gösterir', async () => {
    await render(<Input label="E-posta" error="Geçerli bir e-posta gir" hint="ipucu" />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Geçerli bir e-posta gir')).toBeTruthy();
    expect(screen.queryByText('ipucu')).toBeNull();
  });
  it('SkeletonList tek "Yükleniyor" etiketi taşır', async () => {
    await render(<SkeletonList rows={3} />);
    expect(screen.getByLabelText('Yükleniyor')).toBeTruthy();
  });
  it('ErrorState "Tekrar dene" ile yeniden dener', async () => {
    const onRetry = jest.fn();
    await render(<ErrorState onRetry={onRetry} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Tekrar dene' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
  it('ErrorState onRetry yoksa düğme göstermez', async () => {
    await render(<ErrorState />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
