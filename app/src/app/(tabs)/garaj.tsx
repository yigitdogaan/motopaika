import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAltMenuBosluk } from '@/components/alt-menu';
import { EkranUstu } from '@/components/ekran-ustu';
import { Ikon } from '@/components/ikon';
import { Dugme, Hap } from '@/components/yol-ui';
import { ben } from '@/demo/akis';
import { demoGaraj, demoProfil, type Motor } from '@/demo/garaj';
import { useAkis } from '@/lib/akis';
import { ProfilEkrani } from '@/components/profil-ekrani';
import { useOturum } from '@/lib/oturum';
import { supabase } from '@/lib/supabase';
import { radius, spacing, useTheme } from '@/theme';

type Sekme = 'garaj' | 'gonderiler';

function MotorKarti({ m, onSil }: { m: Motor; onSil?: () => void }) {
  const c = useTheme();
  return (
    <View style={[styles.motor, { backgroundColor: c.surface, borderColor: m.ana ? c.primary : c.border }]}>
      <View style={[styles.motorIkon, { backgroundColor: m.ana ? c.primary : c.surfaceAlt }]}>
        <Ikon ad="motor" boyut={30} renk={m.ana ? c.onPrimary : c.primary} />
      </View>
      <View style={styles.motorYazi}>
        <View style={styles.motorBaslik}>
          <Text style={[styles.motorAd, { color: c.text }]} numberOfLines={1}>
            {m.marka} {m.model}
          </Text>
          {m.ana ? (
            <View style={[styles.ana, { backgroundColor: c.primary }]}>
              <Text style={[styles.anaYazi, { color: c.onPrimary }]}>ANA MOTOR</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.motorAlt, { color: c.textMuted }]}>
          {[m.yil, m.hacim, m.km].filter(Boolean).join(' • ') || 'Detay eklenmedi'}
        </Text>
      </View>
      {onSil ? <Dugme etiket="Sil" tur="kontur" onPress={onSil} style={styles.sil} /> : null}
    </View>
  );
}

/** Profil ve Garaj: gerçek modda veritabanı profili, değilse demo. */
export default function Garaj() {
  const { kullanici } = useOturum();
  const c = useTheme();
  const [ust, setUst] = useState(110);
  if (supabase && kullanici) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <EkranUstu baslik="Profil ve Garaj" onYukseklik={setUst} />
        <ProfilEkrani id={kullanici.id} ustBosluk={ust} />
      </View>
    );
  }
  return <DemoGaraj />;
}

