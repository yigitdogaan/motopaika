import { Platform } from 'react-native';

// Kaynak: ofis/bilgi/tasarim/sistem.md — ekranlarda ham renk/boşluk yok, yalnız token.

export const palette = {
  dark: {
    primary: '#FFB800',
    onPrimary: '#121212',
    onAccent: '#FFFFFF',
    header: '#1E3731',
    ink: '#1F3F46',
    lime: '#C6F135',
    onLime: '#16181D',
    navy: '#1B2250',
    onNavyMuted: '#B8BDD8',
    navyYuzey: '#2B3373',
    headerYuzey: '#314F47',
    headerMuted: '#B7C7C1',
    tintYesil: '#1F3A2C',
    tintMavi: '#1E2D4D',
    tintTuruncu: '#3A2A1E',
    bg: '#121212',
    surface: '#1E1E1E',
    surfaceAlt: '#2A2A2A',
    border: '#333333',
    text: '#F5F5F5',
    textMuted: '#9A9A9A',
    success: '#3DDC84',
    warning: '#FFB800',
    danger: '#FF5A4F',
    info: '#4DA3FF',
  },
  light: {
    primary: '#F25C05',
    onPrimary: '#16181D',
    onAccent: '#FFFFFF',
    header: '#1E3731',
    ink: '#0B1F26',
    lime: '#C6F135',
    onLime: '#16181D',
    navy: '#1B2250',
    onNavyMuted: '#B8BDD8',
    navyYuzey: '#2B3373',
    headerYuzey: '#314F47',
    headerMuted: '#B7C7C1',
    tintYesil: '#E2F2E8',
    tintMavi: '#E3EAF9',
    tintTuruncu: '#FDE9DC',
    bg: '#FFFFFF',
    surface: '#F4F5F7',
    surfaceAlt: '#E8EAEE',
    border: '#D5D8DE',
    text: '#16181D',
    textMuted: '#5B6270',
    success: '#1E8A4B',
    warning: '#8A6400',
    danger: '#C62828',
    info: '#1D6FD1',
  },
} as const;

export type ColorToken = keyof typeof palette.dark;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 } as const;

export const typography = {
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  button: { fontSize: 16, lineHeight: 20, fontWeight: '600' },
} as const;

/** Başlık ve gönderi adları için serifli yazı tipi (tasarımdaki gibi). */
export const fontSerif = Platform.select({ ios: 'Georgia', default: 'serif' });
