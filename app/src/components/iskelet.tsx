import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing, useTheme } from '@/theme';

/** Yavaşça beliren/sönen yer tutucu blok: içerik gelene kadar boş ekran yerine gösterilir. */
export function IskeletBlok({ style }: { style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  const a = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const d = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(a, { toValue: 0.45, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ]),
    );
    d.start();
    return () => d.stop();
  }, [a]);
  return <Animated.View style={[{ backgroundColor: c.surfaceAlt, opacity: a, borderRadius: radius.sm }, style]} />;
}

/** Gönderi kartının iskeleti: avatar, iki satır başlık ve üç satır metin. */
export function IskeletKart() {
  const c = useTheme();
  return (
    <View style={[styles.kart, { backgroundColor: c.surface, borderColor: c.border }]} accessibilityLabel="Yükleniyor" accessible>
      <View style={styles.ust}>
        <IskeletBlok style={styles.avatar} />
        <View style={styles.kimlik}>
          <IskeletBlok style={{ height: 14, width: '45%' }} />
          <IskeletBlok style={{ height: 11, width: '70%' }} />
        </View>
      </View>
      <IskeletBlok style={{ height: 13, width: '100%' }} />
      <IskeletBlok style={{ height: 13, width: '92%' }} />
      <IskeletBlok style={{ height: 13, width: '60%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  kart: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, gap: spacing.md },
  ust: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: radius.full },
  kimlik: { flex: 1, gap: 8 },
});
