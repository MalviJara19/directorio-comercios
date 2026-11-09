
import { useCallback, useState } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

import {
  obtenerMiPerfil,
  actualizarAvisosActivos,
} from "../../servicios/api";
import { obtenerUsuario, cerrarSesion } from "../../servicios/sesion";
import AppTabs from "@/components/app-tabs";
import type { Usuario } from "../../tipos/usuario";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PerfilVecino() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [actualizandoAvisos, setActualizandoAvisos] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const cargarUsuario = async () => {
        try {
          const datosLocales = await obtenerUsuario();
          const perfilAPI = await obtenerMiPerfil();

          if (activo && datosLocales) {
            setUsuario({
              ...datosLocales,
              ...(perfilAPI ?? {}),
            });
          }
        } catch (error) {
          console.log("Error al cargar perfil:", error);

          if (activo) {
            const datos = await obtenerUsuario();
            setUsuario(datos);
          }
        }
      };

      cargarUsuario();

      return () => {
        activo = false;
      };
    }, [])
  );

  const handleCambiarAvisos = async () => {
    if (!usuario || actualizandoAvisos) {
      return;
    }

    const nuevoEstado = !usuario.avisosActivos;

    try {
      setActualizandoAvisos(true);

      const perfilActualizado =
        await actualizarAvisosActivos(nuevoEstado);

      setUsuario((actual) =>
        actual
          ? {
              ...actual,
              ...(perfilActualizado ?? {}),
              avisosActivos: nuevoEstado,
            }
          : actual
      );

      Alert.alert(
        "Avisos y notificaciones",
        nuevoEstado
          ? "Activaste las notificaciones."
          : "Desactivaste todas las notificaciones."
      );
    } catch (error: any) {
      console.log(
        "Error al actualizar los avisos:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.mensaje ||
          "No se pudo actualizar la configuración. Intentá nuevamente."
      );
    } finally {
      setActualizandoAvisos(false);
    }
  };

  const handleCerrarSesion = async () => {
    await cerrarSesion();
    router.replace("/auth/login");
  };

  if (!usuario) {
    return (
      <View style={styles.contenedor}>
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView
        style={styles.contenido}
        contentContainerStyle={styles.contenidoInterno}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titulo}>Hola,</Text>

        <Text style={styles.nombre}>{usuario.nombre} 👋</Text>

        <Text style={styles.descripcion}>
          ¡Bienvenido! Desde acá podrás consultar tus comercios favoritos,
          promociones y reseñas.
        </Text>

        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Mis preferencias</Text>

          <TouchableOpacity
            style={styles.opcion}
            onPress={() => router.push("/perfiles/favoritos")}
            activeOpacity={0.7}
          >
            <Text style={styles.textoOpcion}>
              ❤️ Comercios favoritos
            </Text>

            <Text style={styles.detalle}>
              {(usuario.favoritos ?? []).length} comercios guardados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.opcion}
            onPress={() => router.push("/perfiles/rubros")}
            activeOpacity={0.7}
          >
            <Text style={styles.textoOpcion}>
              🏷️ Rubros de interés
            </Text>

            <Text style={styles.detalle}>
              {(usuario.rubrosDeInteres ?? []).length} rubros seleccionados
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.opcion,
            actualizandoAvisos && styles.opcionDeshabilitada,
          ]}
          onPress={handleCambiarAvisos}
          activeOpacity={0.7}
          disabled={actualizandoAvisos}
        >
          <Text style={styles.textoOpcion}>
            🔔 Avisos y notificaciones
          </Text>

          <Text style={styles.detalle}>
            {actualizandoAvisos
              ? "Actualizando..."
              : usuario.avisosActivos
                ? "Avisos activados · Tocá para desactivar"
                : "Avisos desactivados · Tocá para activar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boton}
          onPress={handleCerrarSesion}
        >
          <Text style={styles.textoBoton}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <AppTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#fff",
  },

  contenido: {
    flex: 1,
  },

  contenidoInterno: {
    alignItems: "center",
    padding: 24,
    paddingBottom: 30,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#263238",
  },

  nombre: {
    fontSize: 28,
    fontWeight: "600",
    color: "#37474F",
  },

  descripcion: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 25,
    color: "#546E7A",
    lineHeight: 23,
  },

  seccion: {
    width: "100%",
    marginTop: 30,
  },

  tituloSeccion: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#263238",
    marginBottom: 15,
  },

  opcion: {
    width: "100%",
    backgroundColor: "#F5F6FA",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },

  opcionDeshabilitada: {
    opacity: 0.6,
  },

  textoOpcion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#37474F",
  },

  detalle: {
    fontSize: 14,
    color: "#78909C",
    marginTop: 6,
  },

  boton: {
    backgroundColor: "#263238",
    paddingVertical: 13,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 35,
  },

  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

