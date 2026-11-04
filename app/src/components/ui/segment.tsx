import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '@/theme';

type Option = { value: string; label: string };
type Props = { options: Option[]; value: string; onChange: (value: string) => void; accessibilityLabel?: string };

/** Üstte yatay sekme grubu (Konular · Sorunlar · Not duvarı). Seçili öğe metin + dolgu ile belli olur. */
export function Segment({ options, value, onChange, accessibilityLabel }: Props) {
  const c = useTheme();
  return (
    <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} style={[styles.row, { backgroundColor: c.surfaceAlt }]}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityLabel={o.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={[styles.item, selected && { backgroundColor: c.primary }]}>
            <Text style={[typography.button, { color: selected ? c.onPrimary : c.textMuted }]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderRadius: radius.sm, padding: spacing.xs, gap: spacing.xs },
  item: { flex: 1, minHeight: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
});
