import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { RoteriLogo } from '@/components/roteri-logo';
import { Dugme } from '@/components/yol-ui';
import { useOturum } from '@/lib/oturum';
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
      {supabase ? (
        <View style={styles.form}>
          {kayit ? (
            <TextInput style={girdi} placeholder="Kullanıcı adı" placeholderTextColor={c.textMuted} autoCapitalize="none" value={kadi} onChangeText={setKadi} />
          ) : null}
          <TextInput style={girdi} placeholder="E-posta" placeholderTextColor={c.textMuted} autoCapitalize="none" keyboardType="email-address" value={eposta} onChangeText={setEposta} />
          <TextInput style={girdi} placeholder="Şifre (en az 6 karakter)" placeholderTextColor={c.textMuted} secureTextEntry value={sifre} onChangeText={setSifre} />
          {mesaj ? <Text style={[typography.body, { color: c.textMuted }]}>{mesaj}</Text> : null}
          <Dugme etiket={kayit ? 'Kayıt Ol' : 'Giriş Yap'} onPress={gonder} pasif={!gecerli || mesgul} />
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
