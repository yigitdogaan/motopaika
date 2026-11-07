import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ikon } from '@/components/ikon';
import { hafifTitresim } from '@/lib/titresim';
import { radius, spacing, useTheme } from '@/theme';

const DAKIKA_ADIM = 15;

/** Tek sütun: yukarı/aşağı oklarla değer artar/azalır, uca gelince başa sarar. */
function Sutun({ deger, adet, adim, onDegis, etiket }: { deger: number; adet: number; adim: number; onDegis: (d: number) => void; etiket: string }) {
  const c = useTheme();
  const kaydir = (yon: 1 | -1) => {
    hafifTitresim();
    onDegis((((deger / adim + yon + adet) % adet) * adim) | 0);
  };
  return (
    <View style={styles.sutun}>
      <Pressable onPress={() => kaydir(-1)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${etiket} azalt`} style={[styles.ok, { transform: [{ rotate: '180deg' }] }]}>
        <Ikon ad="ileri" boyut={14} renk={c.primary} />
      </Pressable>
      <Text style={[styles.deger, { color: c.text }]} accessibilityLabel={`${etiket} ${String(deger).padStart(2, '0')}`}>
        {String(deger).padStart(2, '0')}
      </Text>
      <Pressable onPress={() => kaydir(1)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${etiket} artır`} style={styles.ok}>
        <Ikon ad="ileri" boyut={14} renk={c.primary} />
      </Pressable>
    </View>
  );
}

/** Saat seçici: tek satırda  ‹ 19 ›  :  ‹ 20 ›  (saat 1'er, dakika 15'er 15'er). */
export function SaatCarki({ saat, dakika, onSaat, onDakika }: { saat: number; dakika: number; onSaat: (s: number) => void; onDakika: (d: number) => void }) {
  const c = useTheme();
  return (
    <View style={[styles.kap, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Sutun deger={saat} adet={24} adim={1} onDegis={onSaat} etiket="Saat" />
      <Text style={[styles.iki, { color: c.text }]}>:</Text>
      <Sutun deger={dakika} adet={60 / DAKIKA_ADIM} adim={DAKIKA_ADIM} onDegis={onDakika} etiket="Dakika" />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, height: 56, borderRadius: radius.lg, borderWidth: 1 },
  sutun: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ok: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  deger: { fontSize: 24, fontWeight: '800', minWidth: 36, textAlign: 'center' },
  iki: { fontSize: 24, fontWeight: '800', marginTop: -3 },
});
