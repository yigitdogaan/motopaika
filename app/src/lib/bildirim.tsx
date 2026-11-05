import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useOturum } from './oturum';
import { avatarAdresi } from './profil';
import { supabase } from './supabase';
import { zamanYazi } from './zaman';

export type BildirimTuru = 'ride_request' | 'ride_accepted' | 'ride_declined' | 'salute' | 'comment' | 'warning' | 'post_removed' | 'account_suspended' | 'account_banned';
export type Bildirim = {
  id: string;
  tur: BildirimTuru;
  postId: string | null;
  aktorId: string | null;
  /** Eylemi yapan kişi (ad, @kullanıcı adı, fotoğraf). */
  aktorAd: string;
  aktorKullanici?: string;
  aktorAvatar?: string;
  /** İlgili gönderinin ilk satırı. */
  gonderiOzeti?: string;
  metin: string;
  /** Yönetim bildirimlerinde yetkilinin yazdığı neden. */
  govde?: string;
  zaman: string;
  olusturma: string;
  okundu: boolean;
};

type Baglam = {
  bildirimler: Bildirim[];
  okunmamis: number;
  okunduYap: (id: string) => void;
  hepsiniOkunduYap: () => void;
  sil: (id: string) => void;
};

const BildirimBaglami = createContext<Baglam | null>(null);

export const SISTEM_TURLERI: BildirimTuru[] = ['warning', 'post_removed', 'account_suspended', 'account_banned'];

function metinYap(tur: BildirimTuru, ad: string): string {
  switch (tur) {
    case 'warning': return 'Roteri Ekibi sana bir uyarı gönderdi';
    case 'post_removed': return 'Roteri Ekibi gönderini kaldırdı';
    case 'account_suspended': return 'Roteri Ekibi hesabını geçici olarak askıya aldı';
    case 'account_banned': return 'Roteri Ekibi hesabını yasakladı';
    case 'ride_request': return `${ad} sürüşüne katılmak istiyor`;
    case 'ride_accepted': return `${ad} katılma isteğini kabul etti`;
    case 'ride_declined': return `${ad} katılma isteğini reddetti`;
    case 'salute': return `${ad} sana selam verdi`;
    case 'comment': return `${ad} gönderine yorum yaptı`;
  }
}

const simdi = Date.now();
const DEMO: Bildirim[] = [
  { id: 'd1', tur: 'ride_request', postId: null, aktorId: null, aktorAd: 'Elif D.', gonderiOzeti: 'Pazar Şile kahvaltı sürüşü', metin: 'Elif D. sürüşüne katılmak istiyor', zaman: '5 dk önce', olusturma: new Date(simdi - 5 * 60000).toISOString(), okundu: false },
  { id: 'd2', tur: 'salute', postId: null, aktorId: null, aktorAd: 'Mert S.', gonderiOzeti: 'Balatayı değiştirdim', metin: 'Mert S. sana selam verdi', zaman: '1 sa önce', olusturma: new Date(simdi - 3600000).toISOString(), okundu: false },
  { id: 'd3', tur: 'comment', postId: null, aktorId: null, aktorAd: 'Burak T.', gonderiOzeti: 'Gece sürüşü rotası', metin: 'Burak T. gönderine yorum yaptı', zaman: 'Dün', olusturma: new Date(simdi - 30 * 3600000).toISOString(), okundu: true },
];

type Satir = {
  id: string;
  type: BildirimTuru;
  post_id: string | null;
  actor_id: string | null;
  read_at: string | null;
  created_at: string;
  actor: { username: string; display_name: string | null; avatar_path: string | null } | null;
  post: { body: string } | null;
  body: string | null;
};

/** Bildirimler: Supabase Realtime ile anında düşer; çan simgesindeki kırmızı sayı okunmamış sayısıdır. */
export function BildirimSaglayici({ children }: { children: ReactNode }) {
  const { kullanici } = useOturum();
  const uid = supabase ? kullanici?.id : undefined;
  const [bildirimler, setBildirimler] = useState<Bildirim[]>(supabase ? [] : DEMO);

  const yukle = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('notifications')
      .select('id, type, post_id, actor_id, body, read_at, created_at, actor:profiles!notifications_actor_id_fkey(username, display_name, avatar_path), post:posts(body)')
      .order('created_at', { ascending: false })
      .limit(50);
    setBildirimler(
      ((data ?? []) as unknown as Satir[]).map((r) => {
        const sistem = SISTEM_TURLERI.includes(r.type);
        const ad = sistem ? 'Roteri Ekibi' : (r.actor?.display_name ?? r.actor?.username ?? 'Bir sürücü');
        return {
          id: r.id,
          tur: r.type,
          postId: r.post_id,
          aktorId: r.actor_id,
          aktorAd: ad,
          aktorKullanici: r.actor?.username,
          aktorAvatar: avatarAdresi(r.actor?.avatar_path),
          gonderiOzeti: r.post?.body ? r.post.body.split('\n')[0].slice(0, 90) : undefined,
          metin: metinYap(r.type, ad),
          govde: r.body ?? undefined,
          zaman: zamanYazi(r.created_at),
          olusturma: r.created_at,
          okundu: !!r.read_at,
        };
      }),
    );
  }, []);

  useEffect(() => {
    const db = supabase;
    if (!db) return;
    if (!uid) {
      setBildirimler([]);
      return;
    }
    yukle();
    const kanal = db
      .channel(`bildirim-${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, () => yukle())
      .subscribe();
    return () => {
      db.removeChannel(kanal);
    };
  }, [uid, yukle]);

  const okunduYap = useCallback(
    (id: string) => {
      setBildirimler((o) => o.map((b) => (b.id === id ? { ...b, okundu: true } : b)));
      supabase?.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).then(() => {});
    },
    [],
  );

  const hepsiniOkunduYap = useCallback(() => {
    setBildirimler((o) => o.map((b) => ({ ...b, okundu: true })));
    if (supabase && uid) {
      supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', uid).is('read_at', null).then(() => {});
    }
  }, [uid]);

  const sil = useCallback((id: string) => {
    setBildirimler((o) => o.filter((b) => b.id !== id));
    supabase?.from('notifications').delete().eq('id', id).then(() => {});
  }, []);

  const okunmamis = bildirimler.filter((b) => !b.okundu).length;
  const deger = useMemo<Baglam>(() => ({ bildirimler, okunmamis, okunduYap, hepsiniOkunduYap, sil }), [bildirimler, okunmamis, okunduYap, hepsiniOkunduYap, sil]);
  return <BildirimBaglami.Provider value={deger}>{children}</BildirimBaglami.Provider>;
}

export function useBildirim(): Baglam {
  const b = useContext(BildirimBaglami);
  if (!b) throw new Error('BildirimSaglayici eksik');
  return b;
}
