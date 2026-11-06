import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type MapPressEvent } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ikon } from '@/components/ikon';
import { Hap } from '@/components/yol-ui';
import { konumBilgisi, mevcutKonum, type Konum } from '@/lib/konum';
import { radius, spacing, useTema, useTheme } from '@/theme';

const KOYU_STIL = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#121212' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b0b0b' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

/** Tam ekran harita: dokunarak/sürükleyerek konum pinler. Seçilince `onSec` çağrılır. */
export function KonumHaritasi({
  gorunur,
  onKapat,
  baslangic,
  baslangicAd,
  onSec,
  onGps,
}: {
  gorunur: boolean;
  onKapat: () => void;
  baslangic?: { lat: number; lng: number } | null;
  baslangicAd?: string;
  onSec: (k: Konum) => void | Promise<void>;
  /** Verilirse "Şu anki konumum" bunu çağırır (true = başarılı). */
  onGps?: () => Promise<boolean>;
}) {
  const c = useTheme();
  const { koyu } = useTema();
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [pinAdi, setPinAdi] = useState('');
  const [mesgul, setMesgul] = useState(false);
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (!gorunur) return;
    setPin(baslangic ?? null);
    setPinAdi(baslangicAd ?? '');
    setHata('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gorunur]);

  const pinle = async (lat: number, lng: number) => {
    setPin({ lat, lng });
    setPinAdi('');
    const k = await konumBilgisi(lat, lng);
    setPinAdi(k.yer);
  };

  const sec = async () => {
    if (!pin || mesgul) return;
    setMesgul(true);
    await onSec(await konumBilgisi(pin.lat, pin.lng));
    setMesgul(false);
    onKapat();
  };

  const gps = async () => {
    setMesgul(true);
    setHata('');
    if (onGps) {
      const ok = await onGps();
      setMesgul(false);
      if (ok) onKapat();
      else setHata('Konum alınamadı. Konum iznini açtığından emin ol.');
      return;
    }
    const k = await mevcutKonum();
    setMesgul(false);
    if (k) {
      await onSec(k);
      onKapat();
    } else setHata('Konum alınamadı. Konum iznini açtığından emin ol.');
  };

  const bolge = baslangic
    ? { latitude: baslangic.lat, longitude: baslangic.lng, latitudeDelta: 0.15, longitudeDelta: 0.15 }
    : { latitude: 41.08, longitude: 29.0, latitudeDelta: 0.75, longitudeDelta: 0.95 };

  return (
    <Modal visible={gorunur} animationType="slide" onRequestClose={onKapat}>
        <View style={[styles.ekran, { backgroundColor: c.bg }]}>
          <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={bolge}
            userInterfaceStyle={koyu ? 'dark' : 'light'}
            customMapStyle={koyu ? KOYU_STIL : undefined}
            showsUserLocation
            showsCompass={false}
            toolbarEnabled={false}
            onPress={(e: MapPressEvent) => pinle(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)}>
            {pin ? (
              <Marker
                coordinate={{ latitude: pin.lat, longitude: pin.lng }}
                draggable
                onDragEnd={(e) => pinle(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)}
                pinColor={c.primary}
              />
            ) : null}
          </MapView>

          <View style={[styles.ust, { top: insets.top + spacing.md }]}>
            <View style={[styles.ipucu, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={[styles.ipucuYazi, { color: c.text }]}>Haritaya dokunarak konumunu pinle</Text>
            </View>
            <Pressable
              onPress={() => onKapat()}
              accessibilityRole="button"
              accessibilityLabel="Kapat"
              style={[styles.kapat, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Ikon ad="kapat" boyut={18} renk={c.text} />
            </Pressable>
          </View>

          <View style={[styles.alt, { backgroundColor: c.surface, borderColor: c.border, paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
            <Text style={[styles.adres, { color: pin ? c.text : c.textMuted }]} numberOfLines={1}>
              {pin ? pinAdi || 'Yer adı aranıyor...' : 'Henüz pin yok'}
            </Text>
            {hata ? <Text style={[styles.hata, { color: c.warning }]}>{hata}</Text> : null}
            <View style={styles.satir}>
              <Hap ikon="gps" etiket="Şu anki konumum" secili={false} onPress={gps} />
              <Hap etiket="Bu konumu seç" secili={true} onPress={sec} />
              {mesgul ? <ActivityIndicator color={c.primary} /> : null}
            </View>
          </View>
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  ust: { position: 'absolute', left: spacing.lg, right: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ipucu: { flex: 1, height: 42, borderRadius: radius.full, borderWidth: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.md },
  ipucuYazi: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  kapat: { width: 42, height: 42, borderRadius: radius.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  alt: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.md },
  adres: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  hata: { fontSize: 12.5, textAlign: 'center' },
  satir: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
});
