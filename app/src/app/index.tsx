import { Redirect, type Href } from 'expo-router';

import { useOturum } from '@/lib/oturum';

/** Açılış: oturum varsa Akış'a, yoksa giriş ekranına yönlendir (korumalı rotaya körlemesine gitmek sonsuz döngü yapıyordu). */
export default function Index() {
  const { kullanici } = useOturum();
  return <Redirect href={(kullanici ? '/akis' : '/giris') as Href} />;
}
