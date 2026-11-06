import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { supabase } from './supabase';

/**
 * Anlık bildirim jetonunu alır ve Supabase'e kaydeder.
 * `expo-notifications` yüklü değilse ya da ortam desteklemiyorsa (Expo Go Android, simülatör) sessizce atlar.
 * Gerçek test için development build + gerçek cihaz gerekir.
 */
export const PUSH_AYAR = 'roteri.ayar.push';
const PUSH_JETON = 'roteri.pushToken';

export async function pushKaydet(zorla = false): Promise<string | null> {
  try {
    if (!supabase || !Device.isDevice) return null;
    if (!zorla && (await AsyncStorage.getItem(PUSH_AYAR)) === 'kapali') return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const N: any = require('expo-notifications');

    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('default', { name: 'Genel', importance: N.AndroidImportance.MAX, lightColor: '#FFB800' });
    }
    let { status } = await N.getPermissionsAsync();
    if (status !== 'granted') status = (await N.requestPermissionsAsync()).status;
    if (status !== 'granted') return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const { data: token } = await N.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    await supabase.rpc('register_push_token', { p_token: token, p_platform: Platform.OS === 'ios' ? 'ios' : 'android' });
    await AsyncStorage.setItem(PUSH_JETON, token);
    return token;
  } catch {
    return null;
  }
}

export async function pushSil(token: string | null) {
  if (!supabase || !token) return;
  try {
    await supabase.rpc('unregister_push_token', { p_token: token });
  } catch {}
}

/** Uygulama açıkken de bildirimin banner olarak görünmesini sağlar; bildirime dokununca ilgili ekrana gider. */
export function pushDinleyicileriKur(git: (yol: string) => void): () => void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const N: any = require('expo-notifications');
    N.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
    });
    const abone = N.addNotificationResponseReceivedListener(() => git('/bildirimler'));
    return () => abone.remove();
  } catch {
    return () => {};
  }
}

/** Ayarlardan anlık bildirimi kapatır: bu cihazın jetonu sunucudan silinir. */
export async function pushKapat() {
  await AsyncStorage.setItem(PUSH_AYAR, 'kapali');
  await pushSil(await AsyncStorage.getItem(PUSH_JETON));
}

/** Ayarlardan açar; izin verilmediyse ya da ortam desteklemiyorsa false döner. */
export async function pushAc(): Promise<boolean> {
  await AsyncStorage.setItem(PUSH_AYAR, 'acik');
  return !!(await pushKaydet(true));
}
