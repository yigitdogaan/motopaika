import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ikon } from '@/components/ikon';
import { Dugme, Hap } from '@/components/yol-ui';
import { MESAFELER, VARSAYILAN_FILTRE, type FiltreSecimi, type Kapsam } from '@/lib/akis-filtre';
import { radius, spacing, useTheme } from '@/theme';

const KAPSAMLAR: { id: Kapsam; ad: string; aciklama: string }[] = [
  { id: 'hepsi', ad: 'Tümü', aciklama: 'Tüm sürücülerin gönderileri' },
  { id: 'anonim', ad: 'Anonim Duvar', aciklama: 'Adı gizli paylaşılan gönderiler' },
  { id: 'yakin', ad: 'Yakınımdakiler', aciklama: 'Konumuna yakın gönderiler, en yakın önce' },
];

type Props = {
  gorunur: boolean;
  onKapat: () => void;
  secim: FiltreSecimi;
  onDegis: (yama: Partial<FiltreSecimi>) => void;
  sehirler: { sehir: string; sayi: number }[];
  /** Şu anki seçimle listelenecek gönderi sayısı (alttaki düğmede gösterilir). */
  sonucSayisi: number;
};

/**
 * Akış filtre paneli: sıralama, kimlerin gönderileri (tümü / anonim / yakınımdakiler + mesafe) ve şehir.
 * Kategori çipleri ekranın üstünde kalır; sık kullanılmayan ayarlar burada toplanır.
 */
export function AkisFiltrePaneli({ gorunur, onKapat, secim, onDegis, sehirler, sonucSayisi }: Props) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const sifirla = () => onDegis({ kapsam: VARSAYILAN_FILTRE.kapsam, maksKm: VARSAYILAN_FILTRE.maksKm, sehir: null, siralama: VARSAYILAN_FILTRE.siralama });
  const degisti = secim.kapsam !== 'hepsi' || !!secim.sehir || secim.siralama !== 'yeni' || secim.maksKm !== VARSAYILAN_FILTRE.maksKm;

  return (
    <Modal visible={gorunur} transparent animationType="slide" onRequestClose={onKapat}>
      <Pressable style={styles.perde} onPress={onKapat} accessibilityLabel="Paneli kapat">
        <Pressable
          style={[styles.sayfa, { backgroundColor: c.bg, borderColor: c.border, paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
          onPress={() => {}}>
          <View style={[styles.tutamac, { backgroundColor: c.border }]} />
          <View style={styles.ust}>
            <Pressable onPress={sifirla} disabled={!degisti} hitSlop={10} accessibilityRole="button" accessibilityLabel="Filtreleri sıfırla" style={styles.solYer}>
              <Text style={[styles.sifirla, { color: degisti ? c.primary : c.textMuted, opacity: degisti ? 1 : 0.5 }]}>Sıfırla</Text>
            </Pressable>
            <Text style={[styles.baslik, { color: c.text }]} accessibilityRole="header">
              Filtrele
            </Text>
            <Pressable onPress={onKapat} hitSlop={12} accessibilityRole="button" accessibilityLabel="Kapat" style={styles.sagYer}>
              <Ikon ad="kapat" boyut={20} renk={c.textMuted} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.icerik} showsVerticalScrollIndicator={false}>
            <Text style={[styles.etiket, { color: c.textMuted }]}>SIRALAMA</Text>
            <View style={styles.hapler}>
              <Hap etiket="En yeni" secili={secim.siralama === 'yeni'} onPress={() => onDegis({ siralama: 'yeni' })} />
              <Hap etiket="En çok selam" secili={secim.siralama === 'selam'} onPress={() => onDegis({ siralama: 'selam' })} />
            </View>
            {secim.kapsam === 'yakin' ? (
              <Text style={[styles.not, { color: c.textMuted }]}>Yakınımdakiler seçiliyken gönderiler her zaman en yakından uzağa sıralanır.</Text>
            ) : null}

            <Text style={[styles.etiket, { color: c.textMuted }]}>GÖNDERİLER</Text>
            <View style={[styles.liste, { borderColor: c.border, backgroundColor: c.surface }]}>
              {KAPSAMLAR.map((k, i) => {
                const secili = secim.kapsam === k.id;
                return (
                  <Pressable
                    key={k.id}
                    onPress={() => onDegis({ kapsam: k.id })}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: secili }}
                    style={[styles.satir, i > 0 && { borderTopColor: c.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                    <View style={styles.satirYazi}>
                      <Text style={[styles.satirAd, { color: c.text }]}>{k.ad}</Text>
                      <Text style={[styles.satirAciklama, { color: c.textMuted }]}>{k.aciklama}</Text>
                    </View>
                    <View style={[styles.radyo, { borderColor: secili ? c.primary : c.border, backgroundColor: secili ? c.primary : 'transparent' }]}>
                      {secili ? <Ikon ad="tik" boyut={13} renk={c.onPrimary} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {secim.kapsam === 'yakin' ? (
              <>
                <Text style={[styles.etiket, { color: c.textMuted }]}>EN FAZLA UZAKLIK</Text>
                <View style={styles.hapler}>
                  {MESAFELER.map((km) => (
                    <Hap key={km ?? 'hepsi'} etiket={km == null ? 'Sınırsız' : `${km} km`} secili={secim.maksKm === km} onPress={() => onDegis({ maksKm: km })} />
                  ))}
                </View>
              </>
            ) : null}

            {sehirler.length > 1 ? (
              <>
                <Text style={[styles.etiket, { color: c.textMuted }]}>ŞEHİR</Text>
                <View style={styles.hapler}>
                  <Hap etiket="Tüm şehirler" ikon="konum" secili={secim.sehir === null} onPress={() => onDegis({ sehir: null })} />
                  {sehirler.map((x) => (
                    <Hap
                      key={x.sehir}
                      etiket={`${x.sehir} · ${x.sayi}`}
                      secili={secim.sehir === x.sehir}
                      onPress={() => onDegis({ sehir: secim.sehir === x.sehir ? null : x.sehir })}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </ScrollView>

          <View style={styles.alt}>
            <Dugme etiket={sonucSayisi === 0 ? 'Gönderi yok' : `${sonucSayisi} gönderiyi göster`} onPress={onKapat} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  perde: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sayfa: { maxHeight: '86%', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, borderBottomWidth: 0, paddingTop: spacing.sm },
  tutamac: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: spacing.sm },
  ust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  solYer: { width: 72 },
  sagYer: { width: 72, alignItems: 'flex-end' },
  baslik: { fontSize: 18, fontWeight: '800' },
  sifirla: { fontSize: 15, fontWeight: '700' },
  icerik: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  etiket: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginTop: spacing.sm },
  hapler: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  not: { fontSize: 13, lineHeight: 18 },
  liste: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  satir: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 60 },
  satirYazi: { flex: 1, gap: 2 },
  satirAd: { fontSize: 16, fontWeight: '700' },
  satirAciklama: { fontSize: 13.5 },
  radyo: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  alt: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
});
