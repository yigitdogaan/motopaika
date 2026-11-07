/**
 * Hafif dokunma titreşimi. `expo-haptics` kurulu değilse ya da cihaz desteklemiyorsa sessizce atlanır
 * (paketi eklemek için: npx expo install expo-haptics).
 */
export function hafifTitresim(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const H: any = require('expo-haptics');
    H.impactAsync?.(H.ImpactFeedbackStyle?.Light);
  } catch {}
}

/** Başarılı bir işlem (ör. selam verildi) için kısa onay titreşimi. */
export function basariTitresimi(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const H: any = require('expo-haptics');
    H.notificationAsync?.(H.NotificationFeedbackType?.Success);
  } catch {}
}
