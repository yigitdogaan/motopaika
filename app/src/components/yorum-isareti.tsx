import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

/** Dolu konuşma balonu; ZaferIsareti ile aynı dolu tasarım dili. Üç nokta `fon` renginde. */
export function YorumIsareti({
  boyut = 26,
  renk = '#FFB800',
  fon = '#1E1E1E',
}: {
  boyut?: number;
  renk?: string;
  fon?: string;
}) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no" style={{ width: boyut, height: boyut }}>
      <Svg width={boyut} height={boyut} viewBox="0 0 256 256">
        <Path
          d="M128 24C70.6 24 24 66.2 24 118.5c0 27.5 13 52.2 33.7 69.5L48 228a6 6 0 0 0 8.6 6.9l40.3-20.4c9.7 2.4 20 3.7 31.1 3.7 57.4 0 104-42.2 104-94.5S185.4 24 128 24Z"
          fill={renk}
        />
        <Circle cx={84} cy={120} r={13} fill={fon} />
        <Circle cx={128} cy={120} r={13} fill={fon} />
        <Circle cx={172} cy={120} r={13} fill={fon} />
      </Svg>
    </View>
  );
}
