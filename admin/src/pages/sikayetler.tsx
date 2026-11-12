import { useState } from 'react';
import { rpc } from '../api';
import { goreli, kategori, kisalt, tarih, SEBEPLER } from '../format';
import { baglanti } from '../router';
import { Avatar, Bos, GonderiFoto, HataKutusu, Modal, OnayModal, Rozet, SayfaBasligi, Sayfalama, Sekmeler, Yukleniyor, useToast, useYukle } from '../ui';

export type SikayetSatir = { post_id: string; body: string; category: string; place: string | null; photo_path: string | null; post_created_at: string; removed_at: string | null;
  author_id: string; author_username: string; author_name: string; author_avatar: string | null; is_anonymous: boolean; report_count: number; open_count: number;
  reasons: Record<string, number>; first_report_at: string; last_report_at: string; total_count: number };
type Detay = { reporter_id: string; reporter_username: string; reason: string | null; status: string; created_at: string; handled_by_username: string | null; handled_at: string | null; handler_note: string | null; detail?: string | null };
const ADET = 20;

export function Sikayetler() {
  const [durum, setDurum] = useState<'open' | 'handled' | 'all'>('open');
  const [sayfa, setSayfa] = useState(0);
  const [sec, setSec] = useState<SikayetSatir | null>(null);
  const v = useYukle(() => rpc<SikayetSatir[]>('admin_reports', { p_status: durum, p_limit: ADET, p_offset: sayfa * ADET }), [durum, sayfa]);
  return (
    <>
      <SayfaBasligi baslik="Şikâyetler" alt="Gönderi bazında gruplanır; en çok şikâyet alan ve açık olanlar üstte." />
      <div className="row wrap" style={{ marginBottom: 14 }}>
        <Sekmeler deger={durum} sec={(d) => { setDurum(d); setSayfa(0); }} secenekler={[['open', 'Bekleyen'], ['handled', 'İşlenmiş'], ['all', 'Tümü']]} />
      </div>
      {v.hata && <HataKutusu m={v.hata} yeniden={v.yenile} />}
      <div className="kart p0">
        {v.yukleniyor && !v.veri ? <Yukleniyor /> : !v.veri?.length ? <Bos m={durum === 'open' ? 'Bekleyen şikâyet yok. 🎉' : 'Kayıt yok.'} /> : (
          <div className="tablo-kap"><table>
            <thead><tr><th>Gönderi</th><th>Yazar</th><th>Şikâyet</th><th>Nedenler</th><th>Son şikâyet</th><th /></tr></thead>
            <tbody>{v.veri.map((r) => (
              <tr key={r.post_id} className="tikla" onClick={() => setSec(r)}>
                <td style={{ maxWidth: 340 }}>
                  <div className="row" style={{ gap: 6 }}><Rozet t={kategori(r.category)} />{r.removed_at && <Rozet c="kotu" t="Kaldırıldı" />}{r.is_anonymous && <Rozet t="Anonim" />}</div>
                  <div style={{ marginTop: 5 }}>{kisalt(r.body, 110)}</div>
                </td>
                <td><div className="row"><Avatar ad={r.author_name} yol={r.author_avatar} /><div><div>{r.author_name}</div><div className="muted sm">@{r.author_username}</div></div></div></td>
                <td><Rozet c={r.open_count > 0 ? 'kotu' : 'ok'} t={`${r.open_count} açık / ${r.report_count}`} /></td>
                <td className="sm muted">{Object.entries(r.reasons).map(([k, n]) => `${k} (${n})`).join(', ')}</td>
                <td className="muted sm" title={tarih(r.last_report_at)}>{goreli(r.last_report_at)}</td>
                <td><button className="btn kucuk">İncele</button></td>
              </tr>))}</tbody>
          </table></div>
        )}
        {v.veri && v.veri.length > 0 && <Sayfalama sayfa={sayfa} sec={setSayfa} toplam={v.veri[0].total_count} adet={ADET} />}
      </div>
      {sec && <SikayetDetay satir={sec} kapat={() => setSec(null)} bitti={() => { setSec(null); v.yenile(); }} />}
    </>
  );
}

