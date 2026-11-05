import { useState } from 'react';
import { rpc } from '../api';
import { EYLEM_AD, eylemAd, goreli, tarih } from '../format';
import { Bos, HataKutusu, Rozet, SayfaBasligi, Sayfalama, Yukleniyor, useYukle } from '../ui';

type Satir = { id: number; created_at: string; actor_id: string | null; actor_username: string | null; action: string; target_type: string | null; target_id: string | null; details: Record<string, unknown>; total_count: number };
const ADET = 50;
const GRUP: [string, string][] = [['', 'Tüm eylemler'], ['post.', 'Gönderi'], ['comment.', 'Yorum'], ['report.', 'Şikâyet'], ['sanction.', 'Yaptırım'], ['staff.', 'Yetkili'], ['announcement.', 'Duyuru']];

export function Denetim() {
  const [grup, setGrup] = useState('');
  const [sayfa, setSayfa] = useState(0);
  const [ac, setAc] = useState<number | null>(null);
  const v = useYukle(() => rpc<Satir[]>('admin_audit_list', { p_action: grup, p_limit: ADET, p_offset: sayfa * ADET }), [grup, sayfa]);
  return (
    <>
      <SayfaBasligi baslik="Denetim günlüğü" alt="Panelden yapılan her işlem burada kayıtlıdır ve silinemez." />
      <div style={{ marginBottom: 14 }}><select className="girdi" style={{ width: 200 }} value={grup} onChange={(e) => { setGrup(e.target.value); setSayfa(0); }} aria-label="Eylem türü">
        {GRUP.map(([k, a]) => <option key={k} value={k}>{a}</option>)}</select></div>
      {v.hata && <HataKutusu m={v.hata} yeniden={v.yenile} />}
      <div className="kart p0">
        {v.yukleniyor && !v.veri ? <Yukleniyor /> : !v.veri?.length ? <Bos /> : (
          <div className="tablo-kap"><table>
            <thead><tr><th>Zaman</th><th>Yetkili</th><th>Eylem</th><th>Hedef</th><th /></tr></thead>
            <tbody>{v.veri.map((a) => (<>
              <tr key={a.id} className="tikla" onClick={() => setAc(ac === a.id ? null : a.id)}>
                <td className="sm" title={tarih(a.created_at)}>{tarih(a.created_at)}<div className="muted">{goreli(a.created_at)}</div></td>
                <td>{a.actor_username ? `@${a.actor_username}` : <span className="muted">silinmiş</span>}</td>
                <td><Rozet c={a.action.startsWith('sanction') || a.action.endsWith('remove') ? 'kotu' : ''} t={eylemAd(a.action)} /></td>
                <td className="muted sm mono">{a.target_type}{a.target_id ? ` · ${a.target_id.slice(0, 8)}` : ''}</td>
                <td className="muted sm">{ac === a.id ? '▲' : '▼'}</td></tr>
              {ac === a.id && <tr key={a.id + 'd'}><td colSpan={5} style={{ background: 'var(--panel2)' }}><pre className="mono sm" style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(a.details, null, 2)}</pre></td></tr>}
            </>))}</tbody></table></div>
        )}
        {v.veri && v.veri.length > 0 && <Sayfalama sayfa={sayfa} sec={setSayfa} toplam={v.veri[0].total_count} adet={ADET} />}
      </div>
    </>
  );
}
void EYLEM_AD;
