# Tasarım sistemi (v0.1)

Kod karşılığı: `app/src/theme/` (tokenlar), `app/src/components/ui/` (bileşenler). Ekranlarda ham renk/boşluk değeri kullanılmaz, yalnız token.

## Renk
| Token | Koyu (varsayılan) | Açık | Not |
| --- | --- | --- | --- |
| primary | #F25C05 | #F25C05 | Ana eylem, aktif sekme. Üstündeki yazı koyu `#16181D` (beyaz yazı ≈3.4:1, yetersiz) |
| bg | #16181D | #FFFFFF | Sayfa zemini |
| surface | #20232A | #F4F5F7 | Kart, input |
| surfaceAlt | #2A2E37 | #E8EAEE | Seçili satır, chip |
| border | #353A45 | #D5D8DE | |
| text | #F2F3F5 | #16181D | Ana metin |
| textMuted | #A4A9B4 | #5B6270 | İkincil metin |
| success | #3DBA6E | #1E8A4B | Çözüldü, onaylı |
| warning | #F2B705 | #8A6400 | Dolandırıcılık uyarısı vb. |
| danger | #F0524F | #C62828 | Sil, şikâyet, hata |
| info | #4DA3FF | #1D6FD1 | |

Kontrast: metin ≥ 4.5:1, büyük metin/ikon ≥ 3:1. Durum yalnız renkle verilmez; ikon veya metin eşlik eder.
Tema sistem ayarını izler, varsayılan koyu; kullanıcı profilden değiştirebilir.

## Tipografi
Sistem yazı tipi (ek font yok; Türkçe karakterler tam desteklenir). Dinamik yazı boyutu desteklenir, sabit yükseklik kullanılmaz.
| Token | Boyut/satır | Ağırlık |
| --- | --- | --- |
| title | 24/30 | 700 |
| heading | 18/24 | 600 |
| body | 16/22 | 400 |
| bodyStrong | 16/22 | 600 |
| caption | 13/18 | 400 |
| button | 16/20 | 600 |

## Boşluk, köşe, gölge
- Boşluk (4 tabanlı): xs 4 · sm 8 · md 12 · lg 16 · xl 24 · xxl 32. Ekran yan boşluğu `lg`.
- Köşe: sm 8 (input, chip) · md 12 (kart) · full 999 (avatar, rozet).
- Gölge: koyu temada yok (kenarlık); açık temada tek hafif seviye.
- Dokunma alanı ≥ 44×44 px (küçük ikonlarda `hitSlop`).
- Hareket 150–250 ms; "hareketi azalt" ayarına uyulur.

## Bileşenler
| Bileşen | Varyant / durum | Erişilebilirlik |
| --- | --- | --- |
| Button | primary, secondary, ghost, danger · md/lg · loading, disabled | role=button, yüklenirken busy |
| Input | üstte etiket, yardım/hata metni, çok satırlı seçenek | Etiket okunur, hata ekran okuyucuya iletilir |
| Card | düz, dokunulabilir | Dokunulabilirse role=button |
| Avatar | sm 32 / md 48 / lg 80; resim yoksa baş harf | Ad etiketi |
| Badge | nötr, success, warning, danger, rozet | Metin zorunlu |
| ListItem | başlık, alt metin, sol/sağ öğe, chevron | Tüm satır tek hedef |
| EmptyState | ikon, başlık, açıklama, tek eylem | |

Yükleniyor: iskelet satırlar. Hata: mesaj + "Tekrar dene". Boş: EmptyState. Üç durum her liste ekranında zorunlu.

## Metin tonu
Türkçe, sen dili, kısa. Hata mesajı suçlamaz, çözüm söyler ("Bağlantı yok. İnternetini kontrol edip tekrar dene.").
