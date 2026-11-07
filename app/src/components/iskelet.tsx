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

/** Liste satırı iskeleti (mesajlar, bildirimler): yuvarlak avatar + iki satır. */
export function IskeletSatir() {
  return (
    <View style={styles.satir}>
      <IskeletBlok style={styles.avatarBuyuk} />
      <View style={styles.kimlik}>
        <IskeletBlok style={{ height: 14, width: '50%' }} />
        <IskeletBlok style={{ height: 12, width: '82%' }} />
      </View>
    </View>
  );
}

/** Birkaç iskelet satırı; ekran ilk veriyi beklerken boş sayfa yerine gösterilir. */
export function IskeletListe({ adet = 6 }: { adet?: number }) {
  return (
    <View accessible accessibilityLabel="Yükleniyor">
      {Array.from({ length: adet }, (_, i) => (
        <IskeletSatir key={i} />
      ))}
    </View>
  );
}

/** Profil sayfası iskeleti: büyük avatar, ad, üç sayaç. */
export function IskeletProfil() {
  return (
    <View style={styles.profil} accessible accessibilityLabel="Profil yükleniyor">
      <IskeletBlok style={{ width: 96, height: 96, borderRadius: radius.full }} />
      <IskeletBlok style={{ height: 18, width: 160 }} />
      <IskeletBlok style={{ height: 12, width: 110 }} />
      <View style={styles.sayaclar}>
        <IskeletBlok style={styles.sayac} />
        <IskeletBlok style={styles.sayac} />
        <IskeletBlok style={styles.sayac} />
      </View>
      <IskeletBlok style={{ height: 46, width: '100%', borderRadius: radius.lg }} />
      <IskeletBlok style={{ height: 120, width: '100%', borderRadius: radius.lg }} />
    </View>
  );
}

const styles = StyleSheet.create({
  satir: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  avatarBuyuk: { width: 52, height: 52, borderRadius: radius.full },
  profil: { alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  sayaclar: { flexDirection: 'row', gap: spacing.md, alignSelf: 'stretch' },
  sayac: { flex: 1, height: 64, borderRadius: radius.lg },
  kart: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, gap: spacing.md },
  ust: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: radius.full },
  kimlik: { flex: 1, gap: 8 },
});
