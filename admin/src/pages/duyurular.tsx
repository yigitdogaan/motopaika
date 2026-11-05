import { useState } from 'react';
import { duyurulariGetir, rpc, type Duyuru } from '../api';
import { tarih } from '../format';
import { Bos, HataKutusu, Modal, OnayModal, Rozet, SayfaBasligi, Yukleniyor, hataMetniK, useToast, useYukle } from '../ui';

const SEV: Record<string, [string, string]> = { info: ['Bilgi', 'bilgi'], warning: ['Uyarı', 'uyari'], critical: ['Kritik', 'kotu'] };

export function Duyurular() {
  const v = useYukle(duyurulariGetir, []);
  const [duzen, setDuzen] = useState<Partial<Duyuru> | null>(null);
  const [sil, setSil] = useState<Duyuru | null>(null);
  const toast = useToast();
  return (
    <>
      <SayfaBasligi baslik="Duyurular" alt="Aktif duyurular uygulamada akışın üstünde banner olarak görünür." sag={<button className="btn birincil" onClick={() => setDuzen({ level: 'info', active: true })}>Yeni duyuru</button>} />
      {v.hata && <HataKutusu m={v.hata} yeniden={v.yenile} />}
      {v.yukleniyor && !v.veri ? <Yukleniyor /> : !v.veri?.length ? <div className="kart"><Bos m="Henüz duyuru yok." /></div> : (
        <div className="col">{v.veri.map((d) => (
          <div key={d.id} className={'duyuru ' + d.level} style={{ opacity: d.active ? 1 : 0.55 }}>
            <div className="row wrap"><b>{d.title}</b><Rozet c={SEV[d.level][1]} t={SEV[d.level][0]} />{d.active ? <Rozet c="ok" t="Yayında" /> : <Rozet t="Kapalı" />}
              <span className="muted sm">{tarih(d.starts_at)}{d.ends_at ? ` → ${tarih(d.ends_at)}` : ''}</span>
              <span className="right row"><button className="btn kucuk" onClick={() => setDuzen(d)}>Düzenle</button>
                <button className="btn kucuk" onClick={async () => { try { await rpc('admin_announcement_save', { p_id: d.id, p_title: d.title, p_body: d.body, p_level: d.level, p_active: !d.active, p_ends_at: d.ends_at }); v.yenile(); } catch (e) { toast(hataMetniK(e), true); } }}>{d.active ? 'Kapat' : 'Yayınla'}</button>
                <button className="btn kucuk tehlike" onClick={() => setSil(d)}>Sil</button></span></div>
            <div style={{ marginTop: 6 }}>{d.body}</div></div>))}</div>
      )}
      {duzen && <Form d={duzen} kapat={() => setDuzen(null)} bitti={() => { setDuzen(null); toast('Duyuru kaydedildi'); v.yenile(); }} />}
      {sil && <OnayModal baslik="Duyuruyu sil" tehlikeli onayEtiketi="Sil" aciklama={`“${sil.title}” kalıcı olarak silinecek.`}
        onayla={async () => { await rpc('admin_announcement_delete', { p_id: sil.id }); toast('Duyuru silindi'); v.yenile(); }} kapat={() => setSil(null)} />}
    </>
  );
}

function Form({ d, kapat, bitti }: { d: Partial<Duyuru>; kapat: () => void; bitti: () => void }) {
  const [baslik, setBaslik] = useState(d.title ?? '');
  const [metin, setMetin] = useState(d.body ?? '');
  const [seviye, setSeviye] = useState(d.level ?? 'info');
  const [aktif, setAktif] = useState(d.active ?? true);
  const [bitis, setBitis] = useState(d.ends_at ? d.ends_at.slice(0, 16) : '');
  const [hata, setHata] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState(false);
  const kaydet = async () => {
    setMesgul(true); setHata(null);
    try {
      await rpc('admin_announcement_save', { p_id: d.id ?? null, p_title: baslik, p_body: metin, p_level: seviye, p_active: aktif, p_ends_at: bitis ? new Date(bitis).toISOString() : null });
      bitti();
    } catch (e) { setHata(hataMetniK(e)); setMesgul(false); }
  };
  return (
    <Modal baslik={d.id ? 'Duyuruyu düzenle' : 'Yeni duyuru'} kapat={kapat} alt={<><button className="btn" onClick={kapat}>Vazgeç</button>
      <button className="btn birincil" onClick={kaydet} disabled={mesgul || !baslik.trim() || !metin.trim()}>{mesgul ? 'Kaydediliyor…' : 'Kaydet'}</button></>}>
      <label className="alan">Başlık ({baslik.length}/80)<input className="girdi" maxLength={80} value={baslik} onChange={(e) => setBaslik(e.target.value)} autoFocus /></label>
      <label className="alan">Metin ({metin.length}/500)<textarea className="girdi" maxLength={500} value={metin} onChange={(e) => setMetin(e.target.value)} /></label>
      <div className="row wrap">
        <label className="alan grow">Seviye<select className="girdi" value={seviye} onChange={(e) => setSeviye(e.target.value as Duyuru['level'])}><option value="info">Bilgi</option><option value="warning">Uyarı</option><option value="critical">Kritik</option></select></label>
        <label className="alan grow">Bitiş (isteğe bağlı)<input className="girdi" type="datetime-local" value={bitis} onChange={(e) => setBitis(e.target.value)} /></label></div>
      <label className="row"><input type="checkbox" checked={aktif} onChange={(e) => setAktif(e.target.checked)} /> Hemen yayında olsun</label>
      {hata && <div className="hata-kutu">{hata}</div>}
    </Modal>
  );
}
