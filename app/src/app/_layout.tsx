import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { OturumSaglayici, useOturum } from '@/lib/oturum';
import { palette } from '@/theme';

function Rotalar() {
  const { kullanici, hazir } = useOturum();
  if (!hazir) return null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!kullanici}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!kullanici}>
        <Stack.Screen name="giris" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const light = useColorScheme() === 'light';
  const c = palette[light ? 'light' : 'dark'];
  const base = light ? DefaultTheme : DarkTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, primary: c.primary, background: c.bg, card: c.bg, text: c.text, border: c.border },
  };
  return (
    <ThemeProvider value={theme}>
      <OturumSaglayici>
        <Rotalar />
      </OturumSaglayici>
    </ThemeProvider>
  );
}
