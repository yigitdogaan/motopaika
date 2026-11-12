// Supabase Edge Function: yüklenen fotoğrafları yapay zeka ile denetler.
// İki webhook aynı fonksiyonu çağırır:
//   1) public.posts INSERT         → gönderi fotoğrafları (photo_paths, bucket post-photos)
//   2) public.chat_messages INSERT → sohbet fotoğrafları (kind = image, media_path, bucket chat-media)
// Karar ENGELLE ise: gönderi `removed_at` ile kaldırılır (yönetim panelinden geri alınabilir),
// sohbet mesajı silinir; kullanıcıya bildirim gider. API hatasında içerik yayında kalır (fail-open) ve günlüğe HATA yazılır.
// Dağıtım: supabase functions deploy foto-moderasyon --no-verify-jwt
// Sırlar:  supabase secrets set ANTHROPIC_API_KEY=...   (anahtarı yalnız kendi terminaline yaz)
//          supabase secrets set MODERASYON_WEBHOOK_SECRET=uzun-rastgele-metin   (webhook'a "Authorization: Bearer <aynı metin>" ekle)
//          isteğe bağlı: supabase secrets set MODERASYON_MODEL=claude-haiku-4-5
import { createClient } from 'npm:@supabase/supabase-js@2';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const MODEL = Deno.env.get('MODERASYON_MODEL') ?? 'claude-haiku-4-5';

type Kayit = {
  id: string;
  author_id?: string;
  photo_paths?: string[] | null;
  sender_id?: string;
  kind?: string;
  media_path?: string | null;
};
type Karar = { karar: 'ENGELLE' | 'SERBEST'; kategori?: string; neden?: string };

const ISTEM = `Bir motosiklet topluluğu uygulamasında kullanıcı fotoğraflarını denetliyorsun.
ENGELLE: çıplaklık veya cinsel içerik, çocukları tehlikeye atan içerik, çok kanlı/parçalanmış ceset ya da ağır yaralanma görüntüsü,
şiddet/işkence, nefret sembolleri veya terör propagandası, kendine zarar, silah tehdidi, yasa dışı madde satışı.
SERBEST: motosiklet, yol, manzara, kask/ekipman, hafif kaza sonrası hasarlı araç, normal insan fotoğrafı, meme/espri görselleri (sakıncasızsa).
Emin değilsen SERBEST de. Yalnızca şu JSON'u döndür: {"karar":"ENGELLE"|"SERBEST","kategori":"cinsel|siddet|nefret|cocuk|zarar|diger","neden":"kısa Türkçe açıklama"}`;

function base64(bayt: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bayt.length; i += 0x8000) s += String.fromCharCode(...bayt.subarray(i, i + 0x8000));
  return btoa(s);
}

async function indir(kova: string, yol: string): Promise<{ veri: string; tur: string } | null> {
  const { data, error } = await db.storage.from(kova).download(yol);
  if (error || !data) return null;
  const tur = data.type && data.type.startsWith('image/') ? data.type : 'image/jpeg';
  return { veri: base64(new Uint8Array(await data.arrayBuffer())), tur };
}

async function denetle(resimler: { veri: string; tur: string }[]): Promise<Karar> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 200,
      system: ISTEM,
      messages: [{
        role: 'user',
        content: [
          ...resimler.map((x) => ({ type: 'image', source: { type: 'base64', media_type: x.tur, data: x.veri } })),
          { type: 'text', text: 'Bu fotoğraf(lar)ı denetle.' },
        ],
      }],
    }),
  });
  if (!r.ok) throw new Error(`Model hatası ${r.status}`);
  const j = await r.json();
  const metin = String(j.content?.[0]?.text ?? '');
  const m = metin.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('Model çıktısı ayrıştırılamadı');
  const k = JSON.parse(m[0]) as Karar;
  return k.karar === 'ENGELLE' ? k : { karar: 'SERBEST' };
}

async function gunluk(kind: string, refId: string, userId: string | null, decision: string, kategori?: string, neden?: string) {
  await db.from('auto_moderation_log').insert({ kind, ref_id: refId, user_id: userId, decision, category: kategori ?? null, reason: neden ?? null });
}

Deno.serve(async (req) => {
  const sir = Deno.env.get('MODERASYON_WEBHOOK_SECRET');
  if (sir && req.headers.get('authorization') !== `Bearer ${sir}`) return new Response('yetkisiz', { status: 401 });
  const govde = (await req.json().catch(() => ({}))) as { table?: string; record?: Kayit };
  const k = govde.record;
  if (!k) return new Response('kayıt yok');

  const gonderi = govde.table === 'posts';
  const yollar = gonderi ? (k.photo_paths ?? []) : k.kind === 'image' && k.media_path ? [k.media_path] : [];
  if (yollar.length === 0) return new Response('foto yok');
  const kova = gonderi ? 'post-photos' : 'chat-media';
  const kullanici = (gonderi ? k.author_id : k.sender_id) ?? null;
  const tur = gonderi ? 'post_photo' : 'chat_photo';

  try {
    const resimler = (await Promise.all(yollar.map((y) => indir(kova, y)))).filter((x): x is { veri: string; tur: string } => !!x);
    if (resimler.length === 0) throw new Error('Fotoğraf indirilemedi');
    const karar = await denetle(resimler);
    if (karar.karar === 'SERBEST') {
      await gunluk(tur, k.id, kullanici, 'SERBEST');
      return new Response('temiz');
    }
    const neden = `Fotoğrafın topluluk kurallarına aykırı bulundu (${karar.kategori ?? 'uygunsuz içerik'}). Hatalı olduğunu düşünüyorsan destek@roteri.app adresine yaz.`;
    if (gonderi) {
      await db.from('posts').update({ removed_at: new Date().toISOString(), removed_reason: `Otomatik: uygunsuz fotoğraf (${karar.kategori ?? 'diğer'})` }).eq('id', k.id);
      if (kullanici) await db.from('notifications').insert({ user_id: kullanici, type: 'post_removed', post_id: k.id, body: neden });
    } else {
      await db.from('chat_messages').delete().eq('id', k.id);
      await db.storage.from(kova).remove(yollar);
      if (kullanici) await db.from('notifications').insert({ user_id: kullanici, type: 'warning', body: neden });
    }
    await gunluk(tur, k.id, kullanici, 'ENGELLE', karar.kategori, karar.neden);
    return new Response('engellendi');
  } catch (e) {
    console.error('foto-moderasyon hatası', e);
    await gunluk(tur, k.id, kullanici, 'HATA', undefined, String(e).slice(0, 300));
    return new Response('hata', { status: 200 });
  }
});
