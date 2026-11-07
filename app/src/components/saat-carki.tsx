import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { hafifTitresim } from '@/lib/titresim';
import { radius, spacing, useTheme } from '@/theme';

const SATIR = 46;
const GORUNEN = 5;
const YUKSEKLIK = SATIR * GORUNEN;

const SAATLER = Array.from({ length: 24 }, (_, i) => i);
const DAKIKALAR = Array.from({ length: 12 }, (_, i) => i * 5);

/** Tek sütunlu kaydırmalı çark: ortadaki satır seçilidir, bırakınca en yakın değere oturur. */
function Cark({ degerler, deger, onDegis, etiket }: { degerler: number[]; deger: number; onDegis: (d: number) => void; etiket: string }) {
  const c = useTheme();
  const kaydirma = useRef<{ scrollTo: (o: { y: number; animated: boolean }) => void } | null>(null);
  const sira = useRef(Math.max(0, degerler.indexOf(deger)));

  // Dışarıdan değer değişirse (hızlı seçim) çarkı oraya kaydır.
  useEffect(() => {
    const i = Math.max(0, degerler.indexOf(deger));
    if (i !== sira.current) {
      sira.current = i;
      kaydirma.current?.scrollTo({ y: i * SATIR, animated: true });
    }
  }, [deger, degerler]);

  // Bir satıra dokunmak da yeterli: çark o satıra kayar.
  const sec = (i: number) => {
    if (i === sira.current) return;
    sira.current = i;
    kaydirma.current?.scrollTo({ y: i * SATIR, animated: true });
    hafifTitresim();
    onDegis(degerler[i]);
  };

  const bitti = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.min(degerler.length - 1, Math.max(0, Math.round(e.nativeEvent.contentOffset.y / SATIR)));
    if (i === sira.current) return;
    sira.current = i;
    hafifTitresim();
    onDegis(degerler[i]);
  };

  return (
    <ScrollView
      ref={kaydirma as never}
      style={styles.cark}
      showsVerticalScrollIndicator={false}
      snapToInterval={SATIR}
      decelerationRate="fast"
      nestedScrollEnabled
      contentOffset={{ x: 0, y: sira.current * SATIR }}
      contentContainerStyle={{ paddingVertical: (YUKSEKLIK - SATIR) / 2 }}
      onMomentumScrollEnd={bitti}
      onScrollEndDrag={bitti}
      accessibilityLabel={etiket}
      accessibilityRole="adjustable"
      accessibilityValue={{ text: String(deger).padStart(2, '0') }}>
      {degerler.map((d) => {
        const secili = d === deger;
        return (
          <Pressable key={d} onPress={() => sec(degerler.indexOf(d))} style={styles.satir} accessibilityRole="button" accessibilityLabel={`${etiket} ${String(d).padStart(2, '0')}`}>
            <Text style={[styles.yazi, { color: secili ? c.text : c.textMuted, fontSize: secili ? 26 : 20, fontWeight: secili ? '800' : '600', opacity: secili ? 1 : 0.55 }]}>
              {String(d).padStart(2, '0')}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** Saat seçici: iki çark (saat · dakika), ortada seçim bandı. Dakika 5'er 5'er ilerler. */
export function SaatCarki({ saat, dakika, onSaat, onDakika }: { saat: number; dakika: number; onSaat: (s: number) => void; onDakika: (d: number) => void }) {
  const c = useTheme();
  return (
    <View style={[styles.kap, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View pointerEvents="none" style={[styles.bant, { backgroundColor: c.surfaceAlt, borderColor: c.primary }]} />
      <Cark degerler={SAATLER} deger={saat} onDegis={onSaat} etiket="Saat" />
      <Text style={[styles.iki, { color: c.text }]}>:</Text>
      <Cark degerler={DAKIKALAR} deger={dakika} onDegis={onDakika} etiket="Dakika" />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: YUKSEKLIK, borderRadius: radius.lg, borderWidth: 1, paddingHorizontal: spacing.xl, overflow: 'hidden' },
  bant: { position: 'absolute', left: spacing.md, right: spacing.md, top: (YUKSEKLIK - SATIR) / 2, height: SATIR, borderRadius: radius.md, borderWidth: 1.5 },
  cark: { width: 90, height: YUKSEKLIK, flexGrow: 0 },
  satir: { height: SATIR, alignItems: 'center', justifyContent: 'center' },
  yazi: { textAlign: 'center' },
  iki: { fontSize: 28, fontWeight: '800', marginHorizontal: spacing.sm, marginTop: -3 },
});
