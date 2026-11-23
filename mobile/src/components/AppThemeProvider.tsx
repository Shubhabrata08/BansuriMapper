import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps, PropsWithChildren } from 'react';
import { PaperProvider } from 'react-native-paper';
import { appTheme } from './theme';

const settings = {
  icon: ({ name, size, color }: { name: string; size: number; color?: string }) => (
    <MaterialCommunityIcons name={name as ComponentProps<typeof MaterialCommunityIcons>['name']} size={size} color={color} />
  ),
};

export function AppThemeProvider({ children }: PropsWithChildren) {
  return <PaperProvider theme={appTheme} settings={settings}>{children}</PaperProvider>;
}
