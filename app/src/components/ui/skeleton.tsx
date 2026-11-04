import { StyleSheet, View } from 'react-native';

import { radius, spacing, useTheme } from '@/theme';

type Props = { width?: number | string; height?: number; rounded?: boolean };

/** Tek gri blok (yükleniyor). Ekran okuyucudan gizli; SkeletonList tek "Yükleniyor" olarak okunur. */
export function Skeleton({ width = '100%', height = 16, rounded }: Props) {
  const c = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: width as number, height, backgroundColor: c.surfaceAlt, borderRadius: rounded ? radius.full : radius.sm }}
    />
  );
}

/** Liste yükleniyor görünümü: `rows` adet ListItem biçiminde satır. */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <View accessible accessibilityLabel="Yükleniyor" accessibilityRole="progressbar" style={styles.list}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton width={48} height={48} rounded />
          <View style={styles.lines}>
            <Skeleton width="70%" />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  lines: { flex: 1, gap: spacing.sm },
});
