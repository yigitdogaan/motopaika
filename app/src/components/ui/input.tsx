import { useState } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '@/theme';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, onFocus, onBlur, multiline, ...rest }: Props) {
  const c = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? c.danger : focused ? c.primary : c.border;
  return (
    <View style={styles.box}>
      <Text style={[typography.caption, { color: c.textMuted }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.textMuted}
        multiline={multiline}
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          typography.body,
          styles.input,
          { color: c.text, backgroundColor: c.surface, borderColor },
          multiline && styles.multiline,
        ]}
      />
      {error ? (
        <Text accessibilityRole="alert" style={[typography.caption, { color: c.danger }]}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={[typography.caption, { color: c.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: spacing.xs },
  input: { minHeight: 48, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
});
