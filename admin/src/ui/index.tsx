import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { imzaliUrl, hataMetni } from '../api';
export { hataMetni as hataMetniK };
import { bas, DEGISIM } from '../format';
import { Ikon } from './ikon';

/* ───── Toast ───── */
type T = { id: number; m: string; hata?: boolean };
const ToastCtx = createContext<(m: string, hata?: boolean) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastSaglayici({ children }: { children: ReactNode }) {
  const [liste, setListe] = useState<T[]>([]);
  const ekle = useCallback((m: string, hata?: boolean) => {
    const id = Math.random();
    setListe((l) => [...l, { id, m, hata }]);
    setTimeout(() => setListe((l) => l.filter((x) => x.id !== id)), hata ? 6000 : 3500);
  }, []);
  return (
    <ToastCtx.Provider value={ekle}>
      {children}
      <div className="bildirimler" role="status" aria-live="polite">
        {liste.map((t) => <div key={t.id} className={'bildirim' + (t.hata ? ' hata' : '')}>{t.m}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}

/* ───── Yükleme hook'u ───── */
export function useYukle<T>(fn: () => Promise<T>, bagimlilik: unknown[]) {
  const [veri, setVeri] = useState<T | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [sayac, setSayac] = useState(0);
  const sira = useRef(0);
  useEffect(() => {
    const bu = ++sira.current;
    setYukleniyor(true);
    fn().then((v) => { if (bu === sira.current) { setVeri(v); setHata(null); } })
      .catch((e) => { if (bu === sira.current) setHata(hataMetni(e)); })
      .finally(() => { if (bu === sira.current) setYukleniyor(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...bagimlilik, sayac]);
  return { veri, hata, yukleniyor, yenile: () => setSayac((s) => s + 1), setVeri };
}
export function useDebounce<T>(v: T, ms = 350) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}

/* ───── Modal ───── */
export function Modal({ baslik, kapat, children, alt, genis }: { baslik: string; kapat: () => void; children: ReactNode; alt?: ReactNode; genis?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && kapat();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [kapat]);
  return (
    <div className="perde" onMouseDown={(e) => e.target === e.currentTarget && kapat()}>
      <div className={'modal' + (genis ? ' genis' : '')} role="dialog" aria-modal="true" aria-label={baslik}>
        <div className="row"><h2 className="grow">{baslik}</h2><button className="btn hayalet kucuk" onClick={kapat} aria-label="Kapat"><Ikon ad="kapat" boyut={16} /></button></div>
        {children}
        {alt && <div className="modal-alt">{alt}</div>}
      </div>
    </div>
  );
}

/** Neden isteyen onay penceresi. */
export function OnayModal(p: { baslik: string; aciklama?: ReactNode; onayEtiketi: string; tehlikeli?: boolean; nedenIste?: boolean; nedenEtiketi?: string;
  onayla: (neden: string) => Promise<void>; kapat: () => void; kisayollar?: string[] }) {
  const [neden, setNeden] = useState('');
  const [mesgul, setMesgul] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const gecerli = !p.nedenIste || neden.trim().length >= 3;
  const git = async () => {
    setMesgul(true); setHata(null);
    try { await p.onayla(neden.trim()); p.kapat(); } catch (e) { setHata(hataMetni(e)); setMesgul(false); }
  };
  return (
    <Modal baslik={p.baslik} kapat={p.kapat} alt={<>
      <button className="btn" onClick={p.kapat} disabled={mesgul}>Vazgeç</button>
      <button className={'btn ' + (p.tehlikeli ? 'tehlike' : 'birincil')} onClick={git} disabled={!gecerli || mesgul}>{mesgul ? 'İşleniyor…' : p.onayEtiketi}</button>
    </>}>
      {p.aciklama && <div className="muted">{p.aciklama}</div>}
      {p.nedenIste && (
        <div className="col">
          <label className="alan">{p.nedenEtiketi ?? 'Neden'} (kullanıcıya da gösterilebilir)
            <textarea className="girdi" value={neden} onChange={(e) => setNeden(e.target.value)} maxLength={300} autoFocus />
          </label>
          {p.kisayollar && <div className="row wrap">{p.kisayollar.map((s) => <button key={s} type="button" className="rozet" style={{ cursor: 'pointer' }} onClick={() => setNeden(s)}>{s}</button>)}</div>}
        </div>
      )}
      {hata && <div className="hata-kutu">{hata}</div>}
    </Modal>
  );
}

/* ───── Küçük parçalar ───── */
export function Avatar({ ad, yol, buyuk }: { ad?: string | null; yol?: string | null; buyuk?: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { let iptal = false; imzaliUrl('avatars', yol).then((u) => !iptal && setUrl(u)); return () => { iptal = true; }; }, [yol]);
  return <span className={'avatar' + (buyuk ? ' b' : '')}>{url ? <img src={url} alt="" /> : bas(ad)}</span>;
}
export function GonderiFoto({ yol }: { yol?: string | null }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { let iptal = false; imzaliUrl('post-photos', yol).then((u) => !iptal && setUrl(u)); return () => { iptal = true; }; }, [yol]);
  if (!yol) return null;
  return url ? <img src={url} alt="Gönderi fotoğrafı" style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 10, border: '1px solid var(--line)' }} /> : <div className="muted sm">Fotoğraf var (önizleme için storage yetkisi gerekir).</div>;
}
export const Rozet = ({ t = '', c = '' }: { t?: string; c?: string }) => <span className={'rozet ' + c}>{t}</span>;
export const RolRozeti = ({ rol }: { rol?: string | null }) => !rol ? null :
  <Rozet c={rol === 'super_admin' ? 'uyari' : rol === 'admin' ? 'bilgi' : ''} t={rol === 'super_admin' ? 'Süper yönetici' : rol === 'admin' ? 'Yönetici' : 'Moderatör'} />;
export const Bos = ({ m = 'Kayıt bulunamadı.' }: { m?: string }) => <div className="bos">{m}</div>;
export const Yukleniyor = () => <div className="yukleniyor">Yükleniyor…</div>;
export const HataKutusu = ({ m, yeniden }: { m: string; yeniden?: () => void }) => (
  <div className="hata-kutu row"><span className="grow">{m}</span>{yeniden && <button className="btn kucuk" onClick={yeniden}>Tekrar dene</button>}</div>
);
export function Sekmeler<T extends string>({ deger, sec, secenekler }: { deger: T; sec: (v: T) => void; secenekler: [T, string][] }) {
  return <div className="sekmeler" role="tablist">{secenekler.map(([k, e]) => <button key={k} role="tab" aria-selected={deger === k} className={'sekme' + (deger === k ? ' on' : '')} onClick={() => sec(k)}>{e}</button>)}</div>;
}
export function Sayfalama({ sayfa, sec, toplam, adet }: { sayfa: number; sec: (n: number) => void; toplam: number; adet: number }) {
  const son = Math.max(1, Math.ceil(toplam / adet));
  return (
    <div className="sayfalama">
      <span className="muted sm">{toplam.toLocaleString('tr-TR')} kayıt</span>
      <span className="right row">
        <button className="btn kucuk" disabled={sayfa <= 0} onClick={() => sec(sayfa - 1)}>Önceki</button>
        <span className="sm muted">{sayfa + 1} / {son}</span>
        <button className="btn kucuk" disabled={sayfa + 1 >= son} onClick={() => sec(sayfa + 1)}>Sonraki</button>
      </span>
    </div>
  );
}
export function SayfaBasligi({ baslik, alt, sag }: { baslik: string; alt?: string; sag?: ReactNode }) {
  return <div className="row wrap" style={{ marginBottom: 18 }}><div className="grow"><h1>{baslik}</h1>{alt && <div className="muted" style={{ marginTop: 2 }}>{alt}</div>}</div>{sag}</div>;
}
export function AramaKutusu({ deger, degis, yer }: { deger: string; degis: (v: string) => void; yer: string }) {
  return (
    <div style={{ position: 'relative', minWidth: 220, flex: 1, maxWidth: 360 }}>
      <span style={{ position: 'absolute', left: 11, top: 9, color: 'var(--muted)' }}><Ikon ad="ara" boyut={16} /></span>
      <input className="girdi" style={{ paddingLeft: 34 }} value={deger} onChange={(e) => degis(e.target.value)} placeholder={yer} />
    </div>
  );
}

export function Istatistik({ etiket, deger, simdi, once, ipucu }: { etiket: string; deger: number | string; simdi?: number; once?: number; ipucu?: string }) {
  const d = simdi !== undefined && once !== undefined ? DEGISIM(simdi, once) : null;
  return (
    <div className="kart istatistik" title={ipucu}>
      <span className="etiket">{etiket}</span>
      <span className="deger">{typeof deger === 'number' ? deger.toLocaleString('tr-TR') : deger}</span>
      {d !== null && <span className={'degisim ' + (d >= 0 ? 'art' : 'azal')}>{d >= 0 ? '▲' : '▼'} %{Math.abs(d)} <span className="muted" style={{ fontWeight: 400 }}>önceki 7 güne göre</span></span>}
    </div>
  );
}

/* ───── Grafikler (bağımlılıksız SVG) ───── */
export type Seri = { ad: string; renk: string; deger: number[] };
export function CizgiGrafik({ etiketler, seriler, yukseklik = 220 }: { etiketler: string[]; seriler: Seri[]; yukseklik?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = yukseklik, sol = 36, ust = 12, alt = 26, sag = 10;
  const maks = useMemo(() => Math.max(1, ...seriler.flatMap((s) => s.deger)), [seriler]);
  const yuvarla = (() => { const m = maks * 1.1; const b = Math.pow(10, Math.floor(Math.log10(m))); return Math.ceil(m / b) * b; })();
  const n = etiketler.length;
  const x = (i: number) => sol + (n <= 1 ? 0 : (i * (W - sol - sag)) / (n - 1));
  const y = (v: number) => ust + (H - ust - alt) * (1 - v / yuvarla);
  const adim = Math.max(1, Math.ceil(n / 7));
  return (
    <div>
      <div className="row wrap sm" style={{ marginBottom: 6 }}>{seriler.map((s) => <span key={s.ad} className="row" style={{ gap: 6 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: s.renk, display: 'inline-block' }} />{s.ad}</span>)}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Çizgi grafik" onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W; setHover(Math.max(0, Math.min(n - 1, Math.round(((px - sol) / (W - sol - sag)) * (n - 1))))); }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}><line x1={sol} x2={W - sag} y1={y(yuvarla * t)} y2={y(yuvarla * t)} stroke="var(--line)" strokeDasharray={t === 0 ? '' : '3 4'} />
            <text x={sol - 6} y={y(yuvarla * t) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">{Math.round(yuvarla * t)}</text></g>
        ))}
        {etiketler.map((e, i) => i % adim === 0 && <text key={i} x={x(i)} y={H - 7} textAnchor="middle" fontSize="10" fill="var(--muted)">{e}</text>)}
        {seriler.map((s) => (
          <g key={s.ad}>
            <path d={s.deger.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')} fill="none" stroke={s.renk} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
            {hover !== null && <circle cx={x(hover)} cy={y(s.deger[hover])} r="4" fill={s.renk} stroke="var(--panel)" strokeWidth="2" />}
          </g>
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={ust} y2={H - alt} stroke="var(--muted)" strokeOpacity=".4" />}
      </svg>
      {hover !== null && (
        <div className="row wrap sm" style={{ marginTop: 4 }}>
          <b>{etiketler[hover]}</b>{seriler.map((s) => <span key={s.ad} style={{ color: s.renk }}>{s.ad}: <b>{s.deger[hover]}</b></span>)}
        </div>
      )}
    </div>
  );
}

export function YatayCubuklar({ satirlar, renk = 'var(--accent)' }: { satirlar: { ad: string; deger: number }[]; renk?: string }) {
  const m = Math.max(1, ...satirlar.map((s) => s.deger));
  if (!satirlar.length) return <Bos m="Veri yok." />;
  return <div>{satirlar.map((s) => (
    <div key={s.ad} className="yatay-cubuk"><span style={{ width: 92 }} className="sm">{s.ad}</span>
      <span className="iz"><span className="dolgu" style={{ width: `${(s.deger / m) * 100}%`, background: renk }} /></span>
      <b className="sm" style={{ width: 44, textAlign: 'right' }}>{s.deger.toLocaleString('tr-TR')}</b></div>
  ))}</div>;
}

export function Halka({ parcalar }: { parcalar: { ad: string; deger: number; renk: string }[] }) {
  const toplam = parcalar.reduce((a, p) => a + p.deger, 0) || 1;
  let acc = 0; const R = 54, C = 2 * Math.PI * R;
  return (
    <div className="row wrap" style={{ gap: 18 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label="Dağılım">
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--panel2)" strokeWidth="18" />
        {parcalar.map((p) => { const uz = (p.deger / toplam) * C; const el = <circle key={p.ad} cx="70" cy="70" r={R} fill="none" stroke={p.renk} strokeWidth="18" strokeDasharray={`${uz} ${C - uz}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)" />; acc += uz; return el; })}
        <text x="70" y="68" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--text)">{toplam.toLocaleString('tr-TR')}</text>
        <text x="70" y="84" textAnchor="middle" fontSize="10" fill="var(--muted)">gönderi</text>
      </svg>
      <div className="col" style={{ gap: 6 }}>{parcalar.map((p) => <span key={p.ad} className="row sm" style={{ gap: 7 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: p.renk, display: 'inline-block' }} />{p.ad}<b>{p.deger}</b></span>)}</div>
    </div>
  );
}
