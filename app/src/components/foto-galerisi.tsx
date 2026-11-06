import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ikon } from '@/components/ikon';
import { radius, spacing, useTheme } from '@/theme';

/** Gönderi fotoğrafları: tek fotoğrafta düz görsel, birden fazlada kaydırmalı galeri ve nokta göstergesi. Dokununca tam ekran açılır. */
export function FotoGalerisi({ adresler, yukseklik = 150 }: { adresler: string[]; yukseklik?: number }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const [genislik, setGenislik] = useState(0);
  const [sayfa, setSayfa] = useState(0);
  const [tamEkran, setTamEkran] = useState<number | null>(null);

  const olc = useCallback((e: LayoutChangeEvent) => setGenislik(e.nativeEvent.layout.width), []);
  if (!adresler.length) return null;

  return (
    <View onLayout={olc} style={[styles.kap, { height: yukseklik, borderColor: c.border }]}>
      {genislik > 0 ? (
        <FlatList
          data={adresler}
          keyExtractor={(u) => u}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={adresler.length > 1}
          onMomentumScrollEnd={(e) => setSayfa(Math.round(e.nativeEvent.contentOffset.x / genislik))}
          getItemLayout={(_, i) => ({ length: genislik, offset: genislik * i, index: i })}
          renderItem={({ item, index }) => (
            <Pressable onPress={() => setTamEkran(index)} accessibilityRole="imagebutton" accessibilityLabel={`Fotoğraf ${index + 1} / ${adresler.length}, büyüt`}>
              <Image source={{ uri: item }} style={{ width: genislik, height: yukseklik }} contentFit="cover" />
            </Pressable>
          )}
        />
      ) : null}
      {adresler.length > 1 ? (
        <View style={styles.noktalar} pointerEvents="none">
          {adresler.map((u, i) => (
            <View key={u} style={[styles.nokta, { backgroundColor: i === sayfa ? c.primary : '#FFFFFF99' }]} />
          ))}
        </View>
      ) : null}

      <Modal visible={tamEkran !== null} transparent animationType="fade" onRequestClose={() => setTamEkran(null)}>
        <View style={styles.tam}>
          {tamEkran !== null ? (
            <FlatList
              data={adresler}
              keyExtractor={(u) => u}
              horizontal
              pagingEnabled
              initialScrollIndex={tamEkran}
              getItemLayout={(_, i) => ({ length: ekranGenisligi(), offset: ekranGenisligi() * i, index: i })}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable onPress={() => setTamEkran(null)} style={{ width: ekranGenisligi(), flex: 1, justifyContent: 'center' }}>
                  <Image source={{ uri: item }} style={styles.tamFoto} contentFit="contain" />
                </Pressable>
              )}
            />
          ) : null}
          <Pressable
            onPress={() => setTamEkran(null)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Kapat"
            style={[styles.kapat, { top: insets.top + spacing.md }]}>
            <Ikon ad="kapat" boyut={22} renk="#FFFFFF" />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const ekranGenisligi = () => Dimensions.get('window').width;

const styles = StyleSheet.create({
  kap: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  noktalar: { position: 'absolute', bottom: spacing.sm, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  nokta: { width: 7, height: 7, borderRadius: 4 },
  tam: { flex: 1, backgroundColor: '#000000F2' },
  tamFoto: { width: '100%', height: '80%' },
  kapat: { position: 'absolute', right: spacing.lg, width: 40, height: 40, borderRadius: 20, backgroundColor: '#00000080', alignItems: 'center', justifyContent: 'center' },
});
