import { avatarAdresi } from './profil';
import { supabase } from './supabase';
import { hizUyarisi } from './yonetim';

export type MesajTuru = 'text' | 'image' | 'location';
export type Oda = {
  id: string;
  ad: string;
  tur: 'dm' | 'grup';
  postId: string | null;
  uye: number;
  son: string;
  sonTur: MesajTuru | null;
  zaman: string | null;
  okunmamis: number;
  bekleyen: number;
  karsiId: string | null;
  karsiAvatar?: string;
};
export type OdaUye = { id: string; kullaniciAdi: string; ad: string; avatarUrl?: string; sehir: string | null; motor: string | null; sahip: boolean };
export type IstekDurumu = 'pending' | 'accepted' | 'declined';
export type SahipIstek = { kullaniciId: string; kullaniciAdi: string; ad: string; sehir: string | null; motorlar: string | null; durum: IstekDurumu };
export type Mesaj = { id: string; yazarId: string; yazar: string; metin: string; zaman: string; tur: MesajTuru; fotoUrl?: string; enlem?: number; boylam?: number };

type MesajSatir = {
  id: string; sender_id: string; body: string; created_at: string; kind: MesajTuru;
  media_path: string | null; lat: number | null; lng: number | null;
  profiles: { username: string; display_name: string | null } | null;
};
const MESAJ_ALANLARI = 'id, sender_id, body, created_at, kind, media_path, lat, lng, profiles(username, display_name)';
/** chat-media özel kovadır: fotoğraflar 1 saatlik imzalı adreslerle gösterilir. */
async function imzaliAdresler(yollar: string[]): Promise<Map<string, string>> {
  const harita = new Map<string, string>();
  if (!supabase || !yollar.length) return harita;
  const { data } = await supabase.storage.from('chat-media').createSignedUrls([...new Set(yollar)], 3600);
  for (const d of data ?? []) if (d.path && d.signedUrl) harita.set(d.path, d.signedUrl);
  return harita;
}

const adi = (p: MesajSatir['profiles']) => p?.display_name ?? p?.username ?? 'Sürücü';
const donustur = (m: MesajSatir, adresler: Map<string, string>): Mesaj => ({
  id: m.id, yazarId: m.sender_id, yazar: adi(m.profiles), metin: m.body, zaman: m.created_at,
  tur: m.kind ?? 'text', fotoUrl: m.media_path ? adresler.get(m.media_path) : undefined, enlem: m.lat ?? undefined, boylam: m.lng ?? undefined,
});
async function donusturHepsi(satirlar: MesajSatir[]): Promise<Mesaj[]> {
  const adresler = await imzaliAdresler(satirlar.flatMap((m) => (m.media_path ? [m.media_path] : [])));
  return satirlar.map((m) => donustur(m, adresler));
}

export async function odalarim(): Promise<Oda[]> {
  if (!supabase) return [];
  const { data } = await supabase.rpc('my_rooms');
  return (data ?? []).map(
    (r: {
      id: string; name: string; kind: 'group' | 'dm'; post_id: string | null; member_count: number;
      last_body: string | null; last_kind: MesajTuru | null; last_at: string | null; unread: number; pending: number;
      peer_id: string | null; peer_avatar: string | null;
    }) => ({
      id: r.id, ad: r.name, tur: r.kind === 'dm' ? 'dm' : 'grup', postId: r.post_id, uye: Number(r.member_count),
      son: r.last_body ?? '', sonTur: r.last_kind, zaman: r.last_at, okunmamis: Number(r.unread), bekleyen: Number(r.pending),
      karsiId: r.peer_id, karsiAvatar: avatarAdresi(r.peer_avatar),
    }),
  );
}

/** Birebir sohbeti açar (yoksa oluşturur); oda id'sini ya da hata mesajını döner. */
export async function dmAc(karsiId: string): Promise<{ id?: string; hata?: string }> {
  if (!supabase) return { hata: 'Supabase yapılandırılmamış.' };
  const { data, error } = await supabase.rpc('get_or_create_dm', { p_other: karsiId });
  if (error) return { hata: error.message.includes('engelli') ? 'Bu sürücüyle mesajlaşamazsın (engel var).' : error.message };
  return { id: data as string };
}

export async function odaUyeleri(odaId: string): Promise<OdaUye[]> {
  if (!supabase) return [];
  const { data } = await supabase.rpc('room_members', { p_room: odaId });
  return (data ?? []).map((u: { user_id: string; username: string; display_name: string | null; avatar_path: string | null; city: string | null; role: string; motorcycle: string | null }) => ({
    id: u.user_id, kullaniciAdi: u.username, ad: u.display_name ?? u.username, avatarUrl: avatarAdresi(u.avatar_path),
    sehir: u.city, motor: u.motorcycle, sahip: u.role === 'owner',
  }));
}

