import { supabase } from './supabase';

/** 1. adım: e-postaya 6 haneli kod gönderir. (Supabase panelinde "Reset password" e-posta şablonuna {{ .Token }} eklenmiş olmalı.) */
export async function sifirlamaKoduGonder(eposta: string): Promise<string | null> {
  if (!supabase) return 'Bu özellik demo modunda yok.';
  const { error } = await supabase.auth.resetPasswordForEmail(eposta.trim());
  return error ? (error.message.includes('rate') ? 'Çok sık denedin. Birkaç dakika sonra tekrar dene.' : 'Kod gönderilemedi. İnternet bağlantını kontrol edip tekrar dene.') : null;
}

/** 2. adım: kodu doğrular ve yeni şifreyi kaydeder; başarılıysa kullanıcı giriş yapmış olur. */
export async function sifreyiYenile(eposta: string, kod: string, yeniSifre: string): Promise<string | null> {
  if (!supabase) return 'Bu özellik demo modunda yok.';
  const { error } = await supabase.auth.verifyOtp({ email: eposta.trim(), token: kod.trim(), type: 'recovery' });
  if (error) return 'Kod hatalı ya da süresi dolmuş.';
  const { error: e2 } = await supabase.auth.updateUser({ password: yeniSifre });
  return e2 ? 'Şifre güncellenemedi. Başka bir şifre dene (en az 6 karakter).' : null;
}

/** Hesabı ve tüm verilerini kalıcı siler, sonra oturumu kapatır. */
export async function hesabiSil(): Promise<string | null> {
  if (!supabase) return 'Bu özellik demo modunda yok.';
  const { error } = await supabase.rpc('delete_my_account');
  if (error) return error.message.includes('son super') ? 'Son süper yönetici hesabı silinemez. Önce başka birini süper yönetici yap.' : 'Hesap silinemedi. İnternet bağlantını kontrol edip tekrar dene.';
  await supabase.auth.signOut();
  return null;
}
