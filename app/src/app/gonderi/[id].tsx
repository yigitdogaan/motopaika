import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GonderiKarti } from '@/components/gonderi-karti';
import { Ikon } from '@/components/ikon';
import { useAkis } from '@/lib/akis';
import { spacing, useTheme } from '@/theme';

/** Gönderi sayfası: tam gönderi, altında yorumlar ve yorum yazma alanı. */
export default function GonderiDetay() {
  const c = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { gonderiler } = useAkis();
  const g = gonderiler.find((x) => x.id === id);

  return (
    <KeyboardAvoidingView style={[styles.ekran, { backgroundColor: c.bg }]} behavior="padding">
      <View style={[styles.ust, { borderBottomColor: c.border, paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" style={styles.geri}>
          <Ikon ad="ileri" boyut={22} renk={c.text} />
        </Pressable>
        <Text style={[styles.baslik, { color: c.text }]} accessibilityRole="header">
          Gönderi
        </Text>
        <View style={styles.geri} />
      </View>
      <ScrollView contentContainerStyle={[styles.icerik, { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xl }]} keyboardShouldPersistTaps="handled">
        {g ? (
          <GonderiKarti g={g} detay />
        ) : (
          <Text style={[styles.bos, { color: c.textMuted }]}>Bu gönderi artık yok ya da görüntülenemiyor.</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  ust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  geri: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '180deg' }] },
  baslik: { fontSize: 18, fontWeight: '800' },
  icerik: { padding: spacing.lg },
  bos: { textAlign: 'center', marginTop: spacing.xxl, fontSize: 15 },
});
