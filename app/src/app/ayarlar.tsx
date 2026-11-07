import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, Share, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ikon, type IkonAdi } from '@/components/ikon';
import { OnayKutusu } from '@/components/onay-kutusu';
import { Dugme } from '@/components/yol-ui';
import { engellenenler, hesapBilgisi, kullaniciAdiDegistir, kullaniciAdiGetir, sifreDegistir, type EngelliKisi, type HesapBilgisi } from '@/lib/ayarlar';
import { useBildirim } from '@/lib/bildirim';
import { useOturum } from '@/lib/oturum';
import { engelle } from '@/lib/profil';
import { PUSH_AYAR, pushAc, pushKapat } from '@/lib/push';
import { hesabiSil } from '@/lib/sifre';
import { supabase } from '@/lib/supabase';
import { radius, spacing, useTema, useTheme, type TemaTercihi } from '@/theme';

const KURALLAR = [
  'Saygılı ol: hakaret, nefret söylemi ve tehdit yasaktır.',
  'Kişisel bilgi paylaşma: telefon, IBAN, T.C. kimlik ve plaka gizlenir.',
  'Spam, reklam ve dolandırıcılık içerikleri kaldırılır.',
  'Güvenli sürüş: tehlikeli sürüşü özendiren paylaşımlar yapma.',
  'Tekrarlayan ihlallerde hesap askıya alınır ya da yasaklanır.',
];

function Bolum({ baslik, children }: { baslik: string; children: ReactNode }) {
  const c = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[styles.bolumBaslik, { color: c.textMuted }]}>{baslik.toLocaleUpperCase('tr')}</Text>
      <View style={[styles.kart, { backgroundColor: c.surface, borderColor: c.border }]}>{children}</View>
    </View>
  );
}

function Satir({
  ikon, baslik, deger, onPress, sag, tehlikeli, son,
}: {
  ikon: IkonAdi; baslik: string; deger?: string; onPress?: () => void; sag?: ReactNode; tehlikeli?: boolean; son?: boolean;
}) {
  const c = useTheme();
  const renk = tehlikeli ? c.danger : c.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={deger ? `${baslik}, ${deger}` : baslik}
      style={({ pressed }) => [styles.satir, { borderBottomColor: c.border, borderBottomWidth: son ? 0 : StyleSheet.hairlineWidth }, pressed && onPress && { backgroundColor: c.surfaceAlt }]}>
      <View style={[styles.satirIkon, { backgroundColor: tehlikeli ? `${c.danger}22` : c.surfaceAlt }]}>
        <Ikon ad={ikon} boyut={18} renk={tehlikeli ? c.danger : c.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.satirBaslik, { color: renk }]}>{baslik}</Text>
        {deger ? <Text style={[styles.satirDeger, { color: c.textMuted }]} numberOfLines={1}>{deger}</Text> : null}
      </View>
      {sag ?? (onPress ? <Ikon ad="ileri" boyut={16} renk={c.textMuted} /> : null)}
    </Pressable>
  );
}

