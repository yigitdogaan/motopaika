export function zamanYazi(iso: string): string {
  const dk = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (dk < 1) return 'Şimdi';
  if (dk < 60) return `${dk} dk önce`;
  if (dk < 1440) return `${Math.round(dk / 60)} sa önce`;
  return `${Math.round(dk / 1440)} gün önce`;
}

const AYLAR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const GUNLER = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const gunBasi = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const saatYazi = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** "Bugün 19:30", "Yarın 10:00", "8 Kas 10:00". */
export function planliZamanYazi(iso: string | Date): string {
  const d = new Date(iso);
  const fark = Math.round((gunBasi(d) - gunBasi(new Date())) / 86400000);
  const gun = fark === 0 ? 'Bugün' : fark === 1 ? 'Yarın' : `${d.getDate()} ${AYLAR[d.getMonth()]}`;
  return `${gun} ${saatYazi(d)}`;
}

/** Gün seçici etiketi: "Bugün", "Yarın", "Cmt 8 Kas". */
export function gunEtiketi(sonraki: number): string {
  const d = new Date();
  d.setDate(d.getDate() + sonraki);
  return sonraki === 0 ? 'Bugün' : sonraki === 1 ? 'Yarın' : `${GUNLER[d.getDay()]} ${d.getDate()} ${AYLAR[d.getMonth()]}`;
}

/** Sohbet listesi saati: bugün "14:32", dün "Dün", daha eski "8 Kas". */
export function listeZamani(iso: string): string {
  const d = new Date(iso);
  const fark = Math.round((gunBasi(new Date()) - gunBasi(d)) / 86400000);
  if (fark <= 0) return saatYazi(d);
  if (fark === 1) return 'Dün';
  return `${d.getDate()} ${AYLAR[d.getMonth()]}`;
}
