import * as Location from 'expo-location';

export type Konum = { lat: number; lng: number; yer: string; sehir?: string };

/** Koordinatın "İlçe, Şehir" adını bulur; bulunamazsa koordinatı yazar. */
export async function konumBilgisi(lat: number, lng: number): Promise<Konum> {
  let yer = '';
  let sehir: string | undefined;
  try {
    const [a] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    sehir = a?.region ?? a?.city ?? a?.subregion ?? undefined;
    const ilce = a?.district ?? a?.subregion ?? a?.city ?? a?.name ?? undefined;
    yer = [ilce, sehir].filter((x, i, d) => x && d.indexOf(x) === i).join(', ');
  } catch {}
  return { lat, lng, yer: yer || `${lat.toFixed(3)}, ${lng.toFixed(3)}`, sehir };
}

/** Konum izni ister, mevcut konumu ve "İlçe, Şehir" adını döner. İzin yoksa null. */
export async function mevcutKonum(): Promise<Konum | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude: lat, longitude: lng } = p.coords;
    return await konumBilgisi(lat, lng);
  } catch {
    return null;
  }
}

/** Yazılı yer adını koordinata çevirir (harita pini için). Bulunamazsa null. */
export async function yerAdindanKonum(yer: string): Promise<{ lat: number; lng: number; sehir?: string } | null> {
  try {
    const [s] = await Location.geocodeAsync(yer);
    if (!s) return null;
    let sehir: string | undefined;
    try {
      const [a] = await Location.reverseGeocodeAsync({ latitude: s.latitude, longitude: s.longitude });
      sehir = a?.region ?? a?.city ?? undefined;
    } catch {}
    return { lat: s.latitude, lng: s.longitude, sehir };
  } catch {
    return null;
  }
}

/** İki nokta arası km (haversine). */
export function mesafeKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const r = (x: number) => (x * Math.PI) / 180;
  const h =
    Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
