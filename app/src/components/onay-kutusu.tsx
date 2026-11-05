import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Ikon, type IkonAdi } from '@/components/ikon';
import { radius, spacing, useTheme } from '@/theme';

/** Uygulama temalı onay penceresi (sistem Alert'i yerine). `tehlikeli` kırmızı onay butonu verir. */
export function OnayKutusu({
  gorunur,
  baslik,
  mesaj,
  onayEtiketi,
  vazgecEtiketi = 'Vazgeç',
  ikon,
  tehlikeli = false,
  onOnay,
  onKapat,
}: {
  gorunur: boolean;
  baslik: string;
  mesaj: string;
  onayEtiketi: string;
  vazgecEtiketi?: string;
  ikon?: IkonAdi;
  tehlikeli?: boolean;
  onOnay: () => void;
  onKapat: () => void;
}) {
  const c = useTheme();
  const vurgu = tehlikeli ? c.danger : c.primary;
  return (
    <Modal visible={gorunur} transparent animationType="fade" onRequestClose={onKapat}>
      <Pressable style={styles.perde} onPress={onKapat}>
        <Pressable style={[styles.kutu, { backgroundColor: c.surface, borderColor: c.border }]} onPress={() => {}}>
          {ikon ? (
            <View style={[styles.ikon, { backgroundColor: `${vurgu}22` }]}>
              <Ikon ad={ikon} boyut={24} renk={vurgu} />
            </View>
          ) : null}
          <Text style={[styles.baslik, { color: c.text }]}>{baslik}</Text>
          <Text style={[styles.mesaj, { color: c.textMuted }]}>{mesaj}</Text>
          <View style={styles.satir}>
            <Pressable onPress={onKapat} accessibilityRole="button" style={[styles.dugme, { borderColor: c.border, borderWidth: 1 }]}>
              <Text style={[styles.dugmeYazi, { color: c.text }]}>{vazgecEtiketi}</Text>
            </Pressable>
            <Pressable onPress={onOnay} accessibilityRole="button" style={[styles.dugme, { backgroundColor: vurgu }]}>
              <Text style={[styles.dugmeYazi, { color: tehlikeli ? '#fff' : c.onPrimary }]}>{onayEtiketi}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  perde: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: spacing.xl },
  kutu: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  ikon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  baslik: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  mesaj: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: spacing.md },
  satir: { flexDirection: 'row', gap: spacing.sm, alignSelf: 'stretch' },
  dugme: { flex: 1, height: 46, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  dugmeYazi: { fontSize: 15, fontWeight: '800' },
});
