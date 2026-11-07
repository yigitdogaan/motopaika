import { SymbolView } from 'expo-symbols';
import type { StyleProp, ViewStyle } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

// iOS: SF Symbols · Android: Material Symbols (ikisi de Expo Go'da hazır).
const IKONLAR = {
  ev: { ios: 'house.fill', android: 'home' },
  izgara: { ios: 'square.grid.2x2.fill', android: 'grid_view' },
  motor: { ios: 'motorcycle', android: 'two_wheeler' },
  sohbet: { ios: 'ellipsis.bubble.fill', android: 'chat_bubble' },
  kisi: { ios: 'person.fill', android: 'person' },
  ara: { ios: 'magnifyingglass', android: 'search' },
  yildiz: { ios: 'star.fill', android: 'star' },
  etiket: { ios: 'tag.fill', android: 'sell' },
  takvim: { ios: 'calendar', android: 'event' },
  harita: { ios: 'map.fill', android: 'map' },
  canli: { ios: 'dot.radiowaves.left.and.right', android: 'sensors' },
  konum: { ios: 'mappin.and.ellipse', android: 'location_on' },
  grup: { ios: 'person.3.fill', android: 'groups' },
  kalp: { ios: 'heart.fill', android: 'favorite' },
  kalpBos: { ios: 'heart', android: 'favorite_border' },
  menu: { ios: 'line.3.horizontal', android: 'menu' },
  zil: { ios: 'bell.fill', android: 'notifications' },
  kapat: { ios: 'xmark', android: 'close' },
  pusula: { ios: 'safari.fill', android: 'explore' },
  yorumDolu: { ios: 'bubble.left.fill', android: 'chat_bubble' },
  yorum: { ios: 'bubble.left', android: 'chat_bubble_outline' },
  sabit: { ios: 'pin.fill', android: 'push_pin' },
  tik: { ios: 'checkmark', android: 'check' },
  ileri: { ios: 'chevron.right', android: 'chevron_right' },
  topluluk: { ios: 'person.2.fill', android: 'group' },
  mesaj: { ios: 'message.fill', android: 'chat_bubble' },
  arti: { ios: 'plus', android: 'add' },
  sil: { ios: 'trash.fill', android: 'delete' },
  uyari: { ios: 'exclamationmark.circle.fill', android: 'error' },
  korna: { ios: 'megaphone.fill', android: 'campaign' },
  el: { ios: 'hand.raised.fill', android: 'back_hand' },
  gps: { ios: 'location.fill', android: 'my_location' },
  foto: { ios: 'camera.fill', android: 'photo_camera' },
  galeri: { ios: 'photo.fill', android: 'photo_library' },
  filtre: { ios: 'line.3.horizontal.decrease', android: 'tune' },
  bilgi: { ios: 'info.circle.fill', android: 'info' },
  anonim: { ios: 'eye.slash.fill', android: 'visibility_off' },
  saat: { ios: 'clock', android: 'schedule' },
  gonder: { ios: 'paperplane.fill', android: 'send' },
  garaj: { ios: 'wrench.and.screwdriver.fill', android: 'build' },
  cikis: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout' },
  ayarlar: { ios: 'gearshape.fill', android: 'settings' },
} as const;

// `dolu={false}` istenince iOS'ta kullanılan çizgi (içi boş) sürümler.
const CIZGI = {
  ev: 'house',
  topluluk: 'person.2',
  mesaj: 'message',
  kisi: 'person',
  harita: 'map',
} as const satisfies Partial<Record<keyof typeof IKONLAR, SFSymbol>>;

export type IkonAdi = keyof typeof IKONLAR;

export function Ikon({
  ad,
  boyut = 24,
  renk,
  dolu = true,
  style,
}: {
  ad: IkonAdi;
  boyut?: number;
  renk: string;
  /** false: iOS'ta çizgi (içi boş) sürümü, varsa. */
  dolu?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const n = IKONLAR[ad];
  const cizgi = dolu ? undefined : (CIZGI as Partial<Record<IkonAdi, SFSymbol>>)[ad];
  return (
    <SymbolView
      name={{ ios: cizgi ?? n.ios, android: n.android, web: n.android }}
      size={boyut}
      tintColor={renk}
      style={style}
    />
  );
}
