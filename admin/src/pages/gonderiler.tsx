import { useState } from 'react';
import { rpc, ROL_SIRA, type Rol } from '../api';
import { KATEGORI, goreli, kategori, kisalt, tarih, SEBEPLER } from '../format';
import { baglanti } from '../router';
import { Avatar, AramaKutusu, Bos, GonderiFoto, HataKutusu, Modal, OnayModal, Rozet, SayfaBasligi, Sayfalama, Sekmeler, Yukleniyor, useDebounce, useToast, useYukle } from '../ui';

type Satir = { id: string; body: string; category: string; place: string | null; photo_path: string | null; is_anonymous: boolean; created_at: string; removed_at: string | null; removed_reason: string | null;
  author_id: string; author_username: string; author_name: string; author_avatar: string | null; report_count: number; open_reports: number; comment_count: number; salute_count: number; total_count: number };
type Yorum = { id: string; author_id: string; author_username: string; author_name: string; body: string; created_at: string };
const ADET = 25;

export function Gonderiler() {
  const [ara, setAra] = useState('');
  const q = useDebounce(ara);
  const [kat, setKat] = useState('');
  const [durum, setDurum] = useState('all');
  const [sayfa, setSayfa] = useState(0);
  const [sec, setSec] = useState<Satir | null>(null);
  const v = useYukle(() => rpc<Satir[]>('admin_posts', { p_search: q, p_category: kat, p_state: durum, p_limit: ADET, p_offset: sayfa * ADET }), [q, kat, durum, sayfa]);
  return (
    <>
      <SayfaBasligi baslik="Gönderiler" alt="Tüm gönderilerde ara, süz; kaldır ya da geri al. Anonim gönderilerde yazar yalnız yetkililere görünür." />
      <div className="row wrap" style={{ marginBottom: 14 }}>
        <AramaKutusu deger={ara} degis={(x) => { setAra(x); setSayfa(0); }} yer="Metin, yer ya da kullanıcı ara…" />
        <select className="girdi" style={{ width: 160 }} value={kat} onChange={(e) => { setKat(e.target.value); setSayfa(0); }} aria-label="Kategori">
          <option value="">Tüm kategoriler</option>{Object.entries(KATEGORI).map(([k, a]) => <option key={k} value={k}>{a}</option>)}</select>
        <Sekmeler deger={durum} sec={(d) => { setDurum(d); setSayfa(0); }} secenekler={[['all', 'Tümü'], ['visible', 'Yayında'], ['removed', 'Kaldırılan'], ['reported', 'Şikâyetli'], ['anonymous', 'Anonim']]} />
      </div>
      {v.hata && <HataKutusu m={v.hata} yeniden={v.yenile} />}
      <div className="kart p0">
        {v.yukleniyor && !v.veri ? <Yukleniyor /> : !v.veri?.length ? <Bos /> : (
          <div className="tablo-kap"><table>
            <thead><tr><th>Gönderi</th><th>Yazar</th><th>Etkileşim</th><th>Şikâyet</th><th>Tarih</th></tr></thead>
            <tbody>{v.veri.map((g) => (
              <tr key={g.id} className="tikla" onClick={() => setSec(g)} style={g.removed_at ? { opacity: 0.6 } : undefined}>
                <td style={{ maxWidth: 380 }}><div className="row" style={{ gap: 6 }}><Rozet t={kategori(g.category)} />{g.removed_at && <Rozet c="kotu" t="Kaldırıldı" />}{g.is_anonymous && <Rozet t="Anonim" />}{g.photo_path && <Rozet t="Fotoğraf" />}</div>
                  <div style={{ marginTop: 5 }}>{kisalt(g.body, 120)}</div></td>
                <td><div className="row"><Avatar ad={g.author_name} yol={g.author_avatar} /><span>@{g.author_username}</span></div></td>
                <td className="sm muted">{g.salute_count} selam · {g.comment_count} yorum</td>
                <td>{g.report_count > 0 ? <Rozet c={g.open_reports > 0 ? 'kotu' : ''} t={`${g.report_count}`} /> : <span className="muted">—</span>}</td>
                <td className="muted sm" title={tarih(g.created_at)}>{goreli(g.created_at)}</td>
              </tr>))}</tbody></table></div>
        )}
        {v.veri && v.veri.length > 0 && <Sayfalama sayfa={sayfa} sec={setSayfa} toplam={v.veri[0].total_count} adet={ADET} />}
      </div>
      {sec && <GonderiDetay g={sec} kapat={() => setSec(null)} bitti={() => { setSec(null); v.yenile(); }} />}
    </>
  );
}

