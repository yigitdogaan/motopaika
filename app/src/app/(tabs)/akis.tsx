import { useEffect, useMemo, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Animated, Easing, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { EkranUstu } from '@/components/ekran-ustu';
import { Ikon } from '@/components/ikon';
import { AkisFiltrePaneli } from '@/components/akis-filtre-paneli';
import { IlkIpucu } from '@/components/ilk-ipucu';
import { IskeletKart } from '@/components/iskelet';
import { KonumAlani } from '@/components/konum-alani';
import { YonetimBanneri } from '@/components/yonetim-banneri';
import { GonderiKarti } from '@/components/gonderi-karti';
import { Hap } from '@/components/yol-ui';
import { gonderiKategorileri, type KategoriId } from '@/demo/akis';
import { useAltMenuBosluk } from '@/components/alt-menu';
import { Avatar } from '@/components/ui/avatar';
import { pasifMi, useAkis } from '@/lib/akis';
import { akisiSuz, bitenleriSona, panelFiltreSayisi, sehirListesi, VARSAYILAN_FILTRE, type FiltreSecimi, type Kapsam, type Siralama } from '@/lib/akis-filtre';
import { hafifTitresim } from '@/lib/titresim';
import { surucuAra, type SurucuSonucu } from '@/lib/surucu-ara';
import { radius, spacing, useTheme } from '@/theme';

// Üst çipler yalnız kategoriler (kısa adlarıyla, kendi renkleriyle): hepsi tek satıra sığar.
// Anonim Duvar, Yakınımdakiler, şehir ve sıralama "Filtre" panelinde toplanır.
const KATEGORI_CIPLERI = (['surus', 'geyik', 'uyari', 'teknik'] as KategoriId[]).map((id) => {
  const k = gonderiKategorileri.find((x) => x.id === id)!;
  return { id, ad: k.kisa, renk: k.renk };
});

/** Seçili panel filtrelerinin okunur özeti (üstteki kaldırılabilir etiketler için). */
function kapsamYazisi(kapsam: Kapsam, maksKm: number | null): string {
  if (kapsam === 'anonim') return 'Anonim Duvar';
  return `Yakınımdakiler · ${maksKm == null ? 'Sınırsız' : `${maksKm} km`}`;
}

/** Seçili bir filtreyi gösteren, dokununca kaldıran küçük etiket. */
function Etiket({ yazi, onKaldir }: { yazi: string; onKaldir: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onKaldir}
      accessibilityRole="button"
      accessibilityLabel={`${yazi} filtresini kaldır`}
      style={[styles.etiket, { backgroundColor: `${c.primary}22`, borderColor: c.primary }]}>
      <Text style={[styles.etiketYazi, { color: c.primary }]}>{yazi}</Text>
      <Ikon ad="kapat" boyut={11} renk={c.primary} />
    </Pressable>
  );
}

