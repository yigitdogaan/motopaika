import { useState } from 'react';
import { rpc, ROL_AD, ROL_SIRA, type Rol } from '../api';
import { gunTarih } from '../format';
import { Bos, HataKutusu, Modal, OnayModal, RolRozeti, SayfaBasligi, Yukleniyor, hataMetniK, useToast, useYukle } from '../ui';

type Satir = { user_id: string; username: string; display_name: string; email: string | null; role: Rol; created_at: string; created_by_username: string | null };

export function Yetkililer({ rol }: { rol: Rol }) {
  const v = useYukle(() => rpc<Satir[]>('admin_staff_list'), []);
  const toast = useToast();
  const sup = rol === 'super_admin';
  const [ekle, setEkle] = useState(false);
  const [kaldir, setKaldir] = useState<Satir | null>(null);
  const [degis, setDegis] = useState<Satir | null>(null);
  return (
    <>
      <SayfaBasligi baslik="Yetkililer" alt="Roller: Moderatör (içerik inceleme, kısa askıya alma) → Yönetici (yasak, duyuru, denetim günlüğü) → Süper yönetici (yetkili yönetimi)."
        sag={sup ? <button className="btn birincil" onClick={() => setEkle(true)}>Yetkili ekle</button> : undefined} />
      {!sup && <div className="duyuru info sm" style={{ marginBottom: 14 }}>Yetkili ekleme ve düzenleme yalnızca süper yöneticiye açıktır.</div>}
      {v.hata && <HataKutusu m={v.hata} yeniden={v.yenile} />}
      <div className="kart p0">
        {v.yukleniyor && !v.veri ? <Yukleniyor /> : !v.veri?.length ? <Bos /> : (
          <div className="tablo-kap"><table>
            <thead><tr><th>Kişi</th><th>Rol</th><th>Ekleyen</th><th>Tarih</th>{sup && <th />}</tr></thead>
            <tbody>{v.veri.map((s) => (
              <tr key={s.user_id}>
                <td><div>{s.display_name}</div><div className="muted sm">@{s.username}{s.email ? ` · ${s.email}` : ''}</div></td>
                <td><RolRozeti rol={s.role} /></td><td className="muted">{s.created_by_username ? `@${s.created_by_username}` : '—'}</td><td className="muted sm">{gunTarih(s.created_at)}</td>
                {sup && <td className="row" style={{ justifyContent: 'flex-end' }}><button className="btn kucuk" onClick={() => setDegis(s)}>Rolü değiştir</button><button className="btn kucuk tehlike" onClick={() => setKaldir(s)}>Kaldır</button></td>}
              </tr>))}</tbody></table></div>
        )}
      </div>
      {ekle && <RolFormu baslik="Yetkili ekle" kapat={() => setEkle(false)} bitti={() => { setEkle(false); toast('Yetkili eklendi'); v.yenile(); }} />}
      {degis && <RolFormu baslik={`Rolü değiştir — @${degis.username}`} kullanici={degis.username} baslangic={degis.role} kapat={() => setDegis(null)} bitti={() => { setDegis(null); toast('Rol güncellendi'); v.yenile(); }} />}
      {kaldir && <OnayModal baslik="Yetkiyi kaldır" tehlikeli onayEtiketi="Kaldır" aciklama={`@${kaldir.username} artık panele giremeyecek.`}
        onayla={async () => { await rpc('admin_staff_remove', { p_user: kaldir.user_id }); toast('Yetki kaldırıldı'); v.yenile(); }} kapat={() => setKaldir(null)} />}
      <div className="kart" style={{ marginTop: 14 }}><h3 style={{ marginBottom: 8 }}>Rol yetkileri</h3>
        <div className="tablo-kap"><table><thead><tr><th>Yetenek</th>{(['moderator', 'admin', 'super_admin'] as Rol[]).map((r) => <th key={r}>{ROL_AD[r]}</th>)}</tr></thead><tbody>
          {([['Şikâyet inceleme, gönderi/yorum kaldırma', 1], ['Uyarı ve en fazla 7 gün askıya alma', 1], ['7 günden uzun askıya alma, kalıcı yasak, yaptırım kaldırma', 2], ['Kullanıcı e-postalarını görme', 2], ['Duyuru yönetimi, denetim günlüğü', 2], ['Yetkili ekleme / çıkarma / rol değiştirme', 3]] as [string, number][]).map(([y, m]) => (
            <tr key={y}><td>{y}</td>{(['moderator', 'admin', 'super_admin'] as Rol[]).map((r) => <td key={r}>{ROL_SIRA[r] >= m ? '✓' : <span className="muted">—</span>}</td>)}</tr>))}</tbody></table></div></div>
    </>
  );
}

function RolFormu({ baslik, kullanici, baslangic, kapat, bitti }: { baslik: string; kullanici?: string; baslangic?: Rol; kapat: () => void; bitti: () => void }) {
  const [ad, setAd] = useState(kullanici ?? '');
  const [rol, setRol] = useState<Rol>(baslangic ?? 'moderator');
  const [hata, setHata] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState(false);
  const kaydet = async () => { setMesgul(true); setHata(null); try { await rpc('admin_staff_set', { p_username: ad.replace(/^@/, ''), p_role: rol }); bitti(); } catch (e) { setHata(hataMetniK(e)); setMesgul(false); } };
  return (
    <Modal baslik={baslik} kapat={kapat} alt={<><button className="btn" onClick={kapat}>Vazgeç</button><button className="btn birincil" onClick={kaydet} disabled={mesgul || !ad.trim()}>{mesgul ? 'Kaydediliyor…' : 'Kaydet'}</button></>}>
      <label className="alan">Kullanıcı adı<input className="girdi" value={ad} onChange={(e) => setAd(e.target.value)} disabled={!!kullanici} placeholder="@kullaniciadi" autoFocus /></label>
      <label className="alan">Rol<select className="girdi" value={rol} onChange={(e) => setRol(e.target.value as Rol)}>{(['moderator', 'admin', 'super_admin'] as Rol[]).map((r) => <option key={r} value={r}>{ROL_AD[r]}</option>)}</select></label>
      {hata && <div className="hata-kutu">{hata}</div>}
    </Modal>
  );
}
