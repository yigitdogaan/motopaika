import { supabase } from './supabase';

/** kayitOl bu değeri döndürürse hesap açıldı ama e-posta doğrulaması (6 haneli kod) bekleniyor. */
export const DOGRULAMA_GEREKLI = 'DOGRULAMA_GEREKLI';
export const EPOSTA_KAYITLI = 'Bu e-posta ile zaten bir hesap var. Giriş yap ya da şifreni sıfırla.';
export const KULLANICI_ADI_ALINMIS = 'Bu kullanıcı adı alınmış. Başka bir tane dene.';

/** Kullanıcı adı boş mu? (büyük/küçük harf ayrımı yok; ağ hatasında null → kayıt denemesine izin verilir) */
export async function kullaniciAdiMusait(ad: string): Promise<boolean | null> {
  if (!supabase) return null;
  // profiles giriş yapmadan okunamaz; bu yüzden yalnız boş/dolu bilgisini veren RPC kullanılır.
  const { data, error } = await supabase.rpc('kullanici_adi_musait', { p_username: ad });
  if (error || typeof data !== 'boolean') return null;
  return data;
}

/** Kayıt sonrası e-postaya gelen 6 haneli kodu doğrular; başarılıysa oturum açılır. */
export async function kayitKoduDogrula(eposta: string, kod: string): Promise<string | null> {
  if (!supabase) return 'Bu özellik demo modunda yok.';
  const { error } = await supabase.auth.verifyOtp({ email: eposta.trim(), token: kod.trim(), type: 'signup' });
  return error ? 'Kod hatalı ya da süresi dolmuş.' : null;
}

/** Doğrulama kodunu yeniden gönderir. */
export async function kayitKoduTekrar(eposta: string): Promise<string | null> {
  if (!supabase) return 'Bu özellik demo modunda yok.';
  const { error } = await supabase.auth.resend({ type: 'signup', email: eposta.trim() });
  if (!error) return null;
  return /rate|seconds|too many/i.test(error.message) ? 'Çok sık denedin. Biraz bekleyip tekrar dene.' : 'Kod gönderilemedi. İnternet bağlantını kontrol edip tekrar dene.';
}
