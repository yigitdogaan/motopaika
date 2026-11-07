import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ikon, type IkonAdi } from '@/components/ikon';
import { radius, spacing, useTheme } from '@/theme';

/** Boş liste ekranı: ikon, kısa başlık, açıklama ve (varsa) tek dokunuşluk eylem düğmesi. */
export function BosDurum({
  ikon,
  baslik,
  metin,
  eylem,
  onEylem,
}: {
  ikon: IkonAdi;
  baslik: string;
  metin: string;
  eylem?: string;
  onEylem?: () => void;
}) {
  const c = useTheme();
  return (
    <View style={styles.kap}>
      <View style={[styles.ikonKap, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Ikon ad={ikon} boyut={30} renk={c.primary} />
      </View>
      <Text style={[styles.baslik, { color: c.text }]}>{baslik}</Text>
      <Text style={[styles.metin, { color: c.textMuted }]}>{metin}</Text>
      {eylem && onEylem ? (
        <Pressable onPress={onEylem} accessibilityRole="button" accessibilityLabel={eylem} style={[styles.dugme, { backgroundColor: c.primary }]}>
          <Text style={[styles.dugmeYazi, { color: c.onPrimary }]}>{eylem}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  ikonKap: { width: 68, height: 68, borderRadius: 34, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  baslik: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  metin: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  dugme: { marginTop: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: 12, borderRadius: radius.full },
  dugmeYazi: { fontSize: 15, fontWeight: '800' },
});
