import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { desactivarPromocion, obtenerMisPromociones } from "@/servicios/api";
import { useFocusEffect, useRouter } from "expo-router";

export default function MisPromociones() {
  const router = useRouter();
  const [promociones, setPromociones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      cargarPromociones();
    }, []),
  );

  async function cargarPromociones() {
    try {
      setCargando(true);

      const datos = await obtenerMisPromociones();

      setPromociones(datos);
    } catch (error) {
      console.error("Error al obtener promociones:", error);
      Alert.alert("Error", "No se pudieron cargar las promociones.");
    } finally {
      setCargando(false);
    }
  }

  function obtenerEstado(promocion: any) {
    if (!promocion.activa) {
      return "Desactivada";
    }

    const fechaVencimiento = new Date(promocion.hasta);
    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    if (fechaVencimiento < hoy) {
      return "Vencida";
    }

    return "Activa";
  }

  async function confirmarDesactivacion(id: string) {
    Alert.alert(
      "Desactivar promoción",
      "¿Estás segura de que querés desactivar esta promoción? No aparecerá más en las fichas públicas.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Desactivar",
          style: "destructive",
          onPress: async () => {
            try {
              await desactivarPromocion(id);
              Alert.alert("Éxito", "La promoción fue desactivada.");
              cargarPromociones();
            } catch (error: any) {
              console.error("Error al desactivar promoción:", error);
              Alert.alert(
                "Error",
                error.response?.data?.error?.mensaje ||
                  "No se pudo desactivar la promoción.",
              );
            }
          },
        },
      ],
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <TouchableOpacity
        style={estilos.botonVolver}
        onPress={() => router.back()}
      >
        <Text style={estilos.textoVolver}>‹ Volver</Text>
      </TouchableOpacity>
      <Text style={estilos.titulo}>Mis promociones</Text>
      <TouchableOpacity
        style={estilos.botonCrear}
        onPress={() => router.push("/perfiles/crear-promocion")}
      >
        <Text style={estilos.textoBotonCrear}>+ Crear promoción</Text>
      </TouchableOpacity>

      {cargando ? (
        <ActivityIndicator size="large" />
      ) : promociones.length === 0 ? (
        <Text style={estilos.vacio}>
          Todavía no tenés promociones registradas.
        </Text>
      ) : (
        promociones.map((promocion, index) => (
          <View key={promocion.id || index} style={estilos.tarjeta}>
            <Text style={estilos.tituloPromocion}>{promocion.titulo}</Text>

            <Text style={estilos.detalle}>{promocion.detalle}</Text>

            <Text style={estilos.informacion}>
              Descuento:{" "}
              {promocion.descuento !== null
                ? `${promocion.descuento}%`
                : "Sin descuento porcentual"}
            </Text>

            <Text style={estilos.informacion}>
              Desde: {new Date(promocion.desde).toLocaleDateString("es-AR")}
            </Text>

            <Text style={estilos.informacion}>
              Hasta: {new Date(promocion.hasta).toLocaleDateString("es-AR")}
            </Text>

            <Text style={estilos.informacion}>Usos: {promocion.usos}</Text>

            <Text
              style={[
                estilos.estado,
                obtenerEstado(promocion) === "Vencida" && estilos.estadoVencido,
                obtenerEstado(promocion) === "Desactivada" &&
                  estilos.estadoDesactivado,
              ]}
            >
              {obtenerEstado(promocion)}
            </Text>

            <Text style={estilos.informacion}>
              {promocion.soloApp
                ? "Promoción exclusiva de la aplicación"
                : "Promoción disponible fuera de la aplicación"}
            </Text>
            <TouchableOpacity
              style={estilos.botonEditar}
              onPress={() =>
                router.push({
                  pathname: "/perfiles/editar-promocion",
                  params: { id: promocion.id },
                })
              }
            >
              <Text style={estilos.textoBotonEditar}>Editar promoción</Text>
            </TouchableOpacity>
            {promocion.activa && (
              <TouchableOpacity
                style={estilos.botonDesactivar}
                onPress={() => confirmarDesactivacion(promocion.id)}
              >
                <Text style={estilos.textoBotonDesactivar}>
                  Desactivar promoción
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  vacio: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 30,
  },
  botonVolver: {
    alignSelf: "flex-start",
    marginBottom: 20,
    paddingVertical: 8,
  },

  textoVolver: {
    fontSize: 16,
    color: "#0a7ea4",
    fontWeight: "600",
  },

  tituloPromocion: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222222",
  },

  detalle: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 10,
  },

  informacion: {
    fontSize: 14,
    color: "#444444",
    marginBottom: 6,
  },

  estado: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#228B55",
    marginTop: 8,
    marginBottom: 8,
  },
  estadoVencido: {
    color: "#D97706",
  },

  estadoDesactivado: {
    color: "#777777",
  },
  botonCrear: {
    backgroundColor: "#228B55",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  textoBotonCrear: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  botonEditar: {
    backgroundColor: "#0a7ea4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },

  textoBotonEditar: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  botonDesactivar: {
  backgroundColor: "#DC3545",
  padding: 12,
  borderRadius: 8,
  alignItems: "center",
  marginTop: 10,
},
textoBotonDesactivar: {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: "bold",
},
});