function DemoGaraj() {
  const c = useTheme();
  const bosluk = useAltMenuBosluk();
  const [ustD, setUstD] = useState(110);
  const { gonderiler } = useAkis();
  const { motorlar, motorEkle, motorSil, cikisYap } = useOturum();
  const [sekme, setSekme] = useState<Sekme>('garaj');
  const [marka, setMarka] = useState('');
  const [model, setModel] = useState('');

  const benimGonderilerim = gonderiler.filter((g) => !g.anonim && g.yazar === ben.ad);
  // Demo sayaç 36 gönderiyle başlar; bu oturumda paylaştıkların eklenir.
  const yeniSayisi = benimGonderilerim.filter((g) => g.id.startsWith('y')).length;
  const eklenen: Motor[] = motorlar.map((m) => ({ id: m.id, marka: m.marka, model: m.model, yil: 0, hacim: '', km: '' }));

  const ekle = () => {
    if (motorEkle(marka, model)) {
      setMarka('');
      setModel('');
    }
  };

  const stat = [
    { deger: demoProfil.selam.toLocaleString('tr-TR'), etiket: 'Selam' },
    { deger: String(demoProfil.gonderi + yeniSayisi), etiket: 'Gönderi' },
    { deger: String(demoProfil.bulusma), etiket: 'Buluşma' },
  ];

  return (
    <View style={[styles.ekran, { backgroundColor: c.bg }]}>
      <EkranUstu baslik="Profil ve Garaj" onYukseklik={setUstD} />
      <ScrollView contentContainerStyle={[styles.icerik, { paddingTop: ustD + spacing.sm, paddingBottom: bosluk }]} keyboardShouldPersistTaps="handled">
        <View style={styles.profil}>
          <View style={[styles.avatar, { borderColor: c.primary, backgroundColor: c.surface }]}>
            <Text style={[styles.avatarYazi, { color: c.primary }]}>{ben.ad.charAt(0)}</Text>
          </View>
          <Text style={[styles.ad, { color: c.text }]}>{ben.ad}</Text>
          <Text style={[styles.kullanici, { color: c.textMuted }]}>
            @{ben.kullaniciAdi} • {ben.sehir}
          </Text>
          <Text style={[styles.bio, { color: c.text }]}>{demoProfil.bio}</Text>
        </View>

        <View style={[styles.istatistikler, { backgroundColor: c.surface, borderColor: c.border }]}>
          {stat.map((s, i) => (
            <View key={s.etiket} style={[styles.istatistik, i > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: c.border }]}>
              <Text style={[styles.deger, { color: s.etiket === 'Selam' ? c.primary : c.text }]}>{s.deger}</Text>
              <Text style={[styles.etiket, { color: c.textMuted }]}>{s.etiket}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sekmeler}>
          <Hap etiket="Garajım" ikon="garaj" secili={sekme === 'garaj'} onPress={() => setSekme('garaj')} />
          <Hap etiket="Gönderilerim" ikon="korna" secili={sekme === 'gonderiler'} onPress={() => setSekme('gonderiler')} />
        </View>

        {sekme === 'garaj' ? (
          <View style={styles.liste}>
            {demoGaraj.map((m) => (
              <MotorKarti key={m.id} m={m} />
            ))}
            {eklenen.map((m) => (
              <MotorKarti key={m.id} m={m} onSil={() => motorSil(m.id)} />
            ))}

            <View style={[styles.ekleKart, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={[styles.ekleBaslik, { color: c.text }]}>Garaja motor ekle</Text>
              <View style={styles.ekleSatir}>
                <TextInput
                  value={marka}
                  onChangeText={setMarka}
                  placeholder="Marka (ör. Honda)"
                  placeholderTextColor={c.textMuted}
                  style={[styles.girdi, { color: c.text, backgroundColor: c.surfaceAlt, borderColor: c.border }]}
                />
                <TextInput
                  value={model}
                  onChangeText={setModel}
                  placeholder="Model (ör. CB650R)"
                  placeholderTextColor={c.textMuted}
                  style={[styles.girdi, { color: c.text, backgroundColor: c.surfaceAlt, borderColor: c.border }]}
                />
              </View>
              <Dugme etiket="Garaja ekle" ikon="arti" onPress={ekle} pasif={!marka.trim() || !model.trim()} />
            </View>
          </View>
        ) : (
          <View style={styles.liste}>
            {benimGonderilerim.length ? (
              benimGonderilerim.map((g) => (
                <View key={g.id} style={[styles.gonderi, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <Text style={[styles.gonderiMeta, { color: c.textMuted }]}>
                    {g.konum} • {g.zaman}
                  </Text>
                  <Text style={[styles.gonderiMetin, { color: c.text }]}>{g.metin}</Text>
                  <Text style={[styles.gonderiMeta, { color: c.primary }]}>{g.selam} selam</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.bos, { color: c.textMuted }]}>Henüz gönderin yok. Ortadaki + ile ilk yolu paylaş.</Text>
            )}
          </View>
        )}

        <Dugme etiket="Çıkış yap" ikon="cikis" tur="kontur" onPress={cikisYap} style={styles.cikis} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  icerik: { padding: spacing.lg, paddingBottom: spacing.xxl + 40, gap: spacing.lg },
  profil: { alignItems: 'center', gap: 6, paddingTop: spacing.sm },
  avatar: { width: 96, height: 96, borderRadius: radius.full, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  avatarYazi: { fontSize: 40, fontWeight: '900' },
  ad: { fontSize: 24, fontWeight: '900', marginTop: spacing.sm },
  kullanici: { fontSize: 14 },
  bio: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: spacing.xs },
  istatistikler: { flexDirection: 'row', borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, paddingVertical: spacing.lg },
  istatistik: { flex: 1, alignItems: 'center', gap: 2 },
  deger: { fontSize: 24, fontWeight: '900' },
  etiket: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  sekmeler: { flexDirection: 'row', gap: spacing.sm },
  liste: { gap: spacing.md },
  motor: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1.5 },
  motorIkon: { width: 58, height: 58, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  motorYazi: { flex: 1, gap: 5 },
  motorBaslik: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  motorAd: { fontSize: 18, fontWeight: '900', flexShrink: 1 },
  ana: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  anaYazi: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  motorAlt: { fontSize: 13.5 },
  sil: { minHeight: 36, paddingHorizontal: spacing.md },
  ekleKart: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, gap: spacing.md },
  ekleBaslik: { fontSize: 16, fontWeight: '800' },
  ekleSatir: { flexDirection: 'row', gap: spacing.sm },
  girdi: { flex: 1, minHeight: 46, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md, fontSize: 15 },
  gonderi: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, gap: 6 },
  gonderiMeta: { fontSize: 12.5, fontWeight: '600' },
  gonderiMetin: { fontSize: 15, lineHeight: 21 },
  bos: { textAlign: 'center', marginTop: spacing.lg, fontSize: 15 },
  cikis: { marginTop: spacing.md },
});
