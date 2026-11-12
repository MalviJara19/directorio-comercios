import { useEffect } from "react";
import { inicializarBaseDatos } from "@/servicios/base-datos";



import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";

import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { StatusBar } from "react-native";

export const unstable_settings = {
  anchor: "bienvenida",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
    useEffect(() => {
    inicializarBaseDatos()
      .then(() => {
        console.log("SQLite está listo para utilizarse.");
      })
      .catch((error) => {
        console.error("Error al inicializar SQLite:", error);
      });
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar barStyle="dark-content" />
      <AnimatedSplashOverlay />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="bienvenida" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen
          name="cuenta/visitante"
          options={{ headerShown: false }}
        />

        <Stack.Screen name="perfiles/vecino" options={{ headerShown: false }} />

        <Stack.Screen
          name="perfiles/comercio"
          options={{ title: "Mi comercio" }}
        />
        <Stack.Screen
          name="perfiles/datos-comercio"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="perfiles/fotos-videos"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="auth/registro"
          options={{ title: "Crear cuenta" }}
        />

        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen name="buscar" options={{ headerShown: false }} />

        <Stack.Screen name="explore" options={{ headerShown: false }} />

        <Stack.Screen name="mapa" options={{ headerShown: false }} />

        <Stack.Screen
          name="comercio/[id]"
          options={{ title: "Detalle del comercio" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
