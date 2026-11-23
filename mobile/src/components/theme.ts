import { Platform } from 'react-native';
import { MD3DarkTheme, type MD3Theme } from 'react-native-paper';

export const colors = {
  background: '#101918', panel: '#182522', input: '#111d1a', line: '#40544a',
  ink: '#f0f3e9', muted: '#a7b6aa', gold: '#d4b477', mint: '#9bc8a8', half: '#e5bd72',
  selected: '#343527', technique: '#303124',
} as const;

export const monospace = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export const appTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 4,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.gold,
    onPrimary: colors.background,
    primaryContainer: colors.selected,
    onPrimaryContainer: colors.ink,
    secondary: colors.mint,
    onSecondary: colors.background,
    secondaryContainer: '#31483e',
    onSecondaryContainer: colors.ink,
    tertiary: colors.half,
    onTertiary: colors.background,
    tertiaryContainer: colors.technique,
    onTertiaryContainer: colors.ink,
    background: colors.background,
    onBackground: colors.ink,
    surface: colors.panel,
    onSurface: colors.ink,
    surfaceVariant: '#223630',
    onSurfaceVariant: colors.muted,
    outline: '#71857a',
    outlineVariant: colors.line,
    inverseSurface: colors.ink,
    inverseOnSurface: colors.background,
    inversePrimary: '#72552a',
    elevation: {
      level0: 'transparent', level1: colors.panel, level2: '#1d2d29',
      level3: '#223630', level4: '#293d34', level5: '#31483e',
    },
  },
};
