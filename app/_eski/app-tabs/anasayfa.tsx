import { Redirect, type Href } from 'expo-router';

/** Eski ana sayfa adresi: yeni ana sayfa Keşfet. */
export default function Anasayfa() {
  return <Redirect href={'/kesfet' as Href} />;
}
