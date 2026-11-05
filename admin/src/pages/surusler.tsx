import { useState } from 'react';
import { rpc } from '../api';
import { goreli, kisalt, tarih } from '../format';
import { baglanti } from '../router';
import { Bos, HataKutusu, Rozet, SayfaBasligi, Sayfalama, Sekmeler, Yukleniyor, useYukle } from '../ui';

type Satir = { post_id: string; body: string; place: string | null; city: string | null; ride_type: string | null; starts_at: string | null; created_at: string; state: string; removed_at: string | null;
  owner_id: string; owner_username: string; owner_name: string; accepted: number; pending: number; declined: number; room_id: string | null; member_count: number; total_count: number };
const ADET = 25;
const DURUM: Record<string, [string, string]> = { active: ['Şu an', 'ok'], planned: ['Planlı', 'bilgi'], past: ['Geçmiş', ''], removed: ['Kaldırıldı', 'kotu'] };
const TUR: Record<string, string> = { gezi: 'Gezi', kahvalti: 'Kahvaltı', gece: 'Gece sürüşü', tur: 'Tur', pist: 'Pist' };

export function Surusler() {
  const [d, setD] = useState('active');
  const [sayfa, setSayfa] = useState(0);
  const v = useYukle(() => rpc<Satir[]>('admin_rides', { p_state: d, p_limit: ADET, p_offset: sayfa * ADET }), [d, sayfa]);
  return (
    <>
      <SayfaBasligi baslik="Sürüşler" alt="Sürüş gönderileri, katılım istekleri ve grup sohbetleri. Sürüş içeriği Gönderiler bölümünden kaldırılabilir." />
      <div style={{ marginBottom: 14 }}><Sekmeler deger={d} sec={(x) => { setD(x); setSayfa(0); }} secenekler={[['active', 'Şu an'], ['planned', 'Planlı'], ['past', 'Geçmiş'], ['removed', 'Kaldırılan'], ['all', 'Tümü']]} /></div>
      {v.hata && <HataKutusu m={v.hata} yeniden={v.yenile} />}
      <div className="kart p0">
        {v.yukleniyor && !v.veri ? <Yukleniyor /> : !v.veri?.length ? <Bos /> : (
          <div className="tablo-kap"><table>
            <thead><tr><th>Sürüş</th><th>Düzenleyen</th><th>Zaman</th><th>Katılım</th><th>Grup</th><th>Durum</th></tr></thead>
            <tbody>{v.veri.map((r) => (
              <tr key={r.post_id}>
                <td style={{ maxWidth: 360 }}><div className="row" style={{ gap: 6 }}>{r.ride_type && <Rozet t={TUR[r.ride_type] ?? r.ride_type} />}<span className="muted sm">{[r.place, r.city].filter(Boolean).join(' · ')}</span></div><div style={{ marginTop: 4 }}>{kisalt(r.body, 110)}</div></td>
                <td><a href={baglanti('/kullanicilar/' + r.owner_id)} style={{ color: 'var(--accent)' }}>@{r.owner_username}</a></td>
                <td className="sm" title={tarih(r.starts_at ?? r.created_at)}>{r.starts_at ? tarih(r.starts_at) : 'Zaman belirtilmemiş'}<div className="muted">{goreli(r.starts_at ?? r.created_at)}</div></td>
                <td className="sm"><Rozet c="ok" t={`${r.accepted} kabul`} /> <Rozet c={r.pending ? 'uyari' : ''} t={`${r.pending} bekleyen`} /> <span className="muted">{r.declined} red</span></td>
                <td className="sm">{r.room_id ? `${r.member_count} üye` : <span className="muted">—</span>}</td>
                <td><Rozet c={DURUM[r.state]?.[1]} t={DURUM[r.state]?.[0] ?? r.state} /></td>
              </tr>))}</tbody></table></div>
        )}
        {v.veri && v.veri.length > 0 && <Sayfalama sayfa={sayfa} sec={setSayfa} toplam={v.veri[0].total_count} adet={ADET} />}
      </div>
    </>
  );
}
