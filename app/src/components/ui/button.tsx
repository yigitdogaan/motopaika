import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { radius, spacing, typography, useTheme } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function Button({ label, onPress, variant = 'primary', size = 'md', loading, disabled, accessibilityLabel }: Props) {
  const c = useTheme();
  const bg = { primary: c.primary, secondary: c.surfaceAlt, ghost: 'transparent', danger: c.danger }[variant];
  const fg = variant === 'primary' ? c.onPrimary : variant === 'danger' ? c.bg : c.text;
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, minHeight: size === 'lg' ? 52 : 44, opacity: off ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'secondary' && { borderWidth: 1, borderColor: c.border },
      ]}>
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[typography.button, { color: fg }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.sm, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' },
});
