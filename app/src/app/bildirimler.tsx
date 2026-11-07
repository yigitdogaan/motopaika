import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BosDurum } from '@/components/bos-durum';
import { Ikon, type IkonAdi } from '@/components/ikon';
import { IskeletListe } from '@/components/iskelet';
import { Hap } from '@/components/yol-ui';
import { ZaferIsareti } from '@/components/zafer-isareti';
import { SISTEM_TURLERI, useBildirim, type Bildirim, type BildirimTuru } from '@/lib/bildirim';
import { istekYanitla, odaIdBul, sahipIstekleri } from '@/lib/sohbet';
import { supabase } from '@/lib/supabase';
import { radius, spacing, useTheme } from '@/theme';

const IKON: Record<BildirimTuru, IkonAdi> = {
  ride_request: 'el',
  ride_accepted: 'tik',
  ride_declined: 'kapat',
  salute: 'el', // gösterimde zafer işareti kullanılır
  comment: 'yorumDolu',
  warning: 'uyari',
  post_removed: 'sil',
  account_suspended: 'uyari',
  account_banned: 'uyari',
};

const gunBasi = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
function bolum(iso: string): string {
  const fark = Math.round((gunBasi(new Date()) - gunBasi(new Date(iso))) / 86400000);
  return fark <= 0 ? 'Bugün' : fark === 1 ? 'Dün' : 'Daha eski';
}