function SikayetDetay({ satir, kapat, bitti }: { satir: SikayetSatir; kapat: () => void; bitti: () => void }) {
  const toast = useToast();
  const d = useYukle(() => rpc<Detay[]>('admin_report_details', { p_post: satir.post_id }), [satir.post_id]);
  const [islem, setIslem] = useState<'kaldir' | 'reddet' | null>(null);
  const acik = satir.open_count > 0;
  return (
    <>
      <Modal baslik="Şikâyet incelemesi" kapat={kapat} genis alt={acik && !satir.removed_at ? <>
        <a className="btn" href={baglanti('/kullanicilar/' + satir.author_id)} onClick={kapat}>Yazarın profili</a>
        <button className="btn" onClick={() => setIslem('reddet')}>Şikâyetleri reddet</button>
        <button className="btn tehlike" onClick={() => setIslem('kaldir')}>Gönderiyi kaldır</button>
      </> : <a className="btn" href={baglanti('/kullanicilar/' + satir.author_id)} onClick={kapat}>Yazarın profili</a>}>
        <div className="row"><Avatar ad={satir.author_name} yol={satir.author_avatar} /><div className="grow"><b>{satir.author_name}</b> <span className="muted">@{satir.author_username}</span>
          <div className="muted sm">{tarih(satir.post_created_at)}{satir.place ? ` · ${satir.place}` : ''}</div></div><Rozet t={kategori(satir.category)} /></div>
        <div className="alinti">{satir.body}</div>
        <GonderiFoto yol={satir.photo_path} />
        <h3>Şikâyetler ({satir.report_count})</h3>
        {d.yukleniyor && !d.veri ? <Yukleniyor /> : (
          <div className="col" style={{ gap: 8 }}>{d.veri?.map((r, i) => (
            <div key={i} className="sol-cizgi"><div className="row wrap"><b>@{r.reporter_username}</b><Rozet t={r.reason || 'Belirtilmedi'} />
              <Rozet c={r.status === 'open' ? 'uyari' : r.status === 'actioned' ? 'ok' : ''} t={r.status === 'open' ? 'Açık' : r.status === 'actioned' ? 'İşlem yapıldı' : 'Reddedildi'} />
              <span className="muted sm right">{tarih(r.created_at)}</span></div>
              {r.detail && <div className="sm" style={{ marginTop: 4 }}>“{r.detail}”</div>}
              {r.handled_by_username && <div className="muted sm">@{r.handled_by_username} · {tarih(r.handled_at)}{r.handler_note ? ` · “${r.handler_note}”` : ''}</div>}</div>))}</div>
        )}
      </Modal>
      {islem === 'kaldir' && <OnayModal baslik="Gönderiyi kaldır" tehlikeli onayEtiketi="Kaldır" nedenIste kisayollar={SEBEPLER}
        aciklama="Gönderi akıştan ve haritadan çıkar, açık şikâyetler “işlem yapıldı” olur ve yazara nedenle birlikte bildirim gider. Geri alınabilir."
        onayla={async (n) => { await rpc('admin_remove_post', { p_post: satir.post_id, p_reason: n }); toast('Gönderi kaldırıldı'); bitti(); }} kapat={() => setIslem(null)} />}
      {islem === 'reddet' && <OnayModal baslik="Şikâyetleri reddet" onayEtiketi="Reddet" aciklama="Gönderi yayında kalır; açık şikâyetler “reddedildi” olarak işaretlenir."
        nedenIste={false}
        onayla={async () => { await rpc('admin_dismiss_reports', { p_post: satir.post_id, p_note: null }); toast('Şikâyetler reddedildi'); bitti(); }} kapat={() => setIslem(null)} />}
    </>
  );
}
