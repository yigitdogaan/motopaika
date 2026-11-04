import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, useTheme } from '@/theme';

type Props = { children: ReactNode; onPress?: () => void; accessibilityLabel?: string };

export function Card({ children, onPress, accessibilityLabel }: Props) {
  const c = useTheme();
  const style = [styles.card, { backgroundColor: c.surface, borderColor: c.border }];
  if (!onPress) return <View style={style}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [...style, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, borderWidth: 1, padding: spacing.lg },
});
