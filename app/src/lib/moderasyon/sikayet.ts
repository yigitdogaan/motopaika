import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

/** Demo modunda şikâyet ve engeller cihazda saklanır; Supabase bağlanınca tabloya yazılacak. */
const ANAHTAR = 'moderasyon.v1';
export type Durum = { bildirilen: string[]; engellenen: string[] };
const BOS: Durum = { bildirilen: [], engellenen: [] };

export async function durumOku(): Promise<Durum> {
  try {
    const ham = await AsyncStorage.getItem(ANAHTAR);
    return ham ? { ...BOS, ...JSON.parse(ham) } : BOS;
  } catch {
    return BOS;
  }
}

export function useSikayet() {
  const [durum, setDurum] = useState<Durum>(BOS);
  useEffect(() => {
    durumOku().then(setDurum);
  }, []);

  const ekle = useCallback((alan: keyof Durum, id: string) => {
    setDurum((d) => {
      if (d[alan].includes(id)) return d;
      const yeni = { ...d, [alan]: [...d[alan], id] };
      AsyncStorage.setItem(ANAHTAR, JSON.stringify(yeni)).catch(() => {});
      return yeni;
    });
  }, []);

  return {
    durum,
    bildir: (id: string) => ekle('bildirilen', id),
    engelle: (id: string) => ekle('engellenen', id),
  };
}
