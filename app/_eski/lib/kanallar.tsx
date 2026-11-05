import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const ANAHTAR = 'motopaika.favoriler';
// Anahtar biçimi: "<kategori>:<id>" (ör. markalar:honda, sehirler:34, sosyal:yeni).
const VARSAYILAN = ['markalar:honda', 'markalar:yamaha', 'sehirler:34', 'sosyal:yeni'];

type Baglam = {
  /** Katılınan kanalların anahtarları. */
  kanallar: string[];
  katildiMi: (anahtar: string) => boolean;
  /** Katıldıysa ayrılır, katılmadıysa katılır. */
  degistir: (anahtar: string) => void;
};

const KanalBaglami = createContext<Baglam | null>(null);

/** Katılınan kanallar tüm ekranlarda ortak; cihazda saklanır. */
export function KanalSaglayici({ children }: { children: ReactNode }) {
  const [kanallar, setKanallar] = useState<string[]>(VARSAYILAN);

  useEffect(() => {
    AsyncStorage.getItem(ANAHTAR)
      .then((s) => {
        if (s) setKanallar(JSON.parse(s) as string[]);
      })
      .catch(() => {});
  }, []);

  const degistir = useCallback((anahtar: string) => {
    setKanallar((onceki) => {
      const yeni = onceki.includes(anahtar) ? onceki.filter((f) => f !== anahtar) : [...onceki, anahtar];
      AsyncStorage.setItem(ANAHTAR, JSON.stringify(yeni)).catch(() => {});
      return yeni;
    });
  }, []);

  const deger = useMemo<Baglam>(
    () => ({ kanallar, degistir, katildiMi: (a) => kanallar.includes(a) }),
    [kanallar, degistir],
  );

  return <KanalBaglami.Provider value={deger}>{children}</KanalBaglami.Provider>;
}

export function useKanallar(): Baglam {
  const b = useContext(KanalBaglami);
  if (!b) throw new Error('KanalSaglayici eksik');
  return b;
}
