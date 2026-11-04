import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useTheme } from '@/theme';
import { Button } from './button';

type Props = {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, icon, actionLabel, onAction }: Props) {
  const c = useTheme();
  return (
    <View style={styles.box}>
      {icon}
      <Text accessibilityRole="header" style={[typography.heading, { color: c.text }]}>
        {title}
      </Text>
      <Text style={[typography.body, styles.text, { color: c.textMuted }]}>{description}</Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  text: { textAlign: 'center' },
  action: { marginTop: spacing.md },
});
