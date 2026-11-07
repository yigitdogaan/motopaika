import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ikon } from '@/components/ikon';
import { KonumHaritasi } from '@/components/konum-haritasi';
import { SaatCarki } from '@/components/saat-carki';
import { Dugme, Hap } from '@/components/yol-ui';
import { gonderiKategorileri, type KategoriId } from '@/demo/akis';
import { MAKS_FOTO, useAkis } from '@/lib/akis';
import { mevcutKonum, yerAdindanKonum } from '@/lib/konum';
import { suz } from '@/lib/moderasyon/uygula';
import { gunEtiketi, planliZamanYazi } from '@/lib/zaman';
import { radius, spacing, useTheme } from '@/theme';

const MAKS = 280;

/** Hazır buluşma zamanları: {gün farkı, saat, dakika} döndürür. */
const HAZIR_ZAMANLAR: { ad: string; hesapla: () => { gun: number; saat: number; dakika: number } }[] = [
  {
    ad: '1 saat sonra',
    hesapla: () => {
      const d = new Date(Date.now() + 60 * 60_000);
      const dk = Math.ceil(d.getMinutes() / 15) * 15;
      if (dk === 60) d.setHours(d.getHours() + 1, 0);
      else d.setMinutes(dk);
      return { gun: d.getDate() === new Date().getDate() ? 0 : 1, saat: d.getHours(), dakika: d.getMinutes() };
    },
  },
  { ad: 'Bu akşam 19:00', hesapla: () => ({ gun: new Date().getHours() >= 18 ? 1 : 0, saat: 19, dakika: 0 }) },
  { ad: 'Yarın 09:00', hesapla: () => ({ gun: 1, saat: 9, dakika: 0 }) },
  {
    ad: 'Cumartesi 10:00',
    hesapla: () => {
      const bugun = new Date().getDay();
      let fark = (6 - bugun + 7) % 7;
      if (fark === 0 && new Date().getHours() >= 9) fark = 7;
      return { gun: fark, saat: 10, dakika: 0 };
    },
  },
  {
    ad: 'Pazar 10:00',
    hesapla: () => {
      const bugun = new Date().getDay();
      let fark = (7 - bugun) % 7;
      if (fark === 0 && new Date().getHours() >= 9) fark = 7;
      return { gun: fark, saat: 10, dakika: 0 };
    },
  },
];

