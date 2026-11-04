# Kararlar

tarih | kim | karar | gerekçe
--- | --- | --- | ---
2026-11-04 | kurucu | Ürün planı onaylandı; yedi alanın hepsi TEK sürümde birlikte geliştirilecek | Kurucu talimatı
2026-11-04 | kurucu | Minimum bütçe ile başlanır, ileride artırılır | Kurucu talimatı
2026-11-04 | kurucu | Ekip kararları kendi verir ve raporlar; sadece yeni işe alım kurucu onayı ister | Kurucu talimatı
2026-11-04 | kurulum | Yığın: Expo + TypeScript + Expo Router, Supabase (geliştirmede yerel), MapLibre | Ücretsiz katmanlar, tek kod tabanı
2026-11-04 | kurulum | Raporlama GitHub Issues üzerinden; Slack yok | Ek servis ve maliyet yok, kurucuya e-posta bildirimi
2026-11-04 | kurulum | İlk kullanıcı hedefi: yayından sonraki 3 ayda 1.000 kayıtlı, 200 haftalık aktif kullanıcı | Kurucu adına başlangıç hedefi; kurucu değiştirebilir
2026-11-04 | kurucu | Depo herkese açık yapıldı; günde 10 tur, 10:00–19:00 arası her saat başı | Kurucu talimatı
2026-11-04 | kurulum | Tur süresi en fazla ~55 dk (planlama 6, rol başına 9, rapor 5 dk) | Bir sonraki saat başı turuyla çakışmasın
2026-11-04 | urun-tasarim | Gezinme: 5 sekme (Topluluk[Konular/Sorunlar/Not duvarı], İkinci el, Rotalar, Etkinlik, Sohbet); bildirim+profil üst çubukta | Mobilde en fazla 5 sekme; yedi alan sığar
2026-11-04 | urun-tasarim | Oturumsuz gezme serbest, yazma eyleminde giriş; sosyal giriş ilk sürümde yok; birincil düğmede koyu yazı (kontrast) | En basit makul seçenek
2026-11-04 | moderasyon-hukuk | Not duvarında ilk sürümde fotoğraf yok; yaş sınırı 18+ varsayımı; moderasyon ilk 2 hafta İNCELEME modunda ölçülür | Hedefleme riskini ve yanlış pozitifi azaltmak; avukat/kurucu onayına açık
2026-11-04 | ceo | Tur 1 raporu yazıldı; kurucuya 3 soru (veri sorumlusu, hukuki e-posta + sunucu bölgesi, 18+) varsayılanlarla iletildi | Kurucuyu beklemeden devam; varsayılan: şahıs, yer tutucu e-posta, AB, 18+
2026-11-04 | ceo | Sonraki turda CTO önceliği: 3 tsc + 1 lint hatası, sonra supabase/ ilk şema | Kalite kapısı yeşil olmadan yeni özellik yok
2026-11-04 | ceo | Tur 2: CTO + urun-tasarim + test; moderasyon-hukuk dinlenir; öncelik kalite kapısı, vercel.json, demo modu | CLAUDE.md önceliği: önce çalışan uygulama
2026-11-04 | ceo | Tasarım tokenları/ui işi CTO'dan urun-tasarim'e alındı | Dosya sahipliği (theme, components/ui)
2026-11-04 | ceo | Tur 2 raporu yazıldı; kurucuya 2 istek iletildi: Vercel Root Directory = app, Playwright tarayıcı indirme izni (varsayılan: ikisi de verilir) | Önizleme açılması ve ekran kanıtı bunlara bağlı
2026-11-04 | cto | vercel.json app/ içinde; Vercel Root Directory app olmalı; app.json web.output = single | Expo web çıktısı tek sayfa, kök klasör app/
2026-11-04 | ceo | Kanıtsız işler [~] bırakıldı (Playwright ekran görüntüleri, Supabase şema doğrulaması) | Kanıtla bitir ilkesi
2026-11-04 | ceo | Tur 3 önceliği: CTO auth demo + profil/garaj, MapLibre + .web.tsx, şablon artıklarını silme, şema doğrulama + RLS testi | Çalışan uygulama; ortak temel ekranları test edilebilsin
2026-11-04 | kurucu | Yeni öncelik (CLAUDE.md): Expo Go'da telefonda çalışan uygulama; web önizlemesi/Vercel yok; EAS Update onizleme dalı; hukuk sona | Kurucu kararı 04.11.2026
2026-11-04 | ceo | Harita MapLibre yerine react-native-maps; kapı npx expo export -p android; Vercel/web işleri düşürüldü (Tur 3 önceliği buna göre güncellendi) | CLAUDE.md ile uyum, Expo Go'da hazır
2026-11-04 | ceo | Tur 3: cto + urun-tasarim + test; moderasyon-hukuk dinlenir; kurucudan yeni yorum yok | Çalışan uygulama önceliği
2026-11-04 | cto | Profil 6. sekme olarak eklendi; demo oturum AsyncStorage'da saklanır; profil formu Input bileşenine geçecek | gezinme.md 5 sekme der, Nehir üst çubuğa taşımak isterse değişir
2026-11-04 | ceo | Tur 3 kapısı yeşil (tsc, lint, jest 34, export android); web artıklarını silme (rm izni yok) ve RLS doğrulama (CLI/Docker yok) [~] kaldı | Kanıtla bitir ilkesi
2026-11-04 | ceo | Tur 4 önceliği: artık silme, Input/Skeleton/ErrorState ekranlarda, Bildir/Engelle + moderasyon modülü, akış testleri | Çalışan uygulama + kritik moderasyon
2026-11-04 | ceo | Tur 4: cto + urun-tasarim + test; moderasyon-hukuk dinlenir; kurucudan yeni yorum yok. oturum.test.tsx düzeltmesi dosya sahipliği gereği test rolüne verildi | Çakışmayı önlemek
