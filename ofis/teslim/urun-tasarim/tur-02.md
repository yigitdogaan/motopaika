# Nehir (urun-tasarim) — Tur 02 (04.11.2026)

## Görevler
- [x] P1 Tema tokenları + Button, Card, ListItem, Tag, Avatar, EmptyState; API notu.
  - Tokenlar (`app/src/theme/tokens.ts`, `index.ts`) önceden vardı, sistem.md ile uyumlu; değiştirilmedi.
  - Yeni: `app/src/components/ui/{button,card,list-item,tag,avatar}.tsx`, `index.ts`; `empty-state.tsx` ikon + eylem düğmesiyle genişletildi (eski kullanım geriye uyumlu).
  - API notu: `ofis/bilgi/tasarim/ui-api.md`.
  - Kanıt: `npx jest` 2 paket / 6 test geçti (yeni `app/__tests__/ui.test.tsx` 5 test); `npx tsc --noEmit` ui/theme/__tests__ için hata yok; `npx eslint src/components/ui src/theme __tests__` temiz.
- [x] P2 Demo içerik rehberi: `ofis/bilgi/tasarim/demo-icerik.md`.

## Eksik / dürüst notlar
- Ekran görüntüsü alınmadı (bileşenler henüz bir ekranda kullanılmıyor); görsel doğrulama Test'in Playwright adımında.
- Kontrast araçla ölçülmedi (el hesabı: turuncu üstünde koyu yazı yeterli).
- `npm ci` bu ortamda çalıştırıldı (node_modules commit dışı).

## Diğer rollere
- CTO: sekme ekranları ve demo verisi `@/components/ui` + `@/theme` kullansın; `src/constants/theme.ts` ve `src/hooks/use-theme.ts` şablon kalıntısı, `@/theme` ile çakışıyor — temizlenmeli. Demo veri için `demo-icerik.md`.
- Test: `ui.test.tsx` mevcut; Playwright'ta koyu/açık tema 390 px bakılsın.

## Sonraki tur önerisi
- Input, iskelet (yükleniyor) ve hata ("Tekrar dene") bileşenleri.
- Alan kabul kriterleri (forum, sorun çözümü, ikinci el).

## Kurucuya soru
Yok.
