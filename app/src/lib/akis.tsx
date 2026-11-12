import { Alert } from 'react-native';
import { moderasyonUyarisi } from './moderasyon/uygula';
import { hizUyarisi, kisitUyarisi } from './yonetim';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ben, demoGonderiler, type Gonderi, type KategoriId } from '@/demo/akis';

import { konumBilgisi, mesafeKm, mevcutKonum, type Konum } from './konum';
import { useOturum } from './oturum';
import { avatarAdresi } from './profil';
import { zamanYazi } from './zaman';
import { istekGeriAl, istekGonder, type IstekDurumu } from './sohbet';
import { supabase } from './supabase';

export type AkisGonderisi = Gonderi & {
  selamVerdi: boolean;
  geliyorumDedi: boolean;
  enlem?: number;
  boylam?: number;
  fotoUrl?: string;
  /** Gönderideki tüm fotoğraflar (en çok 4); `fotoUrl` ilkidir. */
  fotoUrlleri?: string[];
  sehir?: string;
  benim?: boolean;
  yazarId?: string;
  avatarUrl?: string;
  /** Oluşturulma zamanı (ISO); sürüşün 12 saatlik ömrü için. */
  olusturma?: string;
  /** Sürüş türü ve başlangıç zamanı (ISO). Anlıkta başlangıç = paylaşım anı. */
  surusTuru?: 'anlik' | 'planli';
  baslangic?: string;
};

/** Bir gönderiye eklenebilecek en çok fotoğraf sayısı (veritabanı kısıtıyla aynı). */
export const MAKS_FOTO = 4;

/** Sürüş (buluşma) gönderisinin aktif kaldığı süre. */
export const SURUS_OMRU_SAAT = 12;

/** Başlangıcından 12 saat geçen sürüş gönderisi pasiftir: haritadan kalkar, katılma isteği alınmaz. */
export function pasifMi(g: { kategori: string; olusturma?: string; baslangic?: string }): boolean {
  const t = g.baslangic ?? g.olusturma;
  return g.kategori === 'surus' && !!t && Date.now() - new Date(t).getTime() > SURUS_OMRU_SAAT * 3600_000;
}

export type YeniGonderi = {
  anonim: boolean;
  kategori: KategoriId;
  konum: string;
  metin: string;
  surusTuru?: 'anlik' | 'planli';
  baslangic?: string;
  /** Telefondaki fotoğraf adresleri (yüklenir, en çok 4). */
  fotoUriler?: string[];
  enlem?: number;
  boylam?: number;
  sehir?: string;
};

type Baglam = {
  gonderiler: AkisGonderisi[];
  /** Gerçek modda ilk liste gelene kadar true (iskelet yükleme için). */
  yukleniyor: boolean;
  /** Akışı sunucudan yeniden çeker (aşağı çekip yenile). */
  yenile: () => Promise<void>;
  ekle: (g: YeniGonderi) => Promise<void>;
  selamDegistir: (id: string) => void;
  geliyorumDegistir: (id: string) => void | Promise<void>;
  yorumlariYukle: (id: string) => Promise<void>;
  yorumEkle: (id: string, metin: string) => Promise<void>;
  /** Sürüş gönderisi başına benim katılma isteği durumum. */
  istekler: Record<string, IstekDurumu>;
  canli: { istek: number; mesaj: number };
  istekGonder: (id: string) => Promise<void>;
  istekGeriAl: (id: string) => Promise<void>;
  /** Kendi gönderini siler; başarılıysa true. */
  gonderiSil: (id: string) => Promise<boolean>;
  /** Gönderiyi şikayet eder: 'tamam' | 'zaten' (daha önce bildirilmiş) | 'hata'. */
  gonderiSikayet: (id: string, neden: string) => Promise<'tamam' | 'zaten' | 'hata'>;
  /** Kullanıcının konumu (GPS ya da elle seçilen); mesafe filtreleri buna göre çalışır. */
  konumum: Konum | null;
  /** Haritadan pinlenen noktayı konum yapar. */
  konumNokta: (lat: number, lng: number) => Promise<void>;
  /** GPS konumuna döner; izin yoksa false. */
  konumGps: () => Promise<boolean>;
};

