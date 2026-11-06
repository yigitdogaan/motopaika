// Supabase Edge Function: alıcının cihazlarına Expo push gönderir. İki webhook aynı fonksiyonu çağırır:
//   1) public.notifications INSERT → selam, yorum, sürüş isteği, yönetim bildirimleri
//   2) public.chat_messages INSERT → sohbet mesajları (odadaki diğer üyelere; engelleme olanlara gitmez)
// Dağıtım: supabase functions deploy push --no-verify-jwt
// Sır (isteğe bağlı güvenlik): supabase secrets set PUSH_WEBHOOK_SECRET=uzun-rastgele-bir-metin
//   ve webhook'a "Authorization: Bearer <aynı metin>" başlığı ekle.
import { createClient } from 'npm:@supabase/supabase-js@2';

type Kayit = { id: string; user_id: string; type: string; actor_id: string | null; post_id: string | null; body: string | null };

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

function metin(tur: string, ad: string, govde: string | null): { baslik: string; icerik: string } {
  switch (tur) {
    case 'ride_request': return { baslik: 'Katılma isteği', icerik: `${ad} sürüşüne katılmak istiyor` };
    case 'ride_accepted': return { baslik: 'İstek kabul edildi', icerik: `${ad} katılma isteğini kabul etti` };
    case 'ride_declined': return { baslik: 'İstek reddedildi', icerik: `${ad} katılma isteğini reddetti` };
    case 'salute': return { baslik: 'Selam!', icerik: `${ad} sana selam verdi` };
    case 'comment': return { baslik: 'Yeni yorum', icerik: `${ad} gönderine yorum yaptı` };
    case 'warning': return { baslik: 'Roteri Ekibi: uyarı', icerik: govde ?? 'Hesabına bir uyarı eklendi.' };
    case 'post_removed': return { baslik: 'Gönderin kaldırıldı', icerik: govde ?? 'Gönderin topluluk kurallarına aykırı bulundu.' };
    case 'account_suspended': return { baslik: 'Hesabın askıya alındı', icerik: govde ?? 'Hesabın geçici olarak askıya alındı.' };
    case 'account_banned': return { baslik: 'Hesabın yasaklandı', icerik: govde ?? 'Hesabın yasaklandı.' };
    default: return { baslik: 'Roteri', icerik: 'Yeni bildirimin var' };
  }
}

type Mesaj = { id: string; room_id: string; sender_id: string; body: string; kind: 'text' | 'image' | 'location' };
type Webhook = { table?: string; record?: Kayit & Partial<Mesaj> };

async function gonder(mesajlar: Record<string, unknown>[], jetonlar: { token: string }[]) {
  if (!mesajlar.length) return { gonderilen: 0, temizlenen: 0 };
  const yanit = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(mesajlar),
  });
  const sonuc = (await yanit.json()) as { data?: { status: string; details?: { error?: string } }[] };
  // Geçersiz (silinmiş uygulama) jetonları temizle
  const olu = (sonuc.data ?? []).flatMap((x, i) => (x.status === 'error' && x.details?.error === 'DeviceNotRegistered' ? [jetonlar[i].token] : []));
  if (olu.length) await db.from('push_tokens').delete().in('token', olu);
  return { gonderilen: mesajlar.length, temizlenen: olu.length };
}

const kisalt = (m: string, n = 120) => (m.length > n ? `${m.slice(0, n - 1)}…` : m);

async function sohbetMesaji(m: Mesaj) {
  const [{ data: oda }, { data: gonderen }, { data: uyeler }, { data: engeller }] = await Promise.all([
    db.from('chat_rooms').select('name, kind').eq('id', m.room_id).maybeSingle(),
    db.from('profiles').select('display_name, username').eq('id', m.sender_id).maybeSingle(),
    db.from('chat_members').select('user_id').eq('room_id', m.room_id).neq('user_id', m.sender_id),
    db.from('user_blocks').select('blocker_id, blocked_id').or(`blocker_id.eq.${m.sender_id},blocked_id.eq.${m.sender_id}`),
  ]);
  const engelli = new Set((engeller ?? []).flatMap((e) => [e.blocker_id, e.blocked_id]));
  const alicilar = (uyeler ?? []).map((u) => u.user_id).filter((id) => !engelli.has(id));
  if (!alicilar.length) return { gonderilen: 0, temizlenen: 0 };

  const { data: jetonlar } = await db.from('push_tokens').select('token').in('user_id', alicilar);
  if (!jetonlar?.length) return { gonderilen: 0, temizlenen: 0 };

  const ad = gonderen?.display_name ?? gonderen?.username ?? 'Bir sürücü';
  const icerik = m.kind === 'image' ? 'Fotoğraf gönderdi' : m.kind === 'location' ? 'Konum paylaştı' : kisalt(m.body);
  const dm = oda?.kind === 'dm';
  const baslik = dm ? ad : (oda?.name ?? 'Sürüş grubu');
  const govde = dm ? icerik : `${ad}: ${icerik}`;
  const mesajlar = jetonlar.map((j) => ({
    to: j.token, title: baslik, body: govde, sound: 'default', channelId: 'default',
    // Aynı odanın mesajları bildirim panelinde tek satırda toplansın.
    data: { tur: 'message', odaId: m.room_id },
  }));
  return gonder(mesajlar, jetonlar);
}

async function uygulamaBildirimi(record: Kayit) {
  const [{ data: jetonlar }, aktor] = await Promise.all([
    db.from('push_tokens').select('token').eq('user_id', record.user_id),
    record.actor_id ? db.from('profiles').select('display_name, username').eq('id', record.actor_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  if (!jetonlar?.length) return { gonderilen: 0, temizlenen: 0 };

  const ad = aktor.data?.display_name ?? aktor.data?.username ?? 'Bir sürücü';
  const { baslik, icerik } = metin(record.type, ad, record.body);
  const mesajlar = jetonlar.map((j) => ({
    to: j.token, title: baslik, body: icerik, sound: 'default', channelId: 'default',
    data: { bildirimId: record.id, tur: record.type, postId: record.post_id },
  }));
  return gonder(mesajlar, jetonlar);
}

Deno.serve(async (req) => {
  const sir = Deno.env.get('PUSH_WEBHOOK_SECRET');
  if (sir && req.headers.get('Authorization') !== `Bearer ${sir}`) return new Response('yetkisiz', { status: 401 });

  const { table, record } = (await req.json()) as Webhook;
  if (!record) return new Response('kayıt yok', { status: 400 });

  let sonuc;
  if (table === 'chat_messages') {
    if (!record.room_id || !record.sender_id) return new Response('eksik mesaj', { status: 400 });
    sonuc = await sohbetMesaji(record as Mesaj);
  } else {
    if (!record.user_id) return new Response('kayıt yok', { status: 400 });
    sonuc = await uygulamaBildirimi(record as Kayit);
  }
  return new Response(JSON.stringify(sonuc), { headers: { 'Content-Type': 'application/json' } });
});
