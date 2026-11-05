import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ikon } from '@/components/ikon';
import { ProfilEkrani } from '@/components/profil-ekrani';
import { spacing, useTheme } from '@/theme';

/** Başka bir sürücünün profili (istek panelinden ve akıştan açılır). */
export default function SurucuProfili() {
  const c = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={[styles.ekran, { backgroundColor: c.bg }]}>
      <View style={[styles.ust, { borderBottomColor: c.border, paddingTop: Platform.OS === 'ios' ? insets.top + spacing.sm : insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Ikon ad="kapat" boyut={22} renk={c.text} />
        </Pressable>
        <Text style={[styles.baslik, { color: c.text }]}>Profil</Text>
      </View>
      {id ? <ProfilEkrani id={id} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  ust: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  baslik: { flex: 1, fontSize: 18, fontWeight: '800' },
});
