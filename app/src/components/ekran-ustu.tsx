import { useRouter, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bulanik } from '@/components/bulanik';
import { Ikon } from '@/components/ikon';
import { KonumAlani } from '@/components/konum-alani';
import { RoteriLogo } from '@/components/roteri-logo';
import { Rozet } from '@/components/rozet';
import { useBildirim } from '@/lib/bildirim';
import { radius, spacing, useTheme } from '@/theme';

/** Bildirim çanı: okunmamış varsa kırmızı sayı rozeti. */
function Zil() {
  const c = useTheme();
  const router = useRouter();
  const { okunmamis } = useBildirim();
  return (
    <Pressable
      onPress={() => router.push('/bildirimler' as Href)}
      accessibilityRole="button"
      accessibilityLabel={okunmamis ? `Bildirimler, ${okunmamis} okunmamış` : 'Bildirimler'}
      style={[styles.zil, { backgroundColor: c.surface, borderColor: okunmamis ? c.danger : c.border }]}>
      <Ikon ad="zil" boyut={20} renk={okunmamis ? c.primary : c.text} />
      <Rozet sayi={okunmamis} style={styles.rozet} />
    </Pressable>
  );
}

/** Ekran başlığı: ortada Roteri yazı logosu, altında ekranın adı; sağda isteğe bağlı eylem ve bildirim çanı. */
export function EkranUstu({
  baslik,
  sol,
  sag,
  alt,
  onYukseklik,
  konumAlani,
}: {
  baslik: string;
  sol?: ReactNode;
  sag?: ReactNode;
  /** Başlığın altında, aynı bulanık alanın içinde duran içerik (ör. filtre çubuğu). */
  alt?: ReactNode;
  /** Alanın yüksekliği: listeler içeriği bu kadar aşağıdan başlatır (başlığın altından kayar). */
  onYukseklik?: (h: number) => void;
  /** Başlık yerine logonun altında "Konumum" alanını gösterir. */
  konumAlani?: boolean;
}) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.dis, { borderBottomColor: c.border, borderBottomWidth: alt ? 0 : StyleSheet.hairlineWidth }]}
      onLayout={(e) => onYukseklik?.(e.nativeEvent.layout.height)}>
      <Bulanik />
      <View style={[styles.kap, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.yanBos}>{sol}</View>
        <View style={styles.orta}>
          <RoteriLogo yukseklik={22} renk={c.text} />
          {konumAlani ? (
            <KonumAlani />
          ) : (
            <Text style={[styles.baslik, { color: c.textMuted }]}>{baslik.toLocaleUpperCase('tr')}</Text>
          )}
        </View>
        <View style={styles.sag}>
          {sag}
          <Zil />
        </View>
      </View>
      {alt}
    </View>
  );
}

const styles = StyleSheet.create({
  dis: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  kap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  yanBos: { flex: 1, alignItems: 'flex-start', justifyContent: 'center' },
  orta: { alignItems: 'center', gap: 4 },
  sag: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.sm },
  zil: { width: 42, height: 42, borderRadius: radius.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rozet: { position: 'absolute', top: -6, right: -6 },
  baslik: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textAlign: 'center' },
});
