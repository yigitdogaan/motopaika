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
| `EmptyState` | `title`, `description`, `icon?`, `actionLabel?`, `onAction?` | Üç durumdan "boş". Eylem verilirse Button çıkar. |

Kapsam dışı (sonraki tur): Input, iskelet (yükleniyor), hata durumu bileşeni ("Tekrar dene").
Not (CTO): `src/constants/theme.ts` ve `src/hooks/use-theme.ts` şablon kalıntısı; yeni kod `@/theme` kullanmalı. `use-theme.ts` `@/theme/index.ts`'teki `useTheme` ile aynı adı taşıyor — şablon dosyaları temizlenirken kaldırılsın.
