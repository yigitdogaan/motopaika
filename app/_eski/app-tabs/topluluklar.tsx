import { useMemo, useRef, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ikon, type IkonAdi } from '@/components/ikon';
import { favoriAnahtari, kategoriler, type KategoriId, type KategoriOgesi } from '@/demo/kategoriler';
import { useKanallar } from '@/lib/kanallar';
import { radius, spacing, useTheme } from '@/theme';

const FAVORI = '★';
const INDEKS_GENISLIK = 28;
const KATEGORI_ETIKET: Record<KategoriId, string> = { markalar: 'Marka', sehirler: 'Şehir', sosyal: 'Sosyal' };

type Bolum = { baslik: string; data: KategoriOgesi[] };
type FavoriOge = KategoriOgesi & { kategori: KategoriId; anahtar: string };

/** Kanallarım ve kategori listesinde ortak madde kutusu. Katıl/Katıldın düğmesi üyeliği aç/kapatır. */
function Madde({
  ad,
  altYazi,
  fav,
  onYildiz,
  onPress,
}: {
  ad: string;
  altYazi?: string;
  fav: boolean;
  onYildiz: () => void;
  onPress?: () => void;
}) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [
        styles.madde,
        { backgroundColor: c.bg, borderColor: c.border, shadowColor: c.text, opacity: pressed ? 0.7 : 1 },
      ]}>
      <View style={styles.maddeYazi}>
        <Text style={[styles.maddeAd, { color: c.text }]} numberOfLines={1}>
          {ad}
        </Text>
        {altYazi ? <Text style={[styles.maddeAlt, { color: c.textMuted }]}>{altYazi}</Text> : null}
      </View>
      <Pressable
        onPress={onYildiz}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={fav ? `${ad} kanalından ayrıl` : `${ad} kanalına katıl`}
        style={({ pressed }) => [
          styles.katil,
          fav ? { borderColor: c.border } : { backgroundColor: c.primary, borderColor: c.primary },
          pressed && { opacity: 0.7 },
        ]}>
        <Text style={[styles.katilYazi, { color: fav ? c.textMuted : c.onAccent }]}>{fav ? 'Katıldın' : 'Katıl'}</Text>
      </Pressable>
    </Pressable>
  );
}

type Secim = 'kanallarim' | KategoriId;

const SEKMELER: { id: Secim; ad: string; ikon: IkonAdi }[] = [
  { id: 'kanallarim', ad: 'Kanallarım', ikon: 'kalp' },
  ...kategoriler.map((k) => ({ id: k.id, ad: k.ad, ikon: k.ikon })),
];