/** Ana akış (duvar). */
export default function Akis() {
  const c = useTheme();
  const bosluk = useAltMenuBosluk();
  const [ust, setUst] = useState(150);
  const { gonderiler, yukleniyor, yenile } = useAkis();
  const [kategori, setKategori] = useState<KategoriId | null>(null);
  const [kapsam, setKapsam] = useState<Kapsam>('hepsi');
  const [panelAcik, setPanelAcik] = useState(false);
  const [yenileniyor, setYenileniyor] = useState(false);
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

  const [maksKm, setMaksKm] = useState<number | null>(VARSAYILAN_FILTRE.maksKm);
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

  const secim: FiltreSecimi = { kategori, kapsam, ara, maksKm, sehir, siralama };
  // Süresi dolan sürüşler listenin sonuna iner: yeni içeriği aşağı itmesin.
  const liste = useMemo(
    () => bitenleriSona(akisiSuz(gonderiler, { kategori, kapsam, ara, maksKm, sehir, siralama }), pasifMi),
    [kategori, kapsam, ara, maksKm, sehir, siralama, gonderiler],
  );
  const suzulu = kategori !== null || kapsam !== 'hepsi' || !!sehir || !!ara.trim();
  const panelSayisi = panelFiltreSayisi(secim);
  const panelDegis = (y: Partial<FiltreSecimi>) => {
    if (y.kapsam !== undefined) setKapsam(y.kapsam);
    if (y.maksKm !== undefined) setMaksKm(y.maksKm);
    if (y.sehir !== undefined) setSehir(y.sehir);
    if (y.siralama !== undefined) setSiralama(y.siralama);
  };
  const yenileDokun = async () => {
    setYenileniyor(true);
    try {
      await yenile();
    } finally {
      setYenileniyor(false);
    }
  };
  const kategoriSec = (k: KategoriId | null) => {
    hafifTitresim();
    setKategori(k);
  };

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
                  autoCapitalize="none"
                  style={[styles.araGirdi, { color: c.text }]}
                />
                {ara ? (
                  <Pressable onPress={() => setAra('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Aramayı temizle">
                    <Ikon ad="kapat" boyut={14} renk={c.textMuted} />
                  </Pressable>
                ) : null}
              </View>
            </Animated.View>
            <View style={styles.cipSatiri}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cipKaydirma} contentContainerStyle={styles.filtreSerit}>
                <Hap etiket="Tümü" secili={kategori === null} onPress={() => kategoriSec(null)} />
                {KATEGORI_CIPLERI.map((k) => (
                  <Hap key={k.id} etiket={k.ad} renk={k.renk} secili={kategori === k.id} onPress={() => kategoriSec(kategori === k.id ? null : k.id)} />
                ))}
              </ScrollView>
            </View>
            {panelSayisi ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filtreSerit, styles.altSerit]} accessibilityLabel="Seçili filtreler">
                {kapsam !== 'hepsi' ? <Etiket yazi={kapsamYazisi(kapsam, maksKm)} onKaldir={() => setKapsam('hepsi')} /> : null}
                {sehir ? <Etiket yazi={sehir} onKaldir={() => setSehir(null)} /> : null}
                {siralama !== 'yeni' ? <Etiket yazi="En çok selam" onKaldir={() => setSiralama('yeni')} /> : null}
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
            <IlkIpucu />
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
          </View>
        }
        renderItem={({ item }) => <GonderiKarti g={item} />}
        contentContainerStyle={[styles.icerik, { paddingTop: ust + spacing.sm, paddingBottom: bosluk }]}
        refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenileDokun} tintColor="transparent" colors={['transparent']} progressViewOffset={ust} />}
        ListEmptyComponent={
          yukleniyor && gonderiler.length === 0 ? (
            <View style={styles.iskeletler}>
              <IskeletKart />
              <IskeletKart />
              <IskeletKart />
            </View>
          ) : (
            <View style={styles.bosAlan}>
              <Text style={[styles.bos, { color: c.textMuted }]}>
                {kapsam === 'yakin' && gonderiler.every((g) => g.mesafeKm >= 9999)
                  ? 'Yakınındakiler için konum gerekli. Konum iznini aç ya da Konumum alanından bir yer seç.'
                  : kapsam === 'yakin' && maksKm != null
                    ? `${maksKm} km çevrende gönderi yok. Mesafeyi artırmayı dene.`
                    : ara.trim() ? 'Aramaya uyan gönderi yok.' : suzulu ? 'Bu filtrede gönderi yok.' : 'Henüz gönderi yok. İlk gönderiyi sen paylaş!'}
              </Text>
              {suzulu ? (
                <Pressable
                  onPress={() => {
                    setKategori(null);
                    setKapsam('hepsi');
                    setSehir(null);
                    setAra('');
                  }}
                  accessibilityRole="button"
                  hitSlop={8}>
                  <Text style={[styles.bosDugme, { color: c.primary }]}>Filtreleri temizle</Text>
                </Pressable>
              ) : null}
            </View>
          )
        }
      />
      {yenileniyor ? (
        <View style={[styles.yenileniyor, { top: ust + spacing.sm, backgroundColor: c.surface, borderColor: c.border }]} pointerEvents="none">
          <ActivityIndicator size="small" color={c.primary} />
          <Text style={[styles.yenileniyorYazi, { color: c.text }]}>Yenileniyor...</Text>
        </View>
      ) : null}
      <Pressable
              onPress={() => setPanelAcik(true)}
              accessibilityRole="button"
              accessibilityLabel={panelSayisi ? `Filtre, ${panelSayisi} ayar seçili` : 'Filtre'}
              style={[styles.filtreDugme, styles.yuzenFiltre, { bottom: bosluk - 6,  backgroundColor: c.surface, borderColor: panelSayisi ? c.primary : c.border }]}>
              <Ikon ad="filtre" boyut={22} renk={panelSayisi ? c.primary : c.text} />
              {panelSayisi ? (
                <View style={[styles.filtreRozet, styles.filtreRozetKose, { backgroundColor: c.primary }]}>
                  <Text style={[styles.filtreRozetYazi, { color: c.onPrimary }]}>{panelSayisi}</Text>
                </View>
              ) : null}
            </Pressable>
      <AkisFiltrePaneli gorunur={panelAcik} onKapat={() => setPanelAcik(false)} secim={secim} onDegis={panelDegis} sehirler={sehirler} sonucSayisi={liste.length} />
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
  cipSatiri: { flexDirection: 'row', alignItems: 'center' },
  cipKaydirma: { flex: 1 },
  filtreDugme: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 9, marginHorizontal: spacing.md, borderRadius: radius.full, borderWidth: 1 },
  yuzenFiltre: { position: 'absolute', right: 23, marginHorizontal: 0, width: 46, height: 46, paddingHorizontal: 0, paddingVertical: 0, justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  filtreYazi: { fontSize: 14, fontWeight: '700' },
  filtreRozet: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  filtreRozetKose: { position: 'absolute', top: -4, right: -4 },
  filtreRozetYazi: { fontSize: 11, fontWeight: '800' },
  etiket: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1 },
  etiketYazi: { fontSize: 13, fontWeight: '700' },
  iskeletler: { gap: spacing.md },
  bosAlan: { alignItems: 'center', gap: spacing.md, marginTop: spacing.xxl },
  bosDugme: { fontSize: 15, fontWeight: '800' },
  yenileniyor: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, zIndex: 20 },
  yenileniyorYazi: { fontSize: 13.5, fontWeight: '700' },
  filtreSerit: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  altSerit: { marginTop: spacing.sm },
  baslikAlani: { gap: spacing.md },
  suruculer: { gap: spacing.sm },
  bolumBaslik: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  surucuSerit: { gap: spacing.sm },
  surucu: { width: 104, alignItems: 'center', gap: 4, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
  surucuAd: { fontSize: 13, fontWeight: '800', maxWidth: 88 },
  surucuKullanici: { fontSize: 11.5, maxWidth: 88 },
  icerik: { padding: spacing.lg, paddingBottom: spacing.xxl + 24, gap: spacing.md },
  bos: { textAlign: 'center', fontSize: 15, lineHeight: 22 },
});
