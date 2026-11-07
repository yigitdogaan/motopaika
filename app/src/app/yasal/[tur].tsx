import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ikon } from '@/components/ikon';
import metin from '@/lib/yasal-metin.json';
import { fontSerif, spacing, useTheme } from '@/theme';

/** Kullanım Koşulları / Gizlilik Politikası. Giriş yapmadan da açılır (giriş ekranından). */
export default function Yasal() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tur } = useLocalSearchParams<{ tur: string }>();
  const icerik = tur === 'gizlilik' ? metin.gizlilik : metin.kosullar;

  return (
    <View style={[styles.ekran, { backgroundColor: c.bg }]}>
      <View style={[styles.ust, { paddingTop: insets.top + spacing.sm, borderBottomColor: c.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" style={styles.geri}>
          <Ikon ad="ileri" boyut={22} renk={c.text} />
        </Pressable>
        <Text style={[styles.ustBaslik, { color: c.text }]} numberOfLines={1} accessibilityRole="header">
          {icerik.baslik}
        </Text>
        <View style={styles.geriBos} />
      </View>
      <ScrollView contentContainerStyle={[styles.icerik, { paddingBottom: insets.bottom + spacing.xxl }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.baslik, { color: c.text, fontFamily: fontSerif }]}>{icerik.baslik}</Text>
        <Text style={[styles.tarih, { color: c.textMuted }]}>Son güncelleme: {metin.guncelleme}</Text>
        <Text style={[styles.govde, { color: c.text }]}>{icerik.giris}</Text>
        {icerik.bolumler.map((b) => (
          <View key={b.baslik} style={styles.bolum}>
            <Text style={[styles.bolumBaslik, { color: c.primary }]}>{b.baslik}</Text>
            <Text style={[styles.govde, { color: c.text }]}>{b.metin}</Text>
          </View>
        ))}
        {metin.iletisim ? (
          <View style={styles.bolum}>
            <Text style={[styles.bolumBaslik, { color: c.primary }]}>İletişim</Text>
            <Text style={[styles.govde, { color: c.text }]}>{metin.iletisim}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  ust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  geri: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '180deg' }] },
  geriBos: { width: 36, height: 36 },
  ustBaslik: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  icerik: { padding: spacing.xl, gap: spacing.md },
  baslik: { fontSize: 28, fontWeight: '800' },
  tarih: { fontSize: 13 },
  bolum: { gap: spacing.xs, marginTop: spacing.sm },
  bolumBaslik: { fontSize: 16, fontWeight: '800' },
  govde: { fontSize: 15.5, lineHeight: 23 },
});
