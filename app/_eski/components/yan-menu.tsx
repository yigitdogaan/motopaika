import { usePathname, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ikon, type IkonAdi } from '@/components/ikon';
import { Rozet } from '@/components/rozet';
import { Avatar } from '@/components/ui/avatar';
import { kanalBul } from '@/demo/kategoriler';
import { demoBildirim, demoGonderiler } from '@/demo/gonderiler';
import { useKanallar } from '@/lib/kanallar';
import { useOturum } from '@/lib/oturum';
import { fontSerif, radius, spacing, useTheme } from '@/theme';

const SAYFALAR: { rota: string; ad: string; ikon: IkonAdi; rozet?: number }[] = [
  { rota: '/kesfet', ad: 'Keşfet', ikon: 'pusula' },
  { rota: '/topluluklar', ad: 'Topluluklar', ikon: 'grup' },
  { rota: '/ikinci-el', ad: 'İkinci el', ikon: 'etiket' },
  { rota: '/rotalar', ad: 'Rotalar', ikon: 'motor' },
  { rota: '/etkinlik', ad: 'Etkinlik', ikon: 'takvim' },
  { rota: '/sohbet', ad: 'Sohbet', ikon: 'sohbet', rozet: demoBildirim.sohbet },
];

/** Demo: çevrimiçi sayısı kanal anahtarından türetilir (gerçek veri bağlanınca değişecek). */
const cevrimici = (anahtar: string) => 3 + (Array.from(anahtar).reduce((t, ch) => t + ch.charCodeAt(0), 0) % 40);

