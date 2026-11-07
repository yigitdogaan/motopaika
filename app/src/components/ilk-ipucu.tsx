import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ikon } from '@/components/ikon';
import { ZaferIsareti } from '@/components/zafer-isareti';
import { radius, spacing, useTheme } from '@/theme';

const ANAHTAR = 'roteri.ipucu.akis.v1';

/**
 * Yeni kullanıcıya tek seferlik kısa tanıtım: "Selam" ve "Ben de Geliyorum!" ne işe yarar.
 * "Anladım" ile kapatılır ve bir daha gösterilmez; depolama okunamazsa hiç gösterilmez (rahatsız etmesin).
 */
export function IlkIpucu() {
  const c = useTheme();
  const [goster, setGoster] = useState(false);
  useEffect(() => {
    let iptal = false;
    AsyncStorage.getItem(ANAHTAR)
      .then((v) => {
        if (!iptal && v !== '1') setGoster(true);
      })
      .catch(() => {});
    return () => {
      iptal = true;
    };
  }, []);
  if (!goster) return null;
  const kapat = () => {
    setGoster(false);
    AsyncStorage.setItem(ANAHTAR, '1').catch(() => {});
  };
  return (
    <View style={[styles.kart, { backgroundColor: c.surface, borderColor: c.primary }]}>
      <Satir ikon={<ZaferIsareti boyut={20} renk={c.primary} fon={c.surface} dolu />} baslik="Selam ver" aciklama="Roteri'de beğeni yerine selam verirsin. Beğendiğin gönderinin sahibi bildirim alır." />
      <Satir ikon={<Ikon ad="motor" boyut={20} renk={c.primary} />} baslik="Birlikte sür" aciklama="'Sürüş' gönderilerinde “Ben de Geliyorum!” ile katılma isteği gönderirsin." />
      <Satir ikon={<Ikon ad="harita" boyut={20} renk={c.primary} />} baslik="Haritadan bak" aciklama="Şu an aktif sürüşleri Harita sekmesinde görürsün." />
      <Pressable onPress={kapat} accessibilityRole="button" accessibilityLabel="İpucunu kapat" style={[styles.dugme, { backgroundColor: c.primary }]}>
        <Text style={[styles.dugmeYazi, { color: c.onPrimary }]}>Anladım</Text>
      </Pressable>
    </View>
  );
}

function Satir({ ikon, baslik, aciklama }: { ikon: React.ReactNode; baslik: string; aciklama: string }) {
  const c = useTheme();
  return (
    <View style={styles.satir}>
      <View style={[styles.ikonKap, { backgroundColor: c.surfaceAlt }]}>{ikon}</View>
      <View style={styles.yazi}>
        <Text style={[styles.baslik, { color: c.text }]}>{baslik}</Text>
        <Text style={[styles.aciklama, { color: c.textMuted }]}>{aciklama}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kart: { borderRadius: radius.lg, borderWidth: 1.5, padding: spacing.lg, gap: spacing.md },
  satir: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ikonKap: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  yazi: { flex: 1, gap: 2 },
  baslik: { fontSize: 15, fontWeight: '800' },
  aciklama: { fontSize: 13.5, lineHeight: 19 },
  dugme: { alignSelf: 'flex-end', paddingHorizontal: spacing.xl, paddingVertical: 10, borderRadius: radius.full, marginTop: spacing.xs },
  dugmeYazi: { fontSize: 14.5, fontWeight: '800' },
});
