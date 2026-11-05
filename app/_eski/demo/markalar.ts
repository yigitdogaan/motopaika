// Türkiye'de yaygın motosiklet markaları. Logo yerine renkli kısaltma kutusu gösterilir (marka logoları telifli/tescilli).
import type { KategoriOgesi } from './kategoriler';

export type Marka = KategoriOgesi;

export const markalar: Marka[] = [
  { id: 'aprilia', ad: 'Aprilia', kisa: 'A', renk: '#1B1B1B' },
  { id: 'arora', ad: 'Arora', kisa: 'AR', renk: '#D84315' },
  { id: 'bajaj', ad: 'Bajaj', kisa: 'BJ', renk: '#1E50A0' },
  { id: 'benelli', ad: 'Benelli', kisa: 'B', renk: '#2E7D32' },
  { id: 'bmw', ad: 'BMW Motorrad', kisa: 'BMW', renk: '#1C69D4' },
  { id: 'cfmoto', ad: 'CFMoto', kisa: 'CF', renk: '#0077C8' },
  { id: 'ducati', ad: 'Ducati', kisa: 'D', renk: '#C8102E' },
  { id: 'harley', ad: 'Harley-Davidson', kisa: 'HD', renk: '#E8581C' },
  { id: 'hero', ad: 'Hero', kisa: 'HR', renk: '#B71C1C' },
  { id: 'honda', ad: 'Honda', kisa: 'H', renk: '#CC0000' },
  { id: 'husqvarna', ad: 'Husqvarna', kisa: 'HQ', renk: '#0F2A4A' },
  { id: 'indian', ad: 'Indian', kisa: 'IN', renk: '#7B1F1F' },
  { id: 'kawasaki', ad: 'Kawasaki', kisa: 'K', renk: '#2E9E3A' },
  { id: 'ktm', ad: 'KTM', kisa: 'KTM', renk: '#F26B00' },
  { id: 'kuba', ad: 'Kuba', kisa: 'KB', renk: '#E30613' },
  { id: 'kymco', ad: 'Kymco', kisa: 'KY', renk: '#005BAC' },
  { id: 'mondial', ad: 'Mondial', kisa: 'M', renk: '#003DA5' },
  { id: 'motoguzzi', ad: 'Moto Guzzi', kisa: 'MG', renk: '#6D1A1A' },
  { id: 'mvagusta', ad: 'MV Agusta', kisa: 'MV', renk: '#9E1B32' },
  { id: 'piaggio', ad: 'Piaggio', kisa: 'P', renk: '#00478F' },
  { id: 'rks', ad: 'RKS', kisa: 'RKS', renk: '#EF6C00' },
  { id: 'royalenfield', ad: 'Royal Enfield', kisa: 'RE', renk: '#8B1E24' },
  { id: 'suzuki', ad: 'Suzuki', kisa: 'S', renk: '#1F4AA8' },
  { id: 'sym', ad: 'SYM', kisa: 'SYM', renk: '#0094D8' },
  { id: 'triumph', ad: 'Triumph', kisa: 'T', renk: '#2B2B2B' },
  { id: 'tvs', ad: 'TVS', kisa: 'TVS', renk: '#2A2A72' },
  { id: 'vespa', ad: 'Vespa', kisa: 'V', renk: '#4E9C8C' },
  { id: 'voge', ad: 'Voge', kisa: 'VG', renk: '#C62828' },
  { id: 'yamaha', ad: 'Yamaha', kisa: 'Y', renk: '#1A3C8F' },
  { id: 'zontes', ad: 'Zontes', kisa: 'Z', renk: '#212121' },
];
