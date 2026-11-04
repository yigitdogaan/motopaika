import { render, screen } from '@testing-library/react-native';

import { EmptyState } from '@/components/ui/empty-state';

describe('duman testi', () => {
  it('EmptyState başlık ve açıklamayı gösterir', async () => {
    await render(<EmptyState title="İlk motorunu ekle" description="Garajın şu an boş." />);
    expect(screen.getByRole('header')).toHaveTextContent('İlk motorunu ekle');
    expect(screen.getByText('Garajın şu an boş.')).toBeTruthy();
  });
});
