import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ikon } from '@/components/ikon';
import type { SikayetNedeni } from '@/lib/moderasyon/sikayet-nedenleri';
import { radius, spacing, useTheme } from '@/theme';

type Sonuc = 'tamam' | 'zaten' | 'hata';

type Props = {
  gorunur: boolean;
  /** Örn. "Gönderiyi şikâyet et" */
  baslik: string;
  nedenler: SikayetNedeni[];
  onGonder: (neden: string, not: string) => Promise<Sonuc>;
  /** Verilirse şikâyet sonrası "X'i de engelle" seçeneği sunulur. */
  engelle?: { ad: string; uygula: () => Promise<boolean> };
  /** Kapanırken şikâyet gönderildiyse true ile çağrılır (örn. gönderi detayından geri dönmek için). */
  onKapat: (gonderildi: boolean) => void;
};

const NOT_SINIRI = 300;

/** Alttan açılan şikâyet sayfası: neden seç → isteğe bağlı not → gönder → teşekkür (+ engelle seçeneği). */
export function SikayetSayfasi({ gorunur, baslik, nedenler, onGonder, engelle, onKapat }: Props) {
  const c = useTheme();
  const [secili, setSecili] = useState<string | null>(null);
  const [not, setNot] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [engellendi, setEngellendi] = useState(false);
  const [engelleniyor, setEngelleniyor] = useState(false);

  useEffect(() => {
    if (gorunur) {
      setSecili(null);
      setNot('');
      setSonuc(null);
      setEngellendi(false);
      setYukleniyor(false);
    }
  }, [gorunur]);

  const gonder = async () => {
    if (!secili || yukleniyor) return;
    setYukleniyor(true);
    const r = await onGonder(nedenler.find((x) => x.id === secili)?.baslik ?? secili, not.trim());
    setYukleniyor(false);
    setSonuc(r);
  };

  const engelleDugme = async () => {
    if (!engelle || engelleniyor) return;
    setEngelleniyor(true);
    setEngellendi(await engelle.uygula());
    setEngelleniyor(false);
  };

  const bitti = sonuc === 'tamam' || sonuc === 'zaten';
  const kapat = () => onKapat(bitti);

  return (
    <Modal visible={gorunur} transparent animationType="slide" onRequestClose={kapat}>
      <KeyboardAvoidingView behavior="padding" style={styles.kap}>
        <Pressable style={styles.perde} onPress={kapat} accessibilityLabel="Kapat" />
        <View style={[styles.sayfa, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={[styles.tutamac, { backgroundColor: c.border }]} />
          {bitti ? (
            <View style={styles.sonuc}>
              <View style={[styles.sonucIkon, { backgroundColor: c.primary }]}>
                <Ikon ad="tik" boyut={28} renk={c.onPrimary} />
              </View>
              <Text style={[styles.baslik, { color: c.text }]}>{sonuc === 'zaten' ? 'Zaten bildirmiştin' : 'Teşekkürler'}</Text>
              <Text style={[styles.alt, { color: c.textMuted }]}>
                {sonuc === 'zaten'
                  ? 'Bu şikâyetini daha önce aldık; ekibimiz inceliyor.'
                  : 'Şikâyetin ekibimize ulaştı. Topluluk kurallarına göre inceleyeceğiz; sana ayrıca yazmamız gerekirse bildirim gelir.'}
              </Text>
              {engelle ? (
                engellendi ? (
                  <Text style={[styles.engelOk, { color: c.textMuted }]}>{engelle.ad} engellendi. Artık içeriklerini görmezsin.</Text>
                ) : (
                  <Pressable
                    onPress={engelleDugme}
                    disabled={engelleniyor}
                    accessibilityRole="button"
                    style={[styles.ikincil, { borderColor: c.border, opacity: engelleniyor ? 0.6 : 1 }]}>
                    <Text style={[styles.ikincilYazi, { color: c.text }]}>{engelleniyor ? 'Engelleniyor…' : `${engelle.ad} kişisini de engelle`}</Text>
                  </Pressable>
                )
              ) : null}
              <Pressable onPress={kapat} accessibilityRole="button" style={[styles.birincil, { backgroundColor: c.primary }]}>
                <Text style={[styles.birincilYazi, { color: c.onPrimary }]}>Tamam</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={[styles.baslik, { color: c.text }]}>{baslik}</Text>
              <Text style={[styles.alt, { color: c.textMuted }]}>Neden bildiriyorsun? Şikâyetin gizli tutulur, karşı taraf kimin bildirdiğini görmez.</Text>
              <ScrollView style={styles.liste} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {nedenler.map((n) => {
                  const acik = secili === n.id;
                  return (
                    <Pressable
                      key={n.id}
                      onPress={() => setSecili(acik ? null : n.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: acik }}
                      style={[styles.neden, { borderColor: acik ? c.primary : c.border, backgroundColor: acik ? c.surfaceAlt : 'transparent' }]}>
                      <View style={[styles.radyo, { borderColor: acik ? c.primary : c.textMuted }]}>
                        {acik ? <View style={[styles.radyoIc, { backgroundColor: c.primary }]} /> : null}
                      </View>
                      <View style={styles.nedenMetin}>
                        <Text style={[styles.nedenBaslik, { color: c.text }]}>{n.baslik}</Text>
                        <Text style={[styles.nedenAciklama, { color: c.textMuted }]}>{n.aciklama}</Text>
                      </View>
                    </Pressable>
                  );
                })}
                {secili ? (
                  <View style={styles.notKap}>
                    <TextInput
                      value={not}
                      onChangeText={(t) => setNot(t.slice(0, NOT_SINIRI))}
                      placeholder="İstersen ne olduğunu kısaca anlat (isteğe bağlı)"
                      placeholderTextColor={c.textMuted}
                      multiline
                      maxLength={NOT_SINIRI}
                      style={[styles.not, { color: c.text, borderColor: c.border, backgroundColor: c.bg }]}
                    />
                    <Text style={[styles.sayac, { color: c.textMuted }]}>{not.length}/{NOT_SINIRI}</Text>
                  </View>
                ) : null}
                {sonuc === 'hata' ? <Text style={[styles.hata, { color: c.danger }]}>Gönderilemedi. İnternet bağlantını kontrol edip tekrar dene.</Text> : null}
              </ScrollView>
              <View style={styles.altSatir}>
                <Pressable onPress={kapat} accessibilityRole="button" style={[styles.ikincil, styles.yarim, { borderColor: c.border }]}>
                  <Text style={[styles.ikincilYazi, { color: c.text }]}>Vazgeç</Text>
                </Pressable>
                <Pressable
                  onPress={gonder}
                  disabled={!secili || yukleniyor}
                  accessibilityRole="button"
                  style={[styles.birincil, styles.yarim, { backgroundColor: c.primary, opacity: !secili || yukleniyor ? 0.45 : 1 }]}>
                  {yukleniyor ? <ActivityIndicator color={c.onPrimary} /> : <Text style={[styles.birincilYazi, { color: c.onPrimary }]}>Şikâyet et</Text>}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, justifyContent: 'flex-end' },
  perde: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  sayfa: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl + 8 : spacing.lg,
    maxHeight: '88%',
  },
  tutamac: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: spacing.md },
  baslik: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  alt: { fontSize: 13.5, lineHeight: 19, textAlign: 'center', marginTop: 6, marginBottom: spacing.md },
  liste: { flexGrow: 0 },
  neden: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  radyo: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radyoIc: { width: 10, height: 10, borderRadius: 5 },
  nedenMetin: { flex: 1, gap: 2 },
  nedenBaslik: { fontSize: 15.5, fontWeight: '700' },
  nedenAciklama: { fontSize: 12.5, lineHeight: 17 },
  notKap: { marginTop: spacing.xs, marginBottom: spacing.sm },
  not: { minHeight: 84, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, fontSize: 15, textAlignVertical: 'top' },
  sayac: { fontSize: 11.5, textAlign: 'right', marginTop: 4 },
  hata: { fontSize: 13, textAlign: 'center', marginBottom: spacing.sm },
  altSatir: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  yarim: { flex: 1 },
  birincil: { height: 50, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  birincilYazi: { fontSize: 15.5, fontWeight: '800' },
  ikincil: { height: 50, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  ikincilYazi: { fontSize: 15, fontWeight: '700' },
  sonuc: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  sonucIkon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  engelOk: { fontSize: 13.5, textAlign: 'center', marginVertical: spacing.xs },
});
