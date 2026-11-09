import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import { api } from "./api";

type Plataforma = "ios" | "android";

export async function registrarDispositivoParaNotificaciones(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      console.log("Las notificaciones push requieren un dispositivo físico.");
      return null;
    }

    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      console.log("Plataforma no compatible con notificaciones push.");
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Notificaciones",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#208AEF",
      });
    }

    const permisosActuales = await Notifications.getPermissionsAsync();
    let estadoPermisos = permisosActuales.status;

    if (estadoPermisos !== "granted") {
      const nuevosPermisos = await Notifications.requestPermissionsAsync();
      estadoPermisos = nuevosPermisos.status;
    }

    if (estadoPermisos !== "granted") {
      console.log("El usuario no autorizó las notificaciones.");
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      throw new Error("No se encontró el projectId de Expo.");
    }

    const respuestaToken = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const tokenExpo = respuestaToken.data;

    await api.post("/dispositivos", {
      tokenExpo,
      plataforma: Platform.OS as Plataforma,
    });

    console.log("Dispositivo registrado para notificaciones:", tokenExpo);

    return tokenExpo;
  } catch (error: any) {
    console.warn(
      "No se pudo registrar el dispositivo para notificaciones:",
      error.response?.data || error.message || error,
    );

    return null;
  }
}