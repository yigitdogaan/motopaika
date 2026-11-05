import { useMemo, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { Animated, Easing, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { EkranUstu } from '@/components/ekran-ustu';
import { Ikon } from '@/components/ikon';
import { KonumAlani } from '@/components/konum-alani';
import { ZaferIsareti } from '@/components/zafer-isareti';
import { YonetimBanneri } from '@/components/yonetim-banneri';
import { GonderiKarti } from '@/components/gonderi-karti';
import { Hap } from '@/components/yol-ui';
import { gonderiKategorileri, type KategoriId } from '@/demo/akis';
import { useAltMenuBosluk } from '@/components/alt-menu';
import { planliZamanYazi } from '@/lib/zaman';
import { pasifMi, useAkis, type AkisGonderisi } from '@/lib/akis';
import { radius, spacing, useTheme } from '@/theme';

type Filtre = 'tumu' | 'anonim' | 'yakin' | KategoriId;
// Üst filtre: Tümü, Anonim Duvar, tüm kategoriler (kendi renkleriyle), Yakınımdakiler.
const FILTRELER: { id: Filtre; ad: string; renk?: string }[] = [
  { id: 'tumu', ad: 'Tümü' },
  { id: 'anonim', ad: 'Anonim Duvar' },
  // Anonim Duvar'dan sonra: Sürüş Arkadaşı, Geyik / İç Dökme; ardından diğer kategoriler.
  ...(['surus', 'geyik', 'uyari', 'teknik'] as KategoriId[]).map((id) => {
    const k = gonderiKategorileri.find((x) => x.id === id)!;
    return { id: id as Filtre, ad: k.ad, renk: k.renk };
  }),
  { id: 'yakin', ad: 'Yakınımdakiler' },
];

// Mesafe seçenekleri (km); null = sınırsız.

/** Ana akış (duvar). */
export default function Akis() {
  const c = useTheme();
  const bosluk = useAltMenuBosluk();
  const [ust, setUst] = useState(150);
  const { gonderiler } = useAkis();
  const [filtre, setFiltre] = useState<Filtre>('tumu');
  const [ara, setAra] = useState('');
  const [araAcik, setAraAcik] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const girdi = useRef<React.ComponentRef<typeof TextInput>>(null);
  const araDegistir = (ac: boolean) => {
    setAraAcik(ac);
    if (!ac) {
      setAra('');
      girdi.current?.blur();
    }
    Animated.timing(anim, { toValue: ac ? 1 : 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(() => {
      if (ac) girdi.current?.focus();
    });
  };

  const liste = useMemo(() => {
    let l = gonderiler;
    if (filtre === 'anonim') l = l.filter((g) => g.anonim);
    else if (filtre === 'yakin') l = l.filter((g) => g.mesafeKm < 9999);
    else if (filtre !== 'tumu') l = l.filter((g) => g.kategori === filtre);
    const q = ara.trim().toLocaleLowerCase('tr');
    if (q) l = l.filter((g) => [g.metin, g.yazar, g.motor, g.konum, g.sehir ?? ''].some((t) => t.toLocaleLowerCase('tr').includes(q)));
    return filtre === 'yakin' ? [...l].sort((a, b) => a.mesafeKm - b.mesafeKm) : l;
  }, [filtre, ara, gonderiler]);

  return (
    <View style={[styles.ekran, { backgroundColor: c.bg }]}>
      <EkranUstu
        baslik="Akış"
        onYukseklik={setUst}
        sol={
          <Pressable
            onPress={() => araDegistir(!araAcik)}
            accessibilityRole="button"
            accessibilityLabel={araAcik ? 'Aramayı kapat' : 'Ara'}
            style={[styles.araDugme, { backgroundColor: c.surface, borderColor: araAcik || ara ? c.primary : c.border }]}>
            <Ikon ad="ara" boyut={20} renk={araAcik || ara ? c.primary : c.text} />
          </Pressable>
        }
        alt={
          <View style={[styles.filtreler, { borderBottomColor: c.border }]}>
            <View style={styles.konumSatiri2}>
              <KonumAlani />
            </View>
            <Animated.View
              style={{ height: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 48] }), opacity: anim, overflow: 'hidden' }}
              pointerEvents={araAcik ? 'auto' : 'none'}>
              <View style={[styles.araKap, { backgroundColor: c.surface, borderColor: c.primary }]}>
                <Ikon ad="ara" boyut={16} renk={c.textMuted} />
                <TextInput
                  ref={girdi}
                  value={ara}
                  onChangeText={setAra}
                  placeholder="Gönderi, kişi, motor veya yer ara..."
                  placeholderTextColor={c.textMuted}
                  returnKeyType="search"
                  autoCorrect={false}
                  style={[styles.araGirdi, { color: c.text }]}
                />
                {ara ? (
                  <Pressable onPress={() => setAra('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Aramayı temizle">
                    <Ikon ad="kapat" boyut={14} renk={c.textMuted} />
                  </Pressable>
                ) : null}
              </View>
            </Animated.View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtreSerit}>
              {FILTRELER.map((f) => (
                <Hap key={f.id} etiket={f.ad} renk={f.renk} secili={f.id === filtre} onPress={() => setFiltre(f.id)} />
              ))}
            </ScrollView>
          </View>
        }
      />

      <FlatList
        data={liste}
        keyExtractor={(g) => g.id}
        ListHeaderComponent={<YonetimBanneri />}
        renderItem={({ item }) => <GonderiKarti g={item} />}
        contentContainerStyle={[styles.icerik, { paddingTop: ust + spacing.sm, paddingBottom: bosluk }]}
        ListEmptyComponent={
          <Text style={[styles.bos, { color: c.textMuted }]}>
            {filtre === 'yakin' && gonderiler.every((g) => g.mesafeKm >= 9999)
              ? 'Yakınındakiler için konum gerekli. Konum iznini aç ya da Konumum alanından bir yer seç.'
              : ara.trim() ? 'Aramaya uyan gönderi yok.' : 'Bu filtrede gönderi yok.'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  filtreler: { paddingVertical: spacing.md },
  araKap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 40, marginHorizontal: spacing.lg, marginBottom: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.full, borderWidth: 1 },
  araGirdi: { flex: 1, fontSize: 14, paddingVertical: 0 },
  konumSatiri2: { alignItems: 'center', marginTop: -spacing.sm, marginBottom: spacing.md },
  araDugme: { width: 42, height: 42, borderRadius: radius.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filtreSerit: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  icerik: { padding: spacing.lg, paddingBottom: spacing.xxl + 24, gap: spacing.md },
  bos: { textAlign: 'center', marginTop: spacing.xxl, fontSize: 15 },
});
