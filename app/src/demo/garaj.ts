export type Motor = { id: string; marka: string; model: string; yil: number; hacim: string; km: string; ana?: boolean };

/** Demo kullanıcının garajı (kullanıcının eklediği motorlar oturumdan gelir). */
export const demoGaraj: Motor[] = [
  { id: 'm1', marka: 'Yamaha', model: 'XSR 900', yil: 2022, hacim: '890 cc', km: '14.200 km', ana: true },
  { id: 'm2', marka: 'Peugeot', model: 'XP400', yil: 2021, hacim: '400 cc', km: '9.800 km' },
];

export const demoProfil = {
  bio: 'Hafta içi trafik, hafta sonu virajlar. XSR ile Karadeniz\'e çıkarım, XP400 ile şehre dönerim.',
  selam: 1284,
  gonderi: 36,
  bulusma: 23,
};
