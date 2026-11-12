import { useState } from 'react';
import { rpc } from '../api';
import { goreli, tarih } from '../format';
import { baglanti } from '../router';
import { Avatar, Bos, HataKutusu, OnayModal, Rozet, SayfaBasligi, Sayfalama, Sekmeler, Yukleniyor, useToast, useYukle } from '../ui';

type Satir = { user_id: string; username: string; display_name: string; avatar_path: string | null; report_count: number; open_count: number;
  reasons: Record<string, number>; details: string[]; last_report_at: string; total_count: number };
const ADET = 20;

/** Kullanıcıların profil şikâyetleri (kişi bazında gruplu). Yaptırım için kullanıcı sayfasından uyarı/askı/yasak uygulanır. */
export function ProfilSikayetleri() {
  const toast = useToast();
  const [durum, setDurum] = useState<'open' | 'handled' | 'all'>('open');
  const [sayfa, setSayfa] = useState(0);
  const [reddet, setReddet] = useState<Satir | null>(null);
  const v = useYukle(() => rpc<Satir[]>('admin_user_reports', { p_status: durum, p_limit: ADET, p_offset: sayfa * ADET }), [durum, sayfa]);
  return (
    <>
      <SayfaBasligi baslik="Profil şikâyetleri" alt="Kişi bazında gruplanır. Yaptırım için kullanıcı sayfasından uyarı, askı veya yasak uygula." />
      <div className="row wrap" style={{ marginBottom: 14 }}>
        <Sekmeler deger={durum} sec={(d) => { setDurum(d); setSayfa(0); }} secenekler={[['open', 'Bekleyen'], ['handled', 'İşlenmiş'], ['all', 'Tümü']]} />
      </div>
      {v.hata && <HataKutusu m={v.hata} yeniden={v.yenile} />}
      <div className="kart p0">
        {v.yukleniyor && !v.veri ? <Yukleniyor /> : !v.veri?.length ? <Bos m={durum === 'open' ? 'Bekleyen profil şikâyeti yok.' : 'Kayıt yok.'} /> : (
          <div className="tablo-kap"><table>
            <thead><tr><th>Kullanıcı</th><th>Şikâyet</th><th>Nedenler</th><th>Notlar</th><th>Son şikâyet</th><th /></tr></thead>
            <tbody>{v.veri.map((r) => (
              <tr key={r.user_id}>
                <td><div className="row"><Avatar ad={r.display_name} yol={r.avatar_path} /><div><div>{r.display_name}</div><div className="muted sm">@{r.username}</div></div></div></td>
                <td><Rozet c={r.open_count > 0 ? 'kotu' : 'ok'} t={`${r.open_count} açık / ${r.report_count}`} /></td>
                <td className="sm muted">{Object.entries(r.reasons).map(([k, n]) => `${k} (${n})`).join(', ')}</td>
                <td className="sm muted" style={{ maxWidth: 280 }}>{r.details.length ? r.details.slice(0, 3).map((d) => `“${d}”`).join(' · ') : '—'}</td>
                <td className="muted sm" title={tarih(r.last_report_at)}>{goreli(r.last_report_at)}</td>
                <td><div className="row" style={{ gap: 6 }}>
                  <a className="btn kucuk" href={baglanti('/kullanicilar/' + r.user_id)}>Profil / yaptırım</a>
                  {r.open_count > 0 && <button className="btn kucuk" onClick={() => setReddet(r)}>Reddet</button>}
                </div></td>
              </tr>))}</tbody>
          </table></div>
        )}
        {v.veri && v.veri.length > 0 && <Sayfalama sayfa={sayfa} sec={setSayfa} toplam={v.veri[0].total_count} adet={ADET} />}
      </div>
      {reddet && <OnayModal baslik="Şikâyetleri reddet" onayEtiketi="Reddet" nedenIste={false}
        aciklama={`@${reddet.username} hakkındaki açık şikâyetler “reddedildi” olarak işaretlenir.`}
        onayla={async () => { await rpc('admin_dismiss_user_reports', { p_user: reddet.user_id, p_note: null }); toast('Şikâyetler reddedildi'); setReddet(null); v.yenile(); }}
        kapat={() => setReddet(null)} />}
    </>
  );
}
