import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useOturum } from './oturum';

const ANAHTAR = 'roteri.karsilama.v1.';

type Baglam = {
  /** null: henüz okunmadı; true: karşılama gösterilmeli; false: daha önce görüldü. */
  gosterilmeli: boolean | null;
  tamamla: () => void;
};

const KarsilamaBaglami = createContext<Baglam>({ gosterilmeli: false, tamamla: () => {} });

/** Her hesap için karşılama turu bir kez gösterilir; depolama okunamazsa hiç gösterilmez. */
export function KarsilamaSaglayici({ children }: { children: ReactNode }) {
  const { kullanici } = useOturum();
  const id = kullanici?.id ?? null;
  const [gosterilmeli, setGosterilmeli] = useState<boolean | null>(null);

  useEffect(() => {
    if (!id) {
      setGosterilmeli(null);
      return;
    }
    let iptal = false;
    AsyncStorage.getItem(ANAHTAR + id)
      .then((v) => !iptal && setGosterilmeli(v !== '1'))
      .catch(() => !iptal && setGosterilmeli(false));
    return () => {
      iptal = true;
    };
  }, [id]);

  const tamamla = useCallback(() => {
    setGosterilmeli(false);
    if (id) AsyncStorage.setItem(ANAHTAR + id, '1').catch(() => {});
  }, [id]);

  const deger = useMemo(() => ({ gosterilmeli, tamamla }), [gosterilmeli, tamamla]);
  return <KarsilamaBaglami.Provider value={deger}>{children}</KarsilamaBaglami.Provider>;
}

export const useKarsilama = () => useContext(KarsilamaBaglami);
