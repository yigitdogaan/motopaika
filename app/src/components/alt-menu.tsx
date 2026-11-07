import { usePathname, useRouter, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bulanik } from '@/components/bulanik';
import { Ikon, type IkonAdi } from '@/components/ikon';
import { Rozet } from '@/components/rozet';
import { demoSohbetler } from '@/demo/mesajlar';
import { supabase } from '@/lib/supabase';
import { radius, useTheme } from '@/theme';

type Dugme = { rota: string; ikon: IkonAdi; etiket: string; kisa: string; rozet?: number };

/**
 * Yüzen alt menü: içeriğin üstünde duran yuvarlak hap. 4 sekme (Akış · Harita · Mesajlar · Profil & Garaj)
 * ve hapın sağında ayrı duran yuvarlak "Gönderi Paylaş" düğmesi.
 */
// Gerçek modda rozet gösterilmez (okunmamış sayısı Mesajlar ekranında).
const OKUNMAMIS = supabase ? 0 : demoSohbetler.reduce((t, s) => t + s.okunmamis, 0);
const SOL: Dugme[] = [
  { rota: 'akis', ikon: 'ev', etiket: 'Akış', kisa: 'Akış' },
  { rota: 'harita', ikon: 'harita', etiket: 'Harita', kisa: 'Harita' },
];
const SAG: Dugme[] = [
  { rota: 'mesajlar', ikon: 'mesaj', etiket: 'Mesajlar', kisa: 'Mesaj', rozet: OKUNMAMIS },
  { rota: 'garaj', ikon: 'kisi', etiket: 'Profil ve Garaj', kisa: 'Profil' },
];

const FAB = 60;
const MENU_YUKSEKLIK = 64;
// Android'de sistem çubuğu payı küçük kaldığı için menü biraz daha yukarıda durur.
const ALT_PAY = Platform.OS === 'android' ? 20 : 0;
const KENAR = 16;

/** Ekranların listelerine eklenecek alt boşluk: yüzen menü son satırı kapatmasın. */
export function useAltMenuBosluk(): number {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, 12) + ALT_PAY + MENU_YUKSEKLIK + 20;
}

/** Tek sekme: seçilince genişler, adı yanında belirir; diğer sekmeler yana kayar. */
function Sekme({ d, secili, onPress }: { d: Dugme; secili: boolean; onPress: () => void }) {
  const c = useTheme();
  const anim = useRef(new Animated.Value(secili ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: secili ? 1 : 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [secili, anim]);

  const genislik = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.3] });
  const yaziGenislik = anim.interpolate({ inputRange: [0, 1], outputRange: [0, d.kisa.length * 8.6] });
  const zemin = anim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(0,0,0,0)', `${c.primary}24`] });

  return (
    <Animated.View style={{ flexGrow: genislik, flexBasis: 0 }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={d.etiket}
        accessibilityState={{ selected: secili }}
        hitSlop={8}
        style={styles.sekme}>
        <Animated.View style={[styles.sekmeIc, { backgroundColor: zemin }]}>
          <Ikon ad={d.ikon} boyut={24} renk={secili ? c.primary : c.textMuted} dolu={secili} />
          <Animated.View style={{ width: yaziGenislik, marginLeft: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }), opacity: anim, overflow: 'hidden' }}>
            <Text numberOfLines={1} style={[styles.etiket, { color: c.primary }]}>
              {d.kisa}
            </Text>
          </Animated.View>
          {d.rozet ? <Rozet sayi={d.rozet} style={styles.rozet} /> : null}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export function AltMenu() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const yol = usePathname();

  const sekme = (d: Dugme) => (
    <Sekme key={d.rota} d={d} secili={yol === `/${d.rota}`} onPress={() => router.navigate(`/${d.rota}` as Href)} />
  );

  return (
    <View style={[styles.dis, { bottom: Math.max(insets.bottom, 12) + ALT_PAY }]} pointerEvents="box-none">
      <View style={[styles.hap, { borderColor: c.border }]}>
        <Bulanik radius={MENU_YUKSEKLIK / 2} />
        {[...SOL, ...SAG].map(sekme)}
      </View>

      <Pressable
        onPress={() => router.push('/yeni-gonderi' as Href)}
        accessibilityRole="button"
        accessibilityLabel="Gönderi Paylaş"
        style={({ pressed }) => [styles.fab, { backgroundColor: c.primary }, pressed && { opacity: 0.85 }]}>
        <Ikon ad="arti" boyut={30} renk={c.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dis: { position: 'absolute', left: KENAR, right: KENAR, flexDirection: 'row', alignItems: 'center', gap: 12 },
  hap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: MENU_YUKSEKLIK,
    paddingHorizontal: 12,
    borderRadius: MENU_YUKSEKLIK / 2,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },
  sekme: { height: 46, alignItems: 'center', justifyContent: 'center' },
  sekmeIc: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, paddingHorizontal: 8, borderRadius: 22 },
  etiket: { fontSize: 14, fontWeight: '800' },
  rozet: { position: 'absolute', top: -2, left: 24 },
  fab: {
    width: FAB,
    height: FAB,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
