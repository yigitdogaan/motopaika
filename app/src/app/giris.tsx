import { DOGRULAMA_GEREKLI, kayitKoduDogrula, kayitKoduTekrar } from '@/lib/kayit';
import { useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AppleLogo, GirisIkon, GoogleG } from '@/components/giris-ikonlari';
import { Ikon } from '@/components/ikon';
import { RoteriLogo } from '@/components/roteri-logo';
import { saglayiciyaGiris, type Saglayici } from '@/lib/oauth';
import { useOturum } from '@/lib/oturum';
import { sifirlamaKoduGonder, sifreyiYenile } from '@/lib/sifre';
import { supabase } from '@/lib/supabase';
import { fontSerif, palette, radius, spacing } from '@/theme';

type Mod = 'giris' | 'kayit' | 'sifre-eposta' | 'sifre-kod' | 'dogrula';

/** Giriş ekranı her temada aynı koyu gri görünümü kullanır (marka ilk izlenimi). */
const G = { ...palette.dark, bg: '#18191C', surface: '#25272B', surfaceAlt: '#2B2D32', border: '#3A3D44' };

/** Küçük, deterministik "tane" noktaları (gerçek rastgelelik yok; her açılışta aynı görünüm). */
function taneler(en: number, boy: number, adet: number) {
  let x = 7;
  const r = () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
  return Array.from({ length: adet }, () => ({ cx: r() * en, cy: r() * boy, o: 0.03 + r() * 0.05, r: 0.5 + r() * 0.7 }));
}

/** Kontur haritası: üst üste binen yumuşak dalga çizgileri (topoğrafya hissi) + sarı ışık + ince tane. */
function Arkaplan({ en, boy }: { en: number; boy: number }) {
  const noktalar = useMemo(() => taneler(en, boy, 160), [en, boy]);
  const kontur = useMemo(() => {
    const cizgiler: string[] = [];
    for (let k = 0; k < 14; k++) {
      const y0 = boy * (0.05 + k * 0.045);
      const g = 18 + k * 5;
      let d = `M ${-20} ${y0}`;
      for (let i = 0; i <= 6; i++) {
        const x = (en / 6) * i + 0;
        const y = y0 + Math.sin(i * 1.15 + k * 0.5) * g + Math.cos(i * 0.7 + k) * (g * 0.4);
        d += ` L ${x} ${y}`;
      }
      cizgiler.push(d);
    }
    return cizgiler;
  }, [en, boy]);
  return (
    <Svg width={en} height={boy} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="zemin" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2E3035" />
          <Stop offset="0.5" stopColor="#1F2024" />
          <Stop offset="1" stopColor="#141517" />
        </LinearGradient>
        <RadialGradient id="isik" cx="50%" cy="22%" rx="70%" ry="42%" fx="50%" fy="22%">
          <Stop offset="0" stopColor={G.primary} stopOpacity="0.22" />
          <Stop offset="0.6" stopColor={G.primary} stopOpacity="0.05" />
          <Stop offset="1" stopColor={G.primary} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="vinyet" cx="50%" cy="40%" rx="85%" ry="75%">
          <Stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={en} height={boy} fill="url(#zemin)" />
      {kontur.map((d, i) => (
        <Path key={i} d={d} stroke="#FFFFFF" strokeOpacity={0.035 + (i % 3) * 0.012} strokeWidth={1} fill="none" strokeLinejoin="round" />
      ))}
      <Path d={`M ${en * 0.1} ${boy * 0.02} C ${en * 0.6} ${boy * 0.18}, ${en * 0.2} ${boy * 0.3}, ${en * 0.8} ${boy * 0.46}`} stroke={G.primary} strokeOpacity={0.1} strokeWidth={1.4} strokeDasharray="10 12" fill="none" />
      <Rect x={0} y={0} width={en} height={boy} fill="url(#isik)" />
      {noktalar.map((n, i) => (
        <Circle key={i} cx={n.cx} cy={n.cy} r={n.r} fill="#FFFFFF" fillOpacity={n.o} />
      ))}
      <Rect x={0} y={0} width={en} height={boy} fill="url(#vinyet)" />
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
  const c = G;
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
  const apple = saglayici === 'apple';
  // Apple: beyaz zemin, siyah yazı. Google: koyu temadaki resmi görünüm.
  const zemin = apple ? '#FFFFFF' : '#131314';
  const yazi = apple ? '#000000' : '#E3E3E3';
  const kenar = apple ? '#FFFFFF' : '#8E918F';
  return (
    <Pressable
      onPress={onPress}
      disabled={mesgul}
      accessibilityRole="button"
      accessibilityLabel={apple ? 'Apple ile devam et' : 'Google ile devam et'}
      style={({ pressed }) => [styles.sosyal, { backgroundColor: zemin, borderColor: kenar }, mesgul && { opacity: 0.5 }, pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] }]}>
      {apple ? <AppleLogo boyut={22} renk={yazi} /> : <GoogleG boyut={21} />}
      <Text style={[styles.sosyalYazi, { color: yazi }]}>{apple ? 'Apple ile devam et' : 'Google ile devam et'}</Text>
    </Pressable>
  );
}

