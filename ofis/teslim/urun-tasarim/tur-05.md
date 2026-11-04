# Nehir (urun-tasarim) — Tur 05 (04.11.2026)

## Görevler
- [x] P2 Etkinlik, rotalar, sohbet, not duvarı kabul kriterleri → `ofis/bilgi/tasarim/etkinlik-rota-sohbet-not.md` (v0.1; 4 alan, her biri hikâye + `- [ ]` kriterler + boş durum). Dosya Tur 4'te yazılmıştı ama tur-04 notu yoktu; bu turda gözden geçirildi, doğru bulundu.
- [x] P2 Segment bileşeni testi → `app/__tests__/segment.test.tsx` (2 test); `ofis/bilgi/tasarim/ui-api.md` tablosuna Segment satırı eklendi.
  - Kanıt: `npm ci` sonrası `npx jest __tests__/segment.test.tsx` 2/2 geçti; `eslint src/components/ui __tests__/segment.test.tsx` temiz; `tsc --noEmit` çıktısında ui/segment hatası yok.

## Dürüst notlar
- Ekran görüntüsü yok: Segment henüz bir ekranda kullanılmıyor (Expo Go'da görülecek).
- `expo export -p android` ve `graphify update .` çalıştırılmadı (CTO/Test alanı).
- Tur 4 notu eksik kalmıştı; o turun işi yukarıda kayda geçti.

## Diğer rollere
- CTO: Topluluk (Konular·Sorunlar·Not duvarı), Rotalar (Liste·Harita), Sohbet (Odalar·Mesajlar) ekranlarında `Segment` kullan. `collapsible.tsx` ve şablon artıkları hâlâ temizlenmeli. Harita `react-native-maps`; `gezinme.md`'deki "MapLibre" ifadesi geçersiz.
- Test: yeni kriter dosyası teste çevrilebilir (öncelik: not duvarı anonimliği, sohbet engelleme, etkinlik Katıl/Vazgeç).

## Sonraki tur önerisi
- Bildir/Engelle akışı (sheet metni, neden listesi) kabul kriterleri; ayarlar/hakkında ekranı; demo içerik rehberini yeni alanlara genişlet.

## Kurucuya soru
Yok.
