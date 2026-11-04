import { FlatList, StyleSheet, Text } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { ListItem } from '@/components/ui/list-item';
import { Tag } from '@/components/ui/tag';
import { demoModu, ogeleriGetir, type Alan } from '@/lib/veri';
import { spacing, typography, useTheme } from '@/theme';

export function ListeEkrani({ alan, bos }: { alan: Alan; bos: string }) {
  const c = useTheme();
  const ogeler = ogeleriGetir(alan);
  if (ogeler.length === 0) return <EmptyState title="Henüz bir şey yok" description={bos} />;
  return (
    <FlatList
      data={ogeler}
      keyExtractor={(o) => o.id}
      ListHeaderComponent={
        demoModu ? (
          <Text style={[typography.caption, styles.demo, { color: c.textMuted }]}>Demo modu: örnek verilerle gösteriliyor.</Text>
        ) : undefined
      }
      renderItem={({ item }) => (
        <ListItem
          title={item.baslik}
          subtitle={item.altBaslik}
          right={item.etiket ? <Tag label={item.etiket} /> : undefined}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  demo: { padding: spacing.lg, paddingBottom: spacing.xs },
});
