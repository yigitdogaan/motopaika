import { fireEvent, render, screen } from '@testing-library/react-native';

import { Avatar, Button, EmptyState, ListItem, Tag } from '@/components/ui';

describe('ui bileşenleri', () => {
  it('Button basılınca çağrılır', async () => {
    const onPress = jest.fn();
    await render(<Button label="Kaydet" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Kaydet' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  it('Button loading iken çağrılmaz', async () => {
    const onPress = jest.fn();
    await render(<Button label="Kaydet" onPress={onPress} loading />);
    await fireEvent.press(screen.getByRole('button', { name: 'Kaydet' }));
    expect(onPress).not.toHaveBeenCalled();
  });
  it('Avatar Türkçe baş harf üretir', async () => {
    await render(<Avatar name="ışık" />);
    expect(screen.getByText('I')).toBeTruthy();
  });
  it('ListItem ve Tag metni gösterir', async () => {
    await render(
      <>
        <ListItem title="Yağ değişimi" subtitle="Bakım" onPress={() => {}} />
        <Tag label="Çözüldü" tone="success" />
      </>,
    );
    expect(screen.getByText('Bakım')).toBeTruthy();
    expect(screen.getByText('Çözüldü')).toBeTruthy();
  });
  it('EmptyState eylem düğmesi çalışır', async () => {
    const onAction = jest.fn();
    await render(<EmptyState title="Garaj boş" description="Motor ekle" actionLabel="Motor ekle" onAction={onAction} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Motor ekle' }));
    expect(onAction).toHaveBeenCalled();
  });
});
