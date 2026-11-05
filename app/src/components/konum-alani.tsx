import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Ikon } from '@/components/ikon';
import { KonumHaritasi } from '@/components/konum-haritasi';
import { useAkis } from '@/lib/akis';
import { useTheme } from '@/theme';

/** Logonun altındaki "Konumum" alanı: mevcut konumu gösterir, dokununca haritadan pinlenerek değiştirilir. */
export function KonumAlani() {
  const c = useTheme();
  const { konumum, konumNokta, konumGps } = useAkis();
  const [acik, setAcik] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setAcik(true)}
        accessibilityRole="button"
        accessibilityLabel={`Konumum: ${konumum?.yer ?? 'belirlenmedi'}. Haritadan değiştirmek için dokun`}
        style={styles.chip}>
        <Ikon ad="konum" boyut={12} renk={c.primary} />
        <Text style={[styles.yazi, { color: c.textMuted }]} numberOfLines={1}>
          {konumum?.yer ?? 'Konum seç'}
        </Text>
        <Ikon ad="ileri" boyut={10} renk={c.textMuted} />
      </Pressable>

      <KonumHaritasi
        gorunur={acik}
        onKapat={() => setAcik(false)}
        baslangic={konumum}
        baslangicAd={konumum?.yer}
        onSec={(k) => konumNokta(k.lat, k.lng)}
        onGps={konumGps}
      />
    </>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: 200, paddingVertical: 2 },
  yazi: { fontSize: 11.5, fontWeight: '700', flexShrink: 1 },
});
