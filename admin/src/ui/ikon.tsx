const P: Record<string, string> = {
  ana: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  bayrak: 'M5 21V4M5 4h11l-2 4 2 4H5',
  yazi: 'M4 5h16M4 10h16M4 15h10M4 20h7',
  kisi: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  yol: 'M4 20L9 4M20 20L15 4M12 6v3M12 12v3M12 18v2',
  mikrofon: 'M3 10v4h3l6 5V5L6 10H3zM16 8a5 5 0 010 8M19 5a9 9 0 010 14',
  kalkan: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4',
  defter: 'M6 3h12v18H6zM9 8h6M9 12h6M9 16h4',
  cikis: 'M9 4H5v16h4M16 8l4 4-4 4M20 12H9',
  menu: 'M4 6h16M4 12h16M4 18h16',
  ara: 'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5',
  kapat: 'M6 6l12 12M18 6L6 18',
  yenile: 'M20 11a8 8 0 10-2.3 5.7M20 4v7h-7',
  tikla: 'M5 12l5 5L20 7',
  uyari: 'M12 3l10 18H2L12 3zM12 10v5M12 18v.5',
  gunes: 'M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
  ay: 'M20 14A8 8 0 019.5 4 8 8 0 1020 14z',
  geri: 'M15 5l-7 7 7 7',
  link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
  yorum: 'M4 5h16v11H9l-5 4V5z',
  mesaj: 'M4 6h16v12H4zM4 7l8 6 8-6',
};
export function Ikon({ ad, boyut = 18 }: { ad: keyof typeof P | string; boyut?: number }) {
  return (
    <svg width={boyut} height={boyut} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={P[ad] ?? ''} />
    </svg>
  );
}
