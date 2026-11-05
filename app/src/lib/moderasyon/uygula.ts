import { Alert } from 'react-native';

import { denetle, type Baglam } from './index';

/**
 * Gönderilecek metni içerik kurallarından geçirir.
 * ENGELLE → uyarı gösterir, null döner (gönderme). MASKELE → kişisel veriyi *** yapıp bildirir ve temiz metni döner.
 * İNCELEME ve SERBEST → metin olduğu gibi gider.
 */
export function suz(metin: string, baglam: Baglam): string | null {
  const s = denetle(metin, baglam);
  if (s.karar === 'ENGELLE') {
    Alert.alert('Bu içerik paylaşılamaz', `${s.neden ?? 'Topluluk kurallarına aykırı'} içerdiği için gönderilmedi. Metni düzenleyip tekrar dene.`);
    return null;
  }
  if (s.karar === 'MASKELE') {
    Alert.alert('Kişisel bilgi gizlendi', `${s.neden ?? 'Kişisel bilgi'} güvenliğin için gizlendi (***). Mesaj bu hâliyle gönderildi.`);
  }
  return s.metin;
}
