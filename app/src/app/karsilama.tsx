import * as Location from 'expo-location';
import { useRouter, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ikon, type IkonAdi } from '@/components/ikon';
import { Dugme } from '@/components/yol-ui';
import { ZaferIsareti } from '@/components/zafer-isareti';
import { useKarsilama } from '@/lib/karsilama';
import { pushAc } from '@/lib/push';
import { fontSerif, radius, spacing, useTheme } from '@/theme';

type Sayfa = { ikon: IkonAdi | 'selam'; baslik: string; metin: string; maddeler: string[] };

const SAYFALAR: Sayfa[] = [
  {
    ikon: 'selam',
    baslik: 'Roteri\'ye hoş geldin',
    metin: 'Türkiye\'nin motosiklet topluluğu. Burada yol bilgisi, sohbet ve sürüş arkadaşı bulursun.',
    maddeler: ['Akış: topluluğun gönderileri', 'Beğeni yerine "Selam" verirsin', 'İstersen anonim paylaşabilirsin'],
  },
  {
    ikon: 'motor',
    baslik: 'Birlikte sür',
    metin: '"Sürüş" gönderisi paylaşarak buluşma kurabilir, başkalarının buluşmalarına katılabilirsin.',
    maddeler: ['Anlık ya da planlı sürüş kur', '"Ben de Geliyorum!" ile istek gönder', 'Onaylanınca sohbet açılır'],
  },
  {
    ikon: 'harita',
    baslik: 'Harita ve garaj',
    metin: 'Aktif sürüşleri haritada gör, kendi motorlarını garajına ekle.',
    maddeler: ['Harita sekmesinde aktif sürüş pinleri', 'Profil ve Garaj: motorların, rozetlerin', 'Mesajlar: sürüş arkadaşlarınla yazış'],
  },
];

