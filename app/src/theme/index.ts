import { useColorScheme } from 'react-native';

import { palette } from './tokens';

export * from './tokens';

/** Sistem temasını izler; belirsizse varsayılan koyu. */
export function useTheme() {
  const scheme = useColorScheme();
  return palette[scheme === 'light' ? 'light' : 'dark'];
}
