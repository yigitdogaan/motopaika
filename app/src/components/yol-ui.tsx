import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Ikon, type IkonAdi } from '@/components/ikon';
import { radius, spacing, useTheme } from '@/theme';

/** Motopaika düğmesi: dolu (garaj sarısı) ya da kontur. */
export function Dugme({
  etiket,
  onPress,
  ikon,
  tur = 'dolu',
  pasif,
  style,
}: {
  etiket: string;
  onPress: () => void;
  ikon?: IkonAdi;
  tur?: 'dolu' | 'kontur';
  pasif?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const dolu = tur === 'dolu';
  const renk = dolu ? c.onPrimary : c.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={pasif}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!pasif }}
      style={({ pressed }) => [
        styles.dugme,
        dolu ? { backgroundColor: c.primary } : { borderColor: c.primary, borderWidth: 1.5 },
        pasif && { opacity: 0.4 },
        pressed && { opacity: 0.8 },
        style,
      ]}>
      {ikon ? <Ikon ad={ikon} boyut={18} renk={renk} /> : null}
      <Text style={[styles.dugmeYazi, { color: renk }]}>{etiket}</Text>
    </Pressable>
  );
}

/** Seçilebilir hap (filtre ve kategori seçimi). */
export function Hap({
  etiket,
  secili,
  onPress,
  ikon,
  renk,
}: {
  etiket: string;
  secili: boolean;
  onPress: () => void;
  ikon?: IkonAdi;
  /** Kategori vurgu rengi: seçiliyken dolgu, değilken ince kenarlık olur. */
  renk?: string;
}) {
  const c = useTheme();
  const vurgu = renk ?? c.primary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: secili }}
      style={[
        styles.hap,
        secili ? { backgroundColor: vurgu, borderColor: vurgu } : { backgroundColor: c.surface, borderColor: renk ? `${renk}88` : c.border },
      ]}>
      {ikon ? <Ikon ad={ikon} boyut={14} renk={secili ? c.onPrimary : c.textMuted} /> : null}
      <Text style={[styles.hapYazi, { color: secili ? c.onPrimary : c.text }]}>{etiket}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dugme: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  dugmeYazi: { fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  hap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  hapYazi: { fontSize: 14, fontWeight: '700' },
});
