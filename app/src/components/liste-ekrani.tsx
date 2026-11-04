import { FlatList, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { demoModu, ogeleriGetir, type Alan } from '@/lib/veri';
import { radius, spacing, typography, useTheme } from '@/theme';

export function ListeEkrani({ alan, bos }: { alan: Alan; bos: string }) {
  const c = useTheme();
  const ogeler = ogeleriGetir(alan);
  if (ogeler.length === 0) return <EmptyState title="Henüz bir şey yok" description={bos} />;
  return (
    <FlatList
      data={ogeler}
      keyExtractor={(o) => o.id}
      contentContainerStyle={styles.liste}
      ListHeaderComponent={
        demoModu ? (
          <Text style={[typography.body, styles.demo, { color: c.textMuted }]}>Demo modu: örnek verilerle gösteriliyor.</Text>
        ) : undefined
      }
      renderItem={({ item }) => (
        <View style={[styles.kart, { backgroundColor: c.surface, borderColor: c.border }]}>
          {item.etiket ? <Text style={[typography.body, { color: c.primary }]}>{item.etiket}</Text> : null}
          <Text style={[typography.heading, { color: c.text }]}>{item.baslik}</Text>
          <Text style={[typography.body, { color: c.textMuted }]}>{item.altBaslik}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  liste: { padding: spacing.md, gap: spacing.sm },
  demo: { marginBottom: spacing.xs },
  kart: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
});
