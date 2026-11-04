import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { motorGecerli } from './dogrulama';

export type Motor = { id: string; marka: string; model: string };
type Kullanici = { id: string; ad: string; sehir: string };
type Kayit = { kullanici: Kullanici | null; motorlar: Motor[] };

const ANAHTAR = 'motopaika.oturum';
const DEMO: Kullanici = { id: 'demo', ad: 'demo_surucu', sehir: 'İstanbul' };

type Baglam = Kayit & {
  hazir: boolean;
  girisYap: () => void;
  cikisYap: () => void;
  motorEkle: (marka: string, model: string) => boolean;
  motorSil: (id: string) => void;
};

const OturumBaglami = createContext<Baglam | null>(null);

/** Demo modu: gerçek hesap yok, "demo kullanıcı" ile giriş yapılır; durum cihazda saklanır. */
export function OturumSaglayici({ children }: { children: ReactNode }) {
  const [durum, setDurum] = useState<Kayit>({ kullanici: null, motorlar: [] });
  const [hazir, setHazir] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ANAHTAR)
      .then((s) => {
        if (s) setDurum(JSON.parse(s) as Kayit);
      })
      .catch(() => {})
      .finally(() => setHazir(true));
  }, []);

  const guncelle = useCallback((fn: (d: Kayit) => Kayit) => {
    setDurum((onceki) => {
      const yeni = fn(onceki);
      AsyncStorage.setItem(ANAHTAR, JSON.stringify(yeni)).catch(() => {});
      return yeni;
    });
  }, []);

  const deger = useMemo<Baglam>(
    () => ({
      ...durum,
      hazir,
      girisYap: () => guncelle((d) => ({ ...d, kullanici: DEMO })),
      cikisYap: () => guncelle((d) => ({ ...d, kullanici: null })),
      motorEkle: (marka, model) => {
        if (!motorGecerli(marka, model)) return false;
        const motor = { id: String(Date.now()), marka: marka.trim(), model: model.trim() };
        guncelle((d) => ({ ...d, motorlar: [...d.motorlar, motor] }));
        return true;
      },
      motorSil: (id) => guncelle((d) => ({ ...d, motorlar: d.motorlar.filter((m) => m.id !== id) })),
    }),
    [durum, hazir, guncelle],
  );

  return <OturumBaglami.Provider value={deger}>{children}</OturumBaglami.Provider>;
}

export function useOturum(): Baglam {
  const b = useContext(OturumBaglami);
  if (!b) throw new Error('OturumSaglayici eksik');
  return b;
}
