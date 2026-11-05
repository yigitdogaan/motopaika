import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ikon } from '@/components/ikon';
import { Rozet } from '@/components/rozet';
import { Avatar } from '@/components/ui/avatar';
import { demoBildirim, demoGonderiler } from '@/demo/gonderiler';
import { useKanallar } from '@/lib/kanallar';
import { useOturum } from '@/lib/oturum';
import { fontSerif, radius, spacing, useTheme } from '@/theme';

/** Üst çubuk: menü (yeni gönderi sayısı rozetiyle), uygulama adı, bildirim ve profil. */
export function UstBar({ onMenu }: { onMenu: () => void }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { kanallar } = useKanallar();
  const { kullanici } = useOturum();
  const yeni = demoGonderiler.filter((g) => kanallar.includes(g.kanal)).length;

  return (
    <View style={[styles.kap, { backgroundColor: c.header, paddingTop: insets.top + spacing.sm }]}>
      <Pressable onPress={onMenu} hitSlop={10} accessibilityRole="button" accessibilityLabel="Menüyü aç" style={styles.ikonKutu}>
        <Ikon ad="menu" boyut={26} renk={c.onAccent} />
        <Rozet sayi={yeni} style={styles.rozet} />
      </Pressable>

      <Text style={[styles.baslik, { color: c.onAccent, fontFamily: fontSerif }]}>Motopaika</Text>

      <View style={styles.bosluk} />

      <View style={styles.ikonKutu} accessibilityLabel="Bildirimler">
        <Ikon ad="zil" boyut={24} renk={c.onAccent} />
        <Rozet sayi={demoBildirim.zil} style={styles.rozet} />
      </View>

      <Pressable
        onPress={() => router.navigate('/profil' as Href)}
        accessibilityRole="button"
        accessibilityLabel="Profil"
        style={styles.avatar}>
        <Avatar name={kullanici?.ad ?? 'Motopaika'} size="sm" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  kap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  ikonKutu: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  rozet: { position: 'absolute', top: -6, right: -8 },
  baslik: { fontSize: 24, fontWeight: '600' },
  bosluk: { flex: 1 },
  avatar: { borderRadius: radius.full, overflow: 'hidden' },
});
