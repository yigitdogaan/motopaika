import { avatarAdresi } from './profil';
import { supabase } from './supabase';

export type EngelliKisi = { id: string; kullaniciAdi: string; ad: string; avatarUrl?: string };

export type HesapBilgisi = { eposta: string | null; saglayici: string };

/** E-posta ve giriş yöntemi (email / google / apple). Google/Apple hesaplarında şifre yoktur. */
export async function hesapBilgisi(): Promise<HesapBilgisi> {
  if (!supabase) return { eposta: null, saglayici: 'email' };
  const { data } = await supabase.auth.getUser();
  return { eposta: data.user?.email ?? null, saglayici: String(data.user?.app_metadata?.provider ?? 'email') };
}

export async function engellenenler(uid: string): Promise<EngelliKisi[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('user_blocks')
    .select('blocked_id, created_at, profiles!user_blocks_blocked_id_fkey(username, display_name, avatar_path)')
    .eq('blocker_id', uid)
    .order('created_at', { ascending: false });
  return ((data ?? []) as unknown as { blocked_id: string; profiles: { username: string; display_name: string | null; avatar_path: string | null } | null }[]).map((r) => ({
    id: r.blocked_id,
    kullaniciAdi: r.profiles?.username ?? '?',
    ad: r.profiles?.display_name ?? r.profiles?.username ?? 'Sürücü',
    avatarUrl: avatarAdresi(r.profiles?.avatar_path),
  }));
}

export const KULLANICI_ADI_RE = /^[A-Za-z0-9._]{3,30}$/;

/** Kullanıcı adını değiştirir; hata metni ya da null döner. */
export async function kullaniciAdiDegistir(uid: string, yeni: string): Promise<string | null> {
  if (!supabase) return 'Bu özellik demo modunda yok.';
  const ad = yeni.trim();
  if (!KULLANICI_ADI_RE.test(ad)) return '3–30 karakter; yalnız harf, rakam, nokta ve alt çizgi kullanabilirsin.';
  const { error } = await supabase.from('profiles').update({ username: ad }).eq('id', uid);
  if (!error) return null;
  return error.code === '23505' ? 'Bu kullanıcı adı alınmış.' : 'Kaydedilemedi. İnternet bağlantını kontrol edip tekrar dene.';
}

/** Mevcut şifreyi doğrulayıp yenisini kaydeder. */
export async function sifreDegistir(eposta: string, mevcut: string, yeni: string): Promise<string | null> {
  if (!supabase) return 'Bu özellik demo modunda yok.';
  if (yeni.length < 6) return 'Yeni şifre en az 6 karakter olmalı.';
  if (yeni === mevcut) return 'Yeni şifre mevcut şifreden farklı olmalı.';
  const { error: e1 } = await supabase.auth.signInWithPassword({ email: eposta, password: mevcut });
  if (e1) return 'Mevcut şifre hatalı.';
  const { error } = await supabase.auth.updateUser({ password: yeni });
  return error ? 'Şifre güncellenemedi. Tekrar dene.' : null;
}

export async function kullaniciAdiGetir(uid: string): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('profiles').select('username').eq('id', uid).maybeSingle();
  return data?.username ?? null;
}
