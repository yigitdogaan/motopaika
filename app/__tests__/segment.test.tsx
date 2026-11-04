import { fireEvent, render, screen } from '@testing-library/react-native';

import { Segment } from '@/components/ui';

const options = [
  { value: 'konular', label: 'Konular' },
  { value: 'sorunlar', label: 'Sorunlar' },
  { value: 'not', label: 'Not duvarı' },
];

describe('Segment', () => {
  it('seçili sekmeyi selected olarak işaretler', async () => {
    await render(<Segment options={options} value="sorunlar" onChange={jest.fn()} />);
    expect(screen.getByRole('tab', { name: 'Sorunlar', selected: true })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Konular', selected: false })).toBeTruthy();
  });
  it('dokunulan sekmenin değerini iletir', async () => {
    const onChange = jest.fn();
    await render(<Segment options={options} value="konular" onChange={onChange} />);
    await fireEvent.press(screen.getByRole('tab', { name: 'Not duvarı' }));
    expect(onChange).toHaveBeenCalledWith('not');
  });
});
