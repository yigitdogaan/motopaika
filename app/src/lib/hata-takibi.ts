// Hata takibi (Sentry). DSN tanımlı değilse ya da paket kurulu değilse hiçbir şey yapmaz;
// uygulama bu yüzden hiçbir koşulda bozulmaz. Kişisel veri toplanmaz: yalnızca rastgele kullanıcı kimliği gönderilir.
type SentryModu = {
  init: (o: Record<string, unknown>) => void;
  wrap: <T>(bilesen: T) => T;
  setUser: (u: { id: string } | null) => void;
  captureException: (e: unknown, ctx?: Record<string, unknown>) => void;
};

let sentry: SentryModu | null = null;

export function hataTakibiBaslat() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn || sentry) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@sentry/react-native') as SentryModu;
    mod.init({
      dsn,
      enabled: !__DEV__,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      environment: __DEV__ ? 'gelistirme' : 'uretim',
    });
    sentry = mod;
  } catch {
    sentry = null;
  }
}

export function hataTakibiSarmala<T>(bilesen: T): T {
  return sentry ? sentry.wrap(bilesen) : bilesen;
}

export function hataTakibiKullanici(id: string | null) {
  sentry?.setUser(id ? { id } : null);
}

export function hataBildir(hata: unknown, baglam?: Record<string, unknown>) {
  if (__DEV__) console.warn('[hata]', hata);
  sentry?.captureException(hata, baglam ? { extra: baglam } : undefined);
}
