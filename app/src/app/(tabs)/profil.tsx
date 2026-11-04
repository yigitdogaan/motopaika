import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ListItem } from '@/components/ui/list-item';
import { useOturum } from '@/lib/oturum';
import { radius, spacing, typography, useTheme } from '@/theme';

export default function Profil() {
  const c = useTheme();
  const { kullanici, motorlar, motorEkle, motorSil, cikisYap } = useOturum();
  const [marka, setMarka] = useState('');
  const [model, setModel] = useState('');
  const alan = [styles.alan, { color: c.text, borderColor: c.border, backgroundColor: c.surface }];

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
          <TextInput
            accessibilityLabel="Marka"
            placeholder="Marka (ör. Yamaha)"
            placeholderTextColor={c.textMuted}
            value={marka}
            onChangeText={setMarka}
            style={alan}
          />
          <TextInput
            accessibilityLabel="Model"
            placeholder="Model (ör. MT-07)"
            placeholderTextColor={c.textMuted}
            value={model}
            onChangeText={setModel}
            style={alan}
          />
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
  alan: { ...typography.body, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, minHeight: 44 },
});
