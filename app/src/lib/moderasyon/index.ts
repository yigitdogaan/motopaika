/** Temel içerik süzme. Kural kaynağı: ofis/bilgi/hukuk/moderasyon-kaliplari.md (ilk tahmin, gerçek veriyle ayarlanır). */

export type Karar = 'SERBEST' | 'MASKELE' | 'INCELEME' | 'ENGELLE';
export type Baglam = 'forum' | 'ilan' | 'sohbet' | 'notDuvari';
export type Sonuc = { karar: Karar; metin: string; neden?: string };

const SIRA: Karar[] = ['SERBEST', 'MASKELE', 'INCELEME', 'ENGELLE'];

/** Türkçe küçük harf, harf tekrarını sadeleştir, harf arası ayraçları sil ("k a p o r a" → "kapora"). */
export function normallestir(s: string): string {
  let t = s.toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ü/g, 'u');
  t = t.replace(/(\p{L})\1{2,}/gu, '$1');
  // tek harflerden oluşan diziyi birleştir
  t = t.replace(/(?:^|(?<=\s))(?:\p{L}[\s.\-*]+){2,}\p{L}(?=\s|$)/gu, (m) => m.replace(/[\s.\-*]/g, ''));
  return t;
}

export function tcKimlikGecerli(s: string): boolean {
  if (!/^[1-9]\d{10}$/.test(s)) return false;
  const d = s.split('').map(Number);
  const tek = d[0] + d[2] + d[4] + d[6] + d[8];
  const cift = d[1] + d[3] + d[5] + d[7];
  const d10 = (((tek * 7 - cift) % 10) + 10) % 10;
  const d11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return d[9] === d10 && d[10] === d11;
}

const TELEFON = /(?:\+?90|0)?[\s.-]*5\d{2}[\s.-]*\d{3}[\s.-]*\d{2}[\s.-]*\d{2}/g;
const EPOSTA = /[\w.+-]+@[\w-]+\.[\w.]+/g;
const IBAN = /TR\d{2}(?:\s?\d{4}){5}\s?\d{2}/gi;
const PLAKA = /\b(?:0[1-9]|[1-7]\d|8[01])\s?[A-ZÇĞİÖŞÜ]{1,3}\s?\d{2,4}\b/g;
const HANE11 = /\b\d{11}\b/g;

type Kural = { ad: string; re: RegExp; karar: Karar; baglamlar?: Baglam[] };
// Normalleştirilmiş metinde aranır (küçük harf, aksansız).
const KURALLAR: Kural[] = [
  { ad: 'Tehdit', re: /seni bulurum|oldurecegim|kafani kiracagim|yolda yakalarim/, karar: 'ENGELLE' },
  { ad: 'Bahis/spam', re: /\b(?:bahis|casino|kripto kazan|yatirim garanti)\b/, karar: 'ENGELLE' },
  { ad: 'Önce ödeme', re: /once havale|eft yap sonra|odeme yap kargo/, karar: 'ENGELLE', baglamlar: ['ilan'] },
  { ad: 'Önce ödeme', re: /once havale|eft yap sonra|odeme yap kargo/, karar: 'INCELEME' },
  { ad: 'Ödeme linki', re: /bit\.ly|odeme linki/, karar: 'ENGELLE' },
  { ad: 'Kapora', re: /\b(?:kapora|kaparo|depozito)\b|rezerve ucreti/, karar: 'INCELEME' },
  { ad: 'Dışarı çekme', re: /\b(?:whatsapp|telegram)\b|wa\.me|\bwp\b/, karar: 'INCELEME', baglamlar: ['ilan', 'sohbet'] },
  { ad: 'Yasaklı ürün', re: /evraksiz|plakasiz|ruhsatsiz|km dusurme|sasi kazima/, karar: 'INCELEME', baglamlar: ['ilan'] },
  { ad: 'Kendine zarar', re: /intihar|kendimi oldurecegim/, karar: 'INCELEME' },
  { ad: 'Kullanıcı etiketi', re: /(?:^|\s)@\w+/, karar: 'ENGELLE', baglamlar: ['notDuvari'] },
];

export function denetle(metin: string, baglam: Baglam): Sonuc {
  const durum: { karar: Karar; neden?: string } = { karar: 'SERBEST' };
  const isaretle = (k: Karar, n: string) => {
    if (SIRA.indexOf(k) > SIRA.indexOf(durum.karar)) {
      durum.karar = k;
      durum.neden = n;
    }
  };

  // Kişisel veri: önce maskele (not duvarında engelle).
  const katiBaglam = baglam === 'notDuvari';
  let cikti = metin;
  const maskele = (re: RegExp, n: string, engelle = false, dogrula?: (m: string) => boolean) => {
    cikti = cikti.replace(re, (m) => {
      if (dogrula && !dogrula(m)) return m;
      isaretle(engelle ? 'ENGELLE' : 'MASKELE', n);
      return '***';
    });
  };
  maskele(EPOSTA, 'E-posta', katiBaglam);
  maskele(IBAN, 'IBAN', katiBaglam);
  maskele(HANE11, 'TC kimlik', katiBaglam, tcKimlikGecerli);
  maskele(TELEFON, 'Telefon', katiBaglam);
  maskele(PLAKA, 'Plaka', katiBaglam);

  const n = normallestir(metin);
  for (const k of KURALLAR) {
    if (k.baglamlar && !k.baglamlar.includes(baglam)) continue;
    if (k.re.test(n)) isaretle(k.karar, k.ad);
  }
  return { karar: durum.karar, metin: durum.karar === 'ENGELLE' ? '' : cikti, neden: durum.neden };
}
