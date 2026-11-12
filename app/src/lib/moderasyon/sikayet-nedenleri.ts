/** Şikâyet nedenleri. `baslik` veritabanına `reason` olarak yazılır; yönetim paneli (admin/src/format.ts SEBEPLER) aynı adları kullanır. */
export type SikayetNedeni = { id: string; baslik: string; aciklama: string };

export const GONDERI_NEDENLERI: SikayetNedeni[] = [
  { id: 'spam', baslik: 'Spam / reklam', aciklama: 'İstenmeyen reklam, tekrar eden ya da alakasız paylaşım' },
  { id: 'hakaret', baslik: 'Hakaret / nefret söylemi', aciklama: 'Küfür, taciz, aşağılama ya da ayrımcılık' },
  { id: 'uygunsuz', baslik: 'Uygunsuz içerik', aciklama: 'Müstehcen veya şiddet içeren yazı ve görsel' },
  { id: 'dolandiricilik', baslik: 'Dolandırıcılık', aciklama: 'Sahte ilan, ön ödeme isteme, kandırma girişimi' },
  { id: 'tehlike', baslik: 'Tehlikeli / yanıltıcı bilgi', aciklama: 'Trafikte tehlikeli davranışı özendirme ya da yanlış bilgi' },
  { id: 'kisisel', baslik: 'Kişisel veri paylaşımı', aciklama: 'Telefon, adres, plaka gibi bilgilerin izinsiz paylaşımı' },
  { id: 'diger', baslik: 'Diğer', aciklama: 'Yukarıdakilerden hiçbiri; aşağıya kısaca yazabilirsin' },
];

export const PROFIL_NEDENLERI: SikayetNedeni[] = [
  { id: 'taciz', baslik: 'Hakaret / nefret söylemi', aciklama: 'Bana ya da başkalarına küfür, taciz veya tehdit' },
  { id: 'sahte', baslik: 'Sahte hesap', aciklama: 'Başkasını taklit ediyor ya da kimliği sahte görünüyor' },
  { id: 'dolandiricilik', baslik: 'Dolandırıcılık', aciklama: 'Para isteme, sahte ilan veya kandırma' },
  { id: 'spam', baslik: 'Spam / reklam', aciklama: 'Sürekli reklam ya da istenmeyen mesaj gönderiyor' },
  { id: 'uygunsuz', baslik: 'Uygunsuz içerik', aciklama: 'Profil fotoğrafı, ad ya da bio uygunsuz' },
  { id: 'diger', baslik: 'Diğer', aciklama: 'Yukarıdakilerden hiçbiri; aşağıya kısaca yazabilirsin' },
];
