import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { validarUsoPromocion } from "@/servicios/api";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";

export default function ValidarPromociones() {
  const router = useRouter();

  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [codigoEscaneado, setCodigoEscaneado] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [autenticado, setAutenticado] = useState(false);
  const [verificandoHuella, setVerificandoHuella] = useState(true);

  useEffect(() => {
    async function verificarIdentidad() {
      try {
        const tieneHardware = await LocalAuthentication.hasHardwareAsync();

        const tieneHuellaRegistrada =
          await LocalAuthentication.isEnrolledAsync();

        if (!tieneHardware || !tieneHuellaRegistrada) {
          Alert.alert(
            "Autenticación no disponible",
            "Este dispositivo no tiene autenticación biométrica configurada.",
            [{ text: "Volver", onPress: () => router.back() }],
          );
          return;
        }

        const resultado = await LocalAuthentication.authenticateAsync({
          promptMessage: "Autenticá tu identidad para validar promociones",
          cancelLabel: "Cancelar",
        });

        if (resultado.success) {
          setAutenticado(true);
        } else {
          Alert.alert(
            "Acceso no autorizado",
            "Necesitás autenticarte para utilizar el lector QR.",
            [{ text: "Volver", onPress: () => router.back() }],
          );
        }
      } catch (error) {
        console.error("Error en autenticación biométrica:", error);
        Alert.alert("Error", "No se pudo verificar tu identidad.", [
          { text: "Volver", onPress: () => router.back() },
        ]);
      } finally {
        setVerificandoHuella(false);
      }
    }

    verificarIdentidad();
  }, []);

  async function procesarCodigo(codigo: string) {
    if (procesando) return;

    try {
      setProcesando(true);
      setCodigoEscaneado(codigo);

      const resultado = await validarUsoPromocion(codigo);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "¡Promoción validada!",
        "El uso de la promoción se registró correctamente.",
      );

      console.log("Resultado de la validación:", resultado);
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Error al validar el QR:", error);

      Alert.alert(
        "No se pudo validar",
        error.response?.data?.error?.mensaje ||
          "El código QR no es válido o no se pudo registrar.",
      );
    } finally {
      setProcesando(false);
    }
  }

  if (verificandoHuella) {
    return (
      <View style={estilos.cargando}>
        <ActivityIndicator size="large" />
        <Text>Verificando identidad...</Text>
      </View>
    );
  }

  if (!autenticado) {
    return null;
  }

  if (!permiso) {
    return (
      <View style={estilos.cargando}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permiso.granted) {
    return (
      <View style={estilos.contenedor}>
        <Text style={estilos.titulo}>Validar promociones</Text>

        <Text style={estilos.texto}>
          Necesitamos acceder a la cámara para escanear el código QR del
          cliente.
        </Text>

        <TouchableOpacity style={estilos.boton} onPress={solicitarPermiso}>
          <Text style={estilos.textoBoton}>Permitir acceso a la cámara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <TouchableOpacity
        style={estilos.botonVolver}
        onPress={() => router.back()}
      >
        <Text style={estilos.textoVolver}>‹ Volver</Text>
      </TouchableOpacity>

      <Text style={estilos.titulo}>Validar promociones</Text>

      <Text style={estilos.texto}>
        Apuntá la cámara al código QR que muestra el cliente.
      </Text>

      <CameraView
        style={estilos.camara}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          codigoEscaneado || procesando
            ? undefined
            : ({ data }) => procesarCodigo(data)
        }
      />

      {codigoEscaneado && (
        <View style={estilos.resultado}>
          <Text style={estilos.textoResultado}>Código detectado:</Text>
          <Text>{codigoEscaneado}</Text>

          {procesando ? (
            <ActivityIndicator size="small" style={{ marginTop: 15 }} />
          ) : (
            <TouchableOpacity
              style={estilos.boton}
              onPress={() => setCodigoEscaneado(null)}
            >
              <Text style={estilos.textoBoton}>Escanear otro código</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
    paddingTop: 40,
  },
  cargando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 15,
  },
  texto: {
    fontSize: 15,
    color: "#555555",
    marginBottom: 20,
  },
  camara: {
    width: "100%",
    height: 350,
    borderRadius: 12,
    overflow: "hidden",
  },
  boton: {
    backgroundColor: "#228B55",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  botonVolver: {
    marginBottom: 20,
  },
  textoVolver: {
    color: "#0a7ea4",
    fontSize: 16,
    fontWeight: "600",
  },
  resultado: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  textoResultado: {
    fontWeight: "bold",
    marginBottom: 5,
  },
});
