jest.mock('@/lib/supabase', () => ({ supabase: null }));

import { pushHedef } from '../push';

describe('pushHedef', () => {
  it('mesaj bildirimi sohbet odasına gider', () => {
    expect(pushHedef({ tur: 'message', odaId: 'oda-1' })).toBe('/sohbet/oda-1');
  });
  it('selam ve yorum ilgili gönderiyi açar', () => {
    expect(pushHedef({ tur: 'salute', postId: 'p1' })).toBe('/gonderi/p1');
    expect(pushHedef({ tur: 'comment', postId: 'p2' })).toBe('/gonderi/p2');
  });
  it('sürüş isteği ve yönetim bildirimleri bildirimler ekranına gider', () => {
    expect(pushHedef({ tur: 'ride_request', postId: 'p3' })).toBe('/bildirimler');
    expect(pushHedef({ tur: 'warning' })).toBe('/bildirimler');
  });
  it('veri yoksa bildirimler ekranına düşer', () => {
    expect(pushHedef(null)).toBe('/bildirimler');
    expect(pushHedef(undefined)).toBe('/bildirimler');
  });
});
