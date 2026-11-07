import { createContext, useContext, useRef, type ReactNode, type RefObject } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

// expo-blur kuruluysa gerçek bulanıklık, değilse yarı saydam zemin (uygulama yine çalışır).
let Blur: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  // Android'de sekme geçişlerinde BlurView çökmesi şüphesiyle şimdilik kapalı: düz yarı saydam zemin kullanılır.
  Blur = null; // require('expo-blur');
} catch {}

const HedefBaglami = createContext<RefObject<View | null> | null>(null);

/** Android'de bulanıklığın alacağı içerik burada durmalı (iOS'ta düz View gibi davranır). */
export function BulanikHedef({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const ref = useRef<View>(null);
  const Hedef = Blur?.BlurTargetView;
  if (!Hedef) return <View style={style}>{children}</View>;
  return (
    <HedefBaglami.Provider value={ref}>
      <Hedef ref={ref} style={style}>
        {children}
      </Hedef>
    </HedefBaglami.Provider>
  );
}

/**
 * Üst/alt çubukların arka planı: bulanık + hafif saydam koyu katman.
 * Üst View'a `overflow: 'hidden'` ve gerekirse `borderRadius` verilmiş olmalı (ya da `radius` geçilir).
 */
export function Bulanik({ yogunluk = 45, radius, katman = '99' }: { yogunluk?: number; radius?: number; /** Koyu katmanın opaklığı (hex, '40' ≈ %75 şeffaf). */ katman?: string }) {
  const c = useTheme();
  const hedef = useContext(HedefBaglami);
  const BlurView = Blur?.BlurView;
  const kap = [StyleSheet.absoluteFill, radius ? { borderRadius: radius, overflow: 'hidden' as const } : null];
  if (!BlurView) {
    return <View pointerEvents="none" style={[kap, { backgroundColor: `${c.surface}F5` }]} />;
  }
  return (
    <View pointerEvents="none" style={kap}>
      <BlurView
        intensity={yogunluk}
        tint="dark"
        blurTarget={hedef ?? undefined}
        blurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `${c.bg}${katman}` }]} />
    </View>
  );
}
