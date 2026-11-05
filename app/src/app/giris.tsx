import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { RoteriLogo } from '@/components/roteri-logo';
import { Dugme } from '@/components/yol-ui';
import { useOturum } from '@/lib/oturum';
import { sifirlamaKoduGonder, sifreyiYenile } from '@/lib/sifre';
import { supabase } from '@/lib/supabase';
import { radius, spacing, typography, useTheme } from '@/theme';

export default function Giris() {
  const c = useTheme();
  const { girisYap, epostaGiris, kayitOl } = useOturum();
  const [kayit, setKayit] = useState(false);
  const [eposta, setEposta] = useState('');
  const [sifre, setSifre] = useState('');
  const [kadi, setKadi] = useState('');
  const [mesaj, setMesaj] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState(false);
  const [sifirla, setSifirla] = useState<null | 'eposta' | 'kod'>(null);
  const [kod, setKod] = useState('');

  const sifirlaGonder = async () => {
    setMesgul(true);
    setMesaj(null);
    const hata = await sifirlamaKoduGonder(eposta);
    setMesgul(false);
    if (hata) return setMesaj(hata);
    setSifirla('kod');
    setMesaj('E-postana 6 haneli bir kod gönderdik. Kodu ve yeni şifreni gir.');
  };
  const sifirlaBitir = async () => {
    setMesgul(true);
    setMesaj(null);
    const hata = await sifreyiYenile(eposta, kod, sifre);
    setMesgul(false);
    if (hata) setMesaj(hata);
  };

  const gonder = async () => {
    setMesgul(true);
    setMesaj(null);
    const hata = kayit ? await kayitOl(eposta, sifre, kadi) : await epostaGiris(eposta, sifre);
    setMesgul(false);
    if (hata) setMesaj(hata);
  };
  const gecerli = eposta.includes('@') && sifre.length >= 6 && (!kayit || kadi.trim().length >= 3);
  const girdi = [styles.girdi, { backgroundColor: c.surface, borderColor: c.border, color: c.text }];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.kap, { backgroundColor: c.bg }]}>
      <RoteriLogo yukseklik={34} renk={c.text} />
      {supabase && sifirla ? (
        <View style={styles.form}>
          <Text style={[typography.body, { color: c.text, fontWeight: '800' }]}>Şifremi unuttum</Text>
          <TextInput style={girdi} placeholder="E-posta" placeholderTextColor={c.textMuted} autoCapitalize="none" keyboardType="email-address" value={eposta} onChangeText={setEposta} editable={sifirla === 'eposta'} />
          {sifirla === 'kod' ? (
            <>
              <TextInput style={girdi} placeholder="6 haneli kod" placeholderTextColor={c.textMuted} keyboardType="number-pad" maxLength={8} value={kod} onChangeText={setKod} />
              <TextInput style={girdi} placeholder="Yeni şifre (en az 6 karakter)" placeholderTextColor={c.textMuted} secureTextEntry value={sifre} onChangeText={setSifre} />
            </>
          ) : null}
          {mesaj ? <Text style={[typography.body, { color: c.textMuted }]}>{mesaj}</Text> : null}
          {sifirla === 'eposta' ? (
            <Dugme etiket="Kod gönder" onPress={sifirlaGonder} pasif={!eposta.includes('@') || mesgul} />
          ) : (
            <Dugme etiket="Şifreyi yenile" onPress={sifirlaBitir} pasif={kod.trim().length < 6 || sifre.length < 6 || mesgul} />
          )}
          <Dugme etiket="Vazgeç" tur="kontur" onPress={() => { setSifirla(null); setMesaj(null); setKod(''); setSifre(''); }} />
        </View>
      ) : supabase ? (
        <View style={styles.form}>
          {kayit ? (
            <TextInput style={girdi} placeholder="Kullanıcı adı" placeholderTextColor={c.textMuted} autoCapitalize="none" value={kadi} onChangeText={setKadi} />
          ) : null}
          <TextInput style={girdi} placeholder="E-posta" placeholderTextColor={c.textMuted} autoCapitalize="none" keyboardType="email-address" value={eposta} onChangeText={setEposta} />
          <TextInput style={girdi} placeholder="Şifre (en az 6 karakter)" placeholderTextColor={c.textMuted} secureTextEntry value={sifre} onChangeText={setSifre} />
          {mesaj ? <Text style={[typography.body, { color: c.textMuted }]}>{mesaj}</Text> : null}
          <Dugme etiket={kayit ? 'Kayıt Ol' : 'Giriş Yap'} onPress={gonder} pasif={!gecerli || mesgul} />
          {!kayit ? <Dugme etiket="Şifremi unuttum" tur="kontur" onPress={() => { setSifirla('eposta'); setMesaj(null); }} /> : null}
          <Dugme etiket={kayit ? 'Hesabım var' : 'Hesap oluştur'} tur="kontur" onPress={() => { setKayit(!kayit); setMesaj(null); }} />
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={[typography.body, { color: c.textMuted }]}>Demo modundasın: hesap gerekmez.</Text>
          <Dugme etiket="Demo kullanıcı ile gir" onPress={girisYap} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  form: { gap: spacing.md },
  girdi: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: 16 },
});