const AkisBaglami = createContext<Baglam | null>(null);

type Satir = {
  id: string;
  category: KategoriId;
  body: string;
  place: string | null;
  lat: number | null;
  lng: number | null;
  has_photo: boolean;
  photo_path: string | null;
  photo_paths: string[] | null;
  city: string | null;
  is_anonymous: boolean;
  created_at: string;
  author_name: string | null;
  author_username: string | null;
  motorcycle: string | null;
  salute_count: number;
  rsvp_count: number;
  comment_count: number;
  saluted: boolean;
  rsvped: boolean;
  is_mine: boolean;
  ride_type: 'instant' | 'planned' | null;
  starts_at: string | null;
  author_id: string | null;
  author_avatar: string | null;
};

function fotoAdresi(yol: string | null): string | undefined {
  if (!yol || !supabase) return undefined;
  return supabase.storage.from('post-photos').getPublicUrl(yol).data.publicUrl;
}

/** Yeni gönderide `photo_paths`, eski gönderilerde yalnız `photo_path` dolu olabilir. */
function fotoYollari(r: Pick<Satir, 'photo_path' | 'photo_paths'>): string[] {
  if (r.photo_paths?.length) return r.photo_paths;
  return r.photo_path ? [r.photo_path] : [];
}

function satirdanGonderi(r: Satir, konum: { lat: number; lng: number } | null): AkisGonderisi {
  const var_ = r.lat != null && r.lng != null;
  return {
    id: r.id,
    anonim: r.is_anonymous,
    yazar: r.is_anonymous ? 'Anonim Sürücü' : (r.author_name ?? r.author_username ?? 'Sürücü'),
    motor: r.motorcycle ?? '',
    konum: r.place || 'Konum belirtilmedi',
    zaman: zamanYazi(r.created_at),
    olusturma: r.created_at,
    surusTuru: r.ride_type === 'planned' ? 'planli' : r.ride_type === 'instant' ? 'anlik' : undefined,
    baslangic: r.starts_at ?? undefined,
    kategori: r.category,
    metin: r.body,
    gorsel: r.has_photo,
    fotoUrl: fotoAdresi(r.photo_path),
    fotoUrlleri: fotoYollari(r).map((y) => fotoAdresi(y)!).filter(Boolean),
    sehir: r.city ?? undefined,
    benim: r.is_mine,
    yazarId: r.author_id ?? undefined,
    avatarUrl: avatarAdresi(r.author_avatar),
    enlem: r.lat ?? undefined,
    boylam: r.lng ?? undefined,
    // Koordinatı olmayan ya da konumun bilinmediği gönderiler "Yakınımdakiler"e girmez.
    mesafeKm: var_ && konum ? mesafeKm(konum, { lat: r.lat!, lng: r.lng! }) : 9999,
    selam: Number(r.salute_count),
    geliyorum: r.category === 'surus' ? Number(r.rsvp_count) : undefined,
    yorumSayisi: Number(r.comment_count),
    yorumlar: [],
    selamVerdi: r.saluted,
    geliyorumDedi: r.rsvped,
  };
}

