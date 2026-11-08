import { DOGRULAMA_GEREKLI, EPOSTA_KAYITLI, KULLANICI_ADI_ALINMIS, kullaniciAdiMusait } from './kayit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { motorGecerli } from './dogrulama';
import { supabase } from './supabase';

export type Motor = { id: string; marka: string; model: string };
type Kullanici = { id: string; ad: string; sehir: string };
type Kayit = { kullanici: Kullanici | null; motorlar: Motor[] };

const ANAHTAR = 'motopaika.oturum';
const DEMO: Kullanici = { id: 'demo', ad: 'demo_surucu', sehir: 'İstanbul' };

type Baglam = Kayit & {
  hazir: boolean;
  girisYap: () => void;
  epostaGiris: (eposta: string, sifre: string) => Promise<string | null>;
  kayitOl: (eposta: string, sifre: string, kullaniciAdi: string) => Promise<string | null>;
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
        if (s) {
          const k = JSON.parse(s) as Kayit;
          setDurum(supabase ? { ...k, kullanici: null } : k);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!supabase) setHazir(true);
      });
  }, []);

  // Gerçek oturum (Supabase yapılandırıldıysa): oturum değişince profili yükle / yoksa oluştur.
  useEffect(() => {
    if (!supabase) return;
    const db = supabase;
    const yukle = async (u: { id: string; user_metadata?: Record<string, unknown> } | null) => {
      if (!u) {
        setDurum((d) => ({ ...d, kullanici: null }));
        setHazir(true);
        return;
      }
      let { data: p } = await db.from('profiles').select('username, display_name').eq('id', u.id).maybeSingle();
      if (!p) {
        const ad = String(u.user_metadata?.username ?? `surucu_${u.id.slice(0, 6)}`);
        const gorunen = String(u.user_metadata?.full_name ?? u.user_metadata?.name ?? '').trim();
        const { data } = await db.from('profiles').insert({ id: u.id, username: ad, display_name: gorunen || null }).select('username, display_name').single();
        p = data;
        if (!p) {
          // Kullanıcı adı o arada alınmışsa (yarış durumu) benzersiz bir yedek adla profili yine de oluştur.
          const yedek = `surucu_${u.id.replace(/-/g, '').slice(0, 8)}`;
          const { data: d2 } = await db.from('profiles').insert({ id: u.id, username: yedek, display_name: gorunen || null }).select('username, display_name').single();
          p = d2;
        }
      }
      setDurum((d) => ({
        ...d,
        kullanici: { id: u.id, ad: p?.display_name ?? p?.username ?? 'Sürücü', sehir: '' },
      }));
      setHazir(true);
    };
    db.auth.getSession().then(({ data }) => yukle(data.session?.user ?? null));
    const { data: abone } = db.auth.onAuthStateChange((_olay, oturum) => {
      setTimeout(() => yukle(oturum?.user ?? null), 0);
    });
    return () => abone.subscription.unsubscribe();
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
      cikisYap: () => {
        if (supabase) supabase.auth.signOut();
        else guncelle((d) => ({ ...d, kullanici: null }));
      },
      epostaGiris: async (eposta, sifre) => {
        if (!supabase) return 'Supabase yapılandırılmamış.';
        const { error } = await supabase.auth.signInWithPassword({ email: eposta.trim(), password: sifre });
        return error ? error.message : null;
      },
      kayitOl: async (eposta, sifre, kullaniciAdi) => {
        if (!supabase) return 'Supabase yapılandırılmamış.';
        const ad = kullaniciAdi.trim();
        if ((await kullaniciAdiMusait(ad)) === false) return KULLANICI_ADI_ALINMIS;
        const { data, error } = await supabase.auth.signUp({
          email: eposta.trim(),
          password: sifre,
          options: { data: { username: ad } },
        });
        if (error) return error.message;
        // Supabase, kayıtlı bir e-posta için hata vermez (sızıntıyı önlemek için); kullanıcının identities listesi boş döner.
        if (data.user && (data.user.identities?.length ?? 1) === 0) return EPOSTA_KAYITLI;
        return data.session ? null : DOGRULAMA_GEREKLI;
      },
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
