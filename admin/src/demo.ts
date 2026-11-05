// Demo modu: .env yokken (ya da DEMO=1 ile) panel sahte verilerle çalışır; ekran görüntüleri ve gezinme denemesi içindir.
const gun = 864e5;
const simdi = Date.now();
const ago = (ms: number) => new Date(simdi - ms).toISOString();
const ileri = (ms: number) => new Date(simdi + ms).toISOString();

const adlar = [
  ['kaanyildiz', 'Kaan Yıldız', 'İstanbul'], ['deniz_r', 'Deniz Aras', 'Ankara'], ['mertcan34', 'Mertcan Öz', 'İstanbul'],
  ['ayse.rider', 'Ayşe Demir', 'İzmir'], ['burak_cbr', 'Burak Şen', 'Bursa'], ['selin.moto', 'Selin Kaya', 'Antalya'],
  ['tolga_gs', 'Tolga Arda', 'İstanbul'], ['zeynepx', 'Zeynep Tan', 'Eskişehir'], ['alinaesir', 'Ali Naesir', 'Ankara'],
  ['ruzgar55', 'Rüzgâr Ece', 'Samsun'], ['emre_v', 'Emre Vural', 'İzmir'], ['cemre.t', 'Cemre Tuna', 'Muğla'],
];
const motorlar = ['Yamaha MT-07', 'Honda CBR650R', 'BMW R 1250 GS', 'Kawasaki Z900', 'Ducati Monster', 'Suzuki V-Strom 650'];

type Kul = { id: string; username: string; display_name: string; city: string; created_at: string; email: string; staff_role: string | null; bio: string };
const kullanicilar: Kul[] = adlar.map((a, i) => ({
  id: `u${i + 1}`, username: a[0], display_name: a[1], city: a[2], created_at: ago((i * 4.3 + 1) * gun),
  email: `${a[0].replace('.', '')}@example.com`, bio: i % 3 === 0 ? 'Hafta sonu sürücüsü. Kahve molası şart.' : '',
  staff_role: i === 0 ? 'super_admin' : i === 1 ? 'admin' : i === 3 ? 'moderator' : null,
}));
const kullaniciAd = (id: string) => kullanicilar.find((k) => k.id === id)?.username ?? '?';

const govdeler = [
  'Pazar sabahı Şile yolunda keyifli bir tur, katılmak isteyen? Kahvaltı Ağva\'da.',
  'Zincir yağlaması için en iyi sprey hangisi? Aylardır deniyorum.',
  'Kadıköy sahilde kasksız tipler görüyorum, lütfen kask takın arkadaşlar.',
  'SATILIK: 2019 model Yamaha MT-07, 14 bin km, ilk sahibinden. Mesaj atın.',
  'Bugün Bolu Dağı\'nda trafik kilitli, alternatif yol önerisi olan?',
  'Hafta sonu Kapadokya turu planlıyorum, 3 gün, 8 kişi.',
  'Bu forumdaki bazı kişiler gerçekten saygısız. Ciddi bir şey yapılmalı!!',
  'Yeni kask aldım, Shoei GT-Air 3, ilk izlenim çok iyi.',
  'ÜCRETSİZ TELEFON KAZANMAK İÇİN LİNKE TIKLA http://kisalt.example/abc',
  'Akşam Beşiktaş\'ta kısa bir buluşma, 20:00 sahil.',
];
const kategoriler = ['surus', 'soru', 'tehlike', 'satilik', 'tehlike', 'surus', 'soru', 'sohbet', 'sohbet', 'surus'];

type Gonderi = { id: string; body: string; category: string; place: string | null; photo_path: string | null; is_anonymous: boolean; created_at: string;
  removed_at: string | null; removed_reason: string | null; author_id: string; starts_at: string | null; ride_type: string | null; city: string | null };
