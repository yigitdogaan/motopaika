import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import './styles.css';
import { Kabuk } from './kabuk';
import { Giris } from './pages/giris';
import { ToastSaglayici } from './ui';
import { benimRolum, oturumDinle, oturumVarMi, type Rol } from './api';

function Uygulama() {
  const [, tazele] = useState(0);
  const [rol, setRol] = useState<Rol | null | undefined>(undefined);
  useEffect(() => oturumDinle(() => tazele((n) => n + 1)), []);
  const var_ = oturumVarMi();
  useEffect(() => {
    if (!var_) { setRol(undefined); return; }
    let iptal = false;
    benimRolum().then((r) => !iptal && setRol(r)).catch(() => !iptal && setRol(null));
    return () => { iptal = true; };
  }, [var_]);
  useEffect(() => {
    const t = localStorage.getItem('tema');
    if (t) document.documentElement.dataset.theme = t;
  }, []);
  if (!var_) return <Giris />;
  if (rol === undefined) return <div className="yukleniyor">Yetkin kontrol ediliyor…</div>;
  if (rol === null) return <Giris yetkisiz />;
  return <Kabuk rol={rol} />;
}

createRoot(document.getElementById('kok')!).render(<ToastSaglayici><Uygulama /></ToastSaglayici>);
