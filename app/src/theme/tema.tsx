import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';

import { palette, type ColorToken } from './tokens';

export type TemaTercihi = 'koyu' | 'acik' | 'sistem';
export type Renkler = { [K in ColorToken]: string };

const ANAHTAR = 'roteri.tema';

type Baglam = {
  /** Kullanıcının seçimi: koyu, açık ya da cihaz ayarını izle. */
  tercih: TemaTercihi;
  tercihDegistir: (t: TemaTercihi) => void;
  /** Şu an uygulanan tema koyu mu? */
  koyu: boolean;
  renkler: Renkler;
};

const VARSAYILAN: Baglam = { tercih: 'koyu', tercihDegistir: () => {}, koyu: true, renkler: palette.dark };
const TemaBaglami = createContext<Baglam>(VARSAYILAN);

/** Uygulama teması: Koyu (varsayılan), Açık ya da Sistem. Seçim cihazda saklanır. */
export function TemaSaglayici({ children }: { children: ReactNode }) {
  const [tercih, setTercih] = useState<TemaTercihi>('koyu');
  const sistem = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(ANAHTAR)
      .then((v) => {
        if (v === 'koyu' || v === 'acik' || v === 'sistem') setTercih(v);
      })
      .catch(() => {});
  }, []);

  // Klavye, uyarı kutuları gibi yerel bileşenler de seçilen temayı izlesin.
  useEffect(() => {
    try {
      Appearance.setColorScheme(tercih === 'sistem' ? 'unspecified' : tercih === 'acik' ? 'light' : 'dark');
    } catch {}
  }, [tercih]);

  const tercihDegistir = useCallback((t: TemaTercihi) => {
    setTercih(t);
    AsyncStorage.setItem(ANAHTAR, t).catch(() => {});
  }, []);

  const koyu = tercih === 'sistem' ? sistem !== 'light' : tercih === 'koyu';
  const deger = useMemo<Baglam>(
    () => ({ tercih, tercihDegistir, koyu, renkler: koyu ? palette.dark : palette.light }),
    [tercih, tercihDegistir, koyu],
  );
  return <TemaBaglami.Provider value={deger}>{children}</TemaBaglami.Provider>;
}

/** Tema tercihi ve durumu (ayarlar ekranı, harita gibi yerler için). */
export function useTema() {
  return useContext(TemaBaglami);
}

/** Etkin renk paleti. */
export function useTheme(): Renkler {
  return useContext(TemaBaglami).renkler;
}
