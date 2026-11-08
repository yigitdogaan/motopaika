// app.json'a ek olarak: Android Google Maps anahtarı yapı sırasında ortam değişkeninden alınır (dosyaya yazılmaz).
// Anahtar yoksa harita ekranı çökmesin diye uygulama listeye geçer (extra.haritaAnahtari).
module.exports = ({ config }) => {
  const anahtar = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  return {
    ...config,
    android: {
      ...config.android,
      ...(anahtar ? { config: { googleMaps: { apiKey: anahtar } } } : {}),
    },
    extra: { ...config.extra, haritaAnahtari: !!anahtar },
  };
};
