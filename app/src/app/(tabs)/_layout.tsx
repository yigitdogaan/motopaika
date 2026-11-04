import { Tabs } from 'expo-router';

import { useTheme } from '@/theme';

const SEKMELER = [
  { name: 'topluluk', title: 'Topluluk' },
  { name: 'ikinci-el', title: 'İkinci el' },
  { name: 'rotalar', title: 'Rotalar' },
  { name: 'etkinlik', title: 'Etkinlik' },
  { name: 'sohbet', title: 'Sohbet' },
  { name: 'profil', title: 'Profil' },
] as const;

export default function TabsLayout() {
  const c = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: { backgroundColor: c.bg, borderTopColor: c.border },
        headerStyle: { backgroundColor: c.bg },
        headerTintColor: c.text,
      }}>
      {SEKMELER.map((s) => (
        <Tabs.Screen key={s.name} name={s.name} options={{ title: s.title }} />
      ))}
    </Tabs>
  );
}
