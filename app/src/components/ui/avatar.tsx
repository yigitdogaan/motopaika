import { Image, StyleSheet, Text, View } from 'react-native';

import { typography, useTheme } from '@/theme';

const SIZES = { sm: 32, md: 48, lg: 80 } as const;
type Props = { name: string; uri?: string; size?: keyof typeof SIZES };

export function Avatar({ name, uri, size = 'md' }: Props) {
  const c = useTheme();
  const d = SIZES[size];
  const box = { width: d, height: d, borderRadius: d / 2 };
  if (uri) return <Image accessibilityLabel={name} source={{ uri }} style={box} />;
  const initial = name.trim().charAt(0).toLocaleUpperCase('tr-TR');
  return (
    <View accessible accessibilityLabel={name} style={[styles.center, box, { backgroundColor: c.surfaceAlt }]}>
      <Text style={[size === 'lg' ? typography.title : typography.bodyStrong, { color: c.text }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
