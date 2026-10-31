import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
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
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />

      <Stack.Screen name="auth/registro" options={{ title: "Crear cuenta" }} />

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen
        name="comercio/[id]"
        options={{ title: "Detalle del comercio" }}
      />
    </Stack>
    </ThemeProvider>
  );
}