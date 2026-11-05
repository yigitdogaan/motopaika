import { Alert } from 'react-native';
import { useCallback, useEffect, useState } from 'react';

import { useOturum } from './oturum';
import { supabase } from './supabase';

export type Kisit = { tur: 'suspension' | 'ban'; neden: string; bitis: string | null };
export type Duyuru = { id: string; baslik: string; metin: string; seviye: 'info' | 'warning' | 'critical' };

/** Hesabımdaki aktif kısıtlama ve yayındaki duyurular (yalnız Supabase yapılandırılmışsa). */
export function useYonetimDurumu() {
  const { kullanici } = useOturum();
  const uid = supabase ? kullanici?.id : undefined;
  const [kisit, setKisit] = useState<Kisit | null>(null);
  const [duyurular, setDuyurular] = useState<Duyuru[]>([]);

  const yukle = useCallback(async () => {
    if (!supabase || !uid) return;
    const [k, d] = await Promise.all([
      supabase.rpc('my_restriction'),
      supabase.from('announcements').select('id, title, body, level').order('created_at', { ascending: false }).limit(3),
    ]);
    const satir = (k.data as { kind: 'suspension' | 'ban'; reason: string; ends_at: string | null }[] | null)?.[0];
    setKisit(satir ? { tur: satir.kind, neden: satir.reason, bitis: satir.ends_at } : null);
    setDuyurular(((d.data ?? []) as { id: string; title: string; body: string; level: Duyuru['seviye'] }[]).map((x) => ({ id: x.id, baslik: x.title, metin: x.body, seviye: x.level })));
  }, [uid]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  return { kisit, duyurular, yenile: yukle };
}

export const kisitMetni = (k: Kisit) =>
  k.tur === 'ban'
    ? `Hesabın yasaklandı. Gönderi, yorum, selam ve mesaj gönderemezsin. Neden: ${k.neden}`
    : `Hesabın ${k.bitis ? new Date(k.bitis).toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) + ' tarihine kadar' : 'geçici olarak'} askıya alındı. Bu sürede içerik gönderemezsin. Neden: ${k.neden}`;

/** Bir işlem başarısız olunca çağır: hesap kısıtlıysa açıklayıcı uyarı gösterir ve true döner. */
export async function kisitUyarisi(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.rpc('my_restriction');
  const satir = (data as { kind: 'suspension' | 'ban'; reason: string; ends_at: string | null }[] | null)?.[0];
  if (!satir) return false;
  Alert.alert(satir.kind === 'ban' ? 'Hesabın yasaklı' : 'Hesabın askıda', kisitMetni({ tur: satir.kind, neden: satir.reason, bitis: satir.ends_at }));
  return true;
}
