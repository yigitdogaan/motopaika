import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ikon } from '@/components/ikon';
import { OnayKutusu } from '@/components/onay-kutusu';
import { ZaferIsareti } from '@/components/zafer-isareti';
import { gonderiKategorileri } from '@/demo/akis';
import { pasifMi, useAkis, type AkisGonderisi } from '@/lib/akis';
import { planliZamanYazi } from '@/lib/zaman';
import { radius, spacing, useTheme } from '@/theme';

/** Gönderide görsel alanı: gerçek fotoğraf bağlanana kadar asfalt ve orta şerit çizimi. */
function GorselAlani({ url }: { url?: string }) {
  const c = useTheme();
  if (url) return <Image source={{ uri: url }} style={[styles.gorsel, { borderColor: c.border }]} contentFit="cover" accessibilityLabel="Gönderi fotoğrafı" />;
  return (
    <View style={[styles.gorsel, { backgroundColor: c.surfaceAlt, borderColor: c.border }]} accessibilityLabel="Gönderi fotoğrafı">
      <View style={styles.serit}>
        {Array.from({ length: 9 }, (_, i) => (
          <View key={i} style={[styles.cizgi, { backgroundColor: c.primary }]} />
        ))}
      </View>
      <View style={styles.gorselEtiket}>
        <Ikon ad="foto" boyut={14} renk={c.textMuted} />
        <Text style={[styles.gorselYazi, { color: c.textMuted }]}>Fotoğraf</Text>
      </View>
    </View>
  );
}

