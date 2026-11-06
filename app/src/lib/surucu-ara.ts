import { avatarAdresi } from './profil';
import { supabase } from './supabase';

export type SurucuSonucu = { id: string; kullanici: string; ad: string; avatarUrl?: string };

/** PostgREST `or` süzgecinde özel anlamı olan karakterleri ve LIKE joker karakterlerini temizler. */
export function sorguyuTemizle(q: string): string {
  return q.replace(/[%_\\,()*"']/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 30);
}

/** Kullanıcı adı ya da görünen ada göre sürücü arar. En çok 8 sonuç; Supabase yoksa (demo) boş döner. */
export async function surucuAra(q: string): Promise<SurucuSonucu[]> {
  const t = sorguyuTemizle(q);
  if (!supabase || t.length < 2) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_path')
    .or(`username.ilike.%${t}%,display_name.ilike.%${t}%`)
    .limit(8);
  if (error || !data) return [];
  return data.map((p) => ({
    id: p.id,
    kullanici: p.username,
    ad: p.display_name ?? p.username,
    avatarUrl: avatarAdresi(p.avatar_path),
  }));
}
