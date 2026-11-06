import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Avatar } from '@/components/ui/avatar';
import { useAkis } from '@/lib/akis';
import { akisiSuz, MESAFELER, sehirListesi, type Filtre, type Siralama } from '@/lib/akis-filtre';
import { surucuAra, type SurucuSonucu } from '@/lib/surucu-ara';
import { radius, spacing, useTheme } from '@/theme';

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

  const [maksKm, setMaksKm] = useState<number | null>(50);
  const [sehir, setSehir] = useState<string | null>(null);
  const [siralama, setSiralama] = useState<Siralama>('yeni');
  const [suruculer, setSuruculer] = useState<SurucuSonucu[]>([]);
  const router = useRouter();

  // Arama kutusu: gönderiler yerelde süzülür, sürücüler 300 ms bekleyip sunucuda aranır.
  useEffect(() => {
    const q = ara.trim();
    if (q.length < 2) {
      setSuruculer([]);
      return;
    }
    let iptal = false;
    const t = setTimeout(() => {
      surucuAra(q).then((l) => {
        if (!iptal) setSuruculer(l);
      });
    }, 300);
    return () => {
      iptal = true;
      clearTimeout(t);
    };
  }, [ara]);

  const sehirler = useMemo(() => sehirListesi(gonderiler), [gonderiler]);
  // Seçili şehrin gönderisi kalmadıysa (silindi/yenilendi) filtreyi sıfırla.
  useEffect(() => {
    if (sehir && !sehirler.some((x) => x.sehir === sehir)) setSehir(null);
  }, [sehir, sehirler]);

  const liste = useMemo(
    () => akisiSuz(gonderiler, { filtre, ara, maksKm, sehir, siralama }),
    [filtre, ara, maksKm, sehir, siralama, gonderiler],
  );
  const suzulu = filtre !== 'tumu' || !!sehir || !!ara.trim();

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
            {filtre === 'yakin' ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filtreSerit, styles.altSerit]} accessibilityLabel="Mesafe">
                {MESAFELER.map((km) => (
                  <Hap key={km ?? 'hepsi'} etiket={km == null ? 'Sınırsız' : `${km} km`} secili={maksKm === km} onPress={() => setMaksKm(km)} />
                ))}
              </ScrollView>
            ) : null}
            {sehirler.length > 1 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filtreSerit, styles.altSerit]} accessibilityLabel="Şehir">
                <Hap etiket="Tüm şehirler" ikon="konum" secili={sehir === null} onPress={() => setSehir(null)} />
                {sehirler.map((x) => (
                  <Hap key={x.sehir} etiket={`${x.sehir} · ${x.sayi}`} secili={sehir === x.sehir} onPress={() => setSehir(sehir === x.sehir ? null : x.sehir)} />
                ))}
              </ScrollView>
            ) : null}
          </View>
        }
      />

      <FlatList
        data={liste}
        keyExtractor={(g) => g.id}
        ListHeaderComponent={
          <View style={styles.baslikAlani}>
            <YonetimBanneri />
            {suruculer.length > 0 ? (
              <View style={styles.suruculer}>
                <Text style={[styles.bolumBaslik, { color: c.textMuted }]}>SÜRÜCÜLER</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.surucuSerit} keyboardShouldPersistTaps="handled">
                  {suruculer.map((k) => (
                    <Pressable
                      key={k.id}
                      onPress={() => router.push(`/profil/${k.id}` as Href)}
                      accessibilityRole="button"
                      accessibilityLabel={`${k.ad} profilini aç`}
                      style={[styles.surucu, { backgroundColor: c.surface, borderColor: c.border }]}>
                      <Avatar name={k.ad} uri={k.avatarUrl} size="md" />
                      <Text style={[styles.surucuAd, { color: c.text }]} numberOfLines={1}>{k.ad}</Text>
                      <Text style={[styles.surucuKullanici, { color: c.textMuted }]} numberOfLines={1}>@{k.kullanici}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
            {filtre !== 'yakin' ? (
              <View style={styles.siralamaSatiri}>
                <Text style={[styles.bolumBaslik, { color: c.textMuted }]}>{liste.length} GÖNDERİ</Text>
                <Pressable
                  onPress={() => setSiralama(siralama === 'yeni' ? 'selam' : 'yeni')}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Sıralama: ${siralama === 'yeni' ? 'en yeni' : 'en çok selam'}. Değiştir`}>
                  <Text style={[styles.siralamaYazi, { color: c.primary }]}>{siralama === 'yeni' ? 'En yeni' : 'En çok selam'}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <GonderiKarti g={item} />}
        contentContainerStyle={[styles.icerik, { paddingTop: ust + spacing.sm, paddingBottom: bosluk }]}
        ListEmptyComponent={
          <Text style={[styles.bos, { color: c.textMuted }]}>
            {filtre === 'yakin' && gonderiler.every((g) => g.mesafeKm >= 9999)
              ? 'Yakınındakiler için konum gerekli. Konum iznini aç ya da Konumum alanından bir yer seç.'
              : filtre === 'yakin' && maksKm != null
                ? `${maksKm} km çevrende gönderi yok. Mesafeyi artırmayı dene.`
                : ara.trim() ? 'Aramaya uyan gönderi yok.' : suzulu ? 'Bu filtrede gönderi yok.' : 'Henüz gönderi yok.'}
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
  altSerit: { marginTop: spacing.sm },
  baslikAlani: { gap: spacing.md },
  suruculer: { gap: spacing.sm },
  bolumBaslik: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  surucuSerit: { gap: spacing.sm },
  surucu: { width: 104, alignItems: 'center', gap: 4, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
  surucuAd: { fontSize: 13, fontWeight: '800', maxWidth: 88 },
  surucuKullanici: { fontSize: 11.5, maxWidth: 88 },
  siralamaSatiri: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  siralamaYazi: { fontSize: 13, fontWeight: '800' },
  icerik: { padding: spacing.lg, paddingBottom: spacing.xxl + 24, gap: spacing.md },
  bos: { textAlign: 'center', marginTop: spacing.xxl, fontSize: 15 },
});
