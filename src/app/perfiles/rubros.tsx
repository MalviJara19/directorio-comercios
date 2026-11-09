
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import AppTabs from "@/components/app-tabs";
import {
  obtenerRubros,
  obtenerMiPerfil,
  actualizarRubrosDeInteres,
} from "@/servicios/api";

type Rubro = {
  id: string;
  nombre: string;
  icono?: string;
  color?: string;
  orden?: number;
};

export default function RubrosScreen() {
  const router = useRouter();

  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);

      const [listaRubros, perfil] = await Promise.all([
        obtenerRubros(),
        obtenerMiPerfil(),
      ]);

      setRubros(listaRubros ?? []);
      setSeleccionados(perfil?.rubrosDeInteres ?? []);
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudieron cargar los rubros de interés."
      );
    } finally {
      setCargando(false);
    }
  }

  function cambiarSeleccion(id: string) {
    setSeleccionados((actuales) =>
      actuales.includes(id)
        ? actuales.filter((rubroId) => rubroId !== id)
        : [...actuales, id]
    );
  }

  async function guardar() {
    try {
      setGuardando(true);

      await actualizarRubrosDeInteres(seleccionados);

      Alert.alert(
        "¡Listo!",
        "Tus rubros de interés se guardaron correctamente.",
        [
          {
            text: "Aceptar",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudieron guardar tus rubros. Intentá nuevamente."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <SafeAreaView style={styles.cargando}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.textoCargando}>Cargando rubros...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <TouchableOpacity
          style={styles.volver}
          onPress={() => router.back()}
        >
          <Text style={styles.textoVolver}>‹ Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Rubros de interés</Text>

        <Text style={styles.descripcion}>
          Elegí los rubros que más te interesan para recibir novedades
          de los comercios.
        </Text>

        <Text style={styles.contador}>
          {seleccionados.length} rubros seleccionados
        </Text>

        {rubros.map((rubro) => {
          const seleccionado = seleccionados.includes(rubro.id);

          return (
            <TouchableOpacity
              key={rubro.id}
              style={[
                styles.rubro,
                seleccionado && styles.rubroSeleccionado,
              ]}
              onPress={() => cambiarSeleccion(rubro.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.nombreRubro}>
                {rubro.nombre}
              </Text>

              <View
                style={[
                  styles.checkbox,
                  seleccionado && styles.checkboxActivo,
                ]}
              >
                {seleccionado && (
                  <Text style={styles.check}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[
            styles.botonGuardar,
            guardando && styles.botonDeshabilitado,
          ]}
          onPress={guardar}
          disabled={guardando}
        >
          <Text style={styles.textoBoton}>
            {guardando ? "Guardando..." : "Guardar preferencias"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <AppTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  contenido: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 35,
  },
  cargando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  textoCargando: {
    marginTop: 12,
    color: "#555",
  },
  volver: {
    marginBottom: 20,
  },
  textoVolver: {
    fontSize: 17,
    color: "#2563EB",
    fontWeight: "600",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#202938",
    marginBottom: 10,
  },
  descripcion: {
    fontSize: 15,
    color: "#667085",
    lineHeight: 22,
    marginBottom: 20,
  },
  contador: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475467",
    marginBottom: 12,
  },
  rubro: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E5EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rubroSeleccionado: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  nombreRubro: {
    fontSize: 16,
    color: "#202938",
    fontWeight: "500",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: "#AAB2BF",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActivo: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  check: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  botonGuardar: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
