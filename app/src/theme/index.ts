import { palette } from './tokens';

export * from './tokens';

/** Motopaika her zaman koyu temadır (asfalt siyahı + garaj sarısı). */
export function useTheme() {
  return palette.dark;
}
