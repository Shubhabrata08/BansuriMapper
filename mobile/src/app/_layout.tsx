import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppThemeProvider } from '../components/AppThemeProvider';

export default function RootLayout() {
  return <AppThemeProvider><StatusBar style="light" /><Slot /></AppThemeProvider>;
}