const gonderiler: Gonderi[] = govdeler.map((b, i) => ({
  id: `p${i + 1}`, body: b, category: kategoriler[i], place: ['Şile', 'Ataşehir', 'Kadıköy', 'Beşiktaş', 'Bolu', 'Ürgüp'][i % 6], photo_path: null,
  is_anonymous: i === 6, created_at: ago((i * 0.7 + 0.2) * gun), removed_at: null, removed_reason: null, author_id: `u${(i % 11) + 2}`,
  starts_at: kategoriler[i] === 'surus' ? (i === 0 ? ileri(2 * gun) : i === 5 ? ileri(5 * gun) : ago(0.3 * gun)) : null,
  ride_type: kategoriler[i] === 'surus' ? ['gezi', 'kahvalti', 'gece'][i % 3] : null, city: ['İstanbul', 'Ankara', 'İzmir'][i % 3],
}));

type Sikayet = { post_id: string; reporter_id: string; reason: string; status: 'open' | 'actioned' | 'dismissed'; created_at: string; handled_by?: string; handled_at?: string; handler_note?: string };
const sikayetler: Sikayet[] = [
  { post_id: 'p9', reporter_id: 'u3', reason: 'Spam / dolandırıcılık', status: 'open', created_at: ago(0.1 * gun) },
  { post_id: 'p9', reporter_id: 'u4', reason: 'Spam / dolandırıcılık', status: 'open', created_at: ago(0.12 * gun) },
  { post_id: 'p9', reporter_id: 'u5', reason: 'Aldatıcı bağlantı', status: 'open', created_at: ago(0.15 * gun) },
  { post_id: 'p7', reporter_id: 'u2', reason: 'Hakaret / nefret', status: 'open', created_at: ago(0.5 * gun) },
  { post_id: 'p7', reporter_id: 'u6', reason: 'Hakaret / nefret', status: 'open', created_at: ago(0.6 * gun) },
  { post_id: 'p4', reporter_id: 'u8', reason: 'Uygunsuz ilan', status: 'open', created_at: ago(1.2 * gun) },
  { post_id: 'p3', reporter_id: 'u9', reason: 'Yanıltıcı bilgi', status: 'dismissed', created_at: ago(3 * gun), handled_by: 'u4', handled_at: ago(2.8 * gun), handler_note: 'Kural ihlali yok.' },
];

type Yaptirim = { id: string; user_id: string; kind: 'warning' | 'suspension' | 'ban'; reason: string; starts_at: string; ends_at: string | null; revoked_at: string | null; revoke_note: string | null; created_by: string };
const yaptirimlar: Yaptirim[] = [
  { id: 's1', user_id: 'u7', kind: 'suspension', reason: 'Tekrarlayan spam paylaşımları', starts_at: ago(1 * gun), ends_at: ileri(6 * gun), revoked_at: null, revoke_note: null, created_by: 'u2' },
  { id: 's2', user_id: 'u10', kind: 'warning', reason: 'Topluluk kurallarına aykırı dil', starts_at: ago(9 * gun), ends_at: null, revoked_at: null, revoke_note: null, created_by: 'u4' },
  { id: 's3', user_id: 'u11', kind: 'ban', reason: 'Dolandırıcılık girişimi', starts_at: ago(20 * gun), ends_at: null, revoked_at: null, revoke_note: null, created_by: 'u1' },
];

type Duyuru = { id: string; title: string; body: string; level: 'info' | 'warning' | 'critical'; active: boolean; starts_at: string; ends_at: string | null; created_at: string };
const duyurular: Duyuru[] = [
  { id: 'd1', title: 'Hoş geldin sezonu', body: 'Bahar sürüşleri başladı! Güvenli sürüşler dileriz.', level: 'info', active: true, starts_at: ago(2 * gun), ends_at: null, created_at: ago(2 * gun) },
  { id: 'd2', title: 'Planlı bakım', body: 'Cumartesi 03:00-04:00 arası kısa bir bakım olacak.', level: 'warning', active: false, starts_at: ago(14 * gun), ends_at: ago(10 * gun), created_at: ago(15 * gun) },
];

