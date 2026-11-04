import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '@/theme';

type Props = { label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' };

/** Rozet/etiket. Metin zorunlu: durum yalnız renkle verilmez. */
export function Tag({ label, tone = 'neutral' }: Props) {
  const c = useTheme();
  const color = tone === 'neutral' ? c.textMuted : c[tone];
  return (
    <View style={[styles.tag, { backgroundColor: c.surfaceAlt, borderColor: color }]}>
      <Text style={[typography.caption, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