/** Gönderi Paylaş: anonim anahtarı, kategori, konum, metin, fotoğraf ve "Paylaş". */
export default function YeniGonderi() {
  const c = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ekle } = useAkis();

  const [anonim, setAnonim] = useState(false);
  const [kategori, setKategori] = useState<KategoriId | null>(null);
  const [konum, setKonum] = useState('');
  const [metin, setMetin] = useState('');
  const [fotoUriler, setFotoUriler] = useState<string[]>([]);
  const [nokta, setNokta] = useState<{ lat: number; lng: number; sehir?: string } | null>(null);
  const [mesgul, setMesgul] = useState(false);
  const [planli, setPlanli] = useState(false);
  const [gun, setGun] = useState(0);
  const [saat, setSaat] = useState(() => Math.min(23, new Date().getHours() + 1));
  const [dakika, setDakika] = useState(0);
  const [uyari, setUyari] = useState<string | null>(null);
  const [haritaAcik, setHaritaAcik] = useState(false);

  const surus = kategori === 'surus';
  const baslangic = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + gun);
    d.setHours(saat, dakika, 0, 0);
    return d;
  }, [gun, saat, dakika]);
  // Planlı sürüş: konum şart, saat en az 10 dk sonrası.
  const zamanGecerli = baslangic.getTime() > Date.now() + 10 * 60_000;
  const planliEksik = surus && planli && (!konum.trim() || !zamanGecerli);
  const hazir = !!kategori && metin.trim().length > 0 && !planliEksik;

  const zamanUygula = (z: { gun: number; saat: number; dakika: number }) => {
    setGun(Math.min(7, z.gun));
    setSaat(z.saat);
    setDakika(z.dakika);
  };

  const konumumuAl = async () => {
    setUyari(null);
    const k = await mevcutKonum();
    if (!k) return setUyari('Konum izni verilmedi. Haritadan pinleyebilirsin.');
    setKonum(k.yer);
    setNokta({ lat: k.lat, lng: k.lng, sehir: k.sehir });
  };

  const fotoSec = async () => {
    const kalan = MAKS_FOTO - fotoUriler.length;
    if (kalan <= 0) return;
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: kalan,
    });
    if (r.canceled) return;
    // Aynı fotoğraf iki kez eklenmesin; sınırı aşan fazlalık kesilir.
    setFotoUriler((o) => [...o, ...r.assets.map((a) => a.uri).filter((u) => !o.includes(u))].slice(0, MAKS_FOTO));
  };

  const paylas = async () => {
    if (!kategori || !hazir || mesgul) return;
    const baglam = anonim && !surus ? 'notDuvari' : 'forum';
    const temiz = suz(metin, baglam);
    if (temiz === null) return;
    setMesgul(true);
    // Elle yazılan yer için koordinat bul: buluşma pini haritada görünsün.
    const n = nokta ?? (konum.trim() ? await yerAdindanKonum(konum.trim()) : null);
    await ekle({
      anonim: anonim && !surus,
      kategori,
      konum,
      metin: temiz,
      surusTuru: surus ? (planli ? 'planli' : 'anlik') : undefined,
      baslangic: surus ? (planli ? baslangic.toISOString() : new Date().toISOString()) : undefined,
      fotoUriler, enlem: n?.lat, boylam: n?.lng, sehir: n?.sehir });
    setMesgul(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={[styles.ekran, { backgroundColor: c.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.ust, { borderBottomColor: c.border, paddingTop: Platform.OS === 'ios' ? spacing.lg : insets.top + spacing.sm }]}>
        <Text style={[styles.baslik, { color: c.text }]} accessibilityRole="header">
          Gönderi Paylaş
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Kapat" style={[styles.kapat, { top: Platform.OS === 'ios' ? spacing.lg : insets.top + spacing.sm }]}>
          <Ikon ad="kapat" boyut={22} renk={c.textMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.icerik} keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
        {surus ? (
          <Text style={[styles.altYazi, { color: c.textMuted }]}>Sürüş paylaşımları anonim olamaz: adın ve motorun görünür.</Text>
        ) : (
        <View style={[styles.anonim, { backgroundColor: c.surface, borderColor: anonim ? c.primary : c.border }]}>
          <View style={[styles.anonimIkon, { backgroundColor: anonim ? c.primary : c.surfaceAlt }]}>
            <Ikon ad="anonim" boyut={20} renk={anonim ? c.onPrimary : c.textMuted} />
          </View>
          <View style={styles.anonimYazi}>
            <Text style={[styles.anonimBaslik, { color: c.text }]}>Anonim Olarak Paylaş</Text>
            <Text style={[styles.altYazi, { color: c.textMuted }]}>
              {anonim ? 'Adın gizlenir, motorun görünür.' : 'Adın ve motorun görünür.'}
            </Text>
          </View>
          <Switch
            value={anonim}
            onValueChange={setAnonim}
            trackColor={{ false: c.surfaceAlt, true: c.primary }}
            thumbColor={anonim ? c.onPrimary : c.textMuted}
            accessibilityLabel="Anonim olarak paylaş"
          />
        </View>
        )}

        <Text style={[styles.etiket, { color: c.textMuted }]}>KATEGORİ</Text>
        <View style={styles.hapler}>
          {gonderiKategorileri.map((k) => (
            <Hap key={k.id} etiket={k.ad} renk={k.renk} secili={kategori === k.id} onPress={() => setKategori(k.id)} />
          ))}
        </View>
        {kategori ? (
          <Text style={[styles.altYazi, { color: c.textMuted }]}>
            {gonderiKategorileri.find((k) => k.id === kategori)?.aciklama}
          </Text>
        ) : (
          <Text style={[styles.altYazi, { color: c.textMuted }]}>Gönderinin türünü seç.</Text>
        )}

        {surus ? (
          <>
            <Text style={[styles.etiket, { color: c.textMuted }]}>SÜRÜŞ TÜRÜ</Text>
            <View style={styles.hapler}>
              <Hap etiket="Anlık Sürüş" ikon="gps" secili={!planli} onPress={() => setPlanli(false)} />
              <Hap etiket="Planlı Sürüş" ikon="saat" secili={planli} onPress={() => setPlanli(true)} />
            </View>
            <Text style={[styles.altYazi, { color: c.textMuted }]}>
              {planli ? 'İleri bir saatte, belirlediğin konumda buluşma kur.' : 'Şimdi çıkıyorsun: buluşma hemen haritada görünür.'}
            </Text>
            {planli ? (
              <>
                <Text style={[styles.etiket, { color: c.textMuted }]}>HIZLI SEÇ</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hapler}>
                  {HAZIR_ZAMANLAR.map((z) => (
                    <Hap key={z.ad} etiket={z.ad} ikon="saat" secili={false} onPress={() => zamanUygula(z.hesapla())} />
                  ))}
                </ScrollView>

                <Text style={[styles.etiket, { color: c.textMuted }]}>GÜN</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hapler}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <Hap key={i} etiket={gunEtiketi(i)} secili={gun === i} onPress={() => setGun(i)} />
                  ))}
                </ScrollView>

                <Text style={[styles.etiket, { color: c.textMuted }]}>SAAT</Text>
                <SaatCarki saat={saat} dakika={dakika} onSaat={setSaat} onDakika={setDakika} />
                <Text style={[styles.altYazi, { color: zamanGecerli ? c.primary : c.warning }]}>
                  {zamanGecerli ? `Buluşma: ${planliZamanYazi(baslangic)}` : 'Saat en az 10 dakika sonrası olmalı.'}
                </Text>
              </>
            ) : null}
          </>
        ) : null}

        <Text style={[styles.etiket, { color: c.textMuted }]}>KONUM</Text>
        <View style={styles.konumSatiri}>
          <Pressable
            onPress={() => setHaritaAcik(true)}
            accessibilityRole="button"
            accessibilityLabel="Haritadan konum pinle"
            style={[styles.girdiKap, { backgroundColor: c.surface, borderColor: nokta ? c.primary : c.border }]}>
            <Ikon ad="konum" boyut={16} renk={c.primary} />
            <Text style={[styles.girdi, { color: konum ? c.text : c.textMuted }]} numberOfLines={1}>
              {konum || 'Haritadan konum pinle'}
            </Text>
            <Ikon ad="harita" boyut={16} renk={c.textMuted} />
          </Pressable>
          <Pressable
            onPress={konumumuAl}
            accessibilityRole="button"
            accessibilityLabel="Konumumu otomatik ekle"
            style={[styles.gps, { backgroundColor: c.primary }]}>
            <Ikon ad="gps" boyut={20} renk={c.onPrimary} />
          </Pressable>
        </View>

        {uyari ? <Text style={[styles.altYazi, { color: c.warning }]}>{uyari}</Text> : null}

        <Text style={[styles.etiket, { color: c.textMuted }]}>YOLDA NE VAR?</Text>
        <View style={[styles.metinKap, { backgroundColor: c.surface, borderColor: c.border }]}>
          <TextInput
            value={metin}
            onChangeText={setMetin}
            placeholder="Yol durumu, buluşma planı, sorun ya da sadece iç dökme..."
            placeholderTextColor={c.textMuted}
            style={[styles.metin, { color: c.text }]}
            multiline
            maxLength={MAKS}
            textAlignVertical="top"
          />
          <Text style={[styles.sayac, { color: metin.length > MAKS - 30 ? c.warning : c.textMuted }]}>
            {metin.length}/{MAKS}
          </Text>
        </View>

        {fotoUriler.length > 0 ? (
          <View style={styles.fotoSerit}>
            {fotoUriler.map((uri, i) => (
              <View key={uri} style={[styles.fotoKutu, { borderColor: i === 0 ? c.primary : c.border }]}>
                <Image source={{ uri }} style={styles.fotoKucuk} contentFit="cover" />
                <Pressable
                  onPress={() => setFotoUriler((o) => o.filter((u) => u !== uri))}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`${i + 1}. fotoğrafı kaldır`}
                  style={[styles.fotoSil, { backgroundColor: c.bg }]}>
                  <Ikon ad="kapat" boyut={14} renk={c.text} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
        {fotoUriler.length < MAKS_FOTO ? (
          <Dugme etiket={fotoUriler.length ? `Fotoğraf Ekle (${fotoUriler.length}/${MAKS_FOTO})` : 'Fotoğraf Ekle'} ikon="foto" tur="kontur" onPress={fotoSec} />
        ) : (
          <Text style={[styles.altYazi, { color: c.textMuted }]}>En fazla {MAKS_FOTO} fotoğraf ekleyebilirsin.</Text>
        )}
      </ScrollView>

      <View style={[styles.alt, { borderTopColor: c.border, paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Dugme etiket={mesgul ? 'Paylaşılıyor...' : 'Paylaş'} ikon="gonder" onPress={paylas} pasif={!hazir || mesgul} />
        {!hazir ? (
          <Text style={[styles.ipucu, { color: c.textMuted }]}>
            {planliEksik ? 'Planlı sürüş için konum yaz ve ileri bir saat seç.' : 'Kategori seç ve bir şeyler yaz.'}
          </Text>
        ) : null}
      </View>
      <KonumHaritasi
        gorunur={haritaAcik}
        onKapat={() => setHaritaAcik(false)}
        baslangic={nokta}
        baslangicAd={konum}
        onSec={(k) => {
          setKonum(k.yer);
          setNokta({ lat: k.lat, lng: k.lng, sehir: k.sehir });
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  ust: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  kapat: { position: 'absolute', right: spacing.lg },
  baslik: { fontSize: 20, fontWeight: '900', letterSpacing: 0.3 },
  icerik: { padding: spacing.lg, gap: spacing.md },
  anonim: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1.5 },
  anonimIkon: { width: 42, height: 42, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  anonimYazi: { flex: 1, gap: 2 },
  anonimBaslik: { fontSize: 16, fontWeight: '800' },
  altYazi: { fontSize: 13 },
  etiket: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginTop: spacing.sm },
  hapler: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  konumSatiri: { flexDirection: 'row', gap: spacing.sm },
  girdiKap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 50, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md },
  girdi: { flex: 1, fontSize: 15, paddingVertical: 0 },
  gps: { width: 50, height: 50, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  metinKap: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md },
  metin: { minHeight: 120, fontSize: 16, lineHeight: 22 },
  sayac: { alignSelf: 'flex-end', fontSize: 12, fontWeight: '700' },
  fotoSerit: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  fotoKutu: { width: 76, height: 76, borderRadius: radius.sm, borderWidth: 1.5, overflow: 'hidden' },
  fotoKucuk: { width: '100%', height: '100%' },
  fotoSil: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  alt: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  ipucu: { textAlign: 'center', fontSize: 12.5 },
});
