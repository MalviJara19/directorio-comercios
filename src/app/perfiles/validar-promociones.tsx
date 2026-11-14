
import { CameraView, useCameraPermissions } from "expo-camera";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppTabs from "@/components/app-tabs";
import { validarCodigoPromocion } from "@/servicios/serviciosComercios";

export default function ValidarPromociones() {
  const router = useRouter();
  const [permiso, solicitarPermiso] = useCameraPermissions();

  const [procesando, setProcesando] = useState(false);
  const [codigoValidado, setCodigoValidado] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [validacionExitosa, setValidacionExitosa] = useState(false);

  const [autenticado, setAutenticado] = useState(false);
  const [verificandoBiometria, setVerificandoBiometria] = useState(true);

  const bloqueoEscaneo = useRef(false);

  // Autenticación biométrica al ingresar a la pantalla.
  useEffect(() => {
    let activo = true;

    async function verificarIdentidad() {
      try {
        const tieneHardware =
          await LocalAuthentication.hasHardwareAsync();

        const tieneBiometriaRegistrada =
          await LocalAuthentication.isEnrolledAsync();

        if (!activo) return;

        if (!tieneHardware || !tieneBiometriaRegistrada) {
          Alert.alert(
            "Autenticación no disponible",
            "Este dispositivo no tiene autenticación biométrica configurada.",
            [
              {
                text: "Volver",
                onPress: () => router.back(),
              },
            ]
          );
          return;
        }

        const resultado =
          await LocalAuthentication.authenticateAsync({
            promptMessage:
              "Autenticá tu identidad para validar promociones",
            cancelLabel: "Cancelar",
          });

        if (!activo) return;

        if (resultado.success) {
          setAutenticado(true);
        } else {
          Alert.alert(
            "Acceso no autorizado",
            "Necesitás autenticarte para utilizar el lector QR.",
            [
              {
                text: "Volver",
                onPress: () => router.back(),
              },
            ]
          );
        }
      } catch (error) {
        console.error("Error en autenticación biométrica:", error);

        if (activo) {
          Alert.alert(
            "Error",
            "No se pudo verificar tu identidad.",
            [
              {
                text: "Volver",
                onPress: () => router.back(),
              },
            ]
          );
        }
      } finally {
        if (activo) {
          setVerificandoBiometria(false);
        }
      }
    }

    verificarIdentidad();

    return () => {
      activo = false;
    };
  }, [router]);

  async function manejarEscaneo(resultado: { data: string }) {
    if (bloqueoEscaneo.current || !resultado.data) {
      return;
    }

    bloqueoEscaneo.current = true;
    setProcesando(true);
    setMensajeError("");
    setCodigoValidado(resultado.data);

    try {
      await validarCodigoPromocion(resultado.data);
      setValidacionExitosa(true);
    } catch (error) {
      const errorApi = error as {
        response?: {
          data?: {
            mensaje?: string;
            message?: string;
            error?: {
              mensaje?: string;
            };
          };
        };
        message?: string;
      };

      setValidacionExitosa(false);
      setMensajeError(
        errorApi.response?.data?.error?.mensaje ??
          errorApi.response?.data?.mensaje ??
          errorApi.response?.data?.message ??
          errorApi.message ??
          "No se pudo validar el código."
      );
    } finally {
      setProcesando(false);
    }
  }

  function volverAEscanear() {
    bloqueoEscaneo.current = false;
    setCodigoValidado("");
    setMensajeError("");
    setValidacionExitosa(false);
  }

  // Primero se verifica la identidad.
  if (verificandoBiometria) {
    return (
      <View style={styles.contenedor}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.descripcion}>
          Verificando identidad...
        </Text>
      </View>
    );
  }

  // Sin autenticación no se permite acceder al lector.
  if (!autenticado) {
    return null;
  }

  if (!permiso) {
    return (
      <View style={styles.contenedor}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (!permiso.granted) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.titulo}>Validar promociones</Text>

        <Text style={styles.descripcion}>
          Necesitamos permiso para utilizar la cámara y escanear los códigos QR
          de tus clientes.
        </Text>

        <TouchableOpacity
          style={styles.boton}
          onPress={solicitarPermiso}
        >
          <Text style={styles.textoBoton}>
            Permitir acceso a la cámara
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => router.back()}
        >
          <Text style={styles.textoVolver}>Volver</Text>
        </TouchableOpacity>

        <AppTabs />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.contenido}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.volver}>‹ Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Validar promociones</Text>

        <Text style={styles.descripcion}>
          Escaneá el código QR que presenta el cliente para validar el uso de
          su promoción.
        </Text>

        {!codigoValidado && (
          <View style={styles.contenedorCamara}>
            <CameraView
              style={styles.camara}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              onBarcodeScanned={
                bloqueoEscaneo.current ? undefined : manejarEscaneo
              }
            />
          </View>
        )}

        {procesando && (
          <View style={styles.resultado}>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text style={styles.descripcion}>
              Validando código...
            </Text>
          </View>
        )}

        {!procesando && validacionExitosa && (
          <View style={styles.resultado}>
            <Text style={styles.iconoExito}>✓</Text>

            <Text style={styles.tituloExito}>
              ¡Promoción validada!
            </Text>

            <Text style={styles.descripcion}>
              El código fue registrado correctamente como utilizado.
            </Text>

            <Text style={styles.codigo}>{codigoValidado}</Text>

            <TouchableOpacity
              style={styles.boton}
              onPress={volverAEscanear}
            >
              <Text style={styles.textoBoton}>
                Escanear otro código
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!procesando && mensajeError !== "" && (
          <View style={styles.resultado}>
            <Text style={styles.tituloError}>
              No se pudo validar
            </Text>

            <Text style={styles.error}>{mensajeError}</Text>

            <Text style={styles.codigo}>{codigoValidado}</Text>

            <TouchableOpacity
              style={styles.boton}
              onPress={volverAEscanear}
            >
              <Text style={styles.textoBoton}>
                Intentar nuevamente
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <AppTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    justifyContent: "center",
  },
  contenido: {
    flex: 1,
    padding: 20,
  },
  volver: {
    color: "#0a7ea4",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#263238",
    textAlign: "center",
    marginBottom: 12,
  },
  descripcion: {
    fontSize: 15,
    color: "#718096",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  contenedorCamara: {
    width: "100%",
    height: 330,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#263238",
    marginTop: 10,
  },
  camara: {
    flex: 1,
  },
  resultado: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 22,
    marginTop: 20,
  },
  iconoExito: {
    fontSize: 48,
    color: "#15803d",
    fontWeight: "bold",
  },
  tituloExito: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#15803d",
    marginVertical: 10,
  },
  tituloError: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 10,
  },
  error: {
    color: "#dc2626",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 10,
  },
  codigo: {
    color: "#263238",
    fontWeight: "bold",
    letterSpacing: 2,
    marginVertical: 12,
  },
  boton: {
    backgroundColor: "#0a7ea4",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  botonVolver: {
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  textoVolver: {
    color: "#0a7ea4",
    fontWeight: "bold",
  },
});
