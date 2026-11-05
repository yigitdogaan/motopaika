import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export type Saglayici = 'google' | 'apple';

/**
 * Google / Apple ile giriş (Supabase OAuth, tarayıcı oturumu). Expo Go'da da çalışır.
 * Dönüş: null → başarılı (ya da kullanıcı vazgeçti), metin → hata mesajı.
 */
export async function saglayiciyaGiris(saglayici: Saglayici): Promise<string | null> {
  if (!supabase) return 'Bu özellik demo modunda yok.';
  try {
    const yonlendirme = Linking.createURL('auth-callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: saglayici,
      options: { redirectTo: yonlendirme, skipBrowserRedirect: true },
    });
    if (error || !data?.url) return 'Giriş başlatılamadı. Bu giriş yöntemi henüz etkinleştirilmemiş olabilir.';

    const sonuc = await WebBrowser.openAuthSessionAsync(data.url, yonlendirme);
    if (sonuc.type !== 'success') return null; // vazgeçti / kapattı

    const adres = sonuc.url;
    const kod = /[?&]code=([^&#]+)/.exec(adres)?.[1];
    if (kod) {
      const { error: e } = await supabase.auth.exchangeCodeForSession(decodeURIComponent(kod));
      return e ? 'Giriş tamamlanamadı. Tekrar dene.' : null;
    }
    const parca = adres.split('#')[1] ?? '';
    const q = new URLSearchParams(parca);
    const access = q.get('access_token');
    const refresh = q.get('refresh_token');
    if (access && refresh) {
      const { error: e } = await supabase.auth.setSession({ access_token: access, refresh_token: refresh });
      return e ? 'Giriş tamamlanamadı. Tekrar dene.' : null;
    }
    const hata = /[?&#]error_description=([^&#]+)/.exec(adres)?.[1];
    return hata ? decodeURIComponent(hata.replace(/\+/g, ' ')) : 'Giriş tamamlanamadı. Tekrar dene.';
  } catch {
    return 'Bağlantı hatası. İnternetini kontrol edip tekrar dene.';
  }
}
