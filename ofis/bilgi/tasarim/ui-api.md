# UI bileşenleri — API notu (Tur 2)

İçe aktarma: `import { Button, Card, ListItem, Tag, Avatar, EmptyState } from '@/components/ui';`
Tokenlar: `import { useTheme, spacing, radius, typography } from '@/theme';` — `useTheme()` sistem temasını izler, varsayılan koyu. Ekranda ham renk/boşluk yazma.

| Bileşen | Props | Notlar |
| --- | --- | --- |
| `Button` | `label`, `onPress`, `variant` (primary\|secondary\|ghost\|danger), `size` (md\|lg), `loading`, `disabled`, `accessibilityLabel` | Min. yükseklik 44/52. primary üstünde koyu yazı (kontrast). loading iken basılamaz. |
| `Card` | `children`, `onPress?`, `accessibilityLabel?` | onPress varsa button rolü. |
| `ListItem` | `title`, `subtitle?`, `left?`, `right?`, `onPress?` | Satır min. 56 px, tek hedef; onPress varsa chevron. |
| `Tag` | `label`, `tone` (neutral\|success\|warning\|danger\|info) | Metin zorunlu; renk + kenarlık. |
| `Avatar` | `name`, `uri?`, `size` (sm 32\|md 48\|lg 80) | Resim yoksa Türkçe baş harf (ı→I). |
| `Input` | `label`, `error?`, `hint?` + TextInput props (`multiline` vb.) | Etiket üstte; hata varsa kırmızı çerçeve + `alert` rolü, hint gizlenir. Min. 48 px. |
| `SkeletonList` / `Skeleton` | `rows?` / `width`, `height`, `rounded` | Yükleniyor durumu; ekran okuyucuya tek "Yükleniyor". |
| `ErrorState` | `message?`, `onRetry?` | "Yüklenemedi" + "Tekrar dene" düğmesi (onRetry varsa). |
| `EmptyState` | `title`, `description`, `icon?`, `actionLabel?`, `onAction?` | Üç durumdan "boş". Eylem verilirse Button çıkar. |

| `Segment` | `options` ([{value,label}], 2–3 adet), `value`, `onChange`, `accessibilityLabel?` | Üstte sekme grubu; `tab` rolü + `selected`; öğe ≥ 44 px; seçili = dolgu + metin rengi. |

Üç durum kuralı: liste yüklenirken `SkeletonList`, hata olunca `ErrorState`, veri yoksa `EmptyState`.
Not (CTO): `src/constants/theme.ts` ve `src/hooks/use-theme.ts` şablon kalıntısı; yeni kod `@/theme` kullanmalı. `use-theme.ts` `@/theme/index.ts`'teki `useTheme` ile aynı adı taşıyor — şablon dosyaları temizlenirken kaldırılsın.
