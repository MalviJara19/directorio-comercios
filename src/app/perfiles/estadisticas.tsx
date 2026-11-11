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

import { obtenerMisPromociones } from "@/servicios/api";
import { useFocusEffect, useRouter } from "expo-router";

export default function Estadisticas() {
  const router = useRouter();

  const [promociones, setPromociones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const totalPromociones = promociones.length;

  const promocionesActivas = promociones.filter((promo) => promo.activa).length;

  const promocionesDesactivadas = promociones.filter(
    (promo) => !promo.activa,
  ).length;

  const totalUsos = promociones.reduce(
    (total, promo) => total + (promo.usos || 0),
    0,
  );

  const promocionMasUtilizada = promociones.reduce(
    (mayor, promo) => ((promo.usos || 0) > (mayor?.usos || 0) ? promo : mayor),
    null as any,
  );

  useFocusEffect(
    useCallback(() => {
      cargarEstadisticas();
    }, []),
  );

  async function cargarEstadisticas() {
    try {
      setCargando(true);

      const datos = await obtenerMisPromociones();
      setPromociones(datos);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      Alert.alert("Error", "No se pudieron cargar las estadísticas.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <TouchableOpacity
        style={estilos.botonVolver}
        onPress={() => router.back()}
      >
        <Text style={estilos.textoVolver}>‹ Volver</Text>
      </TouchableOpacity>

      
      <Text style={estilos.titulo}>Estadísticas</Text>

      {cargando ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <View style={estilos.tarjeta}>
            <Text style={estilos.numero}>{totalPromociones}</Text>
            <Text style={estilos.descripcion}>Total de promociones</Text>
          </View>

          <View style={estilos.tarjeta}>
            <Text style={estilos.numero}>{promocionesActivas}</Text>
            <Text style={estilos.descripcion}>Promociones activas</Text>
          </View>

          <View style={estilos.tarjeta}>
            <Text style={estilos.numero}>{promocionesDesactivadas}</Text>
            <Text style={estilos.descripcion}>Promociones desactivadas</Text>
          </View>

          <View style={estilos.tarjeta}>
            <Text style={estilos.numero}>{totalUsos}</Text>
            <Text style={estilos.descripcion}>Usos totales</Text>
          </View>

          <View style={estilos.tarjeta}>
            <Text style={estilos.descripcion}>Promoción más utilizada</Text>
            <Text style={estilos.tituloPromocion}>
              {promocionMasUtilizada && promocionMasUtilizada.usos > 0
                ? promocionMasUtilizada.titulo
                : "Todavía no hay usos registrados"}
            </Text>

            {promocionMasUtilizada && promocionMasUtilizada.usos > 0 && (
              <Text style={estilos.descripcion}>
                {promocionMasUtilizada.usos} usos
              </Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 20,
    backgroundColor: "#F5F5F5",
    flexGrow: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#222222",
  },

  tarjeta: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  numero: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#228B55",
    marginBottom: 5,
  },
  descripcion: {
    fontSize: 15,
    color: "#666666",
  },
  tituloPromocion: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222222",
    marginTop: 10,
  },
  botonVolver: {
    marginTop: 15,
    marginBottom: 20,
  },
  textoVolver: {
    fontSize: 16,
    color: "#0a7ea4",
    fontWeight: "600",
  },
});
