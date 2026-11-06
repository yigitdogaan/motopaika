import { supabase } from './supabase';
import { zamanYazi } from './zaman';

export type Profil = {
  id: string;
  kullaniciAdi: string;
  ad: string;
  bio: string;
  sehirId: number | null;
  sehir: string | null;
  avatarYol: string | null;
  avatarUrl?: string;
};
export type MotorFoto = { id: string; yol: string; url: string };
export type GarajMotor = { id: string; marka: string; model: string; yil: number | null; km: number | null; lakap: string | null; fotolar: MotorFoto[] };
export type MotorAlanlari = { marka: string; model: string; yil: number | null; km: number | null; lakap: string };
export const MOTOR_FOTO_MAKS = 8;
export type GonderiOzeti = { id: string; metin: string; konum: string; zaman: string; selam: number; kategori: string; anonim: boolean };

export function avatarAdresi(yol: string | null | undefined): string | undefined {
  if (!yol || !supabase) return undefined;
  return supabase.storage.from('avatars').getPublicUrl(yol).data.publicUrl;
}

export async function profilGetir(id: string): Promise<Profil | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_path, city_id, cities(name)')
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  const sehir = (data.cities as unknown as { name: string } | null)?.name ?? null;
  return {
    id: data.id,
    kullaniciAdi: data.username,
    ad: data.display_name ?? data.username,
    bio: data.bio ?? '',
    sehirId: data.city_id,
    sehir,
    avatarYol: data.avatar_path,
    avatarUrl: avatarAdresi(data.avatar_path),
  };
}

export async function profilGuncelle(
  id: string,
  alanlar: { display_name?: string | null; bio?: string | null; city_id?: number | null; avatar_path?: string | null },
): Promise<string | null> {
  if (!supabase) return 'Supabase yapılandırılmamış.';
  const { error } = await supabase.from('profiles').update(alanlar).eq('id', id);
  return error ? error.message : null;
}

export async function sehirleriGetir(): Promise<{ id: number; ad: string }[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('cities').select('id, name').order('name');
  return (data ?? []).map((s: { id: number; name: string }) => ({ id: s.id, ad: s.name })).sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

/** Fotoğrafı avatars deposuna yükler; yolu döner (hata olursa null). */
export async function avatarYukle(uid: string, uri: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const buf = await (await fetch(uri)).arrayBuffer();
    const yol = `${uid}/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from('avatars').upload(yol, buf, { contentType: 'image/jpeg' });
    return error ? null : yol;
  } catch {
    return null;
  }
}

const motorFotoAdresi = (yol: string) => supabase!.storage.from('motor-photos').getPublicUrl(yol).data.publicUrl;

export async function motorlariGetir(id: string): Promise<GarajMotor[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('motorcycles')
    .select('id, brand, model, year, km, nickname, motorcycle_photos(id, path, position, created_at)')
    .eq('owner_id', id)
    .order('created_at');
  type F = { id: string; path: string; position: number; created_at: string };
  const motorlar = (data ?? []).map((m: { id: string; brand: string; model: string; year: number | null; km: number | null; nickname: string | null; motorcycle_photos: F[] | null }) => ({
    id: m.id,
    marka: m.brand,
    model: m.model,
    yil: m.year,
    km: m.km,
    lakap: m.nickname,
    fotolar: [...(m.motorcycle_photos ?? [])]
      .sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at))
      .map((f) => ({ id: f.id, yol: f.path, url: motorFotoAdresi(f.path) })),
  }));
  // Bozuk (neredeyse boş) dosyalar Android'de resim çözücüyü çökertebilir; boyutu küçük olanlar gösterilmez.
  await Promise.all(
    motorlar.map(async (m: GarajMotor) => {
      const saglam = await Promise.all(m.fotolar.map((f) => fotoSaglamMi(f.url)));
      m.fotolar = m.fotolar.filter((_, i) => saglam[i]);
    }),
  );
  return motorlar;
}

/** HEAD ile dosya boyutuna bakar; ağ hatasında fotoğrafı saklı tutar. */
async function fotoSaglamMi(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { method: 'HEAD' });
    if (!r.ok) return false;
    const baslik = r.headers.get('content-length');
    return baslik === null ? true : Number(baslik) >= 5 * 1024;
  } catch {
    return true;
  }
}

/** Fotoğrafı motor-photos deposuna yükleyip motora bağlar; hata mesajı ya da null döner. */
export async function motorFotoEkle(uid: string, motorId: string, uri: string): Promise<string | null> {
  if (!supabase) return 'Supabase yapılandırılmamış.';
  try {
    const buf = await (await fetch(uri)).arrayBuffer();
    // Boş ya da bozuk okunan dosya yüklenmesin (cihazdaki resim çözücüyü çökertebilir).
    if (buf.byteLength < 5 * 1024) return 'Fotoğraf okunamadı, başka bir fotoğraf dene.';
    const yol = `${uid}/${motorId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
    const { error: ue } = await supabase.storage.from('motor-photos').upload(yol, buf, { contentType: 'image/jpeg' });
    if (ue) return ue.message;
    const { error } = await supabase.from('motorcycle_photos').insert({ motorcycle_id: motorId, owner_id: uid, path: yol });
    if (error) {
      await supabase.storage.from('motor-photos').remove([yol]);
      return error.message;
    }
    return null;
  } catch {
    return 'Fotoğraf yüklenemedi.';
  }
}

export async function motorFotoSil(foto: MotorFoto): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('motorcycle_photos').delete().eq('id', foto.id);
  if (error) return false;
  await supabase.storage.from('motor-photos').remove([foto.yol]);
  return true;
}

