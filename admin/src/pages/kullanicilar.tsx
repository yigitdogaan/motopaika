import { useState } from 'react';
import { rpc, ROL_SIRA, type Rol } from '../api';
import { goreli, gunTarih, kategori, kisalt, tarih, SEBEPLER } from '../format';
import { baglanti, git } from '../router';
import { Avatar, AramaKutusu, Bos, HataKutusu, Modal, OnayModal, RolRozeti, Rozet, SayfaBasligi, Sayfalama, Sekmeler, Yukleniyor, useDebounce, useToast, useYukle } from '../ui';

type Satir = { id: string; username: string; display_name: string; avatar_path: string | null; city: string | null; created_at: string; email: string | null; posts_count: number;
  reports_against: number; active_sanction: string | null; sanction_ends: string | null; staff_role: string | null; total_count: number };
const ADET = 25;
const YAP_AD: Record<string, string> = { warning: 'Uyarı', suspension: 'Askıya alma', ban: 'Yasak' };

export function Kullanicilar() {
  const [ara, setAra] = useState('');
  const q = useDebounce(ara);
  const [f, setF] = useState('all');
  const [sayfa, setSayfa] = useState(0);
  const v = useYukle(() => rpc<Satir[]>('admin_users', { p_search: q, p_filter: f, p_limit: ADET, p_offset: sayfa * ADET }), [q, f, sayfa]);
  return (
    <>
      <SayfaBasligi baslik="Kullanıcılar" alt="Ara, süz, yaptırımları gör. E-posta yalnızca Yönetici ve üstüne görünür." />
      <div className="row wrap" style={{ marginBottom: 14 }}>
        <AramaKutusu deger={ara} degis={(x) => { setAra(x); setSayfa(0); }} yer="Kullanıcı adı, isim ya da e-posta…" />
        <Sekmeler deger={f} sec={(d) => { setF(d); setSayfa(0); }} secenekler={[['all', 'Tümü'], ['new', 'Yeni (7 gün)'], ['reported', 'Şikâyet almış'], ['restricted', 'Kısıtlı'], ['staff', 'Yetkililer']]} />
      </div>
      {v.hata && <HataKutusu m={v.hata} yeniden={v.yenile} />}
      <div className="kart p0">
        {v.yukleniyor && !v.veri ? <Yukleniyor /> : !v.veri?.length ? <Bos /> : (
          <div className="tablo-kap"><table>
            <thead><tr><th>Kullanıcı</th><th>Şehir</th><th>Gönderi</th><th>Şikâyet</th><th>Durum</th><th>Katıldı</th></tr></thead>
            <tbody>{v.veri.map((u) => (
              <tr key={u.id} className="tikla" onClick={() => git('/kullanicilar/' + u.id)}>
                <td><div className="row"><Avatar ad={u.display_name} yol={u.avatar_path} /><div><div>{u.display_name} <RolRozeti rol={u.staff_role} /></div><div className="muted sm">@{u.username}{u.email ? ` · ${u.email}` : ''}</div></div></div></td>
                <td className="muted">{u.city ?? '—'}</td><td>{u.posts_count}</td>
                <td>{u.reports_against > 0 ? <Rozet c="uyari" t={String(u.reports_against)} /> : <span className="muted">—</span>}</td>
                <td>{u.active_sanction ? <Rozet c="kotu" t={u.active_sanction === 'ban' ? 'Yasaklı' : `Askıda · ${goreli(u.sanction_ends)}`} /> : <Rozet c="ok" t="Aktif" />}</td>
                <td className="muted sm">{gunTarih(u.created_at)}</td>
              </tr>))}</tbody></table></div>
        )}
        {v.veri && v.veri.length > 0 && <Sayfalama sayfa={sayfa} sec={setSayfa} toplam={v.veri[0].total_count} adet={ADET} />}
      </div>
    </>
  );
}

type Detay = { id: string; username: string; display_name: string; bio: string | null; avatar_path: string | null; city: string | null; created_at: string; email: string | null; last_sign_in_at: string | null; staff_role: string | null;
  counts: Record<string, number>; motorcycles: { id: string; brand: string; model: string; year: number | null }[];
  sanctions: { id: string; kind: string; reason: string; starts_at: string; ends_at: string | null; revoked_at: string | null; revoke_note: string | null; by: string | null; active: boolean }[];
  recent_posts: { id: string; body: string; category: string; created_at: string; removed_at: string | null; is_anonymous: boolean }[];
  recent_comments: { id: string; body: string; post_id: string; created_at: string }[] };