const denetim: { id: number; created_at: string; actor_id: string; action: string; target_type: string; target_id: string; details: Record<string, unknown> }[] = [
  { id: 6, created_at: ago(0.9 * gun), actor_id: 'u2', action: 'sanction.suspension', target_type: 'user', target_id: 'u7', details: { reason: 'Tekrarlayan spam paylaşımları', days: 7 } },
  { id: 5, created_at: ago(2.8 * gun), actor_id: 'u4', action: 'report.dismiss', target_type: 'post', target_id: 'p3', details: { count: 1, note: 'Kural ihlali yok.' } },
  { id: 4, created_at: ago(9 * gun), actor_id: 'u4', action: 'sanction.warning', target_type: 'user', target_id: 'u10', details: { reason: 'Topluluk kurallarına aykırı dil' } },
  { id: 3, created_at: ago(12 * gun), actor_id: 'u1', action: 'post.remove', target_type: 'post', target_id: 'px', details: { reason: 'Reklam', body: 'İNDİRİM İNDİRİM ...' } },
  { id: 2, created_at: ago(20 * gun), actor_id: 'u1', action: 'sanction.ban', target_type: 'user', target_id: 'u11', details: { reason: 'Dolandırıcılık girişimi' } },
  { id: 1, created_at: ago(30 * gun), actor_id: 'u1', action: 'staff.set', target_type: 'user', target_id: 'u2', details: { role: 'admin', previous: null } },
];

const yorumlar = [
  { id: 'c1', post_id: 'p1', author_id: 'u3', body: 'Ben varım, kaçta çıkıyoruz?', created_at: ago(0.1 * gun) },
  { id: 'c2', post_id: 'p1', author_id: 'u5', body: 'Yağmur riski var mı bakar mısın?', created_at: ago(0.05 * gun) },
  { id: 'c3', post_id: 'p9', author_id: 'u6', body: 'Bu bir dolandırıcılık, sakın tıklamayın.', created_at: ago(0.05 * gun) },
];

const gecikme = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(structuredClone(v)), 120));
const sayfala = <T,>(liste: T[], a: Record<string, unknown>) => {
  const lim = Number(a.p_limit ?? 30), off = Number(a.p_offset ?? 0);
  return liste.slice(off, off + lim).map((x) => ({ ...x, total_count: liste.length }));
};
const aktifYap = (id: string) => yaptirimlar.find((y) => y.user_id === id && y.kind !== 'warning' && !y.revoked_at && (!y.ends_at || new Date(y.ends_at).getTime() > Date.now()));
const kayit = (action: string, target_type: string, target_id: string, details: Record<string, unknown>) =>
  denetim.unshift({ id: denetim.length + 1, created_at: new Date().toISOString(), actor_id: 'u1', action, target_type, target_id, details });

