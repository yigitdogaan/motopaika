import { render, screen } from '@testing-library/react-native';

import { ListeEkrani } from '@/components/liste-ekrani';

describe('ListeEkrani (demo modu)', () => {
  it('rotaları örnek verilerle gösterir', async () => {
    await render(<ListeEkrani alan="rotalar" bos="boş" />);
    expect(await screen.findByText('Şile – Ağva sahil yolu')).toBeTruthy();
    expect(await screen.findByText(/Demo modu/)).toBeTruthy();
  });
});