export function KullaniciDetay({ id, rol }: { id: string; rol: Rol }) {
  const toast = useToast();
  const v = useYukle(() => rpc<Detay>('admin_user_detail', { p_user: id }), [id]);
  const [yaptirim, setYaptirim] = useState<'warning' | 'suspension' | 'ban' | null>(null);
  const [kaldirilacak, setKaldirilacak] = useState<string | null>(null);
  if (v.hata) return <><a href={baglanti('/kullanicilar')} className="btn kucuk" style={{ marginBottom: 12 }}>← Kullanıcılar</a><HataKutusu m={v.hata} yeniden={v.yenile} /></>;
  if (!v.veri) return <Yukleniyor />;
  const u = v.veri; const admin = ROL_SIRA[rol] >= 2;
  const aktif = u.sanctions.find((s) => s.active && s.kind !== 'warning');
  const c = u.counts;
  return (
    <>
      <a href={baglanti('/kullanicilar')} className="btn kucuk" style={{ marginBottom: 14 }}>← Kullanıcılar</a>
      <div className="kart row wrap" style={{ gap: 16 }}>
        <Avatar ad={u.display_name} yol={u.avatar_path} buyuk />
        <div className="grow"><h1>{u.display_name} <RolRozeti rol={u.staff_role} /></h1>
          <div className="muted">@{u.username} · {u.city ?? 'Şehir yok'} · katıldı {gunTarih(u.created_at)}</div>
          {u.bio && <div style={{ marginTop: 6 }}>{u.bio}</div>}
          {admin && <div className="muted sm" style={{ marginTop: 6 }}>{u.email} · son giriş {goreli(u.last_sign_in_at)}</div>}</div>
        <div className="col" style={{ alignItems: 'flex-end' }}>
          {aktif ? <Rozet c="kotu" t={aktif.kind === 'ban' ? 'Yasaklı' : `Askıda · ${tarih(aktif.ends_at)}`} /> : <Rozet c="ok" t="Hesap aktif" />}
          <div className="row wrap"><button className="btn" onClick={() => setYaptirim('warning')}>Uyar</button>
            <button className="btn" onClick={() => setYaptirim('suspension')}>Askıya al</button>
            <button className="btn tehlike" onClick={() => setYaptirim('ban')} disabled={!admin} title={admin ? '' : 'Yönetici yetkisi gerekir'}>Yasakla</button></div></div>
      </div>
      <div className="izgara g4" style={{ marginTop: 14 }}>
        {([['Gönderi', c.posts], ['Kaldırılan', c.posts_removed], ['Aldığı şikâyet', c.reports_against], ['Yaptığı şikâyet', c.reports_made], ['Yorum', c.comments], ['Verdiği selam', c.salutes_given], ['Sohbet odası', c.rooms], ['Engelleyen', c.blocked_by]] as [string, number][])
          .map(([e, d]) => <div key={e} className="kart istatistik"><span className="etiket">{e}</span><span className="deger" style={{ fontSize: 22 }}>{d}</span></div>)}
      </div>
      <div className="izgara g2" style={{ marginTop: 14 }}>
        <div className="kart"><div className="kart-baslik"><h2>Yaptırım geçmişi</h2></div>
          {!u.sanctions.length ? <div className="muted">Hiç yaptırım yok.</div> : <div className="col">{u.sanctions.map((s) => (
            <div key={s.id} className="sol-cizgi"><div className="row wrap"><Rozet c={s.kind === 'warning' ? 'uyari' : 'kotu'} t={YAP_AD[s.kind]} />
              {s.revoked_at ? <Rozet t="Kaldırıldı" /> : s.active ? <Rozet c="kotu" t="Etkin" /> : s.kind !== 'warning' && <Rozet t="Süresi doldu" />}
              <span className="muted sm right">{tarih(s.starts_at)}</span></div>
              <div style={{ marginTop: 4 }}>{s.reason}</div>
              <div className="muted sm">@{s.by ?? '?'}{s.ends_at ? ` · bitiş ${tarih(s.ends_at)}` : ''}{s.revoke_note ? ` · kaldırma notu: ${s.revoke_note}` : ''}</div>
              {s.active && s.kind !== 'warning' && admin && <button className="btn kucuk" style={{ marginTop: 6 }} onClick={() => setKaldirilacak(s.id)}>Yaptırımı kaldır</button>}</div>))}</div>}
        </div>
        <div className="kart"><div className="kart-baslik"><h2>Motosikletler</h2></div>
          {!u.motorcycles.length ? <div className="muted">Garajı boş.</div> : <div className="col" style={{ gap: 6 }}>{u.motorcycles.map((m) => <div key={m.id}>{m.brand} {m.model} {m.year ? <span className="muted">({m.year})</span> : null}</div>)}</div>}
          <div className="kart-baslik" style={{ marginTop: 18 }}><h2>Son yorumlar</h2></div>
          {!u.recent_comments.length ? <div className="muted">Yorum yok.</div> : u.recent_comments.map((x) => <div key={x.id} className="sol-cizgi" style={{ marginBottom: 8 }}>{kisalt(x.body, 140)}<div className="muted sm">{goreli(x.created_at)}</div></div>)}
        </div>
      </div>
      <div className="kart" style={{ marginTop: 14 }}><div className="kart-baslik"><h2>Son gönderiler</h2></div>
        {!u.recent_posts.length ? <div className="muted">Gönderi yok.</div> : <div className="col">{u.recent_posts.map((p) => (
          <div key={p.id} className="sol-cizgi"><div className="row wrap"><Rozet t={kategori(p.category)} />{p.removed_at && <Rozet c="kotu" t="Kaldırıldı" />}{p.is_anonymous && <Rozet t="Anonim" />}<span className="muted sm right">{goreli(p.created_at)}</span></div>
            <div style={{ marginTop: 4 }}>{kisalt(p.body, 200)}</div></div>))}</div>}
      </div>
      {yaptirim && <YaptirimModal kind={yaptirim} u={u} rol={rol} kapat={() => setYaptirim(null)} bitti={() => { toast('Yaptırım uygulandı'); v.yenile(); }} />}
      {kaldirilacak && <OnayModal baslik="Yaptırımı kaldır" onayEtiketi="Kaldır" nedenIste nedenEtiketi="Not (denetim günlüğüne yazılır)" aciklama="Kullanıcı kısıtlaması hemen kalkar."
        onayla={async (n) => { await rpc('admin_revoke_sanction', { p_sanction: kaldirilacak, p_note: n }); toast('Yaptırım kaldırıldı'); v.yenile(); }} kapat={() => setKaldirilacak(null)} />}
    </>
  );
}

