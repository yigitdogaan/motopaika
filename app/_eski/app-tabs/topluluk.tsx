import { Redirect, type Href } from 'expo-router';

/** Eski forum listesi adresi: içerik artık Keşfet'te (katıldığın kanalların gönderileri). */
export default function EskiTopluluk() {
  return <Redirect href={'/kesfet' as Href} />;
}
