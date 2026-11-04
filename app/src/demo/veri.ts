// Demo modu örnek verileri (EXPO_PUBLIC_SUPABASE_URL yokken kullanılır).
export type Oge = { id: string; baslik: string; altBaslik: string; etiket?: string };

export const demoVeri = {
  topluluk: [
    { id: 't1', baslik: 'Zincir yağlama ne sıklıkla yapılmalı?', altBaslik: 'Ahmet K. · İstanbul · 14 yorum', etiket: 'Bakım' },
    { id: 't2', baslik: 'MT-07 için en iyi lastik hangisi?', altBaslik: 'Elif D. · Ankara · 32 yorum', etiket: 'Lastik' },
    { id: 't3', baslik: 'Motor çalışıyor ama rölantide titriyor', altBaslik: 'Mert S. · İzmir · Açık sorun', etiket: 'Sorun' },
    { id: 't4', baslik: 'Kış öncesi akü bakımı ipuçları', altBaslik: 'Burak T. · Bursa · 9 yorum', etiket: 'Bakım' },
    { id: 't5', baslik: 'Not: Dün Kınalı çıkışında kayganlık vardı, dikkat.', altBaslik: 'Anonim · Not duvarı', etiket: 'Not' },
  ],
  ikinciEl: [
    { id: 'i1', baslik: 'Honda CB650R 2021 · 18.000 km', altBaslik: '389.000 ₺ · İstanbul', etiket: 'Motor' },
    { id: 'i2', baslik: 'Shoei NXR2 kask, M beden, az kullanılmış', altBaslik: '9.500 ₺ · Ankara', etiket: 'Ekipman' },
    { id: 'i3', baslik: 'Yamaha MT-07 egzoz (Akrapovič)', altBaslik: '14.000 ₺ · İzmir', etiket: 'Parça' },
    { id: 'i4', baslik: 'Kawasaki Versys 650 2018', altBaslik: '265.000 ₺ · Antalya', etiket: 'Motor' },
  ],
  rotalar: [
    { id: 'r1', baslik: 'Şile – Ağva sahil yolu', altBaslik: '92 km · Virajlı · Manzara', etiket: 'İstanbul' },
    { id: 'r2', baslik: 'Bolu – Abant – Gölcük', altBaslik: '78 km · Orman · Mola: Abant', etiket: 'Bolu' },
    { id: 'r3', baslik: 'Datça yarımadası turu', altBaslik: '110 km · Deniz manzarası', etiket: 'Muğla' },
    { id: 'r4', baslik: 'Karadeniz – Zigana geçidi', altBaslik: '64 km · Dağ yolu · Dikkat: sis', etiket: 'Gümüşhane' },
  ],
  etkinlik: [
    { id: 'e1', baslik: 'Pazar sabahı Şile kahvaltı sürüşü', altBaslik: '09 Kas 2026 · 08:00 · 23 katılımcı', etiket: 'İstanbul' },
    { id: 'e2', baslik: 'Ankara Eymir Gölü buluşması', altBaslik: '15 Kas 2026 · 11:00 · 41 katılımcı', etiket: 'Ankara' },
    { id: 'e3', baslik: 'Kış öncesi bakım atölyesi', altBaslik: '22 Kas 2026 · 14:00 · 17 katılımcı', etiket: 'İzmir' },
  ],
  sohbet: [
    { id: 's1', baslik: 'İstanbul Sürücüleri', altBaslik: '128 çevrimiçi · Son: "Yarın Şile var mı?"', etiket: 'Oda' },
    { id: 's2', baslik: 'Ankara Motorcular', altBaslik: '64 çevrimiçi · Son: "Eymir pazar günü"', etiket: 'Oda' },
    { id: 's3', baslik: 'Yeni Başlayanlar', altBaslik: '210 çevrimiçi · Son: "Ehliyet sınıfı sorusu"', etiket: 'Oda' },
    { id: 's4', baslik: 'Teknik Sorular', altBaslik: '87 çevrimiçi · Son: "Zincir gerginliği kaç mm?"', etiket: 'Oda' },
  ],
} satisfies Record<string, Oge[]>;
