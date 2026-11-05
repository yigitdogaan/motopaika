import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

/** Yeşil-sarı sayı rozeti (okunmamış / yeni sayısı). */
export function Rozet({ sayi, style }: { sayi: number; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  if (sayi <= 0) return null;
  return (
    <View style={[styles.kap, { backgroundColor: c.danger }, style]}>
      <Text style={[styles.yazi, { color: c.onAccent }]}>{sayi > 99 ? '99+' : sayi}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' },
  yazi: { fontSize: 11, fontWeight: '700' },
});
