import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ikon, type IkonAdi } from '@/components/ikon';
import { Avatar } from '@/components/ui/avatar';
import { kanalBul } from '@/demo/kategoriler';
import { demoGonderiler, gonderiTurleri, type Gonderi, type GonderiTuru } from '@/demo/gonderiler';
import { useKanallar } from '@/lib/kanallar';
import { fontSerif, radius, spacing, useTheme } from '@/theme';

type Filtre = 'Tümü' | GonderiTuru;
const FILTRELER: Filtre[] = ['Tümü', ...gonderiTurleri];

function Etiket({ yazi, ikon, arka, renk }: { yazi: string; ikon?: IkonAdi; arka: string; renk: string }) {
  return (
    <View style={[styles.etiket, { backgroundColor: arka }]}>
      {ikon ? <Ikon ad={ikon} boyut={11} renk={renk} /> : null}
      <Text style={[styles.etiketYazi, { color: renk }]}>{yazi}</Text>
    </View>
  );
}

function GonderiKarti({ g, begendi, onBegen }: { g: Gonderi; begendi: boolean; onBegen: () => void }) {
  const c = useTheme();
  const kanal = kanalBul(g.kanal);
  return (
    <View style={[styles.kart, { backgroundColor: c.bg, borderColor: c.border, shadowColor: c.text }]}>
      <View style={styles.etiketler}>
        {g.sabit ? <Etiket yazi="Sabit" ikon="sabit" arka={c.tintYesil} renk={c.success} /> : null}
        <Etiket yazi={g.tur} arka={c.tintMavi} renk={c.info} />
        {kanal ? <Etiket yazi={kanal.oge.ad} arka={c.tintTuruncu} renk={c.primary} /> : null}
      </View>

      <View style={styles.yazar}>
        <Avatar name={g.yazar} size="sm" />
        <Text style={[styles.yazarAd, { color: c.text }]} numberOfLines={1}>
          {g.yazar}
        </Text>
        <Text style={[styles.zaman, { color: c.textMuted }]}>· {g.zaman}</Text>
      </View>

      <Text style={[styles.baslik, { color: c.text, fontFamily: fontSerif }]}>{g.baslik}</Text>
      <Text style={[styles.ozet, { color: c.textMuted }]} numberOfLines={3}>
        {g.ozet}
      </Text>

      <View style={styles.alt}>
        <View style={styles.sayi}>
          <Ikon ad="yorum" boyut={16} renk={c.textMuted} />
          <Text style={[styles.sayiYazi, { color: c.textMuted }]}>{g.yorum}</Text>
        </View>
        <Pressable
          onPress={onBegen}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={begendi ? 'Beğeniyi geri al' : 'Beğen'}
          style={styles.sayi}>
          <Ikon ad={begendi ? 'kalp' : 'kalpBos'} boyut={16} renk={begendi ? c.primary : c.textMuted} />
          <Text style={[styles.sayiYazi, { color: begendi ? c.primary : c.textMuted }]}>{g.begeni + (begendi ? 1 : 0)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Keşfet (ana sayfa): katıldığın kanallarda yazılan gönderiler. Menüden bir kanal seçilirse yalnız o kanal gösterilir. */
export default function Kesfet() {
  const c = useTheme();
  const router = useRouter();
  const { kanal: kanalParam } = useLocalSearchParams<{ kanal?: string }>();
  const { kanallar, degistir } = useKanallar();
  const [filtre, setFiltre] = useState<Filtre>('Tümü');
  const [begenilen, setBegenilen] = useState<string[]>([]);

  // Seçili kanal artık katılınmıyorsa (ayrıldıysan) filtreyi yok say.
  const kanalAnahtar = kanalParam && kanallar.includes(kanalParam) ? kanalParam : undefined;
  const kanal = kanalAnahtar ? kanalBul(kanalAnahtar) : undefined;

  const kapsam = useMemo(
    () => demoGonderiler.filter((g) => (kanalAnahtar ? g.kanal === kanalAnahtar : kanallar.includes(g.kanal))),
    [kanalAnahtar, kanallar],
  );
  const gorunen = useMemo(() => {
    const liste = kapsam.filter((g) => filtre === 'Tümü' || g.tur === filtre);
    return [...liste.filter((g) => g.sabit), ...liste.filter((g) => !g.sabit)];
  }, [kapsam, filtre]);

  const tumKanallar = () => router.setParams({ kanal: '' });
  const topluluklar = () => router.navigate('/topluluklar' as Href);
  const begen = (id: string) => setBegenilen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  const sayi = (t: GonderiTuru) => kapsam.filter((g) => g.tur === t).length;
  const istatistik = [
    { deger: kanal ? 1 : kanallar.length, etiket: 'Kanal' },
    { deger: kapsam.length, etiket: 'Gönderi' },
    { deger: sayi('Soru'), etiket: 'Soru' },
    { deger: sayi('Makale'), etiket: 'Makale' },
  ];

  const ust = (
    <View>
      <View style={[styles.ozet2, { backgroundColor: c.navy }]}>
        <Text style={[styles.ozetBaslik, { color: c.onAccent, fontFamily: fontSerif }]}>
          {kanal ? kanal.oge.ad : 'Keşfet'}
        </Text>
        <Text style={[styles.ozetMetin, { color: c.onNavyMuted }]}>
          {kanal
            ? `${kanal.kategori.ad} kanalı. Bu kanalda paylaşılan gönderiler, sorular ve deneyimler.`
            : 'Katıldığın kanallarda yazılan son gönderiler, sorular ve deneyimler burada.'}
        </Text>

        <View style={styles.istatistikler}>
          {istatistik.map((i) => (
            <View key={i.etiket} style={styles.istatistik}>
              <Text style={[styles.istatistikDeger, { color: c.onAccent }]}>{i.deger}</Text>
              <Text style={[styles.istatistikEtiket, { color: c.onNavyMuted }]}>{i.etiket}</Text>
            </View>
          ))}
        </View>

        <View style={styles.dugmeler}>
          {kanal ? (
            <>
              <Pressable onPress={tumKanallar} accessibilityRole="button" style={[styles.dugme, { backgroundColor: c.bg }]}>
                <Text style={[styles.dugmeYazi, { color: c.text }]}>Tüm kanallarım</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (kanalAnahtar) degistir(kanalAnahtar);
                  tumKanallar();
                }}
                accessibilityRole="button"
                style={[styles.dugme, { backgroundColor: c.navyYuzey }]}>
                <Text style={[styles.dugmeYazi, { color: c.onAccent }]}>Kanaldan ayrıl</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={topluluklar} accessibilityRole="button" style={[styles.dugme, { backgroundColor: c.bg }]}>
              <Ikon ad="grup" boyut={14} renk={c.text} />
              <Text style={[styles.dugmeYazi, { color: c.text }]}>Yeni topluluklara katıl</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtreler}>
        {FILTRELER.map((f) => {
          const aktif = f === filtre;
          return (
            <Pressable
              key={f}
              onPress={() => setFiltre(f)}
              accessibilityRole="tab"
              accessibilityState={{ selected: aktif }}
              style={[styles.filtre, aktif ? { backgroundColor: c.header, borderColor: c.header } : { backgroundColor: c.bg, borderColor: c.border }]}>
              <Text style={[styles.filtreYazi, { color: aktif ? c.onAccent : c.text }]}>{f}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <FlatList
      style={{ backgroundColor: c.surface }}
      data={gorunen}
      keyExtractor={(g) => g.id}
      ListHeaderComponent={ust}
      contentContainerStyle={styles.icerik}
      renderItem={({ item }) => (
        <GonderiKarti g={item} begendi={begenilen.includes(item.id)} onBegen={() => begen(item.id)} />
      )}
      ListEmptyComponent={
        kanallar.length === 0 ? (
          <View style={[styles.bosKart, { backgroundColor: c.bg, borderColor: c.border }]}>
            <View style={[styles.bosIkon, { backgroundColor: c.surfaceAlt }]}>
              <Ikon ad="grup" boyut={30} renk={c.primary} />
            </View>
            <Text style={[styles.bosBaslik, { color: c.text }]}>Henüz bir kanala katılmadın</Text>
            <Text style={[styles.bosMetin, { color: c.textMuted }]}>
              Kanalları incele ve yeni topluluklara katıl. Katıldığın kanalların gönderileri burada görünür.
            </Text>
            <Pressable onPress={topluluklar} accessibilityRole="button" style={[styles.bosDugme, { backgroundColor: c.primary }]}>
              <Text style={[styles.bosDugmeYazi, { color: c.onAccent }]}>Kanalları incele</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={[styles.bos, { color: c.textMuted }]}>
            {filtre === 'Tümü' ? 'Bu kanallarda henüz gönderi yok.' : `Bu kanallarda ${filtre.toLocaleLowerCase('tr')} türünde gönderi yok.`}
          </Text>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  icerik: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  ozet2: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md },
  ozetBaslik: { fontSize: 28, fontWeight: '600' },
  ozetMetin: { fontSize: 15, lineHeight: 21 },
  istatistikler: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  istatistik: { gap: 2 },
  istatistikDeger: { fontSize: 26, fontWeight: '600' },
  istatistikEtiket: { fontSize: 13 },
  dugmeler: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  dugme: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md },
  dugmeYazi: { fontSize: 15, fontWeight: '600' },
  filtreler: { gap: spacing.sm, paddingVertical: spacing.lg },
  filtre: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: StyleSheet.hairlineWidth },
  filtreYazi: { fontSize: 15, fontWeight: '500' },
  kart: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  etiketler: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  etiket: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm + 2, paddingVertical: 4, borderRadius: radius.sm },
  etiketYazi: { fontSize: 12, fontWeight: '600' },
  yazar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  yazarAd: { fontSize: 15, fontWeight: '500', flexShrink: 1 },
  zaman: { fontSize: 13 },
  baslik: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  ozet: { fontSize: 15, lineHeight: 21 },
  alt: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.xs },
  sayi: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sayiYazi: { fontSize: 14 },
  bosKart: { alignItems: 'center', borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.xl, gap: spacing.md },
  bosIkon: { width: 64, height: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  bosBaslik: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  bosMetin: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  bosDugme: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: spacing.md, borderRadius: radius.md, marginTop: spacing.sm },
  bosDugmeYazi: { fontSize: 16, fontWeight: '700' },
  bos: { textAlign: 'center', marginTop: spacing.xl, fontSize: 15 },
});