/** Topluluklar: arama, dört düğme (Kanallarım · Markalar · Şehirler · Sosyal) ve seçilenin listesi. Açılışta Kanallarım. */
export default function Topluluklar() {
  const c = useTheme();
  const liste = useRef<SectionList<KategoriOgesi, Bolum>>(null);
  const { kanallar: favoriler, degistir } = useKanallar();
  const [secili, setSecili] = useState<Secim>('kanallarim');
  const [arama, setArama] = useState('');

  const kategori = kategoriler.find((k) => k.id === secili);
  const q = arama.trim().toLocaleLowerCase('tr');
  const eslesir = (ad: string) => !q || ad.toLocaleLowerCase('tr').includes(q);

  // Tüm kategorilerdeki favoriler (kategori sırasıyla).
  const tumFavoriler = useMemo<FavoriOge[]>(
    () =>
      kategoriler.flatMap((k) =>
        k.ogeler
          .map((o) => ({ ...o, kategori: k.id, anahtar: favoriAnahtari(k.id, o.id) }))
          .filter((o) => favoriler.includes(o.anahtar)),
      ),
    [favoriler],
  );

  const bolumler = useMemo<Bolum[]>(() => {
    if (!kategori) return [];
    const q = arama.trim().toLocaleLowerCase('tr');
    const uygun = kategori.ogeler.filter((m) => !q || m.ad.toLocaleLowerCase('tr').includes(q));
    const favMi = (o: KategoriOgesi) => favoriler.includes(favoriAnahtari(kategori.id, o.id));
    const harfler = new Map<string, KategoriOgesi[]>();
    for (const o of [...uygun.filter((o) => !favMi(o))].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'))) {
      const h = o.ad[0].toLocaleUpperCase('tr');
      harfler.set(h, [...(harfler.get(h) ?? []), o]);
    }
    const fav = uygun.filter(favMi);
    return [
      ...(fav.length ? [{ baslik: FAVORI, data: fav }] : []),
      ...[...harfler].map(([baslik, data]) => ({ baslik, data })),
    ];
  }, [arama, favoriler, kategori]);

  const gorunenFavoriler = tumFavoriler.filter((f) => eslesir(f.ad));

  const sec = (id: Secim) => {
    setSecili(id);
    setArama('');
  };

  const git = (i: number) =>
    liste.current?.scrollToLocation({ sectionIndex: i, itemIndex: 0, viewPosition: 0, animated: true });

  const ust = (
    <View>
      <View style={[styles.arama, { backgroundColor: c.surfaceAlt }]}>
        <Ikon ad="ara" boyut={16} renk={c.textMuted} />
        <TextInput
          value={arama}
          onChangeText={setArama}
          placeholder={kategori ? `${kategori.ad} içinde ara` : 'Kanallarda ara'}
          placeholderTextColor={c.textMuted}
          style={[styles.aramaYazi, { color: c.text }]}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      <View style={styles.kategoriler}>
        {SEKMELER.map((k) => {
          const aktif = k.id === secili;
          return (
            <Pressable
              key={k.id}
              style={styles.kategori}
              onPress={() => sec(k.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: aktif }}>
              <View
                style={[
                  styles.daire,
                  aktif
                    ? { backgroundColor: c.primary, shadowColor: c.primary }
                    : { backgroundColor: c.bg, shadowColor: c.text, shadowOpacity: 0.06 },
                ]}>
                <Ikon ad={k.ikon} boyut={26} renk={aktif ? c.onAccent : c.primary} />
              </View>
              <Text
                style={[styles.kategoriYazi, { color: aktif ? c.text : c.textMuted }, aktif && styles.kalin]}
                numberOfLines={1}>
                {k.ad}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.baslikSatir}>
        <Text style={[styles.baslik, { color: c.text }]}>{kategori ? kategori.ad : 'Kanallarım'}</Text>
        {!kategori && tumFavoriler.length > 0 && (
          <Text style={[styles.sayi, { color: c.textMuted }]}>{tumFavoriler.length} kanal</Text>
        )}
      </View>

      {!kategori &&
        (gorunenFavoriler.length ? (
          gorunenFavoriler.map((f) => (
            <Madde
              key={f.anahtar}
              ad={f.ad}
              altYazi={KATEGORI_ETIKET[f.kategori]}
              fav
              onYildiz={() => degistir(f.anahtar)}
              onPress={() => sec(f.kategori)}
            />
          ))
        ) : q ? (
          <Text style={[styles.bos, { color: c.textMuted }]}>&quot;{arama}&quot; kanallarında yok.</Text>
        ) : (
          <View style={[styles.bosKart, { backgroundColor: c.bg, borderColor: c.border }]}>
            <View style={[styles.bosIkon, { backgroundColor: c.surfaceAlt }]}>
              <Ikon ad="grup" boyut={30} renk={c.primary} />
            </View>
            <Text style={[styles.bosBaslik, { color: c.text }]}>Henüz bir kanala katılmadın</Text>
            <Text style={[styles.bosMetin, { color: c.textMuted }]}>
              Kanalları incele ve yeni topluluklara katıl. Motor markanın, şehrinin ve ilgi alanlarının
              kanalları burada toplanır.
            </Text>
            <Pressable
              onPress={() => sec('markalar')}
              accessibilityRole="button"
              style={({ pressed }) => [styles.bosDugme, { backgroundColor: c.primary }, pressed && { opacity: 0.8 }]}>
              <Text style={[styles.bosDugmeYazi, { color: c.onAccent }]}>Kanalları incele</Text>
            </Pressable>
            <View style={styles.bosKisayollar}>
              {kategoriler.map((k) => (
                <Pressable
                  key={k.id}
                  onPress={() => sec(k.id)}
                  accessibilityRole="button"
                  style={[styles.bosKisayol, { borderColor: c.border }]}>
                  <Ikon ad={k.ikon} boyut={14} renk={c.primary} />
                  <Text style={[styles.bosKisayolYazi, { color: c.text }]}>{k.ad}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
    </View>
  );

  return (
    <View style={[styles.ekran, { backgroundColor: c.surface, paddingTop: spacing.lg }]}>
      <SectionList
        ref={liste}
        sections={bolumler}
        keyExtractor={(o) => o.id}
        ListHeaderComponent={ust}
        renderSectionHeader={() => null}
        stickySectionHeadersEnabled={false}
        initialNumToRender={100}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.icerik}
        onScrollToIndexFailed={() => {}}
        ListEmptyComponent={
          kategori && (
          <Text style={[styles.bos, { color: c.textMuted }]}>&quot;{arama}&quot; için sonuç bulunamadı.</Text>
          )
        }
        renderItem={({ item }) => {
          if (!kategori) return null;
          const fav = favoriler.includes(favoriAnahtari(kategori.id, item.id));
          return (
            <Madde ad={item.ad} fav={fav} onYildiz={() => degistir(favoriAnahtari(kategori.id, item.id))} />
          );
        }}
      />

      {kategori && !arama && bolumler.length > 1 && (
        <View style={styles.indeksKap} pointerEvents="box-none">
          <View style={[styles.indeks, { backgroundColor: c.surfaceAlt }]}>
            {bolumler.map((b, i) => (
              <Pressable key={b.baslik} onPress={() => git(i)} hitSlop={4} style={styles.harf}>
                {b.baslik === FAVORI ? (
                  <Text style={[styles.harfYazi, { color: c.primary }]}>✓</Text>
                ) : (
                  <Text style={[styles.harfYazi, { color: c.text }]}>{b.baslik}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  icerik: { paddingLeft: spacing.xl, paddingRight: spacing.xl + INDEKS_GENISLIK, paddingBottom: spacing.xxl },
  arama: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 46,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  aramaYazi: { fontSize: 16, minWidth: 40, paddingVertical: 0 },
  kategoriler: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl },
  kategori: { flex: 1, alignItems: 'center', gap: spacing.sm },
  daire: {
    width: 62,
    height: 58,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  kategoriYazi: { fontSize: 13, fontWeight: '500' },
  kalin: { fontWeight: '700' },
  sayi: { fontSize: 14 },
  baslikSatir: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  baslik: { fontSize: 24, fontWeight: '700' },
  bosKart: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
    gap: spacing.md,
  },
  bosIkon: { width: 64, height: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  bosBaslik: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  bosMetin: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  bosDugme: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  bosDugmeYazi: { fontSize: 16, fontWeight: '700' },
  bosKisayollar: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  bosKisayol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bosKisayolYazi: { fontSize: 13, fontWeight: '500' },
  madde: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  maddeYazi: { flex: 1, gap: 2 },
  maddeAd: { fontSize: 16, fontWeight: '500' },
  maddeAlt: { fontSize: 12 },
  katil: {
    minWidth: 84,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  katilYazi: { fontSize: 13, fontWeight: '700' },
  bos: { textAlign: 'center', marginTop: spacing.xl },
  indeksKap: { position: 'absolute', right: spacing.sm, top: 0, bottom: 0, justifyContent: 'center' },
  indeks: { width: 22, borderRadius: radius.full, paddingVertical: spacing.sm, alignItems: 'center', gap: 1 },
  harf: { alignItems: 'center', justifyContent: 'center', minHeight: 14 },
  harfYazi: { fontSize: 10, fontWeight: '600' },
});