export async function demo(ad: string, a: Record<string, any>): Promise<unknown> {
  switch (ad) {
    case 'admin_stats': return gecikme({
      users_total: 1284, users_7d: 96, users_prev_7d: 71, posts_total: 3920, posts_7d: 412, posts_prev_7d: 455, posts_removed: 38,
      comments_total: 11840, comments_7d: 1530, messages_7d: 9210, active_rides: gonderiler.filter((g) => g.category === 'surus' && !g.removed_at).length,
      reports_open: new Set(sikayetler.filter((s) => s.status === 'open').map((s) => s.post_id)).size, reports_7d: 14,
      sanctions_active: yaptirimlar.filter((y) => y.kind !== 'warning' && !y.revoked_at).length, staff_count: 3,
      by_category: { surus: 140, soru: 96, sohbet: 120, tehlike: 31, satilik: 25 },
      top_cities: [{ name: 'İstanbul', count: 520 }, { name: 'Ankara', count: 188 }, { name: 'İzmir', count: 140 }, { name: 'Bursa', count: 82 }, { name: 'Antalya', count: 66 }, { name: 'Eskişehir', count: 41 }],
    });
    case 'admin_daily': {
      const n = Number(a.p_days ?? 14);
      return gecikme(Array.from({ length: n }, (_, i) => {
        const d = new Date(simdi - (n - 1 - i) * gun);
        const w = Math.sin(i * 0.9) * 0.5 + 1;
        return { day: d.toISOString().slice(0, 10), users: Math.round(10 * w + (i % 4)), posts: Math.round(55 * w + (i % 5) * 3), comments: Math.round(210 * w), reports: Math.round(2 * w + (i % 3)) };
      }));
    }
    case 'admin_reports': {
      const ids = [...new Set(sikayetler.map((s) => s.post_id))];
      const satirlar = ids.map((id) => {
        const r = sikayetler.filter((s) => s.post_id === id); const p = gonderiler.find((g) => g.id === id)!; const u = kullanicilar.find((k) => k.id === p.author_id)!;
        const nedenler: Record<string, number> = {}; r.forEach((x) => { nedenler[x.reason] = (nedenler[x.reason] ?? 0) + 1; });
        const ac = r.filter((x) => x.status === 'open').length;
        return { post_id: id, body: p.body, category: p.category, place: p.place, photo_path: null, post_created_at: p.created_at, removed_at: p.removed_at,
          author_id: u.id, author_username: u.username, author_name: u.display_name, author_avatar: null, is_anonymous: p.is_anonymous,
          report_count: r.length, open_count: ac, reasons: nedenler, first_report_at: r[r.length - 1].created_at, last_report_at: r[0].created_at };
      }).filter((r) => a.p_status === 'all' || (a.p_status === 'open' ? r.open_count > 0 : r.open_count === 0))
        .sort((x, y) => y.open_count - x.open_count);
      return gecikme(sayfala(satirlar, a));
    }
    case 'admin_report_details': return gecikme(sikayetler.filter((s) => s.post_id === a.p_post).map((s) => ({
      reporter_id: s.reporter_id, reporter_username: kullaniciAd(s.reporter_id), reason: s.reason, status: s.status, created_at: s.created_at,
      handled_by_username: s.handled_by ? kullaniciAd(s.handled_by) : null, handled_at: s.handled_at ?? null, handler_note: s.handler_note ?? null })));
    case 'admin_dismiss_reports': {
      let n = 0; sikayetler.forEach((s) => { if (s.post_id === a.p_post && s.status === 'open') { s.status = 'dismissed'; s.handled_by = 'u1'; s.handled_at = new Date().toISOString(); s.handler_note = a.p_note; n++; } });
      kayit('report.dismiss', 'post', a.p_post, { count: n, note: a.p_note }); return gecikme(n);
    }
    case 'admin_remove_post': {
      const p = gonderiler.find((g) => g.id === a.p_post)!; p.removed_at = new Date().toISOString(); p.removed_reason = a.p_reason;
      sikayetler.forEach((s) => { if (s.post_id === p.id && s.status === 'open') s.status = 'actioned'; });
      kayit('post.remove', 'post', p.id, { reason: a.p_reason, body: p.body }); return gecikme(null);
    }
    case 'admin_restore_post': { const p = gonderiler.find((g) => g.id === a.p_post)!; p.removed_at = null; p.removed_reason = null; kayit('post.restore', 'post', p.id, {}); return gecikme(null); }
    case 'admin_posts': {
      const q = String(a.p_search ?? '').toLowerCase();
      const liste = gonderiler.filter((g) => (!a.p_category || g.category === a.p_category)
        && (!q || g.body.toLowerCase().includes(q) || kullaniciAd(g.author_id).includes(q))
        && (a.p_state === 'all' || (a.p_state === 'visible' && !g.removed_at) || (a.p_state === 'removed' && !!g.removed_at)
          || (a.p_state === 'anonymous' && g.is_anonymous) || (a.p_state === 'reported' && sikayetler.some((s) => s.post_id === g.id))))
        .sort((x, y) => y.created_at.localeCompare(x.created_at))
        .map((g) => { const u = kullanicilar.find((k) => k.id === g.author_id)!;
          return { ...g, author_username: u.username, author_name: u.display_name, author_avatar: null,
            report_count: sikayetler.filter((s) => s.post_id === g.id).length, open_reports: sikayetler.filter((s) => s.post_id === g.id && s.status === 'open').length,
            comment_count: yorumlar.filter((c) => c.post_id === g.id).length, salute_count: (g.body.length * 3) % 40 }; });
      return gecikme(sayfala(liste, a));
    }
    case 'admin_post_comments': return gecikme(yorumlar.filter((c) => c.post_id === a.p_post).map((c) => ({ ...c, author_username: kullaniciAd(c.author_id), author_name: kullanicilar.find((k) => k.id === c.author_id)!.display_name })));
    case 'admin_delete_comment': { const i = yorumlar.findIndex((c) => c.id === a.p_comment); if (i >= 0) yorumlar.splice(i, 1); kayit('comment.delete', 'comment', a.p_comment, { reason: a.p_reason }); return gecikme(null); }
    case 'admin_users': {
      const q = String(a.p_search ?? '').toLowerCase();
      const liste = kullanicilar.filter((u) => (!q || u.username.includes(q) || u.display_name.toLowerCase().includes(q) || u.email.includes(q)))
        .map((u) => { const y = aktifYap(u.id);
          return { id: u.id, username: u.username, display_name: u.display_name, avatar_path: null, city: u.city, created_at: u.created_at, email: u.email,
            posts_count: gonderiler.filter((g) => g.author_id === u.id).length, reports_against: sikayetler.filter((s) => gonderiler.find((g) => g.id === s.post_id)?.author_id === u.id).length,
            active_sanction: y?.kind ?? null, sanction_ends: y?.ends_at ?? null, staff_role: u.staff_role }; })
        .filter((u) => a.p_filter === 'all' || (a.p_filter === 'restricted' && u.active_sanction) || (a.p_filter === 'reported' && u.reports_against > 0)
          || (a.p_filter === 'new' && Date.now() - new Date(u.created_at).getTime() < 7 * gun) || (a.p_filter === 'staff' && u.staff_role));
      return gecikme(sayfala(liste, a));
    }
    case 'admin_user_detail': {
      const u = kullanicilar.find((k) => k.id === a.p_user)!;
      return gecikme({ id: u.id, username: u.username, display_name: u.display_name, bio: u.bio, avatar_path: null, city: u.city, created_at: u.created_at, email: u.email, last_sign_in_at: ago(0.2 * gun), staff_role: u.staff_role,
        counts: { posts: gonderiler.filter((g) => g.author_id === u.id).length, posts_removed: gonderiler.filter((g) => g.author_id === u.id && g.removed_at).length, comments: 14, salutes_given: 52,
          reports_against: sikayetler.filter((s) => gonderiler.find((g) => g.id === s.post_id)?.author_id === u.id).length, reports_made: 2, rooms: 4, blocked_by: 1 },
        motorcycles: [{ id: 'm1', brand: motorlar[Number(u.id.slice(1)) % 6].split(' ')[0], model: motorlar[Number(u.id.slice(1)) % 6].split(' ').slice(1).join(' '), year: 2019 }],
        sanctions: yaptirimlar.filter((y) => y.user_id === u.id).map((y) => ({ id: y.id, kind: y.kind, reason: y.reason, starts_at: y.starts_at, ends_at: y.ends_at, revoked_at: y.revoked_at, revoke_note: y.revoke_note, by: kullaniciAd(y.created_by),
          active: y.kind !== 'warning' && !y.revoked_at && (!y.ends_at || new Date(y.ends_at).getTime() > Date.now()) })),
        recent_posts: gonderiler.filter((g) => g.author_id === u.id).map((g) => ({ id: g.id, body: g.body, category: g.category, created_at: g.created_at, removed_at: g.removed_at, is_anonymous: g.is_anonymous })),
        recent_comments: yorumlar.filter((c) => c.author_id === u.id).map((c) => ({ id: c.id, body: c.body, post_id: c.post_id, created_at: c.created_at })) });
    }
    case 'admin_sanction': {
      const y: Yaptirim = { id: 's' + (yaptirimlar.length + 1), user_id: a.p_user, kind: a.p_kind, reason: a.p_reason, starts_at: new Date().toISOString(),
        ends_at: a.p_kind === 'suspension' ? ileri(Number(a.p_days) * gun) : null, revoked_at: null, revoke_note: null, created_by: 'u1' };
      yaptirimlar.unshift(y); kayit('sanction.' + a.p_kind, 'user', a.p_user, { reason: a.p_reason, days: a.p_days }); return gecikme(y.id);
    }
    case 'admin_revoke_sanction': { const y = yaptirimlar.find((x) => x.id === a.p_sanction)!; y.revoked_at = new Date().toISOString(); y.revoke_note = a.p_note; kayit('sanction.revoke', 'user', y.user_id, { note: a.p_note }); return gecikme(null); }
    case 'admin_rides': {
      const liste = gonderiler.filter((g) => g.category === 'surus').map((g) => {
        const u = kullanicilar.find((k) => k.id === g.author_id)!; const st = g.starts_at ? new Date(g.starts_at).getTime() : new Date(g.created_at).getTime();
        const durum = g.removed_at ? 'removed' : Date.now() > st + 12 * 36e5 ? 'past' : g.starts_at && st > Date.now() ? 'planned' : 'active';
        return { post_id: g.id, body: g.body, place: g.place, city: g.city, ride_type: g.ride_type, starts_at: g.starts_at, created_at: g.created_at, state: durum, removed_at: g.removed_at,
          owner_id: u.id, owner_username: u.username, owner_name: u.display_name, accepted: 3 + (g.body.length % 5), pending: g.body.length % 3, declined: g.body.length % 2, room_id: 'r' + g.id, member_count: 4 + (g.body.length % 5) };
      }).filter((r) => a.p_state === 'all' || r.state === a.p_state);
      return gecikme(sayfala(liste, a));
    }
    case 'admin_announcement_save': {
      if (a.p_id) { Object.assign(duyurular.find((d) => d.id === a.p_id)!, { title: a.p_title, body: a.p_body, level: a.p_level, active: a.p_active, ends_at: a.p_ends_at }); kayit('announcement.update', 'announcement', a.p_id, { title: a.p_title }); return gecikme(a.p_id); }
      const d: Duyuru = { id: 'd' + (duyurular.length + 1), title: a.p_title, body: a.p_body, level: a.p_level, active: a.p_active, starts_at: new Date().toISOString(), ends_at: a.p_ends_at, created_at: new Date().toISOString() };
      duyurular.unshift(d); kayit('announcement.create', 'announcement', d.id, { title: d.title }); return gecikme(d.id);
    }
    case 'admin_announcement_delete': { const i = duyurular.findIndex((d) => d.id === a.p_id); if (i >= 0) duyurular.splice(i, 1); kayit('announcement.delete', 'announcement', a.p_id, {}); return gecikme(null); }
    case 'admin_staff_list': return gecikme(kullanicilar.filter((u) => u.staff_role).map((u) => ({ user_id: u.id, username: u.username, display_name: u.display_name, email: u.email, role: u.staff_role, created_at: ago(30 * gun), created_by_username: u.id === 'u1' ? null : 'kaanyildiz' })));
    case 'admin_staff_set': {
      const u = kullanicilar.find((k) => k.username.toLowerCase() === String(a.p_username).toLowerCase()); if (!u) throw new Error('kullanici bulunamadi');
      u.staff_role = a.p_role; kayit('staff.set', 'user', u.id, { role: a.p_role }); return gecikme(null);
    }
    case 'admin_staff_remove': { const u = kullanicilar.find((k) => k.id === a.p_user)!; u.staff_role = null; kayit('staff.remove', 'user', u.id, {}); return gecikme(null); }
    case 'admin_audit_list': {
      const liste = denetim.filter((d) => !a.p_action || d.action.startsWith(a.p_action)).map((d) => ({ ...d, actor_username: kullaniciAd(d.actor_id) }));
      return gecikme(sayfala(liste, a));
    }
    case 'admin_announcements_all': return gecikme(duyurular);
  }
  throw new Error('Demo: bilinmeyen çağrı ' + ad);
}
