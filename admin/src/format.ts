export const tarih = (s?: string | null) => (s ? new Date(s).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
export const gunTarih = (s?: string | null) => (s ? new Date(s).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export function goreli(s?: string | null) {
  if (!s) return '—';
  const f = Date.now() - new Date(s).getTime();
  const gelecek = f < 0; const m = Math.abs(f) / 6e4;
  const b = m < 1 ? 'az önce' : m < 60 ? `${Math.floor(m)} dk` : m < 1440 ? `${Math.floor(m / 60)} sa` : m < 43200 ? `${Math.floor(m / 1440)} gün` : `${Math.floor(m / 43200)} ay`;
  return b === 'az önce' ? b : gelecek ? `${b} sonra` : `${b} önce`;
}
export const sayi = (n: number | string | null | undefined) => Number(n ?? 0).toLocaleString('tr-TR');
export const KATEGORI: Record<string, string> = { surus: 'Sürüş', soru: 'Soru', sohbet: 'Sohbet', tehlike: 'Tehlike', satilik: 'Satılık', yardim: 'Yardım', etkinlik: 'Etkinlik' };
export const kategori = (k: string) => KATEGORI[k] ?? k;
export const bas = (s?: string | null) => (s?.trim()?.[0] ?? '?').toLocaleUpperCase('tr-TR');
export const kisalt = (s: string, n = 90) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
export const DEGISIM = (simdi: number, once: number) => (once === 0 ? (simdi > 0 ? 100 : 0) : Math.round(((simdi - once) / once) * 100));

export const EYLEM_AD: Record<string, string> = {
  'post.remove': 'Gönderi kaldırıldı', 'post.restore': 'Gönderi geri alındı', 'comment.delete': 'Yorum silindi',
  'report.dismiss': 'Şikâyet reddedildi', 'sanction.warning': 'Uyarı verildi', 'sanction.suspension': 'Hesap askıya alındı',
  'sanction.ban': 'Hesap yasaklandı', 'sanction.revoke': 'Yaptırım kaldırıldı', 'staff.set': 'Yetkili rolü atandı',
  'staff.remove': 'Yetkili kaldırıldı', 'announcement.create': 'Duyuru oluşturuldu', 'announcement.update': 'Duyuru güncellendi',
  'announcement.delete': 'Duyuru silindi',
};
export const eylemAd = (e: string) => EYLEM_AD[e] ?? e;
export const SEBEPLER = ['Spam / reklam', 'Hakaret / nefret söylemi', 'Dolandırıcılık', 'Uygunsuz içerik', 'Tehlikeli / yanıltıcı bilgi', 'Kişisel veri paylaşımı', 'Diğer'];
