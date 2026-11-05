import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ikon } from '@/components/ikon';
import { kisitMetni, useYonetimDurumu } from '@/lib/yonetim';
import { radius, spacing, useTheme } from '@/theme';

/** Akışın üstünde: hesap kısıtı (kapatılamaz) ve yayındaki duyurular (kapatılabilir). */
export function YonetimBanneri() {
  const c = useTheme();
  const { kisit, duyurular } = useYonetimDurumu();
  const [gizli, setGizli] = useState<string[]>([]);
  const liste = duyurular.filter((d) => !gizli.includes(d.id));
  if (!kisit && !liste.length) return null;
  return (
    <View style={{ gap: spacing.sm, marginBottom: spacing.sm }}>
      {kisit ? (
        <View style={[styles.kutu, { backgroundColor: c.surface, borderColor: c.danger }]} accessibilityRole="alert">
          <Ikon ad="uyari" boyut={20} renk={c.danger} />
          <Text style={[styles.yazi, { color: c.text }]}>{kisitMetni(kisit)}</Text>
        </View>
      ) : null}
      {liste.map((d) => {
        const renk = d.seviye === 'critical' ? c.danger : d.seviye === 'warning' ? c.warning : c.primary;
        return (
          <View key={d.id} style={[styles.kutu, { backgroundColor: c.surface, borderColor: renk }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.baslik, { color: c.text }]}>{d.baslik}</Text>
              <Text style={[styles.yazi, { color: c.textMuted }]}>{d.metin}</Text>
            </View>
            <Pressable onPress={() => setGizli((g) => [...g, d.id])} hitSlop={10} accessibilityRole="button" accessibilityLabel="Duyuruyu kapat">
              <Ikon ad="kapat" boyut={14} renk={c.textMuted} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  kutu: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  baslik: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  yazi: { flex: 1, fontSize: 13, lineHeight: 18 },
});
