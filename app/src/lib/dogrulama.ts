/** Kullanıcı adı: 3–20 karakter, yalnızca harf (Türkçe dahil), rakam ve alt çizgi. */
export function kullaniciAdiGecerli(ad: string): boolean {
  return /^[\p{L}\p{N}_]{3,20}$/u.test(ad);
}

export function motorGecerli(marka: string, model: string): boolean {
  return marka.trim().length > 0 && model.trim().length > 0;
}
