import { useEffect, useState } from 'react';
const oku = () => {
  const h = location.hash.replace(/^#/, '') || '/';
  const [yol, sorgu = ''] = h.split('?');
  return { yol, parcalar: yol.split('/').filter(Boolean), sorgu: new URLSearchParams(sorgu) };
};
export function useYol() {
  const [d, set] = useState(oku);
  useEffect(() => { const f = () => set(oku()); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); }, []);
  return d;
}
export const git = (yol: string) => { location.hash = yol; };
export const baglanti = (yol: string) => '#' + yol;