/** İlk kayıttan sonra bir kez gösterilen kısa tur: 3 tanıtım sayfası + izin sayfası. */
export default function Karsilama() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { tamamla } = useKarsilama();
  const kaydirma = useRef<FlatList>(null);
  const [sira, setSira] = useState(0);
  const [konumIzni, setKonumIzni] = useState<'bekle' | 'tamam' | 'red'>('bekle');
  const [bildirimIzni, setBildirimIzni] = useState<'bekle' | 'tamam' | 'red'>('bekle');
  const toplam = SAYFALAR.length + 1;
  const son = sira === toplam - 1;

  const bitir = () => {
    tamamla();
    router.replace('/akis' as Href);
  };
  const git = (i: number) => {
    kaydirma.current?.scrollToOffset({ offset: i * width, animated: true });
    setSira(i);
  };
  const kaydi = (e: NativeSyntheticEvent<NativeScrollEvent>) => setSira(Math.round(e.nativeEvent.contentOffset.x / width));

  const konumIste = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setKonumIzni(status === 'granted' ? 'tamam' : 'red');
    } catch {
      setKonumIzni('red');
    }
  };
  const bildirimIste = async () => setBildirimIzni((await pushAc()) ? 'tamam' : 'red');

  const IzinSayfasi = () => (
        <View style={[styles.sayfa, { width }]}>
          <View style={[styles.ikonKap, { backgroundColor: c.surface, borderColor: c.primary }]}>
            <Ikon ad="konum" boyut={44} renk={c.primary} />
          </View>
          <Text style={[styles.baslik, { color: c.text, fontFamily: fontSerif }]}>Son bir adım</Text>
          <Text style={[styles.metin, { color: c.textMuted }]}>İzinler isteğe bağlı. Sonradan Ayarlar'dan değiştirebilirsin.</Text>
          <View style={styles.maddeler}>
            <IzinSatiri
              ikon="konum"
              baslik="Konum"
              aciklama="Yakınındaki sürüşleri göstermek ve gönderine konum eklemek için."
              durum={konumIzni}
              onPress={konumIste}
            />
            <IzinSatiri
              ikon="zil"
              baslik="Bildirimler"
              aciklama="Selam, yorum ve sürüş isteklerinden haberdar olmak için."
              durum={bildirimIzni}
              onPress={bildirimIste}
            />
          </View>
        </View>
  );

  return (
    <View style={[styles.kap, { backgroundColor: c.bg, paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.ust}>
        {!son ? (
          <Pressable onPress={bitir} hitSlop={12} accessibilityRole="button" accessibilityLabel="Turu atla">
            <Text style={[styles.atla, { color: c.textMuted }]}>Atla</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        ref={kaydirma}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={kaydi}
        style={styles.sayfalar}
        extraData={[konumIzni, bildirimIzni]}
        data={[...SAYFALAR.map((_, i) => i), SAYFALAR.length]}
        keyExtractor={(i) => String(i)}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => {
          const s = SAYFALAR[item];
          if (!s) return <IzinSayfasi />;
          return (
            <View style={[styles.sayfa, { width }]}>
              <View style={[styles.ikonKap, { backgroundColor: c.surface, borderColor: c.primary }]}>
                {s.ikon === 'selam' ? <ZaferIsareti boyut={44} renk={c.primary} fon={c.surface} dolu /> : <Ikon ad={s.ikon} boyut={44} renk={c.primary} />}
              </View>
              <Text style={[styles.baslik, { color: c.text, fontFamily: fontSerif }]}>{s.baslik}</Text>
              <Text style={[styles.metin, { color: c.textMuted }]}>{s.metin}</Text>
              <View style={styles.maddeler}>
                {s.maddeler.map((m) => (
                  <View key={m} style={[styles.madde, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <Ikon ad="tik" boyut={16} renk={c.primary} />
                    <Text style={[styles.maddeYazi, { color: c.text }]}>{m}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        }}
      />

      <View style={styles.noktalar}>
        {Array.from({ length: toplam }, (_, i) => (
          <View key={i} style={[styles.nokta, { backgroundColor: i === sira ? c.primary : c.border, width: i === sira ? 22 : 8 }]} />
        ))}
      </View>
      <View style={styles.alt}>
        <Dugme etiket={son ? 'Başla' : 'İleri'} onPress={son ? bitir : () => git(sira + 1)} />
      </View>
    </View>
  );
}

function IzinSatiri({ ikon, baslik, aciklama, durum, onPress }: { ikon: IkonAdi; baslik: string; aciklama: string; durum: 'bekle' | 'tamam' | 'red'; onPress: () => void }) {
  const c = useTheme();
  return (
    <View style={[styles.izin, { backgroundColor: c.surface, borderColor: durum === 'tamam' ? c.primary : c.border }]}>
      <Ikon ad={ikon} boyut={22} renk={c.primary} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.izinBaslik, { color: c.text }]}>{baslik}</Text>
        <Text style={[styles.izinMetin, { color: c.textMuted }]}>{aciklama}</Text>
        {durum === 'red' ? <Text style={[styles.izinMetin, { color: c.warning }]}>İzin verilmedi; sonradan telefon ayarlarından açabilirsin.</Text> : null}
      </View>
      {durum === 'tamam' ? (
        <Ikon ad="tik" boyut={22} renk={c.primary} />
      ) : (
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${baslik} iznini aç`} style={[styles.izinDugme, { backgroundColor: c.primary }]}>
          <Text style={[styles.izinDugmeYazi, { color: c.onPrimary }]}>Aç</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1 },
  ust: { height: 32, alignItems: 'flex-end', paddingHorizontal: spacing.xl, justifyContent: 'center' },
  atla: { fontSize: 15, fontWeight: '700' },
  sayfalar: { flex: 1 },
  sayfa: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.lg },
  ikonKap: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  baslik: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  metin: { fontSize: 16, lineHeight: 23, textAlign: 'center' },
  maddeler: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.sm },
  madde: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  maddeYazi: { flex: 1, fontSize: 15, fontWeight: '600' },
  izin: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1.5 },
  izinBaslik: { fontSize: 16, fontWeight: '800' },
  izinMetin: { fontSize: 13.5, lineHeight: 19 },
  izinDugme: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.full },
  izinDugmeYazi: { fontSize: 14.5, fontWeight: '800' },
  noktalar: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: spacing.lg },
  nokta: { height: 8, borderRadius: 4 },
  alt: { paddingHorizontal: spacing.xl },
});
