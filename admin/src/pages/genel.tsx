import { rpc } from '../api';
import { kategori } from '../format';
import { baglanti } from '../router';
import { CizgiGrafik, Halka, HataKutusu, Istatistik, SayfaBasligi, Yukleniyor, YatayCubuklar, useYukle } from '../ui';

type Stats = { users_total: number; users_7d: number; users_prev_7d: number; posts_total: number; posts_7d: number; posts_prev_7d: number; posts_removed: number;
  comments_total: number; comments_7d: number; messages_7d: number; active_rides: number; reports_open: number; reports_7d: number; sanctions_active: number; staff_count: number;
  by_category: Record<string, number>; top_cities: { name: string; count: number }[] };
type Gun = { day: string; users: number; posts: number; comments: number; reports: number };
const RENKLER = ['#ffb800', '#5aa9ff', '#3ecf8e', '#ff5c5c', '#b58cff', '#ff8fb1'];

export function Genel() {
  const s = useYukle(() => rpc<Stats>('admin_stats'), []);
  const g = useYukle(() => rpc<Gun[]>('admin_daily', { p_days: 14 }), []);
  if (s.hata) return <HataKutusu m={s.hata} yeniden={s.yenile} />;
  if (!s.veri) return <Yukleniyor />;
  const d = s.veri;
  const etiket = (g.veri ?? []).map((x) => new Date(x.day).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }));
  return (
    <>
      <SayfaBasligi baslik="Genel bakış" alt="Topluluğun anlık durumu. Sayılar son 7 günü önceki 7 günle karşılaştırır."
        sag={<button className="btn" onClick={() => { s.yenile(); g.yenile(); }}>Yenile</button>} />
      {d.reports_open > 0 && (
        <a href={baglanti('/sikayetler')} className="duyuru warning row" style={{ marginBottom: 14 }}>
          <b>{d.reports_open} gönderi</b> inceleme bekliyor. <span className="right" style={{ color: 'var(--accent)', fontWeight: 600 }}>Şikâyetlere git →</span>
        </a>
      )}
      <div className="izgara g4">
        <Istatistik etiket="Toplam kullanıcı" deger={d.users_total} simdi={d.users_7d} once={d.users_prev_7d} ipucu={`Son 7 günde +${d.users_7d}`} />
        <Istatistik etiket="Yayındaki gönderi" deger={d.posts_total} simdi={d.posts_7d} once={d.posts_prev_7d} />
        <Istatistik etiket="Açık şikâyet (gönderi)" deger={d.reports_open} />
        <Istatistik etiket="Aktif yaptırım" deger={d.sanctions_active} ipucu="Askıya alma + yasak" />
      </div>
      <div className="izgara g4" style={{ marginTop: 14 }}>
        <Istatistik etiket="Aktif / planlı sürüş" deger={d.active_rides} />
        <Istatistik etiket="Yorum (7 gün)" deger={d.comments_7d} />
        <Istatistik etiket="Mesaj (7 gün)" deger={d.messages_7d} />
        <Istatistik etiket="Kaldırılan gönderi" deger={d.posts_removed} />
      </div>
      <div className="izgara g21" style={{ marginTop: 14 }}>
        <div className="kart">
          <div className="kart-baslik"><h2>Son 14 gün</h2></div>
          {g.veri ? <CizgiGrafik etiketler={etiket} seriler={[
            { ad: 'Gönderi', renk: RENKLER[0], deger: g.veri.map((x) => x.posts) },
            { ad: 'Yeni üye', renk: RENKLER[1], deger: g.veri.map((x) => x.users) },
            { ad: 'Şikâyet', renk: RENKLER[3], deger: g.veri.map((x) => x.reports) },
          ]} /> : <Yukleniyor />}
        </div>
        <div className="kart">
          <div className="kart-baslik"><h2>Kategori dağılımı</h2><span className="muted sm">30 gün</span></div>
          <Halka parcalar={Object.entries(d.by_category).sort((a, b) => b[1] - a[1]).map(([k, v], i) => ({ ad: kategori(k), deger: v, renk: RENKLER[i % RENKLER.length] }))} />
        </div>
      </div>
      <div className="izgara g2" style={{ marginTop: 14 }}>
        <div className="kart"><div className="kart-baslik"><h2>En çok üyesi olan şehirler</h2></div>
          <YatayCubuklar satirlar={d.top_cities.map((c) => ({ ad: c.name, deger: c.count }))} /></div>
        <div className="kart"><div className="kart-baslik"><h2>Yorumlar (14 gün)</h2></div>
          {g.veri && <CizgiGrafik yukseklik={170} etiketler={etiket} seriler={[{ ad: 'Yorum', renk: RENKLER[2], deger: g.veri.map((x) => x.comments) }]} />}</div>
      </div>
    </>
  );
}
