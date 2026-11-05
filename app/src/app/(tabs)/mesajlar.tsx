import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAltMenuBosluk } from '@/components/alt-menu';
import { EkranUstu } from '@/components/ekran-ustu';
import { Ikon } from '@/components/ikon';
import { Hap } from '@/components/yol-ui';
import { demoSohbetler, type Sohbet } from '@/demo/mesajlar';
import { useAkis } from '@/lib/akis';
import { odalarim } from '@/lib/sohbet';
import { listeZamani } from '@/lib/zaman';
import { Image } from 'expo-image';
import { supabase } from '@/lib/supabase';
import { radius, spacing, useTheme } from '@/theme';

type Filtre = 'tumu' | 'dm' | 'grup';
const FILTRELER: { id: Filtre; ad: string }[] = [
  { id: 'tumu', ad: 'Tümü' },
  { id: 'dm', ad: 'Birebir' },
  { id: 'grup', ad: 'Sürüş Grupları' },
];

/** Mesajlar: birebir yazışmalar ve grup sürüş sohbetleri. Satıra dokununca okundu olur. */
export default function Mesajlar() {
  const c = useTheme();
  const bosluk = useAltMenuBosluk();
  const [ust, setUst] = useState(110);
  const [filtre, setFiltre] = useState<Filtre>('tumu');
  const [okunan, setOkunan] = useState<string[]>([]);

  const router = useRouter();
  const [gercek, setGercek] = useState<Sohbet[]>([]);
  const { canli } = useAkis();

  // Gerçek modda: üyesi olduğun grup sohbetleri (ekran her açıldığında yenilenir).
  useFocusEffect(
    useCallback(() => {
      if (!supabase) return;
      odalarim().then((odalar) =>
        setGercek(
          odalar.map((o) => ({
            id: o.id,
            tur: o.tur,
            ad: o.ad,
            son: o.son,
            sonTur: o.sonTur ?? undefined,
            zaman: o.zaman ? listeZamani(o.zaman) : '',
            okunmamis: o.okunmamis,
            uye: o.uye,
            bekleyenIstek: o.bekleyen,
            avatarUrl: o.karsiAvatar,
          })),
        ),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canli.istek, canli.mesaj]),
  );

  const kaynak = supabase ? gercek : demoSohbetler;
  const liste = useMemo(() => kaynak.filter((s) => filtre === 'tumu' || s.tur === filtre), [kaynak, filtre]);

  const ac = (s: Sohbet) => {
    if (supabase) {
      router.push({ pathname: '/sohbet/[id]', params: { id: s.id, ad: s.ad } } as unknown as Href);
      return;
    }
    setOkunan((o) => (o.includes(s.id) ? o : [...o, s.id]));
  };

  return (
    <View style={[styles.ekran, { backgroundColor: c.bg }]}>
      <EkranUstu
        baslik="Mesajlar"
        onYukseklik={setUst}
        alt={
          <View style={[styles.filtreler, { borderBottomColor: c.border }]}>
            {FILTRELER.map((f) => (
              <Hap key={f.id} etiket={f.ad} secili={f.id === filtre} onPress={() => setFiltre(f.id)} />
            ))}
          </View>
        }
      />

      <FlatList
        data={liste}
        keyExtractor={(s) => s.id}
        ListEmptyComponent={
          <Text style={[styles.bos, { color: c.textMuted }]}>Henüz sohbetin yok. Bir sürüş paylaşırsan grubu burada açılır; haritada bir sürüşe katılma isteği gönderirsen kabul edilince grup burada görünür.</Text>
        }
        contentContainerStyle={[styles.icerik, { paddingTop: ust, paddingBottom: bosluk }]}
        ItemSeparatorComponent={() => <View style={[styles.ayirac, { backgroundColor: c.border }]} />}
        renderItem={({ item: s }) => {
          const yeni = okunan.includes(s.id) ? 0 : s.okunmamis;
          return (
            <Pressable
              onPress={() => ac(s)}
              accessibilityRole="button"
              accessibilityLabel={`${s.ad}, ${yeni} okunmamış mesaj`}
              style={({ pressed }) => [styles.satir, pressed && { backgroundColor: c.surface }]}>
              <View style={[styles.avatar, { backgroundColor: s.tur === 'grup' ? c.primary : c.surfaceAlt, overflow: 'hidden' }]}>
                {s.avatarUrl ? (
                  <Image source={{ uri: s.avatarUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
                ) : s.tur === 'grup' ? (
                  <Ikon ad="topluluk" boyut={22} renk={c.onPrimary} />
                ) : (
                  <Text style={[styles.avatarYazi, { color: c.primary }]}>{s.ad.charAt(0)}</Text>
                )}
                {s.tur === 'dm' && s.cevrimici ? <View style={[styles.cevrimici, { backgroundColor: c.success, borderColor: c.bg }]} /> : null}
              </View>
              <View style={styles.yazilar}>
                <View style={styles.ustSatir}>
                  <Text style={[styles.ad, { color: c.text }]} numberOfLines={1}>
                    {s.ad}
                  </Text>
                  <Text style={[styles.zaman, { color: yeni ? c.primary : c.textMuted }]}>{s.zaman}</Text>
                </View>
                <View style={styles.ustSatir}>
                  <View style={styles.sonSatir}>
                    {s.sonTur === 'image' || s.sonTur === 'location' ? (
                      <Ikon ad={s.sonTur === 'image' ? 'foto' : 'konum'} boyut={14} renk={yeni ? c.primary : c.textMuted} />
                    ) : null}
                    <Text style={[styles.son, { color: yeni ? c.text : c.textMuted }]} numberOfLines={1}>
                      {s.sonTur === 'image' ? 'Fotoğraf' : s.sonTur === 'location' ? 'Konum' : s.son || 'Henüz mesaj yok'}
                    </Text>
                  </View>
                  {yeni ? (
                    <View style={[styles.rozet, { backgroundColor: c.primary }]}>
                      <Text style={[styles.rozetYazi, { color: c.onPrimary }]}>{yeni}</Text>
                    </View>
                  ) : null}
                </View>
                {s.tur === 'grup' ? (
                  <Text style={[styles.uye, { color: c.textMuted }]}>
                    {s.uye} sürücü
                    {s.bekleyenIstek ? <Text style={{ color: c.primary, fontWeight: '800' }}>  •  {s.bekleyenIstek} katılma isteği</Text> : null}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  filtreler: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  icerik: { paddingBottom: spacing.xxl + 24 },
  ayirac: { height: StyleSheet.hairlineWidth, marginLeft: spacing.lg + 52 + spacing.md },
  satir: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  avatar: { width: 52, height: 52, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  avatarYazi: { fontSize: 20, fontWeight: '900' },
  cevrimici: { position: 'absolute', right: 0, bottom: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2.5 },
  yazilar: { flex: 1, gap: 3 },
  ustSatir: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  ad: { flex: 1, fontSize: 16, fontWeight: '800' },
  zaman: { fontSize: 12, fontWeight: '600' },
  sonSatir: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  son: { flexShrink: 1, fontSize: 14 },
  rozet: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  rozetYazi: { fontSize: 12, fontWeight: '900' },
  uye: { fontSize: 12 },
  bos: { textAlign: 'center', padding: spacing.xl, fontSize: 14, lineHeight: 20 },
});