/** Fotoğrafı kapak yapar (listede en öne alır). */
export async function motorKapakYap(motorId: string, fotoId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.from('motorcycle_photos').select('position').eq('motorcycle_id', motorId).order('position', { ascending: true }).limit(1).maybeSingle();
  const { error } = await supabase.from('motorcycle_photos').update({ position: (data?.position ?? 0) - 1 }).eq('id', fotoId);
  return !error;
}

export async function motorEkleDb(uid: string, a: MotorAlanlari): Promise<string | null> {
  if (!supabase) return 'Supabase yapılandırılmamış.';
  const { error } = await supabase.from('motorcycles').insert({
    owner_id: uid,
    brand: a.marka.trim(),
    model: a.model.trim(),
    year: a.yil,
    km: a.km,
    nickname: a.lakap.trim() || null,
  });
  return error ? error.message : null;
}

export async function motorGuncelleDb(id: string, a: MotorAlanlari): Promise<string | null> {
  if (!supabase) return 'Supabase yapılandırılmamış.';
  const { error } = await supabase
    .from('motorcycles')
    .update({ brand: a.marka.trim(), model: a.model.trim(), year: a.yil, km: a.km, nickname: a.lakap.trim() || null })
    .eq('id', id);
  return error ? error.message : null;
}

export async function motorSilDb(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('motorcycles').delete().eq('id', id);
  return !error;
}

/** benim: kendi tüm gönderilerim (anonimler dahil); değilse yazarın anonim olmayan gönderileri. */
export async function gonderileriGetir(id: string, benim: boolean): Promise<GonderiOzeti[]> {
  if (!supabase) return [];
  let q = supabase.from('feed_posts').select('id, body, place, created_at, salute_count, category, is_anonymous').order('created_at', { ascending: false }).limit(100);
  q = benim ? q.eq('is_mine', true) : q.eq('author_id', id);
  const { data } = await q;
  return (data ?? []).map((r: { id: string; body: string; place: string | null; created_at: string; salute_count: number; category: string; is_anonymous: boolean }) => ({
    id: r.id, metin: r.body, konum: r.place || 'Konum belirtilmedi', zaman: zamanYazi(r.created_at), selam: Number(r.salute_count), kategori: r.category, anonim: r.is_anonymous,
  }));
}

export async function gonderiSil(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('posts').delete().eq('id', id);
  return !error;
}

export async function engelliMi(uid: string, hedef: string): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.from('user_blocks').select('blocked_id').eq('blocker_id', uid).eq('blocked_id', hedef).maybeSingle();
  return !!data;
}

export async function engelle(uid: string, hedef: string, engel: boolean): Promise<boolean> {
  if (!supabase) return false;
  const { error } = engel
    ? await supabase.from('user_blocks').insert({ blocker_id: uid, blocked_id: hedef })
    : await supabase.from('user_blocks').delete().eq('blocker_id', uid).eq('blocked_id', hedef);
  return !error;
}
