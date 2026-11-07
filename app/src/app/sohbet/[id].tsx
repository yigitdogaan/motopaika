import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ikon } from '@/components/ikon';
import { KonumHaritasi } from '@/components/konum-haritasi';
import { useAkis } from '@/lib/akis';
import { mevcutKonum } from '@/lib/konum';
import { suz } from '@/lib/moderasyon/uygula';
import { kisitUyarisi } from '@/lib/yonetim';
import { useOturum } from '@/lib/oturum';
import {
  fotoMesajiGonder, istekYanitla, konumMesajiGonder, mesajGonder, mesajlariDinle, mesajlariGetir, odaBilgisi, odaUyeleri, okunduYap,
  sahipIstekleri, type Mesaj, type OdaUye, type SahipIstek,
} from '@/lib/sohbet';
import { radius, spacing, useTema, useTheme } from '@/theme';

const saatYazi = (iso: string) => new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
const haritadaAc = (lat: number, lng: number) => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);

function Avatar({ ad, url, boyut = 40, grup = false }: { ad: string; url?: string; boyut?: number; grup?: boolean }) {
  const c = useTheme();
  return (
    <View style={{ width: boyut, height: boyut, borderRadius: boyut / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: grup ? c.primary : c.surfaceAlt }}>
      {url ? (
        <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : grup ? (
        <Ikon ad="topluluk" boyut={boyut * 0.5} renk={c.onPrimary} />
      ) : (
        <Text style={{ color: c.primary, fontWeight: '900', fontSize: boyut * 0.42 }}>{ad.charAt(0).toLocaleUpperCase('tr')}</Text>
      )}
    </View>
  );
}

/** Sohbet: birebir ya da grup. Üstte kişi/grup bilgisi, mesajlarda metin, fotoğraf ve konum. */
export default function Sohbet() {
  const c = useTheme();
  const { koyu } = useTema();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { kullanici } = useOturum();
  const { id, ad } = useLocalSearchParams<{ id: string; ad?: string }>();
  const { canli } = useAkis();
  const ben = kullanici?.id;

  const [mesajlar, setMesajlar] = useState<Mesaj[]>([]);
  const [metin, setMetin] = useState('');
  const [tur, setTur] = useState<'dm' | 'grup'>('grup');
  const [baslik, setBaslik] = useState(ad ?? 'Sohbet');
  const [uyeler, setUyeler] = useState<OdaUye[]>([]);
  const [postId, setPostId] = useState<string | null>(null);
  const [sahip, setSahip] = useState(false);
  const [istekler, setIstekler] = useState<SahipIstek[]>([]);
  const [panelAcik, setPanelAcik] = useState(false);
  const [uyeAcik, setUyeAcik] = useState(false);
  const [ekAcik, setEkAcik] = useState(false);
  const [haritaAcik, setHaritaAcik] = useState(false);
  const [buyukFoto, setBuyukFoto] = useState<string | null>(null);
  const [gonderiyor, setGonderiyor] = useState(false);

  const karsi = useMemo(() => (tur === 'dm' ? uyeler.find((u) => u.id !== ben) : undefined), [tur, uyeler, ben]);

  const oku = useCallback(() => {
    if (id && ben) okunduYap(id, ben);
  }, [id, ben]);

  const istekleriYukle = useCallback((pid: string) => {
    sahipIstekleri(pid).then(setIstekler);
  }, []);

  // Oda bilgisi: tür, ad, sahip, bekleyen istekler, üyeler.
  useEffect(() => {
    if (!id || !ben) return;
    odaBilgisi(id).then((o) => {
      if (!o) return;
      setTur(o.tur);
      if (o.tur === 'grup') setBaslik(o.ad);
      if (!o.postId) return;
      setPostId(o.postId);
      if (o.sahipId === ben) {
        setSahip(true);
        istekleriYukle(o.postId);
      }
    });
    odaUyeleri(id).then(setUyeler);
  }, [id, ben, istekleriYukle]);

  // Yeni istek anında listeye düşsün; üye listesi de yenilensin (kabul sonrası).
  useEffect(() => {
    if (sahip && postId) istekleriYukle(postId);
    if (id) odaUyeleri(id).then(setUyeler);
  }, [canli.istek, sahip, postId, id, istekleriYukle]);

  const yanitla = async (k: SahipIstek, kabul: boolean) => {
    if (!postId) return;
    if (await istekYanitla(postId, k.kullaniciId, kabul)) {
      istekleriYukle(postId);
      if (id) odaUyeleri(id).then(setUyeler);
    }
  };

  useEffect(() => {
    if (!id) return;
    mesajlariGetir(id).then(setMesajlar);
    oku();
    return mesajlariDinle(id, (m) => {
      setMesajlar((o) => (o.some((x) => x.id === m.id) ? o : [m, ...o]));
      oku();
    });
  }, [id, oku]);

  const profileGit = (uid: string) => {
    setUyeAcik(false);
    router.push({ pathname: '/profil/[id]', params: { id: uid } } as unknown as Href);
  };

  const gonder = async () => {
    const ham = metin.trim();
    if (!ham || !id || !ben) return;
    const t = suz(ham, 'sohbet');
    if (t === null) return;
    setMetin('');
    if (!(await mesajGonder(id, ben, t))) {
      setMetin(t);
      await kisitUyarisi();
    }
  };

  const fotoGonder = async (kaynak: 'galeri' | 'kamera') => {
    setEkAcik(false);
    if (!id || !ben) return;
    let r: ImagePicker.ImagePickerResult;
    if (kaynak === 'kamera') {
      const izin = await ImagePicker.requestCameraPermissionsAsync();
      if (!izin.granted) return Alert.alert('Kamera izni gerekli', 'Fotoğraf çekmek için kamera iznini aç.');
      r = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    } else {
      r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    }
    if (r.canceled) return;
    setGonderiyor(true);
    const ok = await fotoMesajiGonder(id, ben, r.assets[0].uri);
    setGonderiyor(false);
    if (!ok && (await kisitUyarisi())) return ok;
    if (!ok) Alert.alert('Fotoğraf gönderilemedi', 'İnternet bağlantını kontrol edip tekrar dene.');
  };

  const konumGonder = async (lat: number, lng: number, yer: string) => {
    if (!id || !ben) return false;
    setGonderiyor(true);
    const ok = await konumMesajiGonder(id, ben, lat, lng, yer);
    setGonderiyor(false);
    if (!ok && (await kisitUyarisi())) return ok;
    if (!ok) Alert.alert('Konum gönderilemedi', 'İnternet bağlantını kontrol edip tekrar dene.');
    return ok;
  };

  const altBaslik =
    tur === 'dm'
      ? karsi
        ? [`@${karsi.kullaniciAdi}`, karsi.sehir, karsi.motor].filter(Boolean).join(' • ')
        : ''
      : `${uyeler.length || ''} ${uyeler.length ? 'sürücü' : 'Sürüş grubu'} • üyeleri görmek için dokun`;

  const baslikaDokun = () => {
    if (tur === 'dm' && karsi) profileGit(karsi.id);
    else setUyeAcik(true);
  };

  return (
    <KeyboardAvoidingView style={[styles.ekran, { backgroundColor: c.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.ust, { borderBottomColor: c.border, backgroundColor: c.surface, paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" style={styles.geri}>
          <Ikon ad="ileri" boyut={22} renk={c.text} />
        </Pressable>
        <Pressable onPress={baslikaDokun} accessibilityRole="button" accessibilityLabel={tur === 'dm' ? 'Profili aç' : 'Üyeleri göster'} style={styles.kimlik}>
          <Avatar ad={tur === 'dm' ? (karsi?.ad ?? baslik) : baslik} url={tur === 'dm' ? karsi?.avatarUrl : undefined} grup={tur === 'grup'} boyut={42} />
          <View style={styles.kimlikYazi}>
            <Text style={[styles.baslik, { color: c.text }]} numberOfLines={1}>
              {tur === 'dm' ? (karsi?.ad ?? baslik) : baslik}
            </Text>
            <Text style={[styles.altBaslik, { color: c.textMuted }]} numberOfLines={1}>
              {altBaslik}
            </Text>
          </View>
        </Pressable>
        {tur === 'grup' ? (
          <Pressable onPress={() => setUyeAcik(true)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Üyeler" style={[styles.uyeDugme, { borderColor: c.border }]}>
            <Ikon ad="grup" boyut={18} renk={c.primary} />
          </Pressable>
        ) : null}
      </View>

      {sahip ? (
        <View style={[styles.istekKutu, { borderBottomColor: c.border, backgroundColor: c.surface }]}>
          <Pressable
            onPress={() => {
              if (postId) istekleriYukle(postId);
              setPanelAcik((a) => !a);
            }}
            accessibilityRole="button"
            style={styles.istekBaslik}>
            <Text style={[styles.istekBaslikYazi, { color: istekler.length ? c.primary : c.textMuted }]}>
              {istekler.length ? `${istekler.length} bekleyen katılma isteği` : 'Bekleyen katılma isteği yok'}
            </Text>
            <Text style={{ color: c.textMuted }}>{panelAcik ? '▲' : '▼'}</Text>
          </Pressable>
          {panelAcik
            ? istekler.map((k) => (
                <View key={k.kullaniciId} style={[styles.istek, { borderTopColor: c.border }]}>
                  <Pressable style={styles.istekBilgi} onPress={() => profileGit(k.kullaniciId)} accessibilityRole="button" accessibilityLabel={`${k.ad} profilini aç`}>
                    <Text style={[styles.istekAd, { color: c.text }]}>
                      {k.ad} <Text style={{ color: c.textMuted }}>@{k.kullaniciAdi}</Text>
                    </Text>
                    <Text style={[styles.istekAlt, { color: c.textMuted }]}>
                      {k.sehir ?? 'Şehir belirtilmemiş'} • {k.motorlar ?? 'Garajı boş'}
                    </Text>
                    <Text style={[styles.istekAlt, { color: c.primary }]}>Profili gör ›</Text>
                  </Pressable>
                  <Pressable onPress={() => yanitla(k, true)} accessibilityRole="button" accessibilityLabel={`${k.ad} isteğini kabul et`} style={[styles.istekDugme, { backgroundColor: c.primary }]}>
                    <Text style={[styles.istekDugmeYazi, { color: c.onPrimary }]}>Kabul</Text>
                  </Pressable>
                  <Pressable onPress={() => yanitla(k, false)} accessibilityRole="button" accessibilityLabel={`${k.ad} isteğini reddet`} style={[styles.istekDugme, { borderColor: c.border, borderWidth: 1 }]}>
                    <Text style={[styles.istekDugmeYazi, { color: c.text }]}>Reddet</Text>
                  </Pressable>
                </View>
              ))
            : null}
        </View>
      ) : null}

      <FlatList
        inverted
        data={mesajlar}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={<Text style={[styles.bos, { color: c.textMuted }]}>İlk mesajı sen yaz.</Text>}
        renderItem={({ item: m }) => {
          const benim = m.yazarId === ben;
          const gonderenId = m.yazarId;
          return (
            <View style={[styles.satir, benim ? styles.sag : styles.sol]}>
              <View
                style={[
                  styles.balon,
                  m.tur === 'text' ? null : styles.medyaBalon,
                  benim ? { backgroundColor: c.primary } : { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1 },
                ]}>
                {!benim && tur === 'grup' ? (
                  <Pressable onPress={() => profileGit(gonderenId)} accessibilityRole="button" accessibilityLabel={`${m.yazar} profilini aç`}>
                    <Text style={[styles.yazar, { color: c.primary }]}>{m.yazar}</Text>
                  </Pressable>
                ) : null}

                {m.tur === 'image' && m.fotoUrl ? (
                  <Pressable onPress={() => setBuyukFoto(m.fotoUrl!)} accessibilityRole="imagebutton" accessibilityLabel="Fotoğrafı büyüt">
                    <Image source={{ uri: m.fotoUrl }} style={styles.foto} contentFit="cover" />
                  </Pressable>
                ) : null}

                {m.tur === 'location' && m.enlem != null && m.boylam != null ? (
                  <Pressable onPress={() => haritadaAc(m.enlem!, m.boylam!)} accessibilityRole="button" accessibilityLabel="Konumu haritada aç">
                    <View style={styles.miniHarita} pointerEvents="none">
                      <MapView
                        style={StyleSheet.absoluteFill}
                        initialRegion={{ latitude: m.enlem, longitude: m.boylam, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                        liteMode
                        scrollEnabled={false}
                        zoomEnabled={false}
                        pitchEnabled={false}
                        rotateEnabled={false}
                        toolbarEnabled={false}
                        userInterfaceStyle={koyu ? 'dark' : 'light'}>
                        <Marker coordinate={{ latitude: m.enlem, longitude: m.boylam }} pinColor={c.primary} />
                      </MapView>
                    </View>
                    <View style={styles.konumAlt}>
                      <Ikon ad="konum" boyut={13} renk={benim ? c.onPrimary : c.primary} />
                      <Text style={[styles.konumYazi, { color: benim ? c.onPrimary : c.text }]} numberOfLines={1}>
                        {m.metin || 'Konum'}
                      </Text>
                    </View>
                    <Text style={[styles.haritadaAc, { color: benim ? c.onPrimary : c.primary }]}>Haritada aç ›</Text>
                  </Pressable>
                ) : null}

                {m.tur === 'text' ? <Text style={[styles.metin, { color: benim ? c.onPrimary : c.text }]}>{m.metin}</Text> : null}
                <Text style={[styles.saat, { color: benim ? c.onPrimary : c.textMuted }]}>{saatYazi(m.zaman)}</Text>
              </View>
            </View>
          );
        }}
      />

      <View style={[styles.alt, { borderTopColor: c.border, paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Pressable
          onPress={() => setEkAcik(true)}
          disabled={gonderiyor}
          accessibilityRole="button"
          accessibilityLabel="Fotoğraf veya konum ekle"
          style={[styles.ekle, { borderColor: c.border, backgroundColor: c.surface, opacity: gonderiyor ? 0.5 : 1 }]}>
          <Ikon ad="arti" boyut={22} renk={c.primary} />
        </Pressable>
        <TextInput
          value={metin}
          onChangeText={setMetin}
          placeholder={gonderiyor ? 'Gönderiliyor...' : 'Mesaj yaz...'}
          placeholderTextColor={c.textMuted}
          style={[styles.girdi, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]}
          maxLength={1000}
          multiline
        />
        <Pressable onPress={gonder} disabled={!metin.trim()} accessibilityRole="button" accessibilityLabel="Gönder" style={[styles.gonder, { backgroundColor: c.primary, opacity: metin.trim() ? 1 : 0.4 }]}>
          <Ikon ad="gonder" boyut={20} renk={c.onPrimary} />
        </Pressable>
      </View>

      {/* Ek menüsü */}
      <Modal visible={ekAcik} transparent animationType="fade" onRequestClose={() => setEkAcik(false)}>
        <Pressable style={styles.perde} onPress={() => setEkAcik(false)}>
          <Pressable style={[styles.sayfa, { backgroundColor: c.surface, borderColor: c.border, paddingBottom: Math.max(insets.bottom, spacing.lg) }]} onPress={() => {}}>
            {[
              { ad: 'Galeriden fotoğraf', ikon: 'galeri' as const, calis: () => fotoGonder('galeri') },
              { ad: 'Kamera ile çek', ikon: 'foto' as const, calis: () => fotoGonder('kamera') },
              { ad: 'Konum gönder', ikon: 'konum' as const, calis: () => { setEkAcik(false); setHaritaAcik(true); } },
            ].map((o) => (
              <Pressable key={o.ad} onPress={o.calis} accessibilityRole="button" style={styles.ekSatir}>
                <View style={[styles.ekIkon, { backgroundColor: c.surfaceAlt }]}>
                  <Ikon ad={o.ikon} boyut={20} renk={c.primary} />
                </View>
                <Text style={[styles.ekYazi, { color: c.text }]}>{o.ad}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Konum seçici: pinle ya da şu anki konumu gönder */}
      <KonumHaritasi
        gorunur={haritaAcik}
        onKapat={() => setHaritaAcik(false)}
        onSec={(k) => {
          konumGonder(k.lat, k.lng, k.yer);
        }}
        onGps={async () => {
          const k = await mevcutKonum();
          if (!k) return false;
          return konumGonder(k.lat, k.lng, k.yer);
        }}
      />

      {/* Üye listesi */}
      <Modal visible={uyeAcik} transparent animationType="slide" onRequestClose={() => setUyeAcik(false)}>
        <Pressable style={styles.perde} onPress={() => setUyeAcik(false)}>
          <Pressable style={[styles.sayfa, styles.uyeSayfa, { backgroundColor: c.surface, borderColor: c.border, paddingBottom: Math.max(insets.bottom, spacing.lg) }]} onPress={() => {}}>
            <Text style={[styles.sayfaBaslik, { color: c.text }]}>{baslik}</Text>
            <Text style={[styles.sayfaAlt, { color: c.textMuted }]}>{uyeler.length} sürücü</Text>
            <ScrollView>
              {uyeler.map((u) => (
                <Pressable key={u.id} onPress={() => profileGit(u.id)} accessibilityRole="button" accessibilityLabel={`${u.ad} profilini aç`} style={styles.uyeSatir}>
                  <Avatar ad={u.ad} url={u.avatarUrl} boyut={44} />
                  <View style={styles.uyeYazi}>
                    <Text style={[styles.uyeAd, { color: c.text }]} numberOfLines={1}>
                      {u.ad} {u.id === ben ? <Text style={{ color: c.textMuted }}>(sen)</Text> : null}
                    </Text>
                    <Text style={[styles.uyeAlt, { color: c.textMuted }]} numberOfLines={1}>
                      @{u.kullaniciAdi}
                      {u.sehir ? ` • ${u.sehir}` : ''}
                      {u.motor ? ` • ${u.motor}` : ''}
                    </Text>
                  </View>
                  {u.sahip ? (
                    <View style={[styles.rozet, { borderColor: c.primary, backgroundColor: `${c.primary}1F` }]}>
                      <Text style={[styles.rozetYazi, { color: c.primary }]}>KURUCU</Text>
                    </View>
                  ) : null}
                </Pressable>
              ))}
              {uyeler.length === 0 ? <Text style={[styles.sayfaAlt, { color: c.textMuted }]}>Üyeler yükleniyor...</Text> : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Fotoğraf büyütme */}
      <Modal visible={!!buyukFoto} transparent animationType="fade" onRequestClose={() => setBuyukFoto(null)}>
        <Pressable style={[styles.perde, styles.fotoPerde]} onPress={() => setBuyukFoto(null)} accessibilityRole="button" accessibilityLabel="Kapat">
          {buyukFoto ? <Image source={{ uri: buyukFoto }} style={styles.buyukFoto} contentFit="contain" /> : null}
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  ust: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  geri: { width: 34, height: 40, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '180deg' }] },
  kimlik: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  kimlikYazi: { flex: 1, gap: 1 },
  baslik: { fontSize: 17, fontWeight: '800' },
  altBaslik: { fontSize: 12 },
  uyeDugme: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  istekKutu: { borderBottomWidth: StyleSheet.hairlineWidth },
  istekBaslik: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  istekBaslikYazi: { fontSize: 14, fontWeight: '800' },
  istek: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth },
  istekBilgi: { flex: 1, gap: 2 },
  istekAd: { fontSize: 15, fontWeight: '800' },
  istekAlt: { fontSize: 12.5 },
  istekDugme: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full },
  istekDugmeYazi: { fontSize: 13, fontWeight: '800' },
  liste: { padding: spacing.lg, gap: spacing.sm },
  bos: { textAlign: 'center', marginTop: spacing.xl, transform: Platform.OS === 'ios' ? [{ scaleY: -1 }] : [] },
  satir: { flexDirection: 'row' },
  sag: { justifyContent: 'flex-end' },
  sol: { justifyContent: 'flex-start' },
  balon: { maxWidth: '82%', borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 3 },
  medyaBalon: { padding: 4 },
  yazar: { fontSize: 12, fontWeight: '800', paddingHorizontal: spacing.xs },
  metin: { fontSize: 15, lineHeight: 21 },
  saat: { fontSize: 10.5, alignSelf: 'flex-end', opacity: 0.75, paddingHorizontal: spacing.xs },
  foto: { width: 230, height: 230, borderRadius: radius.md },
  miniHarita: { width: 230, height: 130, borderRadius: radius.md, overflow: 'hidden' },
  konumAlt: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.xs, paddingTop: 4 },
  konumYazi: { fontSize: 13, fontWeight: '700', flexShrink: 1 },
  haritadaAc: { fontSize: 12, fontWeight: '800', paddingHorizontal: spacing.xs },
  alt: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  ekle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  girdi: { flex: 1, maxHeight: 110, minHeight: 44, borderRadius: radius.lg, borderWidth: 1, paddingHorizontal: spacing.md, paddingTop: 12, paddingBottom: 12, fontSize: 15 },
  gonder: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  perde: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  fotoPerde: { justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.92)' },
  buyukFoto: { width: '100%', height: '80%' },
  sayfa: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.sm },
  uyeSayfa: { maxHeight: '75%' },
  sayfaBaslik: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  sayfaAlt: { fontSize: 13, textAlign: 'center', marginBottom: spacing.sm },
  ekSatir: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  ekIkon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  ekYazi: { fontSize: 16, fontWeight: '700' },
  uyeSatir: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  uyeYazi: { flex: 1, gap: 2 },
  uyeAd: { fontSize: 15.5, fontWeight: '800' },
  uyeAlt: { fontSize: 12.5 },
  rozet: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 7, paddingVertical: 3 },
  rozetYazi: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1 },
});
