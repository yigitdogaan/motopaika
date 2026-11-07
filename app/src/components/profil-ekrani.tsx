import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAltMenuBosluk } from '@/components/alt-menu';
import { Ikon, type IkonAdi } from '@/components/ikon';
import { MotorDetayi } from '@/components/motor-detayi';
import { IskeletProfil } from '@/components/iskelet';
import { Dugme, Hap } from '@/components/yol-ui';
import { kategoriRenkleri, type KategoriId } from '@/demo/akis';
import { useOturum } from '@/lib/oturum';
import { kmCoz, kmYazi, rozetleriHesapla } from '@/lib/rozetler';
import { dmAc } from '@/lib/sohbet';
import {
  avatarYukle,
  engelle,
  engelliMi,
  gonderileriGetir,
  gonderiSil,
  motorEkleDb,
  motorGuncelleDb,
  motorlariGetir,
  motorSilDb,
  profilGetir,
  profilGuncelle,
  sehirleriGetir,
  type GarajMotor,
  type GonderiOzeti,
  type Profil,
} from '@/lib/profil';
import { radius, spacing, useTheme } from '@/theme';

type Sekme = 'garaj' | 'gonderiler';

function Yuz({ uri, ad, boyut }: { uri?: string; ad: string; boyut: number }) {
  const c = useTheme();
  const [bozuk, setBozuk] = useState(false);
  return (
    <View style={{ width: boyut, height: boyut, borderRadius: boyut / 2, borderWidth: 3, borderColor: c.primary, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {uri && !bozuk ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" onError={() => setBozuk(true)} />
      ) : (
        <Text style={{ fontSize: boyut * 0.4, fontWeight: '900', color: c.primary }}>{ad.charAt(0).toLocaleUpperCase('tr')}</Text>
      )}
    </View>
  );
}

/**
 * Gerçek (Supabase) profil: kendi profilim (düzenlenebilir) ya da başka sürücünün profili (salt okunur, engelleme).
 * Anonim gönderiler başkasının profilinde görünmez.
 */
type TamamlaAdim = { id: string; ad: string; ikon: IkonAdi; tamam: boolean; onPress: () => void };

/** Kendi profilinde: eksik adımları gösteren kart. Hepsi bitince görünmez. */
function TamamlaKarti({ adimlar }: { adimlar: TamamlaAdim[] }) {
  const c = useTheme();
  const biten = adimlar.filter((a) => a.tamam).length;
  if (biten === adimlar.length) return null;
  return (
    <View style={[styles.tamamla, { backgroundColor: c.surface, borderColor: c.primary }]}>
      <View style={styles.tamamlaUst}>
        <Text style={[styles.tamamlaBaslik, { color: c.text }]}>Profilini tamamla</Text>
        <Text style={[styles.tamamlaSayi, { color: c.primary }]}>{biten}/{adimlar.length}</Text>
      </View>
      <View style={[styles.cubuk, { backgroundColor: c.surfaceAlt }]}>
        <View style={[styles.cubukDolu, { backgroundColor: c.primary, width: `${(biten / adimlar.length) * 100}%` }]} />
      </View>
      {adimlar.map((a) => (
        <Pressable
          key={a.id}
          onPress={a.onPress}
          disabled={a.tamam}
          accessibilityRole="button"
          accessibilityLabel={a.tamam ? `${a.ad}, tamamlandı` : a.ad}
          style={styles.tamamlaSatir}>
          <Ikon ad={a.tamam ? 'tik' : a.ikon} boyut={18} renk={a.tamam ? c.success : c.primary} />
          <Text style={[styles.tamamlaYazi, { color: a.tamam ? c.textMuted : c.text }, a.tamam && { textDecorationLine: 'line-through' }]}>{a.ad}</Text>
          {!a.tamam ? <Ikon ad="ileri" boyut={12} renk={c.textMuted} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

export function ProfilEkrani({ id, ustBosluk }: { id: string; ustBosluk?: number }) {
  const c = useTheme();
  const bosluk = useAltMenuBosluk();
  const { kullanici } = useOturum();
  const router = useRouter();
  const benim = kullanici?.id === id;

  const [profil, setProfil] = useState<Profil | null>(null);
  const [rozetAcik, setRozetAcik] = useState(false);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [motorlar, setMotorlar] = useState<GarajMotor[]>([]);
  const [seciliMotor, setSeciliMotor] = useState<string | null>(null);
  const [gonderiler, setGonderiler] = useState<GonderiOzeti[]>([]);
  const [engelli, setEngelli] = useState(false);
  const [bulunamadi, setBulunamadi] = useState(false);
  const [yuklemeHatasi, setYuklemeHatasi] = useState<string | null>(null);
  const [sekme, setSekme] = useState<Sekme>('garaj');

  const [marka, setMarka] = useState('');
  const [model, setModel] = useState('');
  const [yil, setYil] = useState('');
  const [lakap, setLakap] = useState('');
  const [km, setKm] = useState('');
  /** Doluysa ekleme formu bu motoru düzenler. */
  const [duzenlenenMotor, setDuzenlenenMotor] = useState<string | null>(null);
  const [ekleAcik, setEkleAcik] = useState(false);
  const [ekleYukseklik, setEkleYukseklik] = useState(270);
  const ekleAnim = useRef(new Animated.Value(0)).current;
  const ekleDegistir = (ac: boolean) => {
    setEkleAcik(ac);
    Animated.timing(ekleAnim, { toValue: ac ? 1 : 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  };

  const [duzenle, setDuzenle] = useState(false);
  const [ad, setAd] = useState('');
  const [bio, setBio] = useState('');
  const [sehirId, setSehirId] = useState<number | null>(null);
  const [sehirler, setSehirler] = useState<{ id: number; ad: string }[]>([]);
  const [sehirAcik, setSehirAcik] = useState(false);
  const [kaydediyor, setKaydediyor] = useState(false);

  const yukle = useCallback(async () => {
    setYuklemeHatasi(null);
    try {
      // Profil bilgisi hemen çizilsin; garaj ve gönderiler ayrı ayrı yüklenir, biri başarısız olsa da ekran açılır.
      const p = await profilGetir(id);
      if (!p) return setBulunamadi(true);
      setBulunamadi(false);
      setProfil(p);
      const [m, g] = await Promise.all([motorlariGetir(id).catch(() => null), gonderileriGetir(id, benim).catch(() => null)]);
      if (m) setMotorlar(m);
      if (g) setGonderiler(g);
      if (kullanici && !benim) setEngelli(await engelliMi(kullanici.id, id).catch(() => false));
    } catch (e) {
      setYuklemeHatasi(e instanceof Error ? e.message : 'Bağlantı kurulamadı.');
    }
  }, [id, benim, kullanici]);

  useFocusEffect(
    useCallback(() => {
      yukle();
    }, [yukle]),
  );

  useEffect(() => {
    if (duzenle && sehirler.length === 0) sehirleriGetir().then(setSehirler);
  }, [duzenle, sehirler.length]);

  const duzenlemeyiAc = () => {
    if (!profil) return;
    setAd(profil.ad === profil.kullaniciAdi ? '' : profil.ad);
    setBio(profil.bio);
    setSehirId(profil.sehirId);
    setDuzenle(true);
  };

  const kaydet = async () => {
    setKaydediyor(true);
    const hata = await profilGuncelle(id, { display_name: ad.trim() || null, bio: bio.trim() || null, city_id: sehirId });
    setKaydediyor(false);
    if (hata) return Alert.alert('Kaydedilemedi', `${hata}\n\nSupabase'de 7. migration çalıştırıldı mı?`);
    setDuzenle(false);
    yukle();
  };

  const avatarDegistir = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: true, aspect: [1, 1] });
    if (r.canceled) return;
    const yol = await avatarYukle(id, r.assets[0].uri);
    if (!yol) return Alert.alert('Fotoğraf yüklenemedi', 'Bağlantını ve migration dosyalarını kontrol et.');
    const hata = await profilGuncelle(id, { avatar_path: yol });
    if (hata) Alert.alert('Kaydedilemedi', hata);
    yukle();
  };

  const motorFormunuTemizle = () => {
    setMarka('');
    setModel('');
    setYil('');
    setLakap('');
    setKm('');
    setDuzenlenenMotor(null);
  };

  const motorKaydet = async () => {
    const y = yil.trim() ? Number(yil) : null;
    if (y !== null && (!Number.isInteger(y) || y < 1950 || y > 2100)) return Alert.alert('Geçersiz yıl', 'Yılı 1950 ile 2100 arasında gir ya da boş bırak.');
    const k = kmCoz(km);
    if (k === undefined) return Alert.alert('Geçersiz kilometre', 'Kilometreyi rakamla ve en fazla 2.000.000 olarak gir ya da boş bırak.');
    const alanlar = { marka, model, yil: y, km: k, lakap };
    const hata = duzenlenenMotor ? await motorGuncelleDb(duzenlenenMotor, alanlar) : await motorEkleDb(id, alanlar);
    if (hata) return Alert.alert(duzenlenenMotor ? 'Motor güncellenemedi' : 'Motor eklenemedi', `${hata}\n\nSupabase'de 18. migration çalıştırıldı mı?`);
    motorFormunuTemizle();
    ekleDegistir(false);
    setMotorlar(await motorlariGetir(id));
  };

  const motorDuzenle = (m: GarajMotor) => {
    setDuzenlenenMotor(m.id);
    setMarka(m.marka);
    setModel(m.model);
    setYil(m.yil ? String(m.yil) : '');
    setLakap(m.lakap ?? '');
    setKm(m.km != null ? String(m.km) : '');
    ekleDegistir(true);
  };

  const motorSil = (m: GarajMotor) =>
    Alert.alert('Motoru sil', `${m.marka} ${m.model} garajından silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          if (await motorSilDb(m.id)) setMotorlar((o) => o.filter((x) => x.id !== m.id));
        },
      },
    ]);

  const gonderiyiSil = (g: GonderiOzeti) =>
    Alert.alert('Gönderiyi sil', 'Bu gönderi kalıcı olarak silinsin mi?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          if (await gonderiSil(g.id)) setGonderiler((o) => o.filter((x) => x.id !== g.id));
        },
      },
    ]);

  const mesajGonder = async () => {
    const r = await dmAc(id);
    if (r.hata || !r.id) return Alert.alert('Mesaj açılamadı', r.hata ?? 'Bir sorun oluştu.');
    router.push({ pathname: '/sohbet/[id]', params: { id: r.id, ad: profil?.ad } } as unknown as Href);
  };

  const engelDegistir = () => {
    if (!kullanici || !profil) return;
    const yeni = !engelli;
    Alert.alert(yeni ? 'Sürücüyü engelle' : 'Engeli kaldır', yeni ? `${profil.ad} engellensin mi? Gönderilerini artık görmezsin.` : `${profil.ad} için engel kalksın mı?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: yeni ? 'Engelle' : 'Kaldır',
        style: yeni ? 'destructive' : 'default',
        onPress: async () => {
          if (await engelle(kullanici.id, id, yeni)) setEngelli(yeni);
        },
      },
    ]);
  };

  if (yuklemeHatasi && !profil) {
    return (
      <View style={{ marginTop: (ustBosluk ?? 0) + spacing.lg, padding: spacing.lg, gap: spacing.md, alignItems: 'center' }}>
        <Text style={[styles.bos, { color: c.textMuted, marginTop: 0, padding: 0 }]}>Profil yüklenemedi. {yuklemeHatasi}</Text>
        <Pressable onPress={yukle} accessibilityRole="button" accessibilityLabel="Yeniden dene">
          <Text style={{ color: c.primary, fontWeight: '700', fontSize: 15 }}>Yeniden dene</Text>
        </Pressable>
      </View>
    );
  }
  if (bulunamadi) return <Text style={[styles.bos, { color: c.textMuted, marginTop: (ustBosluk ?? 0) + spacing.lg }]}>Profil bulunamadı.</Text>;
  if (!profil) return <View style={{ marginTop: (ustBosluk ?? 0) + spacing.lg }}><IskeletProfil /></View>;

  const selam = gonderiler.reduce((t, g) => t + g.selam, 0);
  const stat = [
    { deger: String(selam), etiket: 'Selam', vurgu: true },
    { deger: String(gonderiler.length), etiket: 'Gönderi' },
    { deger: String(gonderiler.filter((g) => g.kategori === 'surus').length), etiket: 'Buluşma' },
  ];
  const rozetler = rozetleriHesapla({ selam, gonderi: gonderiler.length, bulusma: gonderiler.filter((g) => g.kategori === 'surus').length, motor: motorlar.length });
  // Başkasının profilinde yalnız kazanılanlar; kendi profilinde kazanılmayanlar da ilerlemeyle görünür.
  const gorunenRozetler = benim ? rozetler : rozetler.filter((r) => r.kazanildi);
  const tamamlaAdimlari: TamamlaAdim[] = [
    { id: 'foto', ad: 'Profil fotoğrafı ekle', ikon: 'foto', tamam: !!profil.avatarUrl, onPress: avatarDegistir },
    { id: 'bio', ad: 'Kendini birkaç cümleyle anlat', ikon: 'kisi', tamam: !!profil.bio.trim(), onPress: duzenlemeyiAc },
    { id: 'motor', ad: 'İlk motorunu garajına ekle', ikon: 'motor', tamam: motorlar.length > 0, onPress: () => setSekme('garaj') },
    { id: 'gonderi', ad: 'İlk gönderini paylaş', ikon: 'korna', tamam: gonderiler.length > 0, onPress: () => router.push('/yeni-gonderi' as Href) },
  ];
  const girdi = [styles.girdi, { color: c.text, backgroundColor: c.surfaceAlt, borderColor: c.border }];

  return (
    <ScrollView
      contentContainerStyle={[styles.icerik, { paddingTop: (ustBosluk ?? 0) + spacing.lg, paddingBottom: bosluk }]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={yenileniyor}
          onRefresh={async () => {
            setYenileniyor(true);
            try {
              await yukle();
            } finally {
              setYenileniyor(false);
            }
          }}
          tintColor={c.primary}
          colors={[c.primary]}
          progressViewOffset={ustBosluk ?? 0}
        />
      }>
      <View style={styles.profil}>
        <Pressable onPress={benim ? avatarDegistir : undefined} disabled={!benim} accessibilityRole="button" accessibilityLabel="Profil fotoğrafını değiştir">
          <Yuz uri={profil.avatarUrl} ad={profil.ad} boyut={96} />
          {benim ? (
            <View style={[styles.kamera, { backgroundColor: c.primary, borderColor: c.bg }]}>
              <Ikon ad="foto" boyut={14} renk={c.onPrimary} />
            </View>
          ) : null}
        </Pressable>
        <Text style={[styles.ad, { color: c.text }]}>{profil.ad}</Text>
        <Text style={[styles.kullanici, { color: c.textMuted }]}>
          @{profil.kullaniciAdi}
          {profil.sehir ? ` • ${profil.sehir}` : ''}
        </Text>
        <Text style={[styles.bio, { color: profil.bio ? c.text : c.textMuted }]}>
          {profil.bio || (benim ? 'Kendini birkaç cümleyle anlat: Profili Düzenle.' : 'Bio eklenmemiş.')}
        </Text>
        {benim ? (
          <Dugme etiket="Profili Düzenle" tur="kontur" onPress={duzenlemeyiAc} style={styles.duzenleDugme} />
        ) : (
          <View style={styles.dugmeSatir}>
            {!engelli ? <Dugme etiket="Mesaj Gönder" ikon="mesaj" onPress={mesajGonder} style={styles.duzenleDugme} /> : null}
            <Dugme etiket={engelli ? 'Engeli Kaldır' : 'Engelle'} tur="kontur" onPress={engelDegistir} style={styles.duzenleDugme} />
          </View>
        )}
      </View>

      {benim ? <TamamlaKarti adimlar={tamamlaAdimlari} /> : null}

      <View style={[styles.istatistikler, { backgroundColor: c.surface, borderColor: c.border }]}>
        {stat.map((s, i) => (
          <View key={s.etiket} style={[styles.istatistik, i > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: c.border }]}>
            <Text style={[styles.deger, { color: s.vurgu ? c.primary : c.text }]}>{s.deger}</Text>
            <Text style={[styles.etiket, { color: c.textMuted }]}>{s.etiket}</Text>
          </View>
        ))}
      </View>

      {gorunenRozetler.length ? (
        <View style={styles.rozetBolum}>
          <Pressable
            onPress={() => setRozetAcik((a) => !a)}
            accessibilityRole="button"
            accessibilityLabel={rozetAcik ? 'Rozetleri gizle' : 'Rozetleri göster'}
            style={[styles.rozetOzet, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Ikon ad="yildiz" boyut={16} renk={c.primary} />
            <Text style={[styles.rozetOzetYazi, { color: c.text }]} numberOfLines={1}>
              {rozetler.filter((r) => r.kazanildi).length} / {rozetler.length} rozet kazanıldı
            </Text>
            <Text style={[styles.rozetOzetLink, { color: c.primary }]}>{rozetAcik ? 'Gizle' : 'Göster'}</Text>
          </Pressable>
          {rozetAcik ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rozetSerit}>
            {gorunenRozetler.map((r) => (
              <View
                key={r.id}
                accessible
                accessibilityLabel={`${r.ad}: ${r.kazanildi ? 'kazanıldı' : `${r.ilerleme.mevcut} / ${r.ilerleme.hedef}`}. ${r.aciklama}`}
                style={[styles.rozetKart, { backgroundColor: c.surface, borderColor: r.kazanildi ? c.primary : c.border, opacity: r.kazanildi ? 1 : 0.55 }]}>
                <Text style={[styles.rozetAd, { color: r.kazanildi ? c.primary : c.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>{r.ad}</Text>
                <Text style={[styles.rozetAlt, { color: c.textMuted }]} numberOfLines={2}>
                  {r.kazanildi ? r.aciklama : `${r.ilerleme.mevcut}/${r.ilerleme.hedef} · ${r.aciklama}`}
                </Text>
              </View>
            ))}
          </ScrollView> : null}
        </View>
      ) : null}

      <View style={styles.sekmeler}>
        <Hap style={styles.yarim} etiket={benim ? 'Garajım' : 'Garaj'} ikon="garaj" secili={sekme === 'garaj'} onPress={() => setSekme('garaj')} />
        <Hap style={styles.yarim} etiket={benim ? 'Gönderilerim' : 'Gönderiler'} ikon="korna" secili={sekme === 'gonderiler'} onPress={() => setSekme('gonderiler')} />
      </View>

      {sekme === 'garaj' ? (
        <View style={styles.liste}>
          {motorlar.length === 0 ? <Text style={[styles.bos, { color: c.textMuted }]}>{benim ? 'Garajın boş. Aşağıdan ilk motorunu ekle.' : 'Garaj boş.'}</Text> : null}
          {motorlar.map((m, i) => (
            <Pressable
              key={m.id}
              onPress={() => setSeciliMotor(m.id)}
              accessibilityRole="button"
              accessibilityLabel={`${m.marka} ${m.model} fotoğrafları`}
              style={[styles.motor, { backgroundColor: c.surface, borderColor: i === 0 ? c.primary : c.border }]}>
              <View style={[styles.motorIkon, { backgroundColor: i === 0 ? c.primary : c.surfaceAlt, overflow: 'hidden' }]}>
                {m.fotolar[0] ? (
                  <Image source={{ uri: m.fotolar[0].url }} style={StyleSheet.absoluteFill} contentFit="cover" />
                ) : (
                  <Ikon ad="motor" boyut={30} renk={i === 0 ? c.onPrimary : c.primary} />
                )}
              </View>
              <View style={styles.motorYazi}>
                <Text style={[styles.motorAd, { color: c.text }]} numberOfLines={1}>
                  {m.marka} {m.model}
                </Text>
                {m.lakap ? <Text style={[styles.motorLakap, { color: c.primary }]} numberOfLines={1}>“{m.lakap}”</Text> : null}
                <Text style={[styles.motorAlt, { color: c.textMuted }]}>
                  {[m.yil ?? 'Yıl belirtilmedi', kmYazi(m.km)].filter(Boolean).join('  •  ')}
                  {m.fotolar.length ? `  •  ${m.fotolar.length} fotoğraf` : benim ? '  •  Fotoğraf ekle ›' : ''}
                </Text>
              </View>
              {benim ? (
                <View style={styles.motorEylem}>
                  <Dugme etiket="Düzenle" tur="kontur" onPress={() => motorDuzenle(m)} style={styles.sil} />
                  <Dugme etiket="Sil" tur="kontur" onPress={() => motorSil(m)} style={styles.sil} />
                </View>
              ) : null}
            </Pressable>
          ))}

          {benim ? (
            <View>
              <Dugme
                etiket={ekleAcik ? 'Kapat' : 'Garaja motor ekle'}
                ikon={ekleAcik ? 'kapat' : 'arti'}
                tur={ekleAcik ? 'kontur' : 'dolu'}
                onPress={() => {
                  if (ekleAcik) motorFormunuTemizle();
                  ekleDegistir(!ekleAcik);
                }}
              />
              <Animated.View
                style={{
                  height: ekleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, ekleYukseklik] }),
                  opacity: ekleAnim,
                  overflow: 'hidden',
                }}
                pointerEvents={ekleAcik ? 'auto' : 'none'}>
                <View
                  style={[styles.ekleKart, styles.ekleIc, { backgroundColor: c.surface, borderColor: c.border }]}
                  onLayout={(e) => setEkleYukseklik(e.nativeEvent.layout.height + spacing.md)}>
                  <View style={styles.ekleSatir}>
                    <TextInput value={marka} onChangeText={setMarka} placeholder="Marka (ör. Honda)" placeholderTextColor={c.textMuted} style={girdi} />
                    <TextInput value={model} onChangeText={setModel} placeholder="Model (ör. CB650R)" placeholderTextColor={c.textMuted} style={girdi} />
                  </View>
                  <View style={styles.ekleSatir}>
                    <TextInput value={yil} onChangeText={setYil} placeholder="Yıl (isteğe bağlı)" placeholderTextColor={c.textMuted} keyboardType="number-pad" maxLength={4} style={girdi} />
                    <TextInput value={km} onChangeText={setKm} placeholder="Kilometre" placeholderTextColor={c.textMuted} keyboardType="number-pad" maxLength={9} style={girdi} />
                  </View>
                  <TextInput value={lakap} onChangeText={setLakap} placeholder="Lakap (ör. Kara Şimşek)" placeholderTextColor={c.textMuted} maxLength={30} style={girdi} />
                  <Dugme etiket={duzenlenenMotor ? 'Değişiklikleri kaydet' : 'Motoru ekle'} ikon="tik" onPress={motorKaydet} pasif={!marka.trim() || !model.trim()} />
                </View>
              </Animated.View>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.liste}>
          {gonderiler.length ? (
            gonderiler.map((g) => (
              <View key={g.id} style={[styles.gonderi, { backgroundColor: c.surface, borderColor: c.border, borderLeftColor: kategoriRenkleri[g.kategori as KategoriId] ?? c.border, borderLeftWidth: 4 }]}>
                <Text style={[styles.gonderiMeta, { color: c.textMuted }]}>
                  {g.anonim ? 'Anonim • ' : ''}
                  {g.konum} • {g.zaman}
                </Text>
                <Text style={[styles.gonderiMetin, { color: c.text }]}>{g.metin}</Text>
                <View style={styles.gonderiAlt}>
                  <Text style={[styles.gonderiMeta, { color: c.primary }]}>{g.selam} selam</Text>
                  {benim ? (
                    <Pressable onPress={() => gonderiyiSil(g)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Gönderiyi sil">
                      <Text style={[styles.gonderiMeta, { color: c.danger }]}>Sil</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.bos, { color: c.textMuted }]}>{benim ? 'Henüz gönderin yok. Ortadaki + ile ilk yolu paylaş.' : 'Henüz gönderisi yok.'}</Text>
          )}
        </View>
      )}

      <MotorDetayi
        motor={motorlar.find((x) => x.id === seciliMotor) ?? null}
        benim={benim}
        uid={kullanici?.id}
        onKapat={() => setSeciliMotor(null)}
        onDegisti={async () => setMotorlar(await motorlariGetir(id))}
      />


      <Modal visible={duzenle} animationType="slide" transparent onRequestClose={() => setDuzenle(false)}>
        <View style={styles.perde}>
          <View style={[styles.sayfa, { backgroundColor: c.bg, borderColor: c.border }]}>
            <View style={styles.sayfaUst}>
              <Text style={[styles.sayfaBaslik, { color: c.text }]}>Profili Düzenle</Text>
              <Pressable onPress={() => setDuzenle(false)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Kapat">
                <Ikon ad="kapat" boyut={22} renk={c.textMuted} />
              </Pressable>
            </View>
            <Text style={[styles.etiket, { color: c.textMuted }]}>GÖRÜNEN AD</Text>
            <TextInput value={ad} onChangeText={setAd} placeholder={profil.kullaniciAdi} placeholderTextColor={c.textMuted} maxLength={40} style={girdi} />
            <Text style={[styles.etiket, { color: c.textMuted }]}>HAKKINDA</Text>
            <TextInput value={bio} onChangeText={setBio} placeholder="Hafta sonu virajlar, hafta içi trafik..." placeholderTextColor={c.textMuted} maxLength={160} multiline style={[...girdi, styles.bioGirdi]} />
            <Text style={[styles.sayac, { color: c.textMuted }]}>{bio.length}/160</Text>
            <Text style={[styles.etiket, { color: c.textMuted }]}>ŞEHİR</Text>
            <Pressable onPress={() => setSehirAcik(true)} accessibilityRole="button" style={[...girdi, styles.sehirSec]}>
              <Text style={{ color: sehirId ? c.text : c.textMuted, fontSize: 15 }}>{sehirler.find((s) => s.id === sehirId)?.ad ?? (sehirId ? profil.sehir : null) ?? 'Şehir seç'}</Text>
            </Pressable>
            <Dugme etiket={kaydediyor ? 'Kaydediliyor...' : 'Kaydet'} onPress={kaydet} pasif={kaydediyor} />
          </View>
        </View>

        <Modal visible={sehirAcik} animationType="fade" transparent onRequestClose={() => setSehirAcik(false)}>
          <Pressable style={styles.perde} onPress={() => setSehirAcik(false)}>
            <View style={[styles.sehirKutu, { backgroundColor: c.surface, borderColor: c.border }]}>
              <ScrollView>
                {sehirler.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => {
                      setSehirId(s.id);
                      setSehirAcik(false);
                    }}
                    accessibilityRole="button"
                    style={styles.sehirSatir}>
                    <Text style={{ color: s.id === sehirId ? c.primary : c.text, fontSize: 16, fontWeight: '600' }}>{s.ad}</Text>
                  </Pressable>
                ))}
                {sehirler.length === 0 ? <Text style={{ color: c.textMuted }}>Şehir listesi boş. 7. migration çalıştırıldı mı?</Text> : null}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  icerik: { padding: spacing.lg, paddingBottom: spacing.xxl + 40, gap: spacing.lg },
  profil: { alignItems: 'center', gap: 6, paddingTop: spacing.sm },
  kamera: { position: 'absolute', right: 0, bottom: 0, width: 30, height: 30, borderRadius: 15, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  ad: { fontSize: 24, fontWeight: '900', marginTop: spacing.sm },
  kullanici: { fontSize: 14 },
  bio: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: spacing.xs },
  dugmeSatir: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  duzenleDugme: { marginTop: spacing.sm, minHeight: 40, paddingHorizontal: spacing.xl },
  istatistikler: { flexDirection: 'row', borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, paddingVertical: spacing.lg },
  istatistik: { flex: 1, alignItems: 'center', gap: 2 },
  deger: { fontSize: 24, fontWeight: '900' },
  etiket: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  sekmeler: { flexDirection: 'row', gap: spacing.sm },
  yarim: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.sm },
  liste: { gap: spacing.md },
  motor: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1.5 },
  motorIkon: { width: 58, height: 58, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  motorYazi: { flex: 1, gap: 5 },
  motorAd: { fontSize: 18, fontWeight: '900' },
  motorAlt: { fontSize: 13.5 },
  motorLakap: { fontSize: 14, fontWeight: '700' },
  motorEylem: { gap: spacing.sm },
  tamamla: { borderRadius: radius.lg, borderWidth: 1.5, padding: spacing.lg, gap: spacing.sm },
  tamamlaUst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tamamlaBaslik: { fontSize: 16, fontWeight: '800' },
  tamamlaSayi: { fontSize: 14, fontWeight: '800' },
  cubuk: { height: 6, borderRadius: 3, overflow: 'hidden' },
  cubukDolu: { height: 6, borderRadius: 3 },
  tamamlaSatir: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 40 },
  tamamlaYazi: { flex: 1, fontSize: 15, fontWeight: '600' },
  rozetBolum: { gap: spacing.sm },
  rozetSerit: { gap: spacing.sm },
  rozetOzet: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 46, paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
  rozetOzetYazi: { flex: 1, fontSize: 14, fontWeight: '700' },
  rozetOzetLink: { fontSize: 13.5, fontWeight: '800' },
  rozetKart: { width: 168, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1.5, gap: 4 },
  rozetAd: { fontSize: 14, fontWeight: '900' },
  rozetAlt: { fontSize: 12, lineHeight: 16 },
  sil: { minHeight: 36, paddingHorizontal: spacing.md },
  ekleIc: { position: 'absolute', top: spacing.md, left: 0, right: 0 },
  ekleKart: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, gap: spacing.md },
  ekleBaslik: { fontSize: 16, fontWeight: '800' },
  ekleSatir: { flexDirection: 'row', gap: spacing.sm },
  girdi: { flex: 1, minHeight: 46, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md, fontSize: 15 },
  gonderi: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, gap: 6 },
  gonderiMeta: { fontSize: 12.5, fontWeight: '600' },
  gonderiMetin: { fontSize: 15, lineHeight: 21 },
  gonderiAlt: { flexDirection: 'row', justifyContent: 'space-between' },
  bos: { textAlign: 'center', marginTop: spacing.lg, fontSize: 15, padding: spacing.lg },
  cikis: { marginTop: spacing.md },
  perde: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sayfa: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  sayfaUst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sayfaBaslik: { fontSize: 20, fontWeight: '900' },
  bioGirdi: { minHeight: 90, paddingTop: 12, textAlignVertical: 'top' },
  sayac: { alignSelf: 'flex-end', fontSize: 12 },
  sehirSec: { justifyContent: 'center', flex: 0 },
  sehirKutu: { maxHeight: '70%', margin: spacing.xl, borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.xxl * 2 },
  sehirSatir: { paddingVertical: spacing.md },
});
