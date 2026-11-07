import { useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { useAltMenuBosluk } from '@/components/alt-menu';
import { EkranUstu } from '@/components/ekran-ustu';
import { Ikon } from '@/components/ikon';
import { Dugme } from '@/components/yol-ui';
import { demoBulusmalar, type Bulusma } from '@/demo/harita';
import { pasifMi, useAkis } from '@/lib/akis';
import { planliZamanYazi } from '@/lib/zaman';
import { odaIdBul } from '@/lib/sohbet';
import { supabase } from '@/lib/supabase';
import { radius, spacing, useTema, useTheme } from '@/theme';

// İstanbul ve çevresi başlangıç görünümü; Expo Go'da hazır react-native-maps (API anahtarı gerektirmez).
const ISTANBUL = { latitude: 41.08, longitude: 29.2, latitudeDelta: 0.75, longitudeDelta: 0.95 };

// Android (Google Maps) için koyu harita stili; iOS'ta userInterfaceStyle="dark" kullanılır.
const KOYU_STIL = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#121212' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d3320' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b0b0b' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

function konumaGit(b: Bulusma) {
  const url = Platform.select({
    ios: `http://maps.apple.com/?daddr=${b.enlem},${b.boylam}&q=${encodeURIComponent(b.ad)}`,
    default: `geo:${b.enlem},${b.boylam}?q=${b.enlem},${b.boylam}(${encodeURIComponent(b.ad)})`,
  });
  Linking.openURL(url).catch(() => {});
}

/** Harita / Radar: aktif buluşma pinleri, pine dokununca detay kartı. */
export default function Harita() {
  const c = useTheme();
  const { koyu } = useTema();
  const router = useRouter();
  const bosluk = useAltMenuBosluk();
  const [seciliId, setSeciliId] = useState<string | null>(null);
  // Android'de pin dokunuşu haritanın onPress'ini de tetikleyebilir; pin dokunuşundan hemen sonraki harita dokunuşunu yok say.
  const pinZamani = useRef(0);
  // Dakikada bir yenile: 12 saati dolan buluşmalar haritadan kalksın.
  const [dakika, setDakika] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDakika((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  const { gonderiler, istekler, istekGonder, istekGeriAl } = useAkis();
  // Gerçek modda pinler, koordinatlı "Sürüş Arkadaşı" gönderilerinden üretilir.
  const bulusmalar = useMemo<Bulusma[]>(
    () =>
      supabase
        ? gonderiler
            .filter((g) => g.kategori === 'surus' && g.enlem != null && g.boylam != null && !pasifMi(g))
            .map((g) => ({
              id: g.id,
              ad: g.metin.length > 60 ? `${g.metin.slice(0, 57)}...` : g.metin,
              yer: g.konum,
              zaman: g.surusTuru === 'planli' && g.baslangic ? `Planlı • ${planliZamanYazi(g.baslangic)}` : `Anlık • ${g.zaman}`,
              motorcu: g.geliyorum ?? 0,
              enlem: g.enlem!,
              boylam: g.boylam!,
              sohbet: g.konum,
            }))
        : demoBulusmalar,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gonderiler, dakika],
  );
  const secili = bulusmalar.find((b) => b.id === seciliId);

  const grubaGit = async (b: Bulusma) => {
    if (!supabase) return router.navigate('/mesajlar' as Href);
    const oda = await odaIdBul(b.id);
    if (oda) router.push({ pathname: '/sohbet/[id]', params: { id: oda, ad: b.yer } } as unknown as Href);
  };

  // Gerçek modda eylemler benim isteğimin durumuna göre değişir.
  const benimGonderim = secili ? gonderiler.find((g) => g.id === secili.id)?.benim : false;
  const durum = secili ? istekler[secili.id] : undefined;

  return (
    <View style={[styles.ekran, { backgroundColor: c.bg }]}>
      <EkranUstu
        baslik="Radar"
        sol={
          <View style={[styles.canli, { borderColor: c.border, backgroundColor: c.surface }]}>
            <View style={[styles.nokta, { backgroundColor: c.success }]} />
            <Text style={[styles.canliYazi, { color: c.text }]}>{bulusmalar.length} buluşma</Text>
          </View>
        }
      />

      <View style={styles.harita}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={ISTANBUL}
          userInterfaceStyle={koyu ? 'dark' : 'light'}
          customMapStyle={koyu ? KOYU_STIL : undefined}
          showsUserLocation
          showsCompass={false}
          toolbarEnabled={false}
          onPress={() => {
            if (Date.now() - pinZamani.current > 600) setSeciliId(null);
          }}>
          {bulusmalar.map((b) => {
            const aktif = b.id === seciliId;
            return (
              <Marker
                key={b.id}
                coordinate={{ latitude: b.enlem, longitude: b.boylam }}
                onPress={(e) => {
                  // Android'de pin dokunuşu haritaya da geçip kartı kapatıyordu.
                  e?.stopPropagation?.();
                  pinZamani.current = Date.now();
                  setSeciliId(b.id);
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                accessibilityLabel={`${b.ad}, ${b.motorcu} motorcu`}>
                <View style={[styles.pin, aktif ? { backgroundColor: c.bg, borderColor: c.primary } : { backgroundColor: c.primary, borderColor: c.bg }]}>
                  <Text style={[styles.pinSayi, { color: aktif ? c.primary : c.onPrimary }]}>{b.motorcu}</Text>
                </View>
              </Marker>
            );
          })}
        </MapView>

        {secili ? (
          <View style={[styles.kart, { backgroundColor: c.surface, borderColor: c.primary, bottom: bosluk }]}>
            <View style={styles.kartUst}>
              <View style={styles.kartYazi}>
                <Text style={[styles.kartBaslik, { color: c.text }]}>{secili.ad}</Text>
                <View style={styles.satir}>
                  <Ikon ad="konum" boyut={13} renk={c.primary} />
                  <Text style={[styles.alt, { color: c.textMuted }]}>{secili.yer}</Text>
                </View>
                <View style={styles.satir}>
                  <Ikon ad="saat" boyut={13} renk={c.primary} />
                  <Text style={[styles.alt, { color: c.textMuted }]}>
                    {secili.zaman} • {secili.motorcu} motorcu
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => setSeciliId(null)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Kartı kapat">
                <Ikon ad="kapat" boyut={18} renk={c.textMuted} />
              </Pressable>
            </View>
            <View style={[styles.eylemler, supabase ? styles.eylemlerDikey : null]}>
              {!supabase ? (
                <Dugme etiket="Sohbete Katıl" ikon="mesaj" onPress={() => grubaGit(secili)} style={supabase ? undefined : styles.eylem} />
              ) : benimGonderim ? (
                <Dugme etiket="Sürüş Grubunu Aç" ikon="mesaj" onPress={() => grubaGit(secili)} style={supabase ? undefined : styles.eylem} />
              ) : durum === 'accepted' ? (
                <Dugme etiket="Gruba Git" ikon="mesaj" onPress={() => grubaGit(secili)} style={supabase ? undefined : styles.eylem} />
              ) : durum === 'pending' ? (
                <Dugme etiket="İstek gönderildi • Geri al" tur="kontur" onPress={() => istekGeriAl(secili.id)} style={supabase ? undefined : styles.eylem} />
              ) : durum === 'declined' ? (
                <Dugme etiket="İstek reddedildi" tur="kontur" pasif onPress={() => {}} style={supabase ? undefined : styles.eylem} />
              ) : (
                <Dugme etiket="Sürüşe Katılma İsteği Gönder" ikon="el" onPress={() => istekGonder(secili.id)} style={supabase ? undefined : styles.eylem} />
              )}
              <Dugme etiket="Konuma Git" ikon="gps" tur="kontur" onPress={() => konumaGit(secili)} style={supabase ? undefined : styles.eylem} />
            </View>
          </View>
        ) : (
          <View style={[styles.ipucu, { backgroundColor: c.surface, borderColor: c.border, bottom: bosluk }]}>
            <Text style={[styles.ipucuYazi, { color: c.textMuted }]}>{bulusmalar.length > 0 ? 'Bir pine dokun, buluşma detayını gör.' : 'Şu an aktif buluşma yok.'}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  harita: { ...StyleSheet.absoluteFill },
  canli: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1 },
  nokta: { width: 8, height: 8, borderRadius: 4 },
  canliYazi: { fontSize: 13, fontWeight: '700' },
  pin: { minWidth: 42, height: 42, borderRadius: radius.full, borderWidth: 3, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  pinSayi: { fontSize: 16, fontWeight: '900' },
  kart: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.xxl + 4, borderRadius: radius.lg, borderWidth: 1.5, padding: spacing.lg, gap: spacing.md },
  kartUst: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  kartYazi: { flex: 1, gap: 5 },
  kartBaslik: { fontSize: 17, fontWeight: '800', lineHeight: 22 },
  satir: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  alt: { fontSize: 13.5 },
  eylemler: { flexDirection: 'row', gap: spacing.sm },
  eylemlerDikey: { flexDirection: 'column' },
  eylem: { flex: 1 },
  ipucu: { position: 'absolute', alignSelf: 'center', bottom: spacing.xxl + 4, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.full, borderWidth: 1 },
  ipucuYazi: { fontSize: 13.5, fontWeight: '600' },
});