function GonderiDetay({ g, kapat, bitti }: { g: Satir; kapat: () => void; bitti: () => void }) {
  const toast = useToast();
  const y = useYukle(() => rpc<Yorum[]>('admin_post_comments', { p_post: g.id }), [g.id]);
  const [islem, setIslem] = useState<'kaldir' | 'geri' | null>(null);
  const [yorumSil, setYorumSil] = useState<Yorum | null>(null);
  return (
    <>
      <Modal baslik="Gönderi" kapat={kapat} genis alt={<>
        <a className="btn" href={baglanti('/kullanicilar/' + g.author_id)} onClick={kapat}>Yazarın profili</a>
        {g.removed_at ? <button className="btn birincil" onClick={() => setIslem('geri')}>Geri al</button> : <button className="btn tehlike" onClick={() => setIslem('kaldir')}>Gönderiyi kaldır</button>}
      </>}>
        <div className="row"><Avatar ad={g.author_name} yol={g.author_avatar} /><div className="grow"><b>{g.author_name}</b> <span className="muted">@{g.author_username}</span>
          <div className="muted sm">{tarih(g.created_at)}{g.place ? ` · ${g.place}` : ''}</div></div><Rozet t={kategori(g.category)} />{g.is_anonymous && <Rozet t="Anonim" />}</div>
        {g.removed_at && <div className="hata-kutu">Kaldırıldı ({tarih(g.removed_at)}): {g.removed_reason}</div>}
        <div className="alinti">{g.body}</div>
        <GonderiFoto yol={g.photo_path} />
        <h3>Yorumlar ({g.comment_count})</h3>
        {y.yukleniyor && !y.veri ? <Yukleniyor /> : !y.veri?.length ? <div className="muted">Yorum yok.</div> : (
          <div className="col" style={{ gap: 8 }}>{y.veri.map((c) => (
            <div key={c.id} className="sol-cizgi row"><div className="grow"><b>@{c.author_username}</b> <span className="muted sm">{goreli(c.created_at)}</span><div style={{ wordBreak: 'break-word' }}>{c.body}</div></div>
              <button className="btn kucuk tehlike" onClick={() => setYorumSil(c)}>Sil</button></div>))}</div>
        )}
      </Modal>
      {islem === 'kaldir' && <OnayModal baslik="Gönderiyi kaldır" tehlikeli onayEtiketi="Kaldır" nedenIste kisayollar={SEBEPLER} aciklama="Gönderi akıştan çıkar ve yazara nedenle birlikte bildirim gider."
        onayla={async (n) => { await rpc('admin_remove_post', { p_post: g.id, p_reason: n }); toast('Gönderi kaldırıldı'); bitti(); }} kapat={() => setIslem(null)} />}
      {islem === 'geri' && <OnayModal baslik="Gönderiyi geri al" onayEtiketi="Geri al" aciklama="Gönderi yeniden akışta görünür."
        onayla={async () => { await rpc('admin_restore_post', { p_post: g.id }); toast('Gönderi geri alındı'); bitti(); }} kapat={() => setIslem(null)} />}
      {yorumSil && <OnayModal baslik="Yorumu sil" tehlikeli onayEtiketi="Sil" nedenIste nedenEtiketi="Silme nedeni (denetim günlüğüne yazılır)" kisayollar={SEBEPLER}
        aciklama={<>“{kisalt(yorumSil.body, 140)}” — @{yorumSil.author_username}</>}
        onayla={async (n) => { await rpc('admin_delete_comment', { p_comment: yorumSil.id, p_reason: n }); toast('Yorum silindi'); y.yenile(); }} kapat={() => setYorumSil(null)} />}
    </>
  );
}
export type { Rol };
void ROL_SIRA;
