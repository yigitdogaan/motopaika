import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useTheme } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
};

/** Tüm satır tek dokunma hedefi; onPress varsa sağda chevron. */
export function ListItem({ title, subtitle, left, right, onPress }: Props) {
  const c = useTheme();
  const body = (
    <>
      {left}
      <View style={styles.text}>
        <Text style={[typography.bodyStrong, { color: c.text }]}>{title}</Text>
        {subtitle ? <Text style={[typography.caption, { color: c.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {right}
      {onPress ? (
        <Text accessible={false} style={[typography.heading, { color: c.textMuted }]}>
          ›
        </Text>
      ) : null}
    </>
  );
  const style = [styles.row, { borderBottomColor: c.border }];
  if (!onPress) return <View style={style}>{body}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      onPress={onPress}
      style={({ pressed }) => [...style, pressed && { backgroundColor: c.surfaceAlt }]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text: { flex: 1, gap: 2 },
});
