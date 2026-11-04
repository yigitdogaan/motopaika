import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useTheme } from '@/theme';
import { Button } from './button';

type Props = { message?: string; onRetry?: () => void };

export function ErrorState({ message = 'Bir şeyler ters gitti. Bağlantını kontrol edip tekrar dene.', onRetry }: Props) {
  const c = useTheme();
  return (
    <View style={styles.box}>
      <Text accessibilityRole="header" style={[typography.heading, { color: c.text }]}>
        Yüklenemedi
      </Text>
      <Text style={[typography.body, styles.text, { color: c.textMuted }]}>{message}</Text>
      {onRetry ? (
        <View style={styles.action}>
          <Button label="Tekrar dene" onPress={onRetry} />
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
