import { Logo } from '../ui/logo';
import { useState } from 'react';
import { DEMO, cikisYap, girisYap, hataMetni } from '../api';

export function Giris({ yetkisiz }: { yetkisiz?: boolean }) {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState(false);
  const gonder = async (e: React.FormEvent) => {
    e.preventDefault(); setMesgul(true); setHata(null);
    try { await girisYap(email.trim(), sifre); } catch (x) { setHata(hataMetni(x)); setMesgul(false); }
  };
  if (yetkisiz) {
    return (
      <div className="giris"><div className="kart col">
        <h2>Yetkin yok</h2>
        <p className="muted" style={{ margin: 0 }}>Bu hesap yönetim paneli için yetkilendirilmemiş. Bir süper yönetici seni “Yetkililer” bölümünden eklemeli.</p>
        <button className="btn" onClick={cikisYap}>Çıkış yap</button>
      </div></div>
    );
  }
  return (
    <div className="giris">
      <form className="kart col" onSubmit={gonder}>
        <div className="col" style={{ gap: 6 }}><Logo yukseklik={26} /><div><h2>Yönetim</h2><div className="muted sm">Yalnız yetkili hesaplar</div></div></div>
        {DEMO && <div className="duyuru warning sm">Demo modu: .env tanımlı değil. Herhangi bir e-posta/şifreyle girebilirsin.</div>}
        <label className="alan">E-posta<input className="girdi" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required={!DEMO} autoFocus /></label>
        <label className="alan">Şifre<input className="girdi" type="password" autoComplete="current-password" value={sifre} onChange={(e) => setSifre(e.target.value)} required={!DEMO} /></label>
        {hata && <div className="hata-kutu">{hata}</div>}
        <button className="btn birincil" disabled={mesgul}>{mesgul ? 'Giriş yapılıyor…' : 'Giriş yap'}</button>
      </form>
    </div>
  );
}
