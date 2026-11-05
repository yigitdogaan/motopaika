import { useEffect, useState } from 'react';
import { DEMO, ROL_AD, ROL_SIRA, cikisYap, oturumEmail, rpc, type Rol } from './api';
import { baglanti, useYol } from './router';
import { Ikon } from './ui/ikon';
import { Genel } from './pages/genel';
import { Sikayetler } from './pages/sikayetler';
import { Gonderiler } from './pages/gonderiler';
import { Kullanicilar, KullaniciDetay } from './pages/kullanicilar';
import { Surusler } from './pages/surusler';
import { Duyurular } from './pages/duyurular';
import { Yetkililer } from './pages/yetkililer';
import { Denetim } from './pages/denetim';

type Oge = { yol: string; ad: string; ikon: string; min: Rol; rozet?: boolean };
const OGELER: Oge[] = [
  { yol: '/', ad: 'Genel bakış', ikon: 'ana', min: 'moderator' },
  { yol: '/sikayetler', ad: 'Şikâyetler', ikon: 'bayrak', min: 'moderator', rozet: true },
  { yol: '/gonderiler', ad: 'Gönderiler', ikon: 'yazi', min: 'moderator' },
  { yol: '/kullanicilar', ad: 'Kullanıcılar', ikon: 'kisi', min: 'moderator' },
  { yol: '/surusler', ad: 'Sürüşler', ikon: 'yol', min: 'moderator' },
  { yol: '/duyurular', ad: 'Duyurular', ikon: 'mikrofon', min: 'admin' },
  { yol: '/yetkililer', ad: 'Yetkililer', ikon: 'kalkan', min: 'admin' },
  { yol: '/denetim', ad: 'Denetim günlüğü', ikon: 'defter', min: 'admin' },
];

export function Kabuk({ rol }: { rol: Rol }) {
  const { yol, parcalar } = useYol();
  const [acik, setAcik] = useState(false);
  const [acik_sikayet, setSik] = useState(0);
  const [tema, setTema] = useState(document.documentElement.dataset.theme ?? 'dark');
  useEffect(() => { setAcik(false); window.scrollTo(0, 0); }, [yol]);
  useEffect(() => {
    let iptal = false;
    const getir = () => rpc<{ reports_open: number }>('admin_stats').then((s) => !iptal && setSik(s.reports_open)).catch(() => {});
    getir(); const t = setInterval(getir, 60_000);
    return () => { iptal = true; clearInterval(t); };
  }, [yol]);
  const temaDegis = () => { const y = tema === 'dark' ? 'light' : 'dark'; setTema(y); document.documentElement.dataset.theme = y; try { localStorage.setItem('tema', y); } catch { /* yok say */ } };

  const bolum = '/' + (parcalar[0] ?? '');
  const ogeler = OGELER.filter((o) => ROL_SIRA[rol] >= ROL_SIRA[o.min]);
  const aktif = OGELER.find((o) => o.yol === bolum) ?? OGELER[0];
  const erisim = ROL_SIRA[rol] >= ROL_SIRA[aktif.min];

  let sayfa;
  if (!erisim) sayfa = <div className="kart bos">Bu bölüm için yetkin yok ({ROL_AD[aktif.min]} ve üstü).</div>;
  else if (bolum === '/sikayetler') sayfa = <Sikayetler />;
  else if (bolum === '/gonderiler') sayfa = <Gonderiler />;
  else if (bolum === '/kullanicilar') sayfa = parcalar[1] ? <KullaniciDetay id={parcalar[1]} rol={rol} /> : <Kullanicilar />;
  else if (bolum === '/surusler') sayfa = <Surusler />;
  else if (bolum === '/duyurular') sayfa = <Duyurular />;
  else if (bolum === '/yetkililer') sayfa = <Yetkililer rol={rol} />;
  else if (bolum === '/denetim') sayfa = <Denetim />;
  else sayfa = <Genel />;

  return (
    <>
      {DEMO && <div className="demo-bant">DEMO MODU — sahte veri gösteriliyor. Gerçek veri için .env dosyasını doldur.</div>}
      <div className="kabuk">
        <aside className={'yan' + (acik ? ' acik' : '')} onClick={() => setAcik(false)}>
          <div className="marka"><i>R</i> Roteri Yönetim</div>
          {ogeler.map((o) => (
            <a key={o.yol} href={baglanti(o.yol)} className={'menu' + (o.yol === aktif.yol ? ' on' : '')}>
              <Ikon ad={o.ikon} /> {o.ad}
              {o.rozet && acik_sikayet > 0 && <span className="sayi">{acik_sikayet}</span>}
            </a>
          ))}
          <div className="alt">
            <div className="sm muted" style={{ padding: '0 6px' }}>{oturumEmail()}<br /><b style={{ color: 'var(--accent)' }}>{ROL_AD[rol]}</b></div>
            <button className="menu" onClick={temaDegis}><Ikon ad={tema === 'dark' ? 'gunes' : 'ay'} /> {tema === 'dark' ? 'Açık tema' : 'Koyu tema'}</button>
            <button className="menu" onClick={cikisYap}><Ikon ad="cikis" /> Çıkış yap</button>
          </div>
        </aside>
        <div className="ana">
          <header className="ust">
            <button className="btn hayalet kucuk menu-dugme" onClick={() => setAcik(true)} aria-label="Menüyü aç"><Ikon ad="menu" /></button>
            <b>{aktif.ad}</b>
          </header>
          <main className="icerik">{sayfa}</main>
        </div>
      </div>
    </>
  );
}
