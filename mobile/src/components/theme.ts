import { Platform } from 'react-native';

export const colors = {
  background: '#101918', panel: '#1d2d29', input: '#111d1a', line: '#40544a',
  ink: '#f0f3e9', muted: '#a7b6aa', gold: '#d4b477', mint: '#9bc8a8', half: '#e5bd72',
  selected: '#343527', technique: '#303124',
} as const;

export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });
export const monospace = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
