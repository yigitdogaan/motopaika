import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { palette } from '@/theme';

/** Roteri logosundaki "R" harfi (iki parça: gövde + bacak). Sınırlar: 437 × 413,5. */
export const R_YOLU =
  'M0,0 H308 A129,129 0 0 1 308,258 H283 V174 H304.5 A43.5,43.5 0 0 0 304.5,87 H87 V413.5 H0 Z M127,128.5 H214 A198,198 0 0 0 437,324.9 V413.5 H412 A285,285 0 0 1 127,128.5 Z';

export function RHarfi({ boyut, renk }: { boyut: number; renk: string }) {
  return (
    <Svg width={(boyut * 437) / 413.5} height={boyut} viewBox="0 0 437 413.5" accessibilityLabel="Roteri">
      <Path d={R_YOLU} fill={renk} fillRule="nonzero" />
    </Svg>
  );
}

const EN_AZ_MS = 1300;

/**
 * Açılış katmanı: koyu zemin üstünde yalnız sarı R. Oturum hazır olunca (en az 1,3 sn sonra) yumuşakça kaybolur.
 * Ana ekranın üstünde durduğu için geçiş kesintisiz olur.
 */
export function AcilisKatmani({ hazir }: { hazir: boolean }) {
  const giris = useRef(new Animated.Value(0)).current;
  const cikis = useRef(new Animated.Value(1)).current;
  const [sureDoldu, setSureDoldu] = useState(false);
  const [bitti, setBitti] = useState(false);

  useEffect(() => {
    Animated.timing(giris, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    const t = setTimeout(() => setSureDoldu(true), EN_AZ_MS);
    return () => clearTimeout(t);
  }, [giris]);

  useEffect(() => {
    if (!hazir || !sureDoldu) return;
    Animated.timing(cikis, { toValue: 0, duration: 380, easing: Easing.in(Easing.quad), useNativeDriver: false }).start(() => setBitti(true));
  }, [hazir, sureDoldu, cikis]);

  if (bitti) return null;
  return (
    <Animated.View style={[styles.kap, { opacity: cikis }]} pointerEvents={hazir && sureDoldu ? 'none' : 'auto'}>
      <Animated.View
        style={{
          opacity: giris,
          transform: [{ scale: giris.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) }],
        }}>
        <RHarfi boyut={96} renk={palette.dark.primary} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  kap: { ...StyleSheet.absoluteFill, backgroundColor: palette.dark.bg, alignItems: 'center', justifyContent: 'center', zIndex: 100 },
});
