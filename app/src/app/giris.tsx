import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Line, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AppleLogo, GirisIkon, GoogleG } from '@/components/giris-ikonlari';
import { Ikon, type IkonAdi } from '@/components/ikon';
import { RoteriLogo } from '@/components/roteri-logo';
import { Dugme } from '@/components/yol-ui';
import { saglayiciyaGiris, type Saglayici } from '@/lib/oauth';
import { useOturum } from '@/lib/oturum';
import { sifirlamaKoduGonder, sifreyiYenile } from '@/lib/sifre';
import { supabase } from '@/lib/supabase';
import { fontSerif, radius, spacing, useTheme } from '@/theme';

type Mod = 'giris' | 'kayit' | 'sifre-eposta' | 'sifre-kod';

const OZELLIKLER: { ikon: IkonAdi; yazi: string }[] = [
  { ikon: 'motor', yazi: 'Birlikte sürüş' },
  { ikon: 'harita', yazi: 'Yakındaki rotalar' },
  { ikon: 'garaj', yazi: 'Kendi garajın' },
];

/** Hero arka planı: sıcak sarı ışık + perspektifli şerit çizgileri (asfalt hissi). */
function Arkaplan({ en, boy }: { en: number; boy: number }) {
  const c = useTheme();
  const cizgiler = Array.from({ length: 7 }, (_, i) => i);
  return (
    <Svg width={en} height={boy} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id="isik" cx="50%" cy="0%" rx="75%" ry="85%" fx="50%" fy="0%">
          <Stop offset="0" stopColor={c.primary} stopOpacity="0.34" />
          <Stop offset="0.55" stopColor={c.primary} stopOpacity="0.07" />
          <Stop offset="1" stopColor={c.primary} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={en} height={boy} fill="url(#isik)" />
      {cizgiler.map((i) => {
        const x = en * (0.5 + (i - 3) * 0.34);
        return <Line key={i} x1={en / 2} y1={boy * 0.12} x2={x} y2={boy} stroke={c.primary} strokeOpacity={0.07} strokeWidth={1.2} strokeDasharray="10 14" />;
      })}
      <Circle cx={en * 0.86} cy={boy * 0.2} r={90} fill={c.primary} fillOpacity={0.05} />
      <Circle cx={en * 0.1} cy={boy * 0.62} r={60} fill={c.primary} fillOpacity={0.04} />
    </Svg>
  );
}