/** Sürüş gönderisinin grup odası (yalnız üyesi olan görür); yoksa null. */
export async function odaIdBul(postId: string): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('chat_rooms').select('id').eq('post_id', postId).maybeSingle();
  return data?.id ?? null;
}

export async function odaBilgisi(odaId: string): Promise<{ postId: string | null; sahipId: string | null; tur: 'dm' | 'grup'; ad: string } | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('chat_rooms').select('post_id, owner_id, kind, name').eq('id', odaId).maybeSingle();
  return data ? { postId: data.post_id, sahipId: data.owner_id, tur: data.kind === 'dm' ? 'dm' : 'grup', ad: data.name } : null;
}

/** Başarılıysa null, değilse hata mesajı döner. */
export async function istekGonder(postId: string, kullaniciId: string): Promise<string | null> {
  if (!supabase) return 'Supabase yapılandırılmamış.';
  const { error } = await supabase.from('ride_requests').insert({ post_id: postId, user_id: kullaniciId });
  return error ? error.message : null;
}

export async function istekGeriAl(postId: string, kullaniciId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('ride_requests').delete().eq('post_id', postId).eq('user_id', kullaniciId);
  return !error;
}

/** Sürüş sahibi için bekleyen istekler ve istekçi profilleri. */
export async function sahipIstekleri(postId: string): Promise<SahipIstek[]> {
  if (!supabase) return [];
  const { data } = await supabase.rpc('my_ride_requests', { p_post: postId });
  return (data ?? [])
    .filter((r: { status: string }) => r.status === 'pending')
    .map((r: { user_id: string; username: string; display_name: string | null; city: string | null; motorcycles: string | null; status: IstekDurumu }) => ({
      kullaniciId: r.user_id, kullaniciAdi: r.username, ad: r.display_name ?? r.username, sehir: r.city, motorlar: r.motorcycles, durum: r.status,
    }));
}

export async function istekYanitla(postId: string, kullaniciId: string, kabul: boolean): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.rpc('answer_ride_request', { p_post: postId, p_user: kullaniciId, p_accept: kabul });
  return !error;
}

export async function mesajlariGetir(odaId: string): Promise<Mesaj[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('chat_messages')
    .select(MESAJ_ALANLARI)
    .eq('room_id', odaId)
    .order('created_at', { ascending: false })
    .limit(100);
  return donusturHepsi((data ?? []) as unknown as MesajSatir[]);
}

export async function mesajGonder(odaId: string, kullaniciId: string, metin: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('chat_messages').insert({ room_id: odaId, sender_id: kullaniciId, body: metin.trim() });
  hizUyarisi(error);
  return !error;
}

/** Fotoğraf mesajı: chat-media deposuna yükler, sonra mesajı ekler. */
export async function fotoMesajiGonder(odaId: string, kullaniciId: string, uri: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const buf = await (await fetch(uri)).arrayBuffer();
    const yol = `${kullaniciId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error: ue } = await supabase.storage.from('chat-media').upload(yol, buf, { contentType: 'image/jpeg' });
    if (ue) return false;
    const { error } = await supabase.from('chat_messages').insert({ room_id: odaId, sender_id: kullaniciId, kind: 'image', media_path: yol, body: '' });
    return !error;
  } catch {
    return false;
  }
}

/** Konum mesajı: koordinat + yer adı (body). */
export async function konumMesajiGonder(odaId: string, kullaniciId: string, enlem: number, boylam: number, yer: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('chat_messages').insert({ room_id: odaId, sender_id: kullaniciId, kind: 'location', lat: enlem, lng: boylam, body: yer.slice(0, 200) });
  return !error;
}

export async function okunduYap(odaId: string, kullaniciId: string) {
  await supabase?.from('chat_members').update({ last_read_at: new Date().toISOString() }).eq('room_id', odaId).eq('user_id', kullaniciId);
}

/** Yeni mesajları canlı dinler; çağrılınca aboneliği kapatan fonksiyon döner. */
export function mesajlariDinle(odaId: string, yeni: (m: Mesaj) => void): () => void {
  const db = supabase;
  if (!db) return () => {};
  const kanal = db
    .channel(`oda-${odaId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${odaId}` }, async (p) => {
      const { data } = await db
        .from('chat_messages')
        .select(MESAJ_ALANLARI)
        .eq('id', (p.new as { id: string }).id)
        .single();
      if (data) yeni((await donusturHepsi([data as unknown as MesajSatir]))[0]);
    })
    .subscribe();
  return () => {
    db.removeChannel(kanal);
  };
}