/** Akış durumu tüm ekranlarda ortak: gönderi, selam, "Ben de geliyorum" ve yorumlar tek yerde tutulur. */
export function AkisSaglayici({ children }: { children: ReactNode }) {
  const [gonderiler, setGonderiler] = useState<AkisGonderisi[]>(() =>
    (supabase ? [] : demoGonderiler).map((g) => ({ ...g, sehir: 'İstanbul', selamVerdi: false, geliyorumDedi: false })),
  );
  const { kullanici } = useOturum();
  const son = useRef(gonderiler);
  son.current = gonderiler;
  const uid = supabase ? kullanici?.id : undefined;
  const [istekler, setIstekler] = useState<Record<string, IstekDurumu>>({});
  const istekRef = useRef(istekler);
  istekRef.current = istekler;
  // Canlı olay sayaçları: ekranlar değişince listelerini yeniler.
  const [canli, setCanli] = useState({ istek: 0, mesaj: 0 });
  const konumRef = useRef<{ lat: number; lng: number } | null>(null);
  const [konumum, setKonumum] = useState<Konum | null>(null);
  const elleRef = useRef(false);

  const [yukleniyor, setYukleniyor] = useState(!!supabase);
  const yenile = useCallback(async () => {
    if (!supabase) return;
    try {
      const [{ data }, { data: ist }] = await Promise.all([
        supabase.from('feed_posts').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('ride_requests').select('post_id, status'),
      ]);
      if (data) setGonderiler((data as Satir[]).map((r) => satirdanGonderi(r, konumRef.current)));
      if (ist) setIstekler(Object.fromEntries(ist.map((i: { post_id: string; status: IstekDurumu }) => [i.post_id, i.status])));
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    if (!uid) {
      setGonderiler([]);
      setYukleniyor(false);
      return;
    }
    yenile();
  }, [uid, yenile]);

  const konumAyarla = useCallback(
    (k: Konum) => {
      konumRef.current = { lat: k.lat, lng: k.lng };
      setKonumum(k);
      yenile();
    },
    [yenile],
  );

  // Konumu bir kez al (izin istenir); kullanıcı elle seçtiyse üzerine yazma.
  useEffect(() => {
    mevcutKonum().then((k) => {
      if (k && !elleRef.current) konumAyarla(k);
    });
  }, [uid, konumAyarla]);

  const konumNokta = useCallback(
    async (lat: number, lng: number) => {
      const k = await konumBilgisi(lat, lng);
      elleRef.current = true;
      konumAyarla(k);
    },
    [konumAyarla],
  );

  const konumGps = useCallback(async () => {
    const k = await mevcutKonum();
    if (!k) return false;
    elleRef.current = false;
    konumAyarla(k);
    return true;
  }, [konumAyarla]);

  // Anlık: yeni/yanıtlanan katılma istekleri ve yeni mesajlar (RLS: yalnız ilgili satırlar gelir).
  useEffect(() => {
    const db = supabase;
    if (!db || !uid) return;
    const kanal = db
      .channel(`canli-${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ride_requests' }, (p) => {
        const y = p.new as { post_id?: string; user_id?: string; status?: IstekDurumu };
        if (y.user_id === uid && y.post_id && y.status) setIstekler((o) => ({ ...o, [y.post_id!]: y.status! }));
        setCanli((o) => ({ ...o, istek: o.istek + 1 }));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => {
        setCanli((o) => ({ ...o, mesaj: o.mesaj + 1 }));
      })
      .subscribe();
    return () => {
      db.removeChannel(kanal);
    };
  }, [uid]);

  const gonderiSil = useCallback(
    async (id: string) => {
      if (supabase) {
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) return false;
      }
      setGonderiler((o) => o.filter((g) => g.id !== id));
      return true;
    },
    [],
  );

  const gonderiSikayet = useCallback(
    async (id: string, neden: string): Promise<'tamam' | 'zaten' | 'hata'> => {
      if (!supabase || !uid) return 'tamam';
      const { error } = await supabase.from('post_reports').insert({ post_id: id, reporter_id: uid, reason: neden.slice(0, 300) });
      if (!error) return 'tamam';
      return error.code === '23505' ? 'zaten' : 'hata';
    },
    [uid],
  );

  const ekle = useCallback(
    async (g: YeniGonderi) => {
      if (supabase && uid) {
        const secilen = (g.fotoUriler ?? []).slice(0, MAKS_FOTO);
        // Fotoğraflar sırayla değil birlikte yüklenir; başarısız olanlar atlanır ve kullanıcıya bildirilir.
        const yuklenen = await Promise.all(
          secilen.map(async (uri) => {
            try {
              const buf = await (await fetch(uri)).arrayBuffer();
              const ad = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
              const { error } = await supabase!.storage.from('post-photos').upload(ad, buf, { contentType: 'image/jpeg' });
              return error ? null : ad;
            } catch {
              return null;
            }
          }),
        );
        const yollar = yuklenen.filter((y): y is string => !!y);
        const yol = yollar[0] ?? null;
        if (yollar.length < secilen.length) {
          Alert.alert('Bazı fotoğraflar yüklenemedi', `${secilen.length - yollar.length} fotoğraf eklenemedi. Gönderin diğerleriyle paylaşıldı.`);
        }
        const { error: yazHata } = await supabase.from('posts').insert({
          author_id: uid,
          is_anonymous: g.anonim,
          category: g.kategori,
          body: g.metin.trim(),
          place: g.konum.trim() || null,
          lat: g.enlem ?? null,
          lng: g.boylam ?? null,
          city: g.sehir ?? null,
          ride_type: g.surusTuru ? (g.surusTuru === 'planli' ? 'planned' : 'instant') : null,
          starts_at: g.baslangic ?? null,
          has_photo: yollar.length > 0,
          photo_path: yol,
          photo_paths: yollar,
        });
        if (yazHata && !moderasyonUyarisi(yazHata) && !hizUyarisi(yazHata) && !(await kisitUyarisi())) Alert.alert('Paylaşılamadı', 'İnternet bağlantını kontrol edip tekrar dene.');
        await yenile();
        return;
      }
      const yeni: AkisGonderisi = {
        id: `y${Date.now()}`,
        anonim: g.anonim,
        yazar: g.anonim ? 'Anonim Sürücü' : ben.ad,
        motor: ben.motor,
        konum: g.konum.trim() || 'Konum belirtilmedi',
        zaman: 'Şimdi',
        olusturma: new Date().toISOString(),
        surusTuru: g.surusTuru,
        baslangic: g.baslangic,
        kategori: g.kategori,
        metin: g.metin.trim(),
        gorsel: !!g.fotoUriler?.length,
        fotoUrl: g.fotoUriler?.[0],
        fotoUrlleri: g.fotoUriler,
        enlem: g.enlem,
        boylam: g.boylam,
        sehir: g.sehir,
        mesafeKm: 0,
        selam: 0,
        geliyorum: g.kategori === 'surus' ? 0 : undefined,
        yorumSayisi: 0,
        yorumlar: [],
        selamVerdi: false,
        geliyorumDedi: false,
      };
      setGonderiler((o) => [yeni, ...o]);
    },
    [uid, yenile],
  );

  const selamDegistir = useCallback(
    (id: string) => {
      if (supabase && uid) {
        const g = son.current.find((x) => x.id === id);
        if (g) {
          (g.selamVerdi
            ? supabase.from('post_salutes').delete().eq('post_id', id).eq('user_id', uid)
            : supabase.from('post_salutes').insert({ post_id: id, user_id: uid })
          ).then(() => {});
        }
      }
      setGonderiler((o) =>
        o.map((g) => (g.id === id ? { ...g, selamVerdi: !g.selamVerdi, selam: g.selam + (g.selamVerdi ? -1 : 1) } : g)),
      );
    },
    [uid],
  );

  const istekGonderFn = useCallback(
    async (id: string) => {
      if (!uid) return;
      const hata = await istekGonder(id, uid);
      if (hata) {
        if (hizUyarisi(hata) || (await kisitUyarisi())) return;
        Alert.alert('İstek gönderilemedi', `${hata}\n\nSupabase'de tüm migration dosyaları çalıştırıldı mı?`);
        return;
      }
      setIstekler((o) => ({ ...o, [id]: 'pending' }));
    },
    [uid],
  );
  const istekGeriAlFn = useCallback(
    async (id: string) => {
      if (uid && (await istekGeriAl(id, uid))) {
        setIstekler((o) => {
          const { [id]: _, ...kalan } = o;
          return kalan;
        });
      }
    },
    [uid],
  );

  const geliyorumDegistir = useCallback(
    async (id: string) => {
      if (supabase && uid) {
        const g = son.current.find((x) => x.id === id);
        if (g && pasifMi(g)) return;
        // Sürüş gönderisinde "Ben de Geliyorum!" = katılma isteği (sahibi kabul eder).
        if (g && g.kategori === 'surus' && !g.benim) {
          const d = istekRef.current[id];
          if (d === 'accepted' || d === 'declined') return;
          const bekliyor = d === 'pending';
          if (bekliyor) await istekGeriAlFn(id);
          else {
            await istekGonderFn(id);
            if (!istekRef.current[id]) return;
          }
          (bekliyor
            ? supabase.from('post_rsvps').delete().eq('post_id', id).eq('user_id', uid)
            : supabase.from('post_rsvps').insert({ post_id: id, user_id: uid })
          ).then(() => {});
          setGonderiler((o) =>
            o.map((x) => (x.id === id ? { ...x, geliyorumDedi: !bekliyor, geliyorum: (x.geliyorum ?? 0) + (bekliyor ? -1 : 1) } : x)),
          );
          return;
        }
        if (g) {
          (g.geliyorumDedi
            ? supabase.from('post_rsvps').delete().eq('post_id', id).eq('user_id', uid)
            : supabase.from('post_rsvps').insert({ post_id: id, user_id: uid })
          ).then(() => {});
        }
      }
      setGonderiler((o) =>
        o.map((g) =>
          g.id === id
            ? { ...g, geliyorumDedi: !g.geliyorumDedi, geliyorum: (g.geliyorum ?? 0) + (g.geliyorumDedi ? -1 : 1) }
            : g,
        ),
      );
    },
    [uid, istekGonderFn, istekGeriAlFn, gonderiSil, gonderiSikayet, konumum, konumNokta, konumGps],
  );

  const yorumlariYukle = useCallback(async (id: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('post_comments')
      .select('body, created_at, profiles(username, display_name)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    const yorumlar = ((data ?? []) as unknown as { body: string; profiles: { username: string; display_name: string | null } | null }[]).map(
      (y) => ({ yazar: y.profiles?.display_name ?? y.profiles?.username ?? 'Sürücü', metin: y.body }),
    );
    setGonderiler((o) => o.map((g) => (g.id === id ? { ...g, yorumlar, yorumSayisi: yorumlar.length } : g)));
  }, []);

  const yorumEkle = useCallback(
    async (id: string, metin: string) => {
      const t = metin.trim();
      if (!t) return;
      if (supabase && uid) {
        const { error: yorumHata } = await supabase.from('post_comments').insert({ post_id: id, author_id: uid, body: t });
        if (yorumHata && !moderasyonUyarisi(yorumHata) && !hizUyarisi(yorumHata)) await kisitUyarisi();
        await yorumlariYukle(id);
        return;
      }
      setGonderiler((o) =>
        o.map((g) =>
          g.id === id ? { ...g, yorumlar: [...g.yorumlar, { yazar: ben.ad, metin: t }], yorumSayisi: g.yorumSayisi + 1 } : g,
        ),
      );
    },
    [uid, yorumlariYukle],
  );

  const deger = useMemo<Baglam>(
    () => ({
      gonderiler,
      yukleniyor,
      yenile,
      ekle,
      selamDegistir,
      geliyorumDegistir,
      yorumlariYukle,
      yorumEkle,
      istekler,
      canli,
      istekGonder: istekGonderFn,
      istekGeriAl: istekGeriAlFn,
      gonderiSil,
      gonderiSikayet,
      konumum,
      konumNokta,
      konumGps,
    }),
    [gonderiler, yukleniyor, yenile, ekle, selamDegistir, geliyorumDegistir, yorumlariYukle, yorumEkle, istekler, canli, istekGonderFn, istekGeriAlFn],
  );
  return <AkisBaglami.Provider value={deger}>{children}</AkisBaglami.Provider>;
}

export function useAkis(): Baglam {
  const b = useContext(AkisBaglami);
  if (!b) throw new Error('AkisSaglayici eksik');
  return b;
}
