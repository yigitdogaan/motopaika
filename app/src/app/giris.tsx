import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { useOturum } from '@/lib/oturum';
import { spacing, typography, useTheme } from '@/theme';

export default function Giris() {
  const c = useTheme();
  const { girisYap } = useOturum();
  return (
    <View style={[styles.kap, { backgroundColor: c.bg }]}>
      <Text style={[typography.title, { color: c.primary }]}>Motopaika</Text>
      <Text style={[typography.body, { color: c.textMuted }]}>
        Türkiye&apos;nin motosiklet topluluğu. Demo modundasın: hesap gerekmez.
      </Text>
      <Button label="Demo kullanıcı ile gir" size="lg" onPress={girisYap} />
    </View>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
});
