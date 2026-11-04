import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useTheme } from '@/theme';

type Props = { title: string; description: string };

export function EmptyState({ title, description }: Props) {
  const c = useTheme();
  return (
    <View style={styles.box}>
      <Text accessibilityRole="header" style={[typography.heading, { color: c.text }]}>
        {title}
      </Text>
      <Text style={[typography.body, styles.text, { color: c.textMuted }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  text: { textAlign: 'center', marginTop: spacing.sm },
});