function YaptirimModal({ kind, u, rol, kapat, bitti }: { kind: 'warning' | 'suspension' | 'ban'; u: Detay; rol: Rol; kapat: () => void; bitti: () => void }) {
  const [gun, setGun] = useState(kind === 'suspension' ? 3 : 0);
  const maks = ROL_SIRA[rol] >= 2 ? 365 : 7;
  const acik = {
    warning: 'Kullanıcıya uyarı bildirimi gider; hesabı kısıtlanmaz.',
    suspension: 'Süre boyunca kullanıcı gönderi, yorum, selam, istek ve mesaj gönderemez; uygulamayı okuyabilir.',
    ban: 'Kalıcı: kullanıcı içerik üretemez. Yaptırım daha sonra kaldırılabilir.',
  }[kind];
  return (
    <OnayModal baslik={`${YAP_AD[kind]} — @${u.username}`} tehlikeli={kind !== 'warning'} onayEtiketi={YAP_AD[kind] + ' uygula'} nedenIste kisayollar={SEBEPLER}
      aciklama={<><div>{acik}</div>
        {kind === 'suspension' && <label className="alan" style={{ marginTop: 10 }}>Süre (gün, en fazla {maks})
          <input className="girdi" type="number" min={1} max={maks} value={gun} onChange={(e) => setGun(Math.max(1, Math.min(maks, Number(e.target.value) || 1)))} /></label>}</>}
      onayla={async (n) => { await rpc('admin_sanction', { p_user: u.id, p_kind: kind, p_reason: n, p_days: kind === 'suspension' ? gun : null }); bitti(); }} kapat={kapat} />
  );
}
export { kisalt };
