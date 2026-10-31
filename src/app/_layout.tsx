import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
} from 'expo-router';

import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />

      <Stack initialRouteName="auth/login">
        <Stack.Screen
          name="auth/login"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="auth/registro"
          options={{ title: 'Crear cuenta' }}
        />

        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="buscar"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="explore"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="mapa"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="comercio/[id]"
          options={{ title: 'Detalle del comercio' }}
        />
      </Stack>
    </ThemeProvider>
  );
}