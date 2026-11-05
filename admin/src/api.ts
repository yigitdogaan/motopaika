// Minimal Supabase istemcisi (yalnız fetch). Tarayıcıda yalnız anon anahtar kullanılır; yetki RLS + admin_* RPC'lerindedir.
import { demo } from './demo';

export const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_ANON_KEY;
export const DEMO = process.env.DEMO === '1' || !URL_ || !KEY;

export type Rol = 'moderator' | 'admin' | 'super_admin';
export const ROL_SIRA: Record<Rol, number> = { moderator: 1, admin: 2, super_admin: 3 };
export const ROL_AD: Record<Rol, string> = { moderator: 'Moderatör', admin: 'Yönetici', super_admin: 'Süper yönetici' };

export type Oturum = { access: string; refresh: string; expires: number; userId: string; email: string };
const ANAHTAR = 'roteri-yonetim-oturum';
let oturum: Oturum | null = null;
const dinleyiciler = new Set<() => void>();
export const oturumDinle = (f: () => void) => { dinleyiciler.add(f); return () => { dinleyiciler.delete(f); }; };
const bildir = () => dinleyiciler.forEach((f) => f());

try { const s = sessionStorage.getItem(ANAHTAR); if (s) oturum = JSON.parse(s); } catch { /* yok say */ }
const kaydet = (o: Oturum | null) => {
  oturum = o;
  try { o ? sessionStorage.setItem(ANAHTAR, JSON.stringify(o)) : sessionStorage.removeItem(ANAHTAR); } catch { /* yok say */ }
  bildir();
};
export const oturumVarMi = () => !!oturum;
export const oturumEmail = () => oturum?.email ?? '';

export class ApiHata extends Error {
  constructor(public kod: string, mesaj: string, public durum = 0) { super(mesaj); }
}

const HATA_TR: [RegExp, string][] = [
  [/yetki yok|42501|permission denied|row-level security/i, 'Bu işlem için yetkin yok.'],
  [/neden gerekli/i, 'Bir neden yazman gerekiyor (en az 3 karakter).'],
  [/kendine yaptirim/i, 'Kendine yaptırım uygulayamazsın.'],
  [/ayni ya da ustun yetkili/i, 'Aynı ya da daha üst yetkideki birine yaptırım uygulanamaz.'],
  [/yasak icin admin/i, 'Kalıcı yasak için en az Yönetici yetkisi gerekir.'],
  [/7 gunden uzun/i, '7 günden uzun askıya alma için en az Yönetici yetkisi gerekir.'],
  [/gun sayisi gerekli/i, 'Askıya alma için gün sayısı gir.'],
  [/en fazla 365/i, 'En fazla 365 gün girilebilir.'],
  [/son super yonetici/i, 'Son süper yönetici düşürülemez ya da kaldırılamaz.'],
  [/kullanici bulunamadi/i, 'Bu kullanıcı adıyla biri bulunamadı.'],
  [/yetkili degil/i, 'Bu kişi zaten yetkili değil.'],
  [/gonderi bulunamadi/i, 'Gönderi bulunamadı ya da zaten kaldırılmış.'],
  [/Invalid login credentials|invalid_credentials/i, 'E-posta ya da şifre hatalı.'],
  [/Failed to fetch|NetworkError/i, 'Sunucuya ulaşılamadı. İnternet bağlantını kontrol et.'],
];
export const hataMetni = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  for (const [re, tr] of HATA_TR) if (re.test(m)) return tr;
  return m;
};

async function ham(yol: string, init: RequestInit = {}, auth = true): Promise<Response> {
  const h = new Headers(init.headers);
  h.set('apikey', KEY!);
  if (auth && oturum) h.set('Authorization', `Bearer ${oturum.access}`);
  else h.set('Authorization', `Bearer ${KEY}`);
  if (init.body && !h.has('Content-Type')) h.set('Content-Type', 'application/json');
  return fetch(`${URL_}${yol}`, { ...init, headers: h });
}

async function yenile() {
  if (!oturum) return;
  const r = await ham('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: oturum.refresh }) }, false);
  if (!r.ok) { kaydet(null); throw new ApiHata('oturum', 'Oturum süresi doldu, tekrar giriş yap.', 401); }
  const j = await r.json();
  kaydet({ access: j.access_token, refresh: j.refresh_token, expires: Date.now() + (j.expires_in - 30) * 1000, userId: j.user.id, email: j.user.email });
}

async function istek(yol: string, init: RequestInit = {}): Promise<Response> {
  if (oturum && Date.now() > oturum.expires) await yenile();
  let r = await ham(yol, init);
  if (r.status === 401 && oturum) { await yenile(); r = await ham(yol, init); }
  if (!r.ok) {
    let m = r.statusText; let kod = String(r.status);
    try { const j = await r.json(); m = j.message ?? j.msg ?? j.error_description ?? m; kod = j.code ?? kod; } catch { /* yok say */ }
    throw new ApiHata(kod, m, r.status);
  }
  return r;
}

export async function girisYap(email: string, sifre: string) {
  if (DEMO) { kaydet({ access: 'demo', refresh: 'demo', expires: Date.now() + 8.64e7, userId: 'u-demo', email: email || 'demo@roteri.app' }); return; }
  const r = await ham('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password: sifre }) }, false);
  const j = await r.json();
  if (!r.ok) throw new ApiHata('giris', j.error_description ?? j.msg ?? 'Giriş başarısız', r.status);
  kaydet({ access: j.access_token, refresh: j.refresh_token, expires: Date.now() + (j.expires_in - 30) * 1000, userId: j.user.id, email: j.user.email });
}
export function cikisYap() {
  if (!DEMO && oturum) void ham('/auth/v1/logout', { method: 'POST' }).catch(() => {});
  kaydet(null);
}

export async function rpc<T>(ad: string, args: Record<string, unknown> = {}): Promise<T> {
  if (DEMO) return demo(ad, args) as Promise<T>;
  const r = await istek(`/rest/v1/rpc/${ad}`, { method: 'POST', body: JSON.stringify(args) });
  const t = await r.text();
  return (t ? JSON.parse(t) : null) as T;
}

export async function benimRolum(): Promise<Rol | null> {
  if (DEMO) return 'super_admin';
  if (!oturum) return null;
  const r = await istek(`/rest/v1/staff?select=role&user_id=eq.${oturum.userId}`);
  const j = (await r.json()) as { role: Rol }[];
  return j[0]?.role ?? null;
}

/** Avatar ve gönderi fotoğrafı kovaları herkese açık olduğundan doğrudan açık adres kullanılır. */
export async function imzaliUrl(kova: string, yol: string | null | undefined): Promise<string | null> {
  if (!yol || DEMO) return null;
  return `${URL_}/storage/v1/object/public/${kova}/${yol}`;
}

export type Duyuru = { id: string; title: string; body: string; level: 'info' | 'warning' | 'critical'; active: boolean; starts_at: string; ends_at: string | null; created_at: string };
export async function duyurulariGetir(): Promise<Duyuru[]> {
  if (DEMO) return demo('admin_announcements_all', {}) as Promise<Duyuru[]>;
  const r = await istek('/rest/v1/announcements?select=*&order=created_at.desc');
  return r.json();
}