function Alan({
  ikon, yer, deger, degis, sifre, ...rest
}: {
  ikon: 'eposta' | 'kilit' | 'kullanici' | 'kod';
  yer: string;
  deger: string;
  degis: (t: string) => void;
  sifre?: boolean;
} & Pick<React.ComponentProps<typeof TextInput>, 'keyboardType' | 'autoCapitalize' | 'maxLength' | 'editable' | 'autoComplete' | 'textContentType' | 'onSubmitEditing' | 'returnKeyType'>) {
  const c = useTheme();
  const [goster, setGoster] = useState(false);
  const [odak, setOdak] = useState(false);
  return (
    <View style={[styles.alan, { backgroundColor: c.surfaceAlt, borderColor: odak ? c.primary : c.border }, rest.editable === false && { opacity: 0.6 }]}>
      <GirisIkon ad={ikon} renk={odak ? c.primary : c.textMuted} />
      <TextInput
        {...rest}
        value={deger}
        onChangeText={degis}
        placeholder={yer}
        placeholderTextColor={c.textMuted}
        secureTextEntry={sifre && !goster}
        autoCorrect={false}
        onFocus={() => setOdak(true)}
        onBlur={() => setOdak(false)}
        style={[styles.girdi, { color: c.text }]}
        accessibilityLabel={yer}
      />
      {sifre ? (
        <Pressable onPress={() => setGoster(!goster)} hitSlop={10} accessibilityRole="button" accessibilityLabel={goster ? 'Şifreyi gizle' : 'Şifreyi göster'}>
          <GirisIkon ad={goster ? 'gozKapali' : 'goz'} renk={c.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

function SosyalDugme({ saglayici, mesgul, onPress }: { saglayici: Saglayici; mesgul: boolean; onPress: () => void }) {
  const c = useTheme();
  const apple = saglayici === 'apple';
  return (
    <Pressable
      onPress={onPress}
      disabled={mesgul}
      accessibilityRole="button"
      accessibilityLabel={apple ? 'Apple ile devam et' : 'Google ile devam et'}
      style={({ pressed }) => [
        styles.sosyal,
        apple ? { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' } : { backgroundColor: c.surfaceAlt, borderColor: c.border },
        mesgul && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
      ]}>
      {apple ? <AppleLogo boyut={20} renk="#000000" /> : <GoogleG boyut={20} />}
      <Text style={[styles.sosyalYazi, { color: apple ? '#000000' : c.text }]}>{apple ? 'Apple' : 'Google'}</Text>
    </Pressable>
  );
}

export default function Giris() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { girisYap, epostaGiris, kayitOl } = useOturum();

  const [mod, setMod] = useState<Mod>('giris');
  const [eposta, setEposta] = useState('');
  const [sifre, setSifre] = useState('');
  const [kadi, setKadi] = useState('');
  const [kod, setKod] = useState('');
  const [mesaj, setMesaj] = useState<{ yazi: string; iyi?: boolean } | null>(null);
  const [mesgul, setMesgul] = useState(false);
  const [klavye, setKlavye] = useState(false);
  useEffect(() => {
    const a = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKlavye(true));
    const b = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKlavye(false));
    return () => { a.remove(); b.remove(); };
  }, []);

  // Giriş animasyonu (JS sürücüsü: Android'de native-driver sorunlarından kaçınmak için)
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [anim]);

  const modDegis = (m: Mod) => {
    setMod(m);
    setMesaj(null);
    setKod('');
  };

  const epostaGecerli = /^\S+@\S+\.\S+$/.test(eposta.trim());
  const kadiGecerli = /^[A-Za-z0-9._]{3,30}$/.test(kadi.trim());
  const girisGecerli = epostaGecerli && sifre.length >= 6 && (mod !== 'kayit' || kadiGecerli);

  const gonder = async () => {
    if (!girisGecerli || mesgul) return;
    setMesgul(true);
    setMesaj(null);
    const hata = mod === 'kayit' ? await kayitOl(eposta, sifre, kadi) : await epostaGiris(eposta, sifre);
    setMesgul(false);
    if (hata) {
      const sade = /invalid login/i.test(hata) ? 'E-posta ya da şifre hatalı.' : /already registered|already been registered/i.test(hata) ? 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.' : /duplicate|username/i.test(hata) ? 'Bu kullanıcı adı alınmış.' : hata;
      setMesaj({ yazi: sade, iyi: hata.startsWith('Kayıt oldu') });
    }
  };

  const sosyal = async (s: Saglayici) => {
    if (mesgul) return;
    setMesgul(true);
    setMesaj(null);
    const hata = await saglayiciyaGiris(s);
    setMesgul(false);
    if (hata) setMesaj({ yazi: hata });
  };

  const kodGonder = async () => {
    setMesgul(true);
    setMesaj(null);
    const hata = await sifirlamaKoduGonder(eposta);
    setMesgul(false);
    if (hata) return setMesaj({ yazi: hata });
    setMod('sifre-kod');
    setMesaj({ yazi: 'E-postana 6 haneli bir kod gönderdik. Kodu ve yeni şifreni gir.', iyi: true });
  };
  const sifreBitir = async () => {
    setMesgul(true);
    setMesaj(null);
    const hata = await sifreyiYenile(eposta, kod, sifre);
    setMesgul(false);
    if (hata) setMesaj({ yazi: hata });
  };

  const kucuk = height < 740;
  const kayitMi = mod === 'kayit';
  const sifreMod = mod === 'sifre-eposta' || mod === 'sifre-kod';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.kap, { backgroundColor: c.bg }]}>
      <View style={styles.scroll}>
        {/* HERO: kalan alanı doldurur; klavye açılınca yalnız logo kalır */}
        <View style={{ flex: 1, minHeight: 0, paddingTop: insets.top, overflow: 'hidden' }}>
          <Arkaplan en={width} boy={height} />
          <Animated.View
            style={[styles.heroIc, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
            <RoteriLogo yukseklik={klavye ? 22 : 30} renk={c.text} />
            {!klavye ? (
              <>
                <Text style={[styles.slogan, { color: c.text, fontFamily: fontSerif, fontSize: kucuk ? 30 : 38, lineHeight: kucuk ? 36 : 44 }]}>
                  Yolda yalnız{'\n'}değilsin<Text style={{ color: c.primary }}>.</Text>
                </Text>
                {!kucuk ? <Text style={[styles.altSlogan, { color: c.textMuted }]}>Türkiye'nin motosiklet topluluğuna katıl.</Text> : null}
                {!kucuk ? (
                  <View style={styles.ozellikler}>
                    {OZELLIKLER.map((o) => (
                      <View key={o.yazi} style={[styles.ozellik, { backgroundColor: c.surface, borderColor: c.border }]}>
                        <Ikon ad={o.ikon} boyut={14} renk={c.primary} />
                        <Text style={[styles.ozellikYazi, { color: c.text }]}>{o.yazi}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </>
            ) : null}
          </Animated.View>
        </View>

        {/* FORM KARTI */}
        <Animated.View
          style={[
            styles.kart,
            { backgroundColor: c.surface, borderColor: c.border, paddingBottom: insets.bottom + spacing.lg, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] },
          ]}>
          <View style={[styles.tutamac, { backgroundColor: c.border }]} />

          {!supabase ? (
            <View style={{ gap: spacing.md }}>
              <Text style={[styles.baslik, { color: c.text }]}>Demo modu</Text>
              <Text style={[styles.aciklama, { color: c.textMuted }]}>Henüz bir hesaba bağlı değilsin. Uygulamayı örnek verilerle gezebilirsin.</Text>
              <Dugme etiket="Demo kullanıcı ile gir" onPress={girisYap} />
            </View>
          ) : sifreMod ? (
            <View style={{ gap: spacing.md }}>
              <Text style={[styles.baslik, { color: c.text }]}>Şifreni yenile</Text>
              <Text style={[styles.aciklama, { color: c.textMuted }]}>
                {mod === 'sifre-eposta' ? 'Hesabına bağlı e-postayı gir, sana bir kod gönderelim.' : 'E-postana gelen kodu ve yeni şifreni gir.'}
              </Text>
              <Alan ikon="eposta" yer="E-posta" deger={eposta} degis={setEposta} keyboardType="email-address" autoCapitalize="none" editable={mod === 'sifre-eposta'} />
              {mod === 'sifre-kod' ? (
                <>
                  <Alan ikon="kod" yer="6 haneli kod" deger={kod} degis={setKod} keyboardType="number-pad" maxLength={8} />
                  <Alan ikon="kilit" yer="Yeni şifre (en az 6 karakter)" deger={sifre} degis={setSifre} sifre />
                </>
              ) : null}
              {mesaj ? <Mesaj m={mesaj} /> : null}
              {mod === 'sifre-eposta' ? (
                <Birincil etiket="Kod gönder" mesgul={mesgul} pasif={!epostaGecerli} onPress={kodGonder} />
              ) : (
                <Birincil etiket="Şifreyi yenile" mesgul={mesgul} pasif={kod.trim().length < 6 || sifre.length < 6} onPress={sifreBitir} />
              )}
              <Pressable onPress={() => modDegis('giris')} accessibilityRole="button" style={styles.baglanti}>
                <Text style={[styles.baglantiYazi, { color: c.textMuted }]}>Girişe geri dön</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              <View style={[styles.sekmeler, { backgroundColor: c.surfaceAlt }]} accessibilityRole="tablist">
                {(['giris', 'kayit'] as const).map((m) => {
                  const secili = mod === m;
                  return (
                    <Pressable key={m} onPress={() => modDegis(m)} accessibilityRole="tab" accessibilityState={{ selected: secili }} style={[styles.sekme, secili && { backgroundColor: c.primary }]}>
                      <Text style={[styles.sekmeYazi, { color: secili ? c.onPrimary : c.textMuted }]}>{m === 'giris' ? 'Giriş yap' : 'Kayıt ol'}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.sosyalSatir}>
                <SosyalDugme saglayici="apple" mesgul={mesgul} onPress={() => sosyal('apple')} />
                <SosyalDugme saglayici="google" mesgul={mesgul} onPress={() => sosyal('google')} />
              </View>

              <View style={styles.ayirac}>
                <View style={[styles.cizgi, { backgroundColor: c.border }]} />
                <Text style={[styles.ayiracYazi, { color: c.textMuted }]}>veya e-posta ile</Text>
                <View style={[styles.cizgi, { backgroundColor: c.border }]} />
              </View>

              {kayitMi ? <Alan ikon="kullanici" yer="Kullanıcı adı" deger={kadi} degis={setKadi} autoCapitalize="none" maxLength={30} /> : null}
              {kayitMi && kadi.length > 0 && !kadiGecerli ? <Text style={[styles.ipucu, { color: c.danger }]}>3–30 karakter; harf, rakam, nokta ve alt çizgi kullanabilirsin.</Text> : null}
              <Alan ikon="eposta" yer="E-posta" deger={eposta} degis={setEposta} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              <Alan ikon="kilit" yer={kayitMi ? 'Şifre (en az 6 karakter)' : 'Şifre'} deger={sifre} degis={setSifre} sifre autoComplete={kayitMi ? 'new-password' : 'current-password'} returnKeyType="go" onSubmitEditing={gonder} />

              {!kayitMi ? (
                <Pressable onPress={() => modDegis('sifre-eposta')} accessibilityRole="button" style={styles.sifreUnuttum}>
                  <Text style={[styles.baglantiYazi, { color: c.primary }]}>Şifremi unuttum</Text>
                </Pressable>
              ) : null}

              {mesaj ? <Mesaj m={mesaj} /> : null}
              <Birincil etiket={kayitMi ? 'Hesap oluştur' : 'Giriş yap'} mesgul={mesgul} pasif={!girisGecerli} onPress={gonder} />

              {!klavye ? <Text style={[styles.yasal, { color: c.textMuted }]}>Devam ederek Kullanım Koşulları'nı ve Gizlilik Politikası'nı kabul etmiş olursun.</Text> : null}
            </View>
          )}
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Mesaj({ m }: { m: { yazi: string; iyi?: boolean } }) {
  const c = useTheme();
  const renk = m.iyi ? c.success : c.danger;
  return (
    <View style={[styles.mesaj, { borderColor: renk, backgroundColor: `${renk}1A` }]} accessibilityRole="alert">
      <Ikon ad={m.iyi ? 'tik' : 'uyari'} boyut={16} renk={renk} />
      <Text style={[styles.mesajYazi, { color: c.text }]}>{m.yazi}</Text>
    </View>
  );
}

function Birincil({ etiket, mesgul, pasif, onPress }: { etiket: string; mesgul: boolean; pasif: boolean; onPress: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={pasif || mesgul}
      accessibilityRole="button"
      accessibilityState={{ disabled: pasif || mesgul, busy: mesgul }}
      style={({ pressed }) => [styles.birincil, { backgroundColor: c.primary }, (pasif || mesgul) && { opacity: 0.45 }, pressed && { opacity: 0.85 }]}>
      {mesgul ? <ActivityIndicator color={c.onPrimary} /> : <Text style={[styles.birincilYazi, { color: c.onPrimary }]}>{etiket}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1 },
  scroll: { flex: 1 },
  heroIc: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md, gap: spacing.md },
  slogan: { fontSize: 38, lineHeight: 44, fontWeight: '800', marginTop: spacing.lg, letterSpacing: -0.5, textAlign: 'center' },
  altSlogan: { fontSize: 15, lineHeight: 21, textAlign: 'center' },
  ozellikler: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xs },
  ozellik: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1 },
  ozellikYazi: { fontSize: 12.5, fontWeight: '700' },
  kart: { borderTopLeftRadius: radius.xl + 4, borderTopRightRadius: radius.xl + 4, borderWidth: 1, borderBottomWidth: 0, paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  tutamac: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, marginBottom: spacing.md },
  baslik: { fontSize: 22, fontWeight: '800' },
  aciklama: { fontSize: 14, lineHeight: 20 },
  sekmeler: { flexDirection: 'row', padding: 4, borderRadius: radius.md + 2 },
  sekme: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: radius.md - 2 },
  sekmeYazi: { fontSize: 14.5, fontWeight: '800' },
  sosyal: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 48, borderRadius: radius.md, borderWidth: 1 },
  sosyalYazi: { fontSize: 15.5, fontWeight: '700' },
  sosyalSatir: { flexDirection: 'row', gap: spacing.md },
  ayirac: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: 2 },
  cizgi: { flex: 1, height: StyleSheet.hairlineWidth },
  ayiracYazi: { fontSize: 12.5, fontWeight: '600' },
  alan: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, borderRadius: radius.md, borderWidth: 1.5, paddingHorizontal: spacing.md },
  girdi: { flex: 1, fontSize: 16, height: '100%' },
  ipucu: { fontSize: 12, marginTop: -6 },
  sifreUnuttum: { alignSelf: 'flex-end', marginTop: -4, paddingVertical: 2 },
  baglanti: { alignSelf: 'center', paddingVertical: spacing.sm },
  baglantiYazi: { fontSize: 13.5, fontWeight: '700' },
  mesaj: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  mesajYazi: { flex: 1, fontSize: 13.5, lineHeight: 19 },
  birincil: { height: 50, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  birincilYazi: { fontSize: 16.5, fontWeight: '800' },
  yasal: { fontSize: 11.5, lineHeight: 16, textAlign: 'center', marginTop: spacing.xs },
});
