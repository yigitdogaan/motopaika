import { Slot, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { AltMenu } from '@/components/alt-menu';
import { BulanikHedef } from '@/components/bulanik';
import { useTheme } from '@/theme';

/**
 * Ana düzen: üstte açık ekran, üstünde yüzen menü (Akış · Harita · Mesajlar · Profil ve Garaj + Gönderi Paylaş).
 * Sekme sistemi yerine doğrudan `Slot` kullanılır: aktif ekran her zaman çizilir, boş sayfa riski yok.
 */
export default function TabsLayout() {
  const c = useTheme();
  const yol = usePathname();
  const opaklik = useRef(new Animated.Value(1)).current;
  const ilk = useRef(true);
  // Sekme değişince yeni ekran yumuşakça belirir (JS sürücüsü: Android'de yerel animasyon çökmesinden kaçınır).
  useEffect(() => {
    if (ilk.current) {
      ilk.current = false;
      return;
    }
    opaklik.setValue(0.15);
    Animated.timing(opaklik, { toValue: 1, duration: 450, easing: Easing.inOut(Easing.quad), useNativeDriver: false }).start();
  }, [yol, opaklik]);
  return (
    <View style={[styles.kap, { backgroundColor: c.bg }]}>
      <BulanikHedef style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.sayfa, { opacity: opaklik }]}>
          <Slot />
        </Animated.View>
        <AltMenu />
      </BulanikHedef>
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1 },
  sayfa: { ...StyleSheet.absoluteFill },
});
