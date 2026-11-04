// Kaynak: ofis/bilgi/tasarim/sistem.md — ekranlarda ham renk/boşluk yok, yalnız token.

export const palette = {
  dark: {
    primary: '#F25C05',
    onPrimary: '#16181D',
    bg: '#16181D',
    surface: '#20232A',
    surfaceAlt: '#2A2E37',
    border: '#353A45',
    text: '#F2F3F5',
    textMuted: '#A4A9B4',
    success: '#3DBA6E',
    warning: '#F2B705',
    danger: '#F0524F',
    info: '#4DA3FF',
  },
  light: {
    primary: '#F25C05',
    onPrimary: '#16181D',
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

export const radius = { sm: 8, md: 12, full: 999 } as const;

export const typography = {
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  button: { fontSize: 16, lineHeight: 20, fontWeight: '600' },
} as const;
