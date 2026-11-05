import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { ListeEkrani } from '@/components/liste-ekrani';
import { ogeleriGetir } from '@/lib/veri';

// Türkiye geneli başlangıç görünümü; Expo Go'da hazır react-native-maps (API anahtarı gerektirmez).
const TURKIYE = { latitude: 39, longitude: 35, latitudeDelta: 12, longitudeDelta: 22 };

export default function Rotalar() {
  const noktalar = ogeleriGetir('rotalar').filter((o) => o.konum);
  return (
    <View style={styles.kap}>
      <MapView style={styles.harita} initialRegion={TURKIYE}>
        {noktalar.map((o) => (
          <Marker
            key={o.id}
            coordinate={{ latitude: o.konum!.lat, longitude: o.konum!.lng }}
            title={o.baslik}
            description={o.altBaslik}
          />
        ))}
      </MapView>
      <ListeEkrani alan="rotalar" bos="İlk rotayı sen ekle." />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1 },
  harita: { height: 240 },
});