export default function Giris() {
  const c = G;
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [epostaAcik, setEpostaAcik] = useState(false);
  const router = useRouter();
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

  // Doğrulama kodu ekranına geç; 60 sn boyunca "tekrar gönder" kapalı.
  const [bekle, setBekle] = useState(0);
  useEffect(() => {
    if (bekle <= 0) return;
    const t = setTimeout(() => setBekle((b) => b - 1), 1000);
    return () => clearTimeout(t);
  }, [bekle]);
  const dogrulamayaGec = (yazi: string) => {
    setMod('dogrula');
    setKod('');
    setBekle(60);
    setMesaj({ yazi, iyi: true });
  };

  const gonder = async () => {
    if (!girisGecerli || mesgul) return;
    setMesgul(true);
    setMesaj(null);
    const hata = mod === 'kayit' ? await kayitOl(eposta, sifre, kadi) : await epostaGiris(eposta, sifre);
    setMesgul(false);
    if (hata === DOGRULAMA_GEREKLI) {
      dogrulamayaGec('E-postana bir doğrulama kodu gönderdik. Kodu gir.');
      return;
    }
    if (hata) {
      if (/not confirmed/i.test(hata)) {
        // E-posta henüz doğrulanmamış: yeni kod gönder ve kod ekranına geç.
        await kayitKoduTekrar(eposta);
        dogrulamayaGec('E-postan henüz doğrulanmamış. Sana yeni bir kod gönderdik.');
        return;
      }
      const sade = /invalid login/i.test(hata)
        ? 'E-posta ya da şifre hatalı.'
        : /already registered|already been registered/i.test(hata)
          ? 'Bu e-posta ile zaten bir hesap var. Giriş yap ya da şifreni sıfırla.'
          : /rate limit|too many/i.test(hata)
            ? 'Çok sık denedin. Birkaç dakika sonra tekrar dene.'
            : /duplicate|username/i.test(hata)
              ? 'Bu kullanıcı adı alınmış.'
              : hata;
      setMesaj({ yazi: sade });
    }
  };

  const dogrula = async () => {
    setMesgul(true);
    setMesaj(null);
    const hata = await kayitKoduDogrula(eposta, kod);
    setMesgul(false);
    if (hata) setMesaj({ yazi: hata });
  };
  const kodTekrar = async () => {
    if (bekle > 0 || mesgul) return;
    setMesgul(true);
    setMesaj(null);
    const hata = await kayitKoduTekrar(eposta);
    setMesgul(false);
    if (hata) return setMesaj({ yazi: hata });
    setBekle(60);
    setMesaj({ yazi: 'Yeni kod gönderildi. Gelmediyse spam klasörüne de bak.', iyi: true });
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
    setMesaj({ yazi: 'E-postana bir kod gönderdik. Kodu ve yeni şifreni gir.', iyi: true });
  };
  const sifreBitir = async () => {
    setMesgul(true);
    setMesaj(null);
    const hata = await sifreyiYenile(eposta, kod, sifre);
    setMesgul(false);
    if (hata) setMesaj({ yazi: hata });
  };

  const kayitMi = mod === 'kayit';
  const sifreMod = mod === 'sifre-eposta' || mod === 'sifre-kod';
  const formGorunur = epostaAcik || sifreMod || mod === 'dogrula';
  const sirali: Saglayici[] = Platform.OS === 'ios' ? ['apple', 'google'] : ['google', 'apple'];
  const giris = { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] };

  return (
    <KeyboardAvoidingView behavior="padding" style={[styles.kap, { backgroundColor: G.bg }]}>
      <StatusBar style="light" />
      <Arkaplan en={width} boy={height + insets.top} />
      <ScrollView contentContainerStyle={styles.icerik} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
        <Animated.View style={[styles.ust, { paddingTop: insets.top + spacing.xxl }, giris]}>
          <RoteriLogo yukseklik={klavye ? 28 : 38} renk={G.text} isaret={G.primary} />
          {!klavye ? (
            <Text style={[styles.slogan, { color: G.text, fontFamily: fontSerif }]}>
              Yolda yalnız{'\n'}değilsin<Text style={{ color: G.primary }}>.</Text>
            </Text>
          ) : null}
        </Animated.View>

        <Animated.View style={[styles.alt, { paddingBottom: klavye ? spacing.lg : insets.bottom + spacing.lg }, giris]}>
          {!supabase ? (
            <View style={{ gap: spacing.md }}>
              <Text style={[styles.aciklama, { color: G.textMuted, textAlign: 'center' }]}>Henüz bir hesaba bağlı değilsin. Uygulamayı örnek verilerle gezebilirsin.</Text>
              <Birincil etiket="Demo kullanıcı ile gir" mesgul={false} pasif={false} onPress={girisYap} />
            </View>
          ) : mod === 'dogrula' ? (
            <View style={{ gap: spacing.md }}>
              <Text style={[styles.baslik, { color: c.text }]}>E-postanı doğrula</Text>
              <Text style={[styles.aciklama, { color: c.textMuted }]}>{eposta.trim()} adresine bir doğrulama kodu gönderdik. Kodu girince hesabın hazır olur.</Text>
              <Alan ikon="kod" yer="Doğrulama kodu" deger={kod} degis={(t) => setKod(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={8} textContentType="oneTimeCode" autoComplete="sms-otp" />
              {mesaj ? <Mesaj m={mesaj} /> : null}
              <Birincil etiket="Doğrula" mesgul={mesgul} pasif={kod.trim().length < 6} onPress={dogrula} />
              <Pressable onPress={kodTekrar} disabled={bekle > 0 || mesgul} accessibilityRole="button" style={styles.baglanti}>
                <Text style={[styles.baglantiYazi, { color: bekle > 0 ? c.textMuted : c.primary }]}>{bekle > 0 ? `Kodu tekrar gönder (${bekle})` : 'Kodu tekrar gönder'}</Text>
              </Pressable>
              <Pressable onPress={() => modDegis('giris')} accessibilityRole="button" style={styles.baglanti}>
                <Text style={[styles.baglantiYazi, { color: c.textMuted }]}>Girişe geri dön</Text>
              </Pressable>
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
                  <Alan ikon="kod" yer="Doğrulama kodu" deger={kod} degis={(t) => setKod(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={8} textContentType="oneTimeCode" autoComplete="sms-otp" />
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
          ) : formGorunur ? (
            <View style={{ gap: 10 }}>
              <View style={[styles.sekmeler, { backgroundColor: G.surfaceAlt }]} accessibilityRole="tablist">
                {(['giris', 'kayit'] as const).map((m) => {
                  const secili = mod === m;
                  return (
                    <Pressable key={m} onPress={() => modDegis(m)} accessibilityRole="tab" accessibilityState={{ selected: secili }} style={[styles.sekme, secili && { backgroundColor: G.primary }]}>
                      <Text style={[styles.sekmeYazi, { color: secili ? G.onPrimary : G.textMuted }]}>{m === 'giris' ? 'Giriş yap' : 'Kayıt ol'}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {kayitMi ? <Alan ikon="kullanici" yer="Kullanıcı adı" deger={kadi} degis={setKadi} autoCapitalize="none" maxLength={30} /> : null}
              {kayitMi && kadi.length > 0 && !kadiGecerli ? <Text style={[styles.ipucu, { color: G.danger }]}>3–30 karakter; harf, rakam, nokta ve alt çizgi kullanabilirsin.</Text> : null}
              <Alan ikon="eposta" yer="E-posta" deger={eposta} degis={setEposta} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              <Alan ikon="kilit" yer={kayitMi ? 'Şifre (en az 6 karakter)' : 'Şifre'} deger={sifre} degis={setSifre} sifre autoComplete={kayitMi ? 'new-password' : 'current-password'} returnKeyType="go" onSubmitEditing={gonder} />
              {!kayitMi ? (
                <Pressable onPress={() => modDegis('sifre-eposta')} accessibilityRole="button" style={styles.sifreUnuttum}>
                  <Text style={[styles.baglantiYazi, { color: G.primary }]}>Şifremi unuttum</Text>
                </Pressable>
              ) : null}
              {mesaj ? <Mesaj m={mesaj} /> : null}
              <Birincil etiket={kayitMi ? 'Hesap oluştur' : 'Giriş yap'} mesgul={mesgul} pasif={!girisGecerli} onPress={gonder} />
              <Pressable onPress={() => { setEpostaAcik(false); modDegis('giris'); }} accessibilityRole="button" style={styles.baglanti}>
                <Text style={[styles.baglantiYazi, { color: G.textMuted }]}>Diğer giriş seçenekleri</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: spacing.md }}>
              {sirali.map((s) => (
                <SosyalDugme key={s} saglayici={s} mesgul={mesgul} onPress={() => sosyal(s)} />
              ))}
              {mesaj ? <Mesaj m={mesaj} /> : null}
              <View style={styles.ayirac}>
                <View style={[styles.cizgi, { backgroundColor: G.border }]} />
                <Text style={[styles.ayiracYazi, { color: G.textMuted }]}>veya</Text>
                <View style={[styles.cizgi, { backgroundColor: G.border }]} />
              </View>
              <Pressable
                onPress={() => { setMesaj(null); setEpostaAcik(true); }}
                accessibilityRole="button"
                accessibilityLabel="E-posta ile devam et"
                style={({ pressed }) => [styles.eposta, { borderColor: G.border, backgroundColor: pressed ? G.surfaceAlt : G.surface }]}>
                <GirisIkon ad="eposta" boyut={20} renk={G.text} />
                <Text style={[styles.sosyalYazi, { color: G.text }]}>E-posta ile devam et</Text>
              </Pressable>
              {!klavye ? (
                <Text style={[styles.yasal, { color: G.textMuted }]}>
                  Devam ederek{' '}
                  <Text style={{ color: G.text, fontWeight: '700' }} onPress={() => router.push('/yasal/kosullar' as Href)} accessibilityRole="link">Kullanım Koşulları</Text>
                  {"'nı ve "}
                  <Text style={{ color: G.text, fontWeight: '700' }} onPress={() => router.push('/yasal/gizlilik' as Href)} accessibilityRole="link">Gizlilik Politikası</Text>
                  {"'nı kabul etmiş olursun."}
                </Text>
              ) : null}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Mesaj({ m }: { m: { yazi: string; iyi?: boolean } }) {
  const c = G;
  const renk = m.iyi ? c.success : c.danger;
  return (
    <View style={[styles.mesaj, { borderColor: renk, backgroundColor: `${renk}1A` }]} accessibilityRole="alert">
      <Ikon ad={m.iyi ? 'tik' : 'uyari'} boyut={16} renk={renk} />
      <Text style={[styles.mesajYazi, { color: c.text }]}>{m.yazi}</Text>
    </View>
  );
}

function Birincil({ etiket, mesgul, pasif, onPress }: { etiket: string; mesgul: boolean; pasif: boolean; onPress: () => void }) {
  const c = G;
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
  icerik: { flexGrow: 1, justifyContent: 'space-between' },
  ust: { alignItems: 'center', gap: spacing.xl, paddingHorizontal: spacing.xl },
  slogan: { fontSize: 30, lineHeight: 37, fontWeight: '800', letterSpacing: -0.4, textAlign: 'center' },
  alt: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  baslik: { fontSize: 22, fontWeight: '800' },
  aciklama: { fontSize: 14, lineHeight: 20 },
  sekmeler: { flexDirection: 'row', padding: 4, borderRadius: radius.md + 2 },
  sekme: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: radius.md - 2 },
  sekmeYazi: { fontSize: 14.5, fontWeight: '800' },
  sosyal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: radius.lg, borderWidth: 1 },
  sosyalYazi: { fontSize: 16, fontWeight: '700' },
  eposta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: radius.lg, borderWidth: 1 },
  ayirac: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: 2 },
  cizgi: { flex: 1, height: StyleSheet.hairlineWidth },
  ayiracYazi: { fontSize: 12.5, fontWeight: '600' },
  alan: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, borderRadius: radius.md, borderWidth: 1.5, paddingHorizontal: spacing.md },
  girdi: { flex: 1, fontSize: 16, height: '100%' },
  ipucu: { fontSize: 12, marginTop: -6 },
  sifreUnuttum: { alignSelf: 'flex-end', marginTop: -4, paddingVertical: 2 },
  baglanti: { alignSelf: 'center', paddingVertical: spacing.sm },
  baglantiYazi: { fontSize: 13.5, fontWeight: '700' },
  mesaj: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  mesajYazi: { flex: 1, fontSize: 13.5, lineHeight: 19 },
  birincil: { height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  birincilYazi: { fontSize: 16.5, fontWeight: '800' },
  yasal: { fontSize: 11.5, lineHeight: 16, textAlign: 'center', marginTop: spacing.xs },
});
