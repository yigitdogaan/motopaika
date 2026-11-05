// Supabase Edge Function: notifications tablosuna INSERT olunca alıcının cihazlarına Expo push gönderir.
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

Deno.serve(async (req) => {
  const sir = Deno.env.get('PUSH_WEBHOOK_SECRET');
  if (sir && req.headers.get('Authorization') !== `Bearer ${sir}`) return new Response('yetkisiz', { status: 401 });

  const { record } = (await req.json()) as { record?: Kayit };
  if (!record?.user_id) return new Response('kayıt yok', { status: 400 });

  const [{ data: jetonlar }, aktor] = await Promise.all([
    db.from('push_tokens').select('token').eq('user_id', record.user_id),
    record.actor_id ? db.from('profiles').select('display_name, username').eq('id', record.actor_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  if (!jetonlar?.length) return new Response('jeton yok');

  const ad = aktor.data?.display_name ?? aktor.data?.username ?? 'Bir sürücü';
  const { baslik, icerik } = metin(record.type, ad, record.body);
  const mesajlar = jetonlar.map((j) => ({
    to: j.token, title: baslik, body: icerik, sound: 'default', channelId: 'default',
    data: { bildirimId: record.id, tur: record.type, postId: record.post_id },
  }));

  const yanit = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(mesajlar),
  });
  const sonuc = (await yanit.json()) as { data?: { status: string; details?: { error?: string } }[] };

  // Geçersiz (silinmiş uygulama) jetonları temizle
  const olu = (sonuc.data ?? []).flatMap((s, i) => (s.status === 'error' && s.details?.error === 'DeviceNotRegistered' ? [jetonlar[i].token] : []));
  if (olu.length) await db.from('push_tokens').delete().in('token', olu);

  return new Response(JSON.stringify({ gonderilen: mesajlar.length, temizlenen: olu.length }), { headers: { 'Content-Type': 'application/json' } });
});
