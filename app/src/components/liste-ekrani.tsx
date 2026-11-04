import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { useSikayet } from '@/lib/moderasyon/sikayet';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ListItem } from '@/components/ui/list-item';
import { SkeletonList } from '@/components/ui/skeleton';
import { Tag } from '@/components/ui/tag';
import type { Oge } from '@/demo/veri';
import { demoModu, ogeleriGetir, type Alan } from '@/lib/veri';
import { spacing, typography, useTheme } from '@/theme';

export function ListeEkrani({ alan, bos }: { alan: Alan; bos: string }) {
  const c = useTheme();
  const [ogeler, setOgeler] = useState<Oge[] | null>(null);
  const [hata, setHata] = useState(false);
  const { durum, bildir } = useSikayet();
  const [deneme, setDeneme] = useState(0);
  useEffect(() => {
    let gecerli = true;
    Promise.resolve()
      .then(() => ogeleriGetir(alan))
      .then(
        (o) => gecerli && setOgeler(o),
        () => gecerli && setHata(true),
      );
    return () => {
      gecerli = false;
    };
  }, [alan, deneme]);
  const tekrarDene = () => {
    setHata(false);
    setOgeler(null);
    setDeneme((d) => d + 1);
  };

  if (hata) return <ErrorState onRetry={tekrarDene} />;
  if (!ogeler) return <SkeletonList />;
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
          right={
            <>
              {item.etiket ? <Tag label={item.etiket} /> : null}
              <Button
                label={durum.bildirilen.includes(item.id) ? 'Bildirildi' : 'Bildir'}
                variant="ghost"
                disabled={durum.bildirilen.includes(item.id)}
                onPress={() => bildir(item.id)}
                accessibilityLabel={`${item.baslik} içeriğini bildir`}
              />
            </>
          }
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  demo: { padding: spacing.lg, paddingBottom: spacing.xs },
});
