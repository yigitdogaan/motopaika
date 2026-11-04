import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { ListItem } from '@/components/ui/list-item';
import { useOturum } from '@/lib/oturum';
import { spacing, typography, useTheme } from '@/theme';

export default function Profil() {
  const c = useTheme();
  const { kullanici, motorlar, motorEkle, motorSil, cikisYap } = useOturum();
  const [marka, setMarka] = useState('');
  const [model, setModel] = useState('');

  const ekle = () => {
    if (motorEkle(marka, model)) {
      setMarka('');
      setModel('');
    }
  };

  return (
    <FlatList
      data={motorlar}
      keyExtractor={(m) => m.id}
      contentContainerStyle={styles.liste}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.ust}>
          <View style={styles.kisi}>
            <Avatar name={kullanici?.ad ?? '?'} size="lg" />
            <View>
              <Text style={[typography.title, { color: c.text }]}>{kullanici?.ad}</Text>
              <Text style={[typography.body, { color: c.textMuted }]}>{kullanici?.sehir}</Text>
            </View>
          </View>
          <Text style={[typography.heading, { color: c.text }]}>Garajım</Text>
        </View>
      }
      ListEmptyComponent={<EmptyState title="Garajın boş" description="Aşağıdan ilk motorunu ekle." />}
      renderItem={({ item }) => (
        <ListItem
          title={`${item.marka} ${item.model}`}
          right={
            <Button
              label="Sil"
              variant="ghost"
              onPress={() => motorSil(item.id)}
              accessibilityLabel={`${item.marka} ${item.model} sil`}
            />
          }
        />
      )}
      ListFooterComponent={
        <View style={styles.form}>
          <Input label="Marka" placeholder="ör. Yamaha" value={marka} onChangeText={setMarka} />
          <Input label="Model" placeholder="ör. MT-07" value={model} onChangeText={setModel} />
          <Button label="Motoru ekle" onPress={ekle} disabled={!marka.trim() || !model.trim()} />
          <Button label="Çıkış yap" variant="secondary" onPress={cikisYap} />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  liste: { padding: spacing.md },
  ust: { gap: spacing.lg, paddingBottom: spacing.md },
  kisi: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  form: { gap: spacing.sm, paddingTop: spacing.lg },
});
