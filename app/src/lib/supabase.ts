import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const demoZorla = process.env.EXPO_PUBLIC_DEMO === '1';
const url = demoZorla ? undefined : process.env.EXPO_PUBLIC_SUPABASE_URL;
const anahtar = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_KEY;

/** URL ve anahtar yoksa null: uygulama demo modunda çalışır. */
export const supabase =
  url && anahtar
    ? createClient(url, anahtar, {
        auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
      })
    : null;