/** Tam ekran menü: sayfalar, katıldığın kanallar ve hesap kartı. */
export function YanMenu({ acik, onKapat }: { acik: boolean; onKapat: () => void }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const yol = usePathname();
  const { kanallar } = useKanallar();
  const { kullanici } = useOturum();
  const [ara, setAra] = useState('');

  const git = (href: Href) => {
    onKapat();
    setAra('');
    router.navigate(href);
  };

  const q = ara.trim().toLocaleLowerCase('tr');
  const liste = kanallar
    .map((a) => ({ anahtar: a, kanal: kanalBul(a) }))
    .filter((k) => k.kanal && (!q || k.kanal.oge.ad.toLocaleLowerCase('tr').includes(q)));

  return (
    <Modal visible={acik} animationType="fade" onRequestClose={onKapat} statusBarTranslucent>
      <View style={[styles.ekran, { backgroundColor: c.header, paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.ust}>
          <Pressable onPress={onKapat} hitSlop={12} accessibilityRole="button" accessibilityLabel="Menüyü kapat" style={styles.kapat}>
            <Ikon ad="kapat" boyut={22} renk={c.onAccent} />
          </Pressable>
          <Text style={[styles.baslik, { color: c.onAccent, fontFamily: fontSerif }]}>Motopaika</Text>
        </View>

        <ScrollView contentContainerStyle={styles.icerik} keyboardShouldPersistTaps="handled">
          <View style={[styles.arama, { backgroundColor: c.headerYuzey }]}>
            <Ikon ad="ara" boyut={16} renk={c.headerMuted} />
            <TextInput
              value={ara}
              onChangeText={setAra}
              placeholder="Kanallarında ara"
              placeholderTextColor={c.headerMuted}
              style={[styles.aramaYazi, { color: c.onAccent }]}
              autoCorrect={false}
            />
          </View>

          <View style={styles.sayfalar}>
            {SAYFALAR.map((s) => {
              const aktif = yol === s.rota;
              return (
                <Pressable
                  key={s.rota}
                  onPress={() => git(s.rota as Href)}
                  accessibilityRole="button"
                  style={[styles.sayfa, aktif && { backgroundColor: c.headerYuzey }]}>
                  <Ikon ad={s.ikon} boyut={22} renk={c.onAccent} />
                  <Text style={[styles.sayfaAd, { color: c.onAccent }]}>{s.ad}</Text>
                  {s.rozet ? <Rozet sayi={s.rozet} /> : null}
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.bolum, { color: c.headerMuted }]}>KANALLARIM</Text>
          {liste.length ? (
            liste.map(({ anahtar, kanal }) => {
              if (!kanal) return null;
              const yeni = demoGonderiler.filter((g) => g.kanal === anahtar).length;
              return (
                <Pressable
                  key={anahtar}
                  onPress={() => git({ pathname: '/kesfet', params: { kanal: anahtar } } as Href)}
                  accessibilityRole="button"
                  style={styles.kanal}>
                  <Ikon ad={kanal.kategori.ikon} boyut={20} renk={c.onAccent} />
                  <Text style={[styles.kanalAd, { color: c.onAccent }]} numberOfLines={1}>
                    {kanal.oge.ad}
                  </Text>
                  <View style={[styles.nokta, { backgroundColor: c.success }]} />
                  <Text style={[styles.cevrimici, { color: c.headerMuted }]}>{cevrimici(anahtar)}</Text>
                  {yeni > 0 ? (
                    <View style={[styles.yeni, { backgroundColor: c.headerYuzey }]}>
                      <Text style={[styles.yeniYazi, { color: c.onAccent }]}>{yeni}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })
          ) : (
            <View style={styles.bos}>
              <Text style={[styles.bosYazi, { color: c.headerMuted }]}>
                {q ? 'Eşleşen kanal yok.' : 'Henüz bir kanala katılmadın.'}
              </Text>
              {!q && (
                <Pressable onPress={() => git('/topluluklar' as Href)} style={[styles.bosDugme, { backgroundColor: c.lime }]}>
                  <Text style={[styles.bosDugmeYazi, { color: c.onLime }]}>Topluluklara göz at</Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>

        <Pressable
          onPress={() => git('/profil' as Href)}
          accessibilityRole="button"
          style={[styles.hesap, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <Avatar name={kullanici?.ad ?? 'Motopaika'} size="md" />
          <View style={styles.hesapYazi}>
            <Text style={[styles.hesapAd, { color: c.onAccent }]}>{kullanici?.ad ?? 'Misafir'}</Text>
            <Text style={[styles.hesapAlt, { color: c.headerMuted }]}>{kullanici?.sehir ?? 'Türkiye'} · Demo hesap</Text>
          </View>
          <View style={[styles.dil, { backgroundColor: c.headerYuzey }]}>
            <Text style={[styles.dilYazi, { color: c.onAccent }]}>TR</Text>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  ust: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  kapat: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  baslik: { fontSize: 26, fontWeight: '600' },
  icerik: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  arama: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 46, borderRadius: radius.md, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  aramaYazi: { flex: 1, fontSize: 16, paddingVertical: 0 },
  sayfalar: { marginTop: spacing.xl, gap: spacing.xs },
  sayfa: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.md + 2, borderRadius: radius.md },
  sayfaAd: { flex: 1, fontSize: 18 },
  bolum: { fontSize: 12, fontWeight: '600', letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.sm, paddingHorizontal: spacing.md },
  kanal: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md + 2 },
  kanalAd: { flex: 1, fontSize: 17 },
  nokta: { width: 7, height: 7, borderRadius: 4 },
  cevrimici: { fontSize: 14, minWidth: 22 },
  yeni: { minWidth: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  yeniYazi: { fontSize: 13, fontWeight: '600' },
  bos: { paddingHorizontal: spacing.md, gap: spacing.md, alignItems: 'flex-start' },
  bosYazi: { fontSize: 15, lineHeight: 21 },
  bosDugme: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md },
  bosDugmeYazi: { fontSize: 15, fontWeight: '700' },
  hesap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  hesapYazi: { flex: 1, gap: 2 },
  hesapAd: { fontSize: 17, fontWeight: '500' },
  hesapAlt: { fontSize: 13 },
  dil: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  dilYazi: { fontSize: 15, fontWeight: '600' },
});
