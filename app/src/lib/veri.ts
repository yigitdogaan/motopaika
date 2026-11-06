import { demoVeri, type Oge } from '@/demo/veri';

/** Bulut veritabanı bağlı değilse uygulama demo modunda çalışır. */
export const demoModu = process.env.EXPO_PUBLIC_DEMO === '1' || !process.env.EXPO_PUBLIC_SUPABASE_URL;

export type Alan = keyof typeof demoVeri;

/** Şimdilik yalnızca demo verisi; Supabase bağlanınca burada gerçek sorgu yapılacak. */
export function ogeleriGetir(alan: Alan): Oge[] {
  return demoVeri[alan];
}
