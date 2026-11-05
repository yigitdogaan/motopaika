import { View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';

// Phosphor Icons "HandPeace" (fill) — MIT lisansı. Başparmak/kıvrık parmak parçaları ayrıldı.
const V1 =
  'M96.55 36.14a16 16 0 0 1 11-19.52c8.61-2.46 17.65 3 20 11.65l16 59.78a4 4 0 0 1-3.18 5A31.8 31.8 0 0 0 128 98c-.56.37-1.1.76-1.64 1.17-.33-.58-.67-1.16-1-1.72a31.74 31.74 0 0 0-14-11.72 3.94 3.94 0 0 1-2.25-2.62Z';
const V2 =
  'M162.8 95.5l23.55 4.81a4 4 0 0 0 4.65-2.86l16.42-61.3a16 16 0 0 0-30.91-8.28l-16.8 62.7a4 4 0 0 0 3.1 4.96Z';
const AVUC =
  'M200.14 127.24a23.9 23.9 0 0 0-15.67-11l-35.6-7.23a16 16 0 0 0-15.12 5 14 14 0 0 0-2.43 3.57 16 16 0 0 0 1.72 17 16.5 16.5 0 0 0 9.8 5.93l15.24 3.11a8.06 8.06 0 0 1 6.32 9.36 28 28 0 0 0 2.77 19 8.19 8.19 0 0 1-1.93 10.41 8 8 0 0 1-11.94-2.43 44 44 0 0 1-5.48-22.09l-8.55-1.86A31.78 31.78 0 0 1 119 142.32c-.38-.57-.73-1.15-1.06-1.74a32 32 0 0 1-6.87 4A32 32 0 0 1 83.63 193a32.3 32.3 0 0 1-6.43-.65l-19.59-4h-.06a2.61 2.61 0 0 0-3 3.57A80.19 80.19 0 0 0 128 240h.61c43.77-.33 79.39-36.62 79.39-80.9v-3.34a55.7 55.7 0 0 0-7.85-28.5Z';

/**
 * Motorcu selamı: yatay zafer (V) işareti, her zaman dolu. V parmakları sağa bakar,
 * alttaki iki kıvrık parmak yataydır. `fon`, parmakların arasındaki ayırıcı çizgi rengidir.
 */
export function ZaferIsareti({
  boyut = 22,
  renk = '#FFB800',
  fon = '#1E1E1E',
}: {
  boyut?: number;
  renk?: string;
  fon?: string;
  /** Eski uyumluluk: artık her zaman dolu çizilir. */
  dolu?: boolean;
}) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no" style={{ width: boyut, height: boyut }}>
      <Svg width={boyut} height={boyut} viewBox="0 0 256 256">
        <G fill={renk}>
          <G transform="matrix(0 -1 -1 0 256 256)">
            <Path d={V1} />
            <Path d={V2} />
            <Path d={AVUC} />
          </G>
          <Rect x={80} y={138} width={76} height={30} rx={15} stroke={fon} strokeWidth={5} />
          <Rect x={80} y={176} width={76} height={30} rx={15} stroke={fon} strokeWidth={5} />
        </G>
      </Svg>
    </View>
  );
}
