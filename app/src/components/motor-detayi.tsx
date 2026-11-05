import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ikon } from '@/components/ikon';
import { OnayKutusu } from '@/components/onay-kutusu';
import { Dugme } from '@/components/yol-ui';
import { MOTOR_FOTO_MAKS, motorFotoEkle, motorFotoSil, motorKapakYap, type GarajMotor } from '@/lib/profil';
import { radius, spacing, useTheme } from '@/theme';

/** Motorun fotoğraf galerisi: kaydırarak gez; sahibi fotoğraf ekler, siler, kapak yapar. */
export function MotorDetayi({
  motor,
  benim,
  uid,
  onKapat,
  onDegisti,
}: {
  motor: GarajMotor | null;
  benim: boolean;
  uid?: string;
  onKapat: () => void;
  onDegisti: () => void | Promise<void>;
}) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const liste = useRef<FlatList>(null);
  const [aktif, setAktif] = useState(0);
  const [mesgul, setMesgul] = useState(false);
  const [silAcik, setSilAcik] = useState(false);

  const fotolar = motor?.fotolar ?? [];
  useEffect(() => {
    if (aktif > Math.max(fotolar.length - 1, 0)) setAktif(Math.max(fotolar.length - 1, 0));
  }, [fotolar.length, aktif]);
  useEffect(() => {
    if (motor) setAktif(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motor?.id]);

  const kaydirildi = (e: NativeSyntheticEvent<NativeScrollEvent>) => setAktif(Math.round(e.nativeEvent.contentOffset.x / width));

  const ekle = async () => {
    if (!motor || !uid || mesgul) return;
    const kalan = MOTOR_FOTO_MAKS - fotolar.length;
    if (kalan <= 0) return;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsMultipleSelection: true, selectionLimit: kalan });
    if (r.canceled) return;
    setMesgul(true);
    let hata: string | null = null;
    for (const a of r.assets.slice(0, kalan)) {
      hata = await motorFotoEkle(uid, motor.id, a.uri);
      if (hata) break;
    }
    await onDegisti();
    setMesgul(false);
    if (hata) Alert.alert('Fotoğraf eklenemedi', hata);
  };

  const kapakYap = async () => {
    if (!motor || !fotolar[aktif]) return;
    setMesgul(true);
    const ok = await motorKapakYap(motor.id, fotolar[aktif].id);
    if (ok) {
      await onDegisti();
      setAktif(0);
      liste.current?.scrollToOffset({ offset: 0, animated: true });
    }
    setMesgul(false);
  };

  const sil = async () => {
    setSilAcik(false);
    const f = fotolar[aktif];
    if (!f) return;
    setMesgul(true);
    const ok = await motorFotoSil(f);
    if (ok) await onDegisti();
    else Alert.alert('Silinemedi', 'İnternet bağlantını kontrol edip tekrar dene.');
    setMesgul(false);
  };

  return (
    <Modal visible={!!motor} animationType="slide" onRequestClose={onKapat}>
      <View style={[styles.ekran, { backgroundColor: c.bg, paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.ust}>
          <View style={styles.baslikKap}>
            <Text style={[styles.baslik, { color: c.text }]} numberOfLines={1}>
              {motor ? `${motor.marka} ${motor.model}` : ''}
            </Text>
            <Text style={[styles.alt, { color: c.textMuted }]}>{motor?.yil ?? 'Yıl belirtilmedi'}</Text>
          </View>
          <Pressable onPress={onKapat} hitSlop={12} accessibilityRole="button" accessibilityLabel="Kapat" style={[styles.kapat, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Ikon ad="kapat" boyut={18} renk={c.text} />
          </Pressable>
        </View>

        {fotolar.length > 0 ? (
          <>
            <FlatList
              ref={liste}
              data={fotolar}
              keyExtractor={(f) => f.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={kaydirildi}
              style={styles.galeri}
              renderItem={({ item }) => (
                <View style={{ width, paddingHorizontal: spacing.lg }}>
                  <Image source={{ uri: item.url }} style={[styles.foto, { backgroundColor: c.surface }]} contentFit="cover" accessibilityLabel="Motor fotoğrafı" />
                </View>
              )}
            />
            <View style={styles.sayac}>
              <Text style={[styles.sayacYazi, { color: c.textMuted }]}>
                {aktif + 1} / {fotolar.length}
                {aktif === 0 ? '  •  Kapak' : ''}
              </Text>
            </View>
            <View style={styles.noktalar}>
              {fotolar.map((f, i) => (
                <View key={f.id} style={[styles.nokta, { backgroundColor: i === aktif ? c.primary : c.border }]} />
              ))}
            </View>
          </>
        ) : (
          <View style={[styles.bos, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Ikon ad="motor" boyut={48} renk={c.primary} />
            <Text style={[styles.bosYazi, { color: c.textMuted }]}>{benim ? 'Henüz fotoğraf yok. Motorunun fotoğraflarını ekle.' : 'Bu motorun fotoğrafı yok.'}</Text>
          </View>
        )}

        {benim ? (
          <View style={[styles.eylemler, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
            <Dugme
              etiket={mesgul ? 'Yükleniyor...' : `Fotoğraf ekle (${fotolar.length}/${MOTOR_FOTO_MAKS})`}
              ikon="foto"
              onPress={ekle}
              pasif={mesgul || fotolar.length >= MOTOR_FOTO_MAKS}
            />
            {fotolar.length > 0 ? (
              <View style={styles.ikiLi}>
                <Dugme etiket="Kapak yap" ikon="yildiz" tur="kontur" onPress={kapakYap} pasif={mesgul || aktif === 0} style={styles.yarim} />
                <Dugme etiket="Sil" ikon="sil" tur="kontur" onPress={() => setSilAcik(true)} pasif={mesgul} style={styles.yarim} />
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <OnayKutusu
        gorunur={silAcik}
        ikon="sil"
        tehlikeli
        baslik="Fotoğrafı sil"
        mesaj="Bu fotoğraf motorundan kalıcı olarak kaldırılacak."
        onayEtiketi="Sil"
        onOnay={sil}
        onKapat={() => setSilAcik(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  ust: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  baslikKap: { flex: 1, gap: 2 },
  baslik: { fontSize: 22, fontWeight: '900' },
  alt: { fontSize: 13.5 },
  kapat: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  galeri: { flexGrow: 0 },
  foto: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg },
  sayac: { alignItems: 'center', marginTop: spacing.md },
  sayacYazi: { fontSize: 13, fontWeight: '700' },
  noktalar: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.sm },
  nokta: { width: 7, height: 7, borderRadius: 4 },
  bos: { marginHorizontal: spacing.lg, aspectRatio: 4 / 3, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  bosYazi: { fontSize: 14, textAlign: 'center' },
  eylemler: { marginTop: 'auto', paddingHorizontal: spacing.lg, gap: spacing.sm },
  ikiLi: { flexDirection: 'row', gap: spacing.sm },
  yarim: { flex: 1 },
});
