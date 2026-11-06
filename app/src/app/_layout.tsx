import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { AcilisKatmani } from '@/components/acilis-ekrani';
import { AkisSaglayici } from '@/lib/akis';
import { BildirimSaglayici } from '@/lib/bildirim';
import { pushDinleyicileriKur, pushKaydet } from '@/lib/push';
import { OturumSaglayici, useOturum } from '@/lib/oturum';
import { TemaSaglayici, useTema } from '@/theme';

function Rotalar() {
  const { kullanici, hazir } = useOturum();
  const router = useRouter();
  useEffect(() => {
    if (!kullanici) return;
    pushKaydet();
    return pushDinleyicileriKur((yol) => router.push(yol as never));
  }, [kullanici, router]);
  return (
    <>
    {hazir ? (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!kullanici}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="yeni-gonderi"
          options={{
            // iOS: yerel modal (aşağı kayarak kapanır). Android: alttan açılıp aşağı alçalarak kapanan ekran.
            presentation: Platform.OS === 'ios' ? 'modal' : 'card',
            animation: 'slide_from_bottom',
            animationDuration: 320,
          }}
        />
 <Stack.Screen name="gonderi/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="sohbet/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="profil/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="bildirimler" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ayarlar" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>
      <Stack.Protected guard={!kullanici}>
        <Stack.Screen name="giris" options={{ animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
    ) : null}
    <AcilisKatmani hazir={hazir} />
    </>
  );
}

function Kok() {
  const { koyu, renkler: c } = useTema();
  const taban = koyu ? DarkTheme : DefaultTheme;
  const theme = {
    ...taban,
    colors: { ...taban.colors, primary: c.primary, background: c.bg, card: c.surface, text: c.text, border: c.border },
  };
  return (
    <ThemeProvider value={theme}>
      <StatusBar style={koyu ? 'light' : 'dark'} />
      <OturumSaglayici>
        <AkisSaglayici>
          <BildirimSaglayici>
            <Rotalar />
          </BildirimSaglayici>
        </AkisSaglayici>
      </OturumSaglayici>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <TemaSaglayici>
      <Kok />
    </TemaSaglayici>
  );
}