/** Bildirimler: gruplanmış liste; dokununca ilgili gönderiye ya da sürüş grubuna gider, istekler burada yanıtlanabilir. */
export default function Bildirimler() {
  const c = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bildirimler, okunmamis, yukleniyor, yenile, okunduYap, hepsiniOkunduYap, sil } = useBildirim();
  const [yenileniyor, setYenileniyor] = useState(false);
  const cekYenile = async () => {
    setYenileniyor(true);
    try {
      await yenile();
    } finally {
      setYenileniyor(false);
    }
  };
  const [sadeceOkunmamis, setSadeceOkunmamis] = useState(false);
  // Sürüş sahibi olarak hâlâ bekleyen istekler ("gönderi:kullanıcı") ve bu ekranda verilen yanıtlar.
  const [bekleyen, setBekleyen] = useState<Set<string> | null>(supabase ? null : new Set());
  const [yanit, setYanit] = useState<Record<string, 'accepted' | 'declined'>>({});

  const istekPostlari = useMemo(
    () => [...new Set(bildirimler.filter((b) => b.tur === 'ride_request' && b.postId).map((b) => b.postId!))],
    [bildirimler],
  );
  const imza = istekPostlari.join(',');
  useEffect(() => {
    if (!supabase) return;
    let iptal = false;
    Promise.all(istekPostlari.map((p) => sahipIstekleri(p).then((l) => l.map((k) => `${p}:${k.kullaniciId}`)))).then((l) => {
      if (!iptal) setBekleyen(new Set(l.flat()));
    });
    return () => {
      iptal = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imza]);

  const liste = useMemo(() => (sadeceOkunmamis ? bildirimler.filter((b) => !b.okundu) : bildirimler), [bildirimler, sadeceOkunmamis]);
  const bolumler = useMemo(() => {
    const harita = new Map<string, Bildirim[]>();
    for (const b of liste) harita.set(bolum(b.olusturma), [...(harita.get(bolum(b.olusturma)) ?? []), b]);
    return ['Bugün', 'Dün', 'Daha eski'].filter((k) => harita.has(k)).map((k) => ({ title: k, data: harita.get(k)! }));
  }, [liste]);

  const gonderiyeGit = (postId: string) => router.push({ pathname: '/gonderi/[id]', params: { id: postId } } as unknown as Href);
  const profileGit = (id: string) => router.push({ pathname: '/profil/[id]', params: { id } } as unknown as Href);

  const ac = async (b: Bildirim) => {
    okunduYap(b.id);
    if (SISTEM_TURLERI.includes(b.tur) || !b.postId) return;
    if ((b.tur === 'ride_request' || b.tur === 'ride_accepted') && supabase) {
      const oda = await odaIdBul(b.postId);
      if (oda) return router.push({ pathname: '/sohbet/[id]', params: { id: oda } } as unknown as Href);
    }
    gonderiyeGit(b.postId);
  };

  const yanitla = async (b: Bildirim, kabul: boolean) => {
    if (!b.postId || !b.aktorId) return;
    if (await istekYanitla(b.postId, b.aktorId, kabul)) {
      setYanit((o) => ({ ...o, [b.id]: kabul ? 'accepted' : 'declined' }));
      okunduYap(b.id);
    } else Alert.alert('İşlem yapılamadı', 'İnternet bağlantını kontrol edip tekrar dene.');
  };

  const sorSil = (b: Bildirim) =>
    Alert.alert('Bildirimi sil', 'Bu bildirim listeden kaldırılsın mı?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => sil(b.id) },
    ]);

  const rozetRenk = (t: BildirimTuru) => (t === 'ride_accepted' ? c.success : t === 'ride_declined' || t === 'account_banned' || t === 'post_removed' ? c.danger : c.primary);

  return (
    <View style={[styles.ekran, { backgroundColor: c.bg }]}>
      <View style={[styles.ust, { borderBottomColor: c.border, paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" style={styles.geri}>
          <Ikon ad="ileri" boyut={22} renk={c.text} />
        </Pressable>
        <Text style={[styles.baslik, { color: c.text }]} accessibilityRole="header">
          Bildirimler
        </Text>
        {okunmamis > 0 ? (
          <Pressable onPress={hepsiniOkunduYap} hitSlop={10} accessibilityRole="button">
            <Text style={[styles.hepsi, { color: c.primary }]}>Tümünü okundu yap</Text>
          </Pressable>
        ) : (
          <View style={styles.geri} />
        )}
      </View>

      <View style={styles.filtreler}>
        <Hap etiket="Tümü" secili={!sadeceOkunmamis} onPress={() => setSadeceOkunmamis(false)} />
        <Hap etiket={okunmamis ? `Okunmamış (${okunmamis})` : 'Okunmamış'} secili={sadeceOkunmamis} onPress={() => setSadeceOkunmamis(true)} />
      </View>

      <SectionList
        sections={bolumler}
        keyExtractor={(b) => b.id}
        stickySectionHeadersEnabled={false}
        refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={cekYenile} tintColor={c.primary} colors={[c.primary]} />}
        contentContainerStyle={[styles.liste, { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xl }]}
        ListEmptyComponent={
          yukleniyor ? (
            <IskeletListe />
          ) : (
          <BosDurum
            ikon="zil"
            baslik={sadeceOkunmamis ? 'Okunmamış bildirimin yok' : 'Henüz bildirimin yok'}
            metin={sadeceOkunmamis ? 'Hepsini okudun.' : 'Selam, yorum ve sürüş istekleri burada görünür.'}
          />
          )
        }
        renderSectionHeader={({ section }) => <Text style={[styles.bolum, { color: c.textMuted }]}>{section.title.toLocaleUpperCase('tr')}</Text>}
        renderItem={({ item: b }) => {
          const anahtar = b.postId && b.aktorId ? `${b.postId}:${b.aktorId}` : '';
          const verilen = yanit[b.id];
          const bekliyor = b.tur === 'ride_request' && !verilen && bekleyen?.has(anahtar);
          const yanitlandi = b.tur === 'ride_request' && !bekliyor && (verilen || (bekleyen !== null && supabase));
          return (
            <Pressable
              onPress={() => ac(b)}
              onLongPress={() => sorSil(b)}
              accessibilityRole="button"
              accessibilityLabel={`${b.metin}. ${b.zaman}`}
              style={[styles.satir, { backgroundColor: b.okundu ? c.bg : c.surface, borderColor: b.okundu ? c.border : c.primary }]}>
              <Pressable
                onPress={() => (b.aktorId && !SISTEM_TURLERI.includes(b.tur) ? profileGit(b.aktorId) : ac(b))}
                accessibilityRole="button"
                accessibilityLabel={`${b.aktorAd} profilini aç`}
                style={styles.avatarKap}>
                <View style={[styles.avatar, { backgroundColor: c.surfaceAlt }]}>
                  {b.aktorAvatar ? (
                    <Image source={{ uri: b.aktorAvatar }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  ) : (
                    <Text style={[styles.avatarYazi, { color: c.primary }]}>{b.aktorAd.charAt(0).toLocaleUpperCase('tr')}</Text>
                  )}
                </View>
                <View style={[styles.rozet, { backgroundColor: rozetRenk(b.tur), borderColor: b.okundu ? c.bg : c.surface }]}>
                  {b.tur === 'salute' ? <ZaferIsareti boyut={13} renk={c.onPrimary} /> : <Ikon ad={IKON[b.tur]} boyut={12} renk={c.onPrimary} />}
                </View>
              </Pressable>

              <View style={styles.yazilar}>
                <Text style={[styles.metin, { color: c.text, fontWeight: b.okundu ? '500' : '700' }]}>
                  <Text style={{ fontWeight: '900' }}>{b.aktorAd}</Text> {b.metin.slice(b.aktorAd.length).trim()}
                </Text>
                {b.govde ? (
                  <Text style={[styles.ozet, { color: c.text }]} numberOfLines={4}>
                    {b.govde}
                  </Text>
                ) : null}
                {b.gonderiOzeti && !b.govde ? (
                  <Text style={[styles.ozet, { color: c.textMuted }]} numberOfLines={1}>
                    “{b.gonderiOzeti}”
                  </Text>
                ) : null}
                <Text style={[styles.zaman, { color: b.okundu ? c.textMuted : c.primary }]}>{b.zaman}</Text>

                {bekliyor ? (
                  <View style={styles.eylemler}>
                    <Pressable onPress={() => yanitla(b, true)} accessibilityRole="button" accessibilityLabel={`${b.aktorAd} isteğini kabul et`} style={[styles.eylem, { backgroundColor: c.primary }]}>
                      <Text style={[styles.eylemYazi, { color: c.onPrimary }]}>Kabul et</Text>
                    </Pressable>
                    <Pressable onPress={() => yanitla(b, false)} accessibilityRole="button" accessibilityLabel={`${b.aktorAd} isteğini reddet`} style={[styles.eylem, { borderColor: c.border, borderWidth: 1 }]}>
                      <Text style={[styles.eylemYazi, { color: c.text }]}>Reddet</Text>
                    </Pressable>
                  </View>
                ) : yanitlandi ? (
                  <Text style={[styles.durum, { color: verilen === 'declined' ? c.danger : c.success }]}>
                    {verilen === 'accepted' ? 'Kabul ettin' : verilen === 'declined' ? 'Reddettin' : 'Yanıtlandı'}
                  </Text>
                ) : null}
              </View>

              {!b.okundu ? <View style={[styles.nokta, { backgroundColor: c.danger }]} /> : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ekran: { flex: 1 },
  ust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  geri: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '180deg' }] },
  baslik: { flex: 1, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  hepsi: { fontSize: 12.5, fontWeight: '800' },
  filtreler: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  liste: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  bolum: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: spacing.md, marginBottom: spacing.xs },
  bosKap: { alignItems: 'center', gap: spacing.md, marginTop: spacing.xxl, paddingHorizontal: spacing.xl },
  bos: { textAlign: 'center', fontSize: 15, lineHeight: 21 },
  satir: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
  avatarKap: { width: 48, height: 48 },
  avatar: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatarYazi: { fontSize: 18, fontWeight: '900' },
  rozet: { position: 'absolute', right: -3, bottom: -3, width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  yazilar: { flex: 1, gap: 2 },
  metin: { fontSize: 14.5, lineHeight: 20 },
  ozet: { fontSize: 13 },
  zaman: { fontSize: 12, fontWeight: '600' },
  eylemler: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  eylem: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.full },
  eylemYazi: { fontSize: 13, fontWeight: '800' },
  durum: { fontSize: 12.5, fontWeight: '800', marginTop: 4 },
  nokta: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
});
