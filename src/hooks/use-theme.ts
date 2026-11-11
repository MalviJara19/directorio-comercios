
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export function useTheme() {
  const scheme = useColorScheme();
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : 'light';

  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[theme][colorName];
}