export function GonderiKarti({ g, detay = false }: { g: AkisGonderisi; detay?: boolean }) {
  const c = useTheme();
  const { selamDegistir, geliyorumDegistir, yorumlariYukle, yorumEkle, istekler, istekGeriAl, gonderiSil, gonderiSikayet } = useAkis();
  const [sikayetAcik, setSikayetAcik] = useState(false);
  const [yorumAcik, setYorumAcik] = useState(detay);
  const [yorum, setYorum] = useState('');
  const router = useRouter();
  useEffect(() => {
    if (detay) yorumlariYukle(g.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detay, g.id]);
  const [silAcik, setSilAcik] = useState(false);
  const silOnay = async () => {
    setSilAcik(false);
    if (await gonderiSil(g.id)) {
      if (detay) router.back();
    } else Alert.alert('Silinemedi', 'İnternet bağlantını kontrol edip tekrar dene.');
  };

  const sikayetEt = async (neden: string) => {
    setSikayetAcik(false);
    const r = await gonderiSikayet(g.id, neden);
    Alert.alert(
      r === 'hata' ? 'Gönderilemedi' : 'Teşekkürler',
      r === 'tamam' ? 'Şikâyetin bize ulaştı. Gönderiyi inceleyeceğiz.' : r === 'zaten' ? 'Bu gönderiyi zaten bildirmiştin.' : 'İnternet bağlantını kontrol edip tekrar dene.',
    );
  };

  const detayaGit = () => {
    if (!detay) router.push({ pathname: '/gonderi/[id]', params: { id: g.id } } as unknown as Href);
  };
  const profileGit = () => {
    if (g.yazarId) router.push({ pathname: '/profil/[id]', params: { id: g.yazarId } } as unknown as Href);
  };
  const kategori = gonderiKategorileri.find((k) => k.id === g.kategori);
  const bulusma = g.kategori === 'surus';
  const pasif = pasifMi(g);
  const renk = pasif ? c.textMuted : (kategori?.renk ?? c.border);

  return (
    <Pressable
      onPress={detayaGit}
      disabled={detay}
      accessibilityRole={detay ? undefined : 'button'}
      accessibilityLabel={detay ? undefined : 'Gönderiyi aç'}
      style={[styles.kart, { backgroundColor: c.surface, borderColor: c.border, borderLeftColor: renk, borderLeftWidth: 4 }]}>
      <View style={styles.ust}>
        <Pressable onPress={profileGit} disabled={!g.yazarId} accessibilityRole="button" accessibilityLabel={`${g.yazar} profili`} style={[styles.avatar, { backgroundColor: g.anonim ? c.surfaceAlt : c.primary, overflow: 'hidden' }]}>
          {g.anonim ? (
            <Ikon ad="motor" boyut={22} renk={c.primary} />
          ) : g.avatarUrl ? (
            <Image source={{ uri: g.avatarUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Text style={[styles.avatarYazi, { color: c.onPrimary }]}>{g.yazar.charAt(0)}</Text>
          )}
        </Pressable>
        <Pressable onPress={profileGit} disabled={!g.yazarId} style={styles.kimlik}>
          <Text style={[styles.ad, { color: c.text }]} numberOfLines={1}>
            {g.yazar}
          </Text>
          {g.motor ? (
            <View style={styles.konumSatiri}>
              <Ikon ad="motor" boyut={12} renk={c.primary} />
              <Text style={[styles.konum, { color: c.text, fontWeight: '700' }]} numberOfLines={1}>
                {g.motor}
              </Text>
            </View>
          ) : null}
          <View style={styles.konumSatiri}>
            <Ikon ad="konum" boyut={12} renk={c.primary} />
            <Text style={[styles.konum, { color: c.textMuted }]} numberOfLines={1}>
              {g.konum} • {g.zaman}
            </Text>
          </View>
        </Pressable>
        {kategori ? (
          <View style={[styles.etiket, { borderColor: renk, backgroundColor: `${renk}1F` }]}>
            <Text style={[styles.etiketYazi, { color: renk }]}>{pasif ? 'SONA ERDİ' : kategori.kisa.toLocaleUpperCase('tr')}</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.metin, { color: c.text }]}>{g.metin}</Text>
      {bulusma && g.surusTuru ? (
        <View style={styles.konumSatiri}>
          <Ikon ad="saat" boyut={13} renk={c.primary} />
          <Text style={[styles.konum, { color: c.primary, fontWeight: '800' }]}>
            {g.surusTuru === 'planli' && g.baslangic ? `Planlı sürüş • ${planliZamanYazi(g.baslangic)}` : 'Anlık sürüş'}
          </Text>
        </View>
      ) : null}
      {g.gorsel || g.fotoUrl ? <GorselAlani url={g.fotoUrl} /> : null}

      <View style={styles.eylemler}>
        <Pressable
          onPress={() => selamDegistir(g.id)}
          accessibilityRole="button"
          accessibilityLabel="Selam ver"
          accessibilityState={{ selected: g.selamVerdi }}
          style={[styles.eylem, g.selamVerdi ? { borderColor: c.primary } : { borderColor: c.border }]}>
          <ZaferIsareti boyut={18} renk={g.selamVerdi ? c.primary : c.textMuted} fon={c.surface} dolu />
          {g.selam > 0 ? <Text style={[styles.sayi, { color: g.selamVerdi ? c.primary : c.textMuted }]}>{g.selam}</Text> : null}
        </Pressable>


        <Pressable
          onPress={() => {
            if (!yorumAcik) yorumlariYukle(g.id);
            setYorumAcik((a) => !a);
          }}
          accessibilityRole="button"
          accessibilityLabel="Yorumlar"
          accessibilityState={{ expanded: yorumAcik }}
          style={[styles.eylem, { borderColor: yorumAcik ? c.primary : c.border }]}>
          <Ikon ad="yorumDolu" boyut={18} renk={yorumAcik ? c.primary : c.textMuted} />
          {g.yorumSayisi > 0 ? <Text style={[styles.sayi, { color: yorumAcik ? c.primary : c.textMuted }]}>{g.yorumSayisi}</Text> : null}
        </Pressable>

        {bulusma && !g.benim && istekler[g.id] !== 'pending' ? (
          <Pressable
            onPress={() => geliyorumDegistir(g.id)}
            disabled={pasif}
            accessibilityRole="button"
            accessibilityState={{ selected: g.geliyorumDedi }}
            style={[styles.eylem, { marginLeft: 'auto' }, pasif && { opacity: 0.45 }, g.geliyorumDedi ? { backgroundColor: c.primary, borderColor: c.primary } : { borderColor: c.primary }]}>
            <Text style={[styles.eylemYazi, { color: g.geliyorumDedi ? c.onPrimary : c.primary }]}>
              {pasif
                ? 'Sürüş sona erdi'
                : istekler[g.id] === 'accepted'
                ? 'Geliyorsun!'
                : istekler[g.id] === 'pending'
                  ? 'İstek gönderildi'
                  : istekler[g.id] === 'declined'
                    ? 'İstek reddedildi'
                    : g.geliyorumDedi
                      ? 'Geliyorsun!'
                      : 'Ben de Geliyorum!'}
            </Text>
            {(g.geliyorum ?? 0) > 0 ? <Text style={[styles.sayi, { color: g.geliyorumDedi ? c.onPrimary : c.textMuted }]}>{g.geliyorum ?? 0}</Text> : null}
          </Pressable>
        ) : null}

        {g.benim ? (
          <Pressable
            onPress={() => setSilAcik(true)}
            accessibilityRole="button"
            accessibilityLabel="Gönderiyi sil"
            hitSlop={10}
            style={{ marginLeft: 'auto', padding: spacing.sm }}>
            <Ikon ad="sil" boyut={14} renk={c.danger} />
          </Pressable>
        ) : null}
      </View>

      {yorumAcik ? (
        <View style={[styles.yorumlar, { borderTopColor: c.border }]}>
          {g.yorumlar.length ? (
            g.yorumlar.map((y, i) => (
              <Text key={i} style={[styles.yorumMetin, { color: c.text }]}>
                <Text style={{ color: c.primary, fontWeight: '700' }}>{y.yazar}  </Text>
                {y.metin}
              </Text>
            ))
          ) : (
            <Text style={[styles.yorumMetin, { color: c.textMuted }]}>Henüz yorum yok. İlk yorumu sen yaz.</Text>
          )}
          <View style={styles.yorumSatir}>
            <TextInput
              value={yorum}
              onChangeText={setYorum}
              placeholder="Yorum yaz..."
              placeholderTextColor={c.textMuted}
              maxLength={280}
              style={[styles.yorumGirdi, { backgroundColor: c.surfaceAlt, borderColor: c.border, color: c.text }]}
            />
            <Pressable
              onPress={() => {
                const t = yorum;
                setYorum('');
                yorumEkle(g.id, t);
              }}
              disabled={!yorum.trim()}
              accessibilityRole="button"
              accessibilityLabel="Yorumu gönder"
              style={[styles.yorumGonder, { backgroundColor: c.primary, opacity: yorum.trim() ? 1 : 0.4 }]}>
              <Ikon ad="gonder" boyut={16} renk={c.onPrimary} />
            </Pressable>
          </View>
          {detay && !g.benim ? (
            <Pressable
              onPress={() => setSikayetAcik(true)}
              accessibilityRole="button"
              accessibilityLabel="Gönderiyi şikayet et"
              style={styles.sikayetSatiri}>
              <Ikon ad="uyari" boyut={15} renk={c.textMuted} />
              <Text style={[styles.sikayetEtiket, { color: c.textMuted }]}>Şikayet et</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {bulusma && !g.benim && istekler[g.id] === 'pending' ? (
        <View style={styles.istekKatman}>
          <Text style={styles.istekKatmanYazi}>Katılım isteği gönderildi</Text>
          <Pressable
            onPress={() => istekGeriAl(g.id)}
            accessibilityRole="button"
            accessibilityLabel="İsteği geri çek"
            style={styles.istekGeriCek}>
            <Text style={styles.istekGeriCekYazi}>İsteği geri çek</Text>
          </Pressable>
        </View>
      ) : null}
      <Modal visible={sikayetAcik} transparent animationType="fade" onRequestClose={() => setSikayetAcik(false)}>
        <Pressable style={styles.perde} onPress={() => setSikayetAcik(false)}>
          <Pressable style={[styles.sikayetKutu, { backgroundColor: c.surface, borderColor: c.border }]} onPress={() => {}}>
            <Text style={[styles.sikayetBaslik, { color: c.text }]}>Gönderiyi şikayet et</Text>
            <Text style={[styles.sikayetAlt, { color: c.textMuted }]}>Neden bildiriyorsun?</Text>
            {['Spam / reklam', 'Uygunsuz içerik', 'Taciz ya da nefret söylemi', 'Yanıltıcı ya da sahte', 'Tehlikeli davranış', 'Diğer'].map((n) => (
              <Pressable key={n} onPress={() => sikayetEt(n)} accessibilityRole="button" style={[styles.sikayetSatir, { borderTopColor: c.border }]}>
                <Text style={[styles.sikayetYazi, { color: c.text }]}>{n}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
      <OnayKutusu
        gorunur={silAcik}
        ikon="sil"
        tehlikeli
        baslik="Gönderiyi sil"
        mesaj="Bu gönderi, yorumları ve varsa sürüş grubu kalıcı olarak silinecek. Bu işlem geri alınamaz."
        onayEtiketi="Sil"
        onOnay={silOnay}
        onKapat={() => setSilAcik(false)}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sikayetSatiri: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm, marginTop: spacing.xs },
  sikayetEtiket: { fontSize: 13, fontWeight: '700' },
  perde: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: spacing.xl },
  sikayetKutu: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg },
  sikayetBaslik: { fontSize: 17, fontWeight: '800', textAlign: 'center' },
  sikayetAlt: { fontSize: 13, textAlign: 'center', marginBottom: spacing.sm },
  sikayetSatir: { paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth },
  sikayetYazi: { fontSize: 15.5, fontWeight: '600', textAlign: 'center' },
  istekKatman: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  istekGeriCek: { marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.full, borderWidth: 1.5, borderColor: '#FFB800' },
  istekGeriCekYazi: { color: '#fff', fontSize: 12, fontWeight: '800' },
  istekKatmanYazi: { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center', paddingHorizontal: spacing.lg },
  kart: { overflow: 'hidden', borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, gap: spacing.md },
  ust: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  avatarYazi: { fontSize: 18, fontWeight: '900' },
  kimlik: { flex: 1, gap: 3 },
  ad: { fontSize: 15, fontWeight: '800' },
  konumSatiri: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  konum: { fontSize: 12.5, flexShrink: 1 },
  etiket: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 7, paddingVertical: 3 },
  etiketYazi: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1 },
  metin: { fontSize: 15.5, lineHeight: 22 },
  gorsel: { height: 150, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', justifyContent: 'center' },
  serit: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  cizgi: { width: 26, height: 5, borderRadius: 2, opacity: 0.85 },
  gorselEtiket: { position: 'absolute', left: spacing.md, bottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 6 },
  gorselYazi: { fontSize: 12 },
  eylemler: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  eylem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 9, borderRadius: radius.full, borderWidth: 1.5 },
  eylemYazi: { fontSize: 13.5, fontWeight: '800' },
  sayi: { fontSize: 13, fontWeight: '700' },
  yorum: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 'auto', paddingVertical: 8, paddingHorizontal: spacing.sm },
  yorumlar: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: spacing.md, gap: spacing.sm },
  yorumSatir: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  yorumGirdi: { flex: 1, height: 40, borderRadius: radius.full, borderWidth: 1, paddingHorizontal: spacing.md, fontSize: 14 },
  yorumGonder: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  yorumMetin: { fontSize: 14, lineHeight: 20 },
});
