import Svg, { Path } from 'react-native-svg';

export function GoogleG({ boyut = 20 }: { boyut?: number }) {
  return (
    <Svg width={boyut} height={boyut} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </Svg>
  );
}

export function AppleLogo({ boyut = 20, renk = '#000' }: { boyut?: number; renk?: string }) {
  return (
    <Svg width={boyut} height={boyut} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Path
        fill={renk}
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
      />
    </Svg>
  );
}

const YOLLAR = {
  eposta: 'M3 6h18v12H3zM3 7l9 6.5L21 7',
  kilit: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 017 0v3',
  kullanici: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20.5a7.5 7.5 0 0115 0',
  goz: 'M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  gozKapali: 'M3 3l18 18M10.6 6a9 9 0 011.4-.1c6.5 0 10 6.1 10 6.1a17 17 0 01-3.3 4M6.5 7.3A16 16 0 002 12s3.5 6.5 10 6.5c1.5 0 2.8-.3 4-.8M9.9 9.9a3 3 0 004.2 4.2',
  kod: 'M5 12h14M13 6l6 6-6 6',
} as const;

export function GirisIkon({ ad, boyut = 20, renk }: { ad: keyof typeof YOLLAR; boyut?: number; renk: string }) {
  return (
    <Svg width={boyut} height={boyut} viewBox="0 0 24 24" fill="none" stroke={renk} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d={YOLLAR[ad]} />
    </Svg>
  );
}