function AltSayfa({ gorunur, baslik, onKapat, children }: { gorunur: boolean; baslik: string; onKapat: () => void; children: ReactNode }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={gorunur} animationType="slide" transparent onRequestClose={onKapat}>
      <View style={styles.perde}>
        <View style={[styles.sayfa, { backgroundColor: c.bg, borderColor: c.border, paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.sayfaUst}>
            <Text style={[styles.sayfaBaslik, { color: c.text }]}>{baslik}</Text>
            <Pressable onPress={onKapat} hitSlop={12} accessibilityRole="button" accessibilityLabel="Kapat">
              <Ikon ad="kapat" boyut={22} renk={c.textMuted} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const TEMA_SECENEKLERI: { id: TemaTercihi; ad: string; aciklama: string }[] = [
  { id: 'koyu', ad: 'Koyu', aciklama: 'Siyah zemin' },
  { id: 'acik', ad: 'Açık', aciklama: 'Beyaz zemin' },
  { id: 'sistem', ad: 'Sistem', aciklama: 'Cihazı izle' },
];

/** Küçük ekran önizlemesi: seçeneğin nasıl görüneceğini gösterir. */
function TemaOnizleme({ id }: { id: TemaTercihi }) {
  const c = useTheme();
  const yuz = (zemin: string, kart: string, cizgi: string) => (
    <View style={{ flex: 1, backgroundColor: zemin, padding: 6, gap: 4 }}>
      <View style={{ height: 5, width: '55%', borderRadius: 3, backgroundColor: c.primary }} />
      <View style={{ height: 14, borderRadius: 4, backgroundColor: kart }} />
      <View style={{ height: 4, width: '80%', borderRadius: 2, backgroundColor: cizgi }} />
    </View>
  );
  const koyu = yuz('#121212', '#2A2A2A', '#555555');
  const acik = yuz('#FFFFFF', '#E8EAEE', '#B8BDC6');
  return (
    <View style={{ height: 54, borderRadius: radius.sm, overflow: 'hidden', flexDirection: 'row', borderWidth: StyleSheet.hairlineWidth, borderColor: c.border }}>
      {id === 'koyu' ? koyu : id === 'acik' ? acik : <>{koyu}{acik}</>}
    </View>
  );
}

function TemaSecici() {
  const c = useTheme();
  const { tercih, tercihDegistir } = useTema();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.md }} accessibilityRole="radiogroup">
      {TEMA_SECENEKLERI.map((s) => {
        const secili = tercih === s.id;
        return (
          <Pressable
            key={s.id}
            onPress={() => tercihDegistir(s.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: secili }}
            accessibilityLabel={`${s.ad} tema, ${s.aciklama}`}
            style={({ pressed }) => [
              { flex: 1, gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, borderWidth: 2, borderColor: secili ? c.primary : c.border, backgroundColor: c.bg },
              pressed && { opacity: 0.8 },
            ]}>
            <TemaOnizleme id={s.id} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: secili ? c.primary : c.text, fontSize: 14, fontWeight: '700' }}>{s.ad}</Text>
              <Text style={{ color: c.textMuted, fontSize: 11 }}>{s.aciklama}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function Ayarlar() {
  const c = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { kullanici, cikisYap } = useOturum();
  const { hepsiniOkunduYap, okunmamis } = useBildirim();
  const gercek = !!supabase && !!kullanici;

  const [hesap, setHesap] = useState<HesapBilgisi>({ eposta: null, saglayici: 'email' });
  const [pushAcik, setPushAcik] = useState(true);
  const [konumIzni, setKonumIzni] = useState<string>('…');
  const [engelliler, setEngelliler] = useState<EngelliKisi[]>([]);
  const [kadi, setKadi] = useState('');

  const [panel, setPanel] = useState<null | 'kadi' | 'sifre' | 'engel' | 'kurallar'>(null);
  const [silAcik, setSilAcik] = useState(false);
  const [cikisAcik, setCikisAcik] = useState(false);
  const [yeniKadi, setYeniKadi] = useState('');
  const [mevcutSifre, setMevcutSifre] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [hata, setHata] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState(false);

  const konumDurumu = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setKonumIzni(status === 'granted' ? 'Açık' : status === 'denied' ? 'Kapalı' : 'Sorulmadı');
    } catch {
      setKonumIzni('Bilinmiyor');
    }
  }, []);

  const engelYukle = useCallback(async () => {
    if (kullanici) setEngelliler(await engellenenler(kullanici.id));
  }, [kullanici]);

  useEffect(() => {
    konumDurumu();
    AsyncStorage.getItem(PUSH_AYAR).then((v) => setPushAcik(v !== 'kapali')).catch(() => {});
    if (gercek) {
      hesapBilgisi().then(setHesap);
      if (kullanici) kullaniciAdiGetir(kullanici.id).then((k) => k && setKadi(k));
      engelYukle();
    }
  }, [gercek, kullanici, konumDurumu, engelYukle]);

  const paneliAc = (p: 'kadi' | 'sifre' | 'engel' | 'kurallar') => {
    setHata(null);
    setYeniKadi(kadi);
    setMevcutSifre('');
    setYeniSifre('');
    setPanel(p);
  };

  const kadiKaydet = async () => {
    if (!kullanici) return;
    setMesgul(true);
    const h = await kullaniciAdiDegistir(kullanici.id, yeniKadi);
    setMesgul(false);
    if (h) return setHata(h);
    setKadi(yeniKadi.trim());
    setPanel(null);
    Alert.alert('Kullanıcı adın güncellendi', 'Değişiklik tüm uygulamada görünecek.');
  };

  const sifreKaydet = async () => {
    if (!hesap.eposta) return;
    setMesgul(true);
    const h = await sifreDegistir(hesap.eposta, mevcutSifre, yeniSifre);
    setMesgul(false);
    if (h) return setHata(h);
    setPanel(null);
    Alert.alert('Şifren güncellendi');
  };

  const pushDegistir = async (v: boolean) => {
    setPushAcik(v);
    if (!v) return pushKapat();
    const ok = await pushAc();
    if (!ok) {
      Alert.alert('Anlık bildirim açılamadı', 'Bildirim izni verilmemiş ya da bu sürüm anlık bildirimi desteklemiyor. İzni telefon ayarlarından açabilirsin.');
    }
  };

  const engelKaldir = async (k: EngelliKisi) => {
    if (!kullanici) return;
    if (await engelle(kullanici.id, k.id, false)) setEngelliler((l) => l.filter((x) => x.id !== k.id));
    else Alert.alert('İşlem yapılamadı', 'İnternet bağlantını kontrol edip tekrar dene.');
  };

  const onbellekTemizle = async () => {
    try {
      await Image.clearDiskCache();
      await Image.clearMemoryCache();
      Alert.alert('Önbellek temizlendi', 'Görseller gerektiğinde yeniden indirilecek.');
    } catch {
      Alert.alert('Temizlenemedi', 'Bir sorun oluştu, tekrar dene.');
    }
  };

  const saglayiciAd = hesap.saglayici === 'google' ? 'Google' : hesap.saglayici === 'apple' ? 'Apple' : null;
  const girdi = [styles.girdi, { backgroundColor: c.surfaceAlt, borderColor: c.border, color: c.text }];

  return (
    <View style={[styles.ekran, { backgroundColor: c.bg }]}>
      <View style={[styles.ust, { paddingTop: insets.top + spacing.sm, borderBottomColor: c.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" style={styles.geri}>
          <Ikon ad="ileri" boyut={22} renk={c.text} />
        </Pressable>
        <Text style={[styles.baslik, { color: c.text }]} accessibilityRole="header">Ayarlar</Text>
        <View style={styles.geri} />
      </View>

      <ScrollView contentContainerStyle={[styles.icerik, { paddingBottom: insets.bottom + spacing.xxl }]} showsVerticalScrollIndicator={false}>
        <Bolum baslik="Görünüm">
          <TemaSecici />
        </Bolum>

        {gercek ? (
          <>
            <View style={[styles.profilKart, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={[styles.avatar, { backgroundColor: c.surfaceAlt }]}>
                <Text style={[styles.avatarYazi, { color: c.primary }]}>{(kullanici?.ad ?? '?').charAt(0).toLocaleUpperCase('tr')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.profilAd, { color: c.text }]} numberOfLines={1}>{kullanici?.ad}</Text>
                <Text style={[styles.satirDeger, { color: c.textMuted }]} numberOfLines={1}>{hesap.eposta ?? ''}</Text>
              </View>
            </View>

            <Bolum baslik="Hesap">
              <Satir ikon="kisi" baslik="Kullanıcı adı" deger={kadi ? `@${kadi}` : '…'} onPress={() => paneliAc('kadi')} />
              <Satir ikon="mesaj" baslik="E-posta" deger={hesap.eposta ?? '—'} />
              {saglayiciAd ? (
                <Satir ikon="tik" baslik="Giriş yöntemi" deger={`${saglayiciAd} ile giriş yaptın`} son />
              ) : (
                <Satir ikon="sabit" baslik="Şifreyi değiştir" onPress={() => paneliAc('sifre')} son />
              )}
            </Bolum>

            <Bolum baslik="Gizlilik ve güvenlik">
              <Satir ikon="anonim" baslik="Engellenen sürücüler" deger={engelliler.length ? `${engelliler.length} kişi` : 'Kimseyi engellemedin'} onPress={() => paneliAc('engel')} son />
            </Bolum>

            <Bolum baslik="Bildirimler">
              <Satir
                ikon="zil"
                baslik="Anlık bildirimler"
                deger="Selam, yorum, sürüş isteği ve yönetim bildirimleri"
                sag={<Switch value={pushAcik} onValueChange={pushDegistir} trackColor={{ true: c.primary, false: c.border }} thumbColor="#FFFFFF" accessibilityLabel="Anlık bildirimler" />}
              />
              <Satir
                ikon="tik"
                baslik="Tümünü okundu say"
                deger={okunmamis ? `${okunmamis} okunmamış bildirim` : 'Okunmamış bildirim yok'}
                onPress={okunmamis ? hepsiniOkunduYap : undefined}
                son
              />
            </Bolum>

            <Bolum baslik="Konum">
              <Satir ikon="konum" baslik="Konum izni" deger={`${konumIzni} · Değiştirmek için dokun`} onPress={() => Linking.openSettings()} son />
            </Bolum>
          </>
        ) : null}

        <Bolum baslik="Uygulama">
          <Satir ikon="topluluk" baslik="Topluluk kuralları" onPress={() => paneliAc('kurallar')} />
          <Satir ikon="sil" baslik="Önbelleği temizle" deger="Kayıtlı görselleri siler" onPress={onbellekTemizle} />
          <Satir ikon="gonder" baslik="Roteri'yi arkadaşına öner" onPress={() => Share.share({ message: 'Roteri: Türkiye\'nin motosiklet topluluğu. Birlikte sürelim!' })} />
          <Satir ikon="yildiz" baslik="Sürüm" deger={`Roteri ${Constants.expoConfig?.version ?? '1.0.0'}`} son />
        </Bolum>

        <Bolum baslik="Oturum">
          <Satir ikon="cikis" baslik="Çıkış yap" onPress={() => setCikisAcik(true)} son={!gercek} />
          {gercek ? <Satir ikon="sil" baslik="Hesabımı sil" deger="Tüm verilerin kalıcı olarak silinir" tehlikeli onPress={() => setSilAcik(true)} son /> : null}
        </Bolum>
      </ScrollView>

      <AltSayfa gorunur={panel === 'kadi'} baslik="Kullanıcı adı" onKapat={() => setPanel(null)}>
        <Text style={[styles.satirDeger, { color: c.textMuted }]}>3–30 karakter; harf, rakam, nokta ve alt çizgi. Başkasının kullandığı ad alınamaz.</Text>
        <TextInput value={yeniKadi} onChangeText={setYeniKadi} autoCapitalize="none" autoCorrect={false} maxLength={30} placeholder="Yeni kullanıcı adı" placeholderTextColor={c.textMuted} style={girdi} />
        {hata ? <Text style={[styles.hata, { color: c.danger }]}>{hata}</Text> : null}
        <Dugme etiket={mesgul ? 'Kaydediliyor…' : 'Kaydet'} onPress={kadiKaydet} pasif={mesgul || yeniKadi.trim().length < 3} />
      </AltSayfa>

      <AltSayfa gorunur={panel === 'sifre'} baslik="Şifreyi değiştir" onKapat={() => setPanel(null)}>
        <TextInput value={mevcutSifre} onChangeText={setMevcutSifre} secureTextEntry autoCapitalize="none" placeholder="Mevcut şifre" placeholderTextColor={c.textMuted} style={girdi} />
        <TextInput value={yeniSifre} onChangeText={setYeniSifre} secureTextEntry autoCapitalize="none" placeholder="Yeni şifre (en az 6 karakter)" placeholderTextColor={c.textMuted} style={girdi} />
        {hata ? <Text style={[styles.hata, { color: c.danger }]}>{hata}</Text> : null}
        <Dugme etiket={mesgul ? 'Kaydediliyor…' : 'Şifreyi güncelle'} onPress={sifreKaydet} pasif={mesgul || !mevcutSifre || yeniSifre.length < 6} />
      </AltSayfa>

      <AltSayfa gorunur={panel === 'engel'} baslik="Engellenen sürücüler" onKapat={() => setPanel(null)}>
        {engelliler.length === 0 ? (
          <Text style={[styles.satirDeger, { color: c.textMuted, textAlign: 'center', paddingVertical: spacing.xl }]}>Kimseyi engellemedin.</Text>
        ) : (
          <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ gap: spacing.sm }}>
            {engelliler.map((k) => (
              <View key={k.id} style={[styles.engelSatir, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={[styles.engelAvatar, { backgroundColor: c.surfaceAlt }]}>
                  {k.avatarUrl ? <Image source={{ uri: k.avatarUrl }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Text style={{ color: c.primary, fontWeight: '900' }}>{k.ad.charAt(0).toLocaleUpperCase('tr')}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.satirBaslik, { color: c.text }]} numberOfLines={1}>{k.ad}</Text>
                  <Text style={[styles.satirDeger, { color: c.textMuted }]} numberOfLines={1}>@{k.kullaniciAdi}</Text>
                </View>
                <Dugme etiket="Kaldır" tur="kontur" onPress={() => engelKaldir(k)} style={{ minHeight: 36, paddingHorizontal: spacing.md }} />
              </View>
            ))}
          </ScrollView>
        )}
      </AltSayfa>

      <AltSayfa gorunur={panel === 'kurallar'} baslik="Topluluk kuralları" onKapat={() => setPanel(null)}>
        <View style={{ gap: spacing.md }}>
          {KURALLAR.map((k, i) => (
            <View key={i} style={styles.kural}>
              <View style={[styles.kuralNo, { backgroundColor: c.primary }]}><Text style={{ color: c.onPrimary, fontWeight: '900', fontSize: 12 }}>{i + 1}</Text></View>
              <Text style={[styles.kuralYazi, { color: c.text }]}>{k}</Text>
            </View>
          ))}
        </View>
      </AltSayfa>

      <OnayKutusu
        gorunur={cikisAcik}
        baslik="Çıkış yapılsın mı?"
        mesaj="İstediğin zaman tekrar giriş yapabilirsin."
        onayEtiketi="Çıkış yap"
        ikon="cikis"
        onOnay={() => { setCikisAcik(false); cikisYap(); }}
        onKapat={() => setCikisAcik(false)}
      />
      <OnayKutusu
        gorunur={silAcik}
        baslik="Hesabın silinsin mi?"
        mesaj="Profilin, gönderilerin, yorumların, mesajların ve motorların kalıcı olarak silinir. Bu işlem geri alınamaz."
        onayEtiketi="Hesabımı sil"
        ikon="sil"
        tehlikeli
        onOnay={async () => {
          setSilAcik(false);
          const h = await hesabiSil();
          if (h) Alert.alert('Hesap silinemedi', h);
        }}
        onKapat={() => setSilAcik(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  ust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  geri: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '180deg' }] },
  baslik: { flex: 1, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  icerik: { padding: spacing.lg, gap: spacing.xl },
  profilKart: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
  avatar: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  avatarYazi: { fontSize: 22, fontWeight: '900' },
  profilAd: { fontSize: 18, fontWeight: '900' },
  bolumBaslik: { fontSize: 12, fontWeight: '800', letterSpacing: 1, paddingLeft: 4 },
  kart: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  satir: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 13 },
  satirIkon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  satirBaslik: { fontSize: 15.5, fontWeight: '700' },
  satirDeger: { fontSize: 13, lineHeight: 18, marginTop: 1 },
  perde: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sayfa: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, padding: spacing.lg, gap: spacing.md },
  sayfaUst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sayfaBaslik: { fontSize: 18, fontWeight: '900' },
  girdi: { minHeight: 48, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md, fontSize: 16 },
  hata: { fontSize: 13, fontWeight: '600' },
  engelSatir: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  engelAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  kural: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  kuralNo: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  kuralYazi: { flex: 1, fontSize: 14.5, lineHeight: 21 },
});
