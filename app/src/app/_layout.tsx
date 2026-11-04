import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { palette } from '@/theme';

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
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
