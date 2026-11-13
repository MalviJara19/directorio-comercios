
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  obtenerComercios,
  obtenerPromociones,
} from "../../servicios/serviciosComercios";

import type {
  Promocion,
  RubroComercio,
} from "../../tipos/comercios";

type Categoria = "vigentes" | "proximas" | "porVencer";

const DIAS_POR_VENCER = 7;

const nombresRubros: Record<RubroComercio, string> = {
  gastronomia: "Gastronomía",
  indumentaria: "Indumentaria",
  hogar: "Hogar",
  "ferreteria y construccion": "Ferretería",
  "salud y farmacia": "Salud y farmacia",
  servicios: "Servicios",
  tecnologia: "Tecnología",
  libreria: "Librería",
  otros: "Otros",
};

export default function PromosScreen() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);

  const [comercios, setComercios] = useState<
    { id: string; nombre: string; rubro: RubroComercio }[]
  >([]);

  const [categoria, setCategoria] = useState<Categoria>("vigentes");
  const [filtroApp, setFiltroApp] = useState(false);
  const [rubroSeleccionado, setRubroSeleccionado] =
    useState<RubroComercio | "todos">("todos");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [promocionesApi, comerciosApi] = await Promise.all([
          obtenerPromociones(),
          obtenerComercios(),
        ]);

        setPromociones(promocionesApi);

        setComercios(
          comerciosApi.map((comercio) => ({
            id: comercio.id,
            nombre: comercio.nombre,
            rubro: comercio.rubro,
          }))
        );
      } catch (e) {
        console.error("Error al cargar promociones:", e);
        setError("No se pudieron cargar las promociones.");
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []);

  const ahora = new Date();
  const limitePorVencer =
    ahora.getTime() + DIAS_POR_VENCER * 24 * 60 * 60 * 1000;

  const promocionesFiltradas = promociones.filter((promo) => {
    const desde = new Date(promo.desde);
    const hasta = new Date(promo.hasta);

    // No mostrar promociones desactivadas o vencidas.
    if (!promo.activa || hasta < ahora) {
      return false;
    }

    // Filtrar por categoría.
    if (categoria === "vigentes") {
      if (desde > ahora) return false;
    }

    if (categoria === "proximas") {
      if (desde <= ahora) return false;
    }

    if (categoria === "porVencer") {
      if (desde > ahora || hasta.getTime() > limitePorVencer) {
        return false;
      }
    }

    // Filtrar promociones exclusivas de la aplicación.
    if (filtroApp && !promo.soloApp) {
      return false;
    }

    // Filtrar por rubro del comercio.
    if (rubroSeleccionado !== "todos") {
      const comercio = comercios.find(
        (item) => item.id === promo.comercioId
      );

      if (comercio?.rubro !== rubroSeleccionado) {
        return false;
      }
    }

    return true;
  });

  function nombreComercio(comercioId: string): string {
    return (
      comercios.find((comercio) => comercio.id === comercioId)?.nombre ??
      "Comercio adherido"
    );
  }

  const rubrosDisponibles = Array.from(
    new Set(comercios.map((comercio) => comercio.rubro))
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>🏷️ Promociones</Text>

      <Text style={styles.subtitulo}>
        Aprovechá las promociones de los comercios
      </Text>

      <Text style={styles.tituloSeccion}>Categorías</Text>

      <View style={styles.filtros}>
        <TouchableOpacity
          style={[
            styles.botonFiltro,
            categoria === "vigentes" && styles.filtroActivo,
          ]}
          onPress={() => setCategoria("vigentes")}
        >
          <Text
            style={[
              styles.textoFiltro,
              categoria === "vigentes" && styles.textoFiltroActivo,
            ]}
          >
            Vigentes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botonFiltro,
            categoria === "proximas" && styles.filtroActivo,
          ]}
          onPress={() => setCategoria("proximas")}
        >
          <Text
            style={[
              styles.textoFiltro,
              categoria === "proximas" && styles.textoFiltroActivo,
            ]}
          >
            Próximas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botonFiltro,
            categoria === "porVencer" && styles.filtroActivo,
          ]}
          onPress={() => setCategoria("porVencer")}
        >
          <Text
            style={[
              styles.textoFiltro,
              categoria === "porVencer" && styles.textoFiltroActivo,
            ]}
          >
            Por vencer
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tituloSeccion}>Tipo de promoción</Text>

      <View style={styles.filtros}>
        <TouchableOpacity
          style={[
            styles.botonFiltro,
            !filtroApp && styles.filtroActivo,
          ]}
          onPress={() => setFiltroApp(false)}
        >
          <Text
            style={[
              styles.textoFiltro,
              !filtroApp && styles.textoFiltroActivo,
            ]}
          >
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botonFiltro,
            filtroApp && styles.filtroActivo,
          ]}
          onPress={() => setFiltroApp(true)}
        >
          <Text
            style={[
              styles.textoFiltro,
              filtroApp && styles.textoFiltroActivo,
            ]}
          >
            Exclusivas de la app
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tituloSeccion}>Filtrar por rubro</Text>

      <View style={styles.filtrosRubros}>
        <TouchableOpacity
          style={[
            styles.botonFiltro,
            rubroSeleccionado === "todos" && styles.filtroActivo,
          ]}
          onPress={() => setRubroSeleccionado("todos")}
        >
          <Text
            style={[
              styles.textoFiltro,
              rubroSeleccionado === "todos" && styles.textoFiltroActivo,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        {rubrosDisponibles.map((rubro) => (
          <TouchableOpacity
            key={rubro}
            style={[
              styles.botonFiltro,
              rubroSeleccionado === rubro && styles.filtroActivo,
            ]}
            onPress={() => setRubroSeleccionado(rubro)}
          >
            <Text
              style={[
                styles.textoFiltro,
                rubroSeleccionado === rubro && styles.textoFiltroActivo,
              ]}
            >
              {nombresRubros[rubro]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : error ? (
        <Text style={styles.mensaje}>{error}</Text>
      ) : promocionesFiltradas.length === 0 ? (
        <Text style={styles.mensaje}>
          No hay promociones disponibles con estos filtros.
        </Text>
      ) : (
        promocionesFiltradas.map((promo) => (
          <View key={promo.id} style={styles.card}>
            {promo.soloApp && (
              <Text style={styles.etiqueta}>
                EXCLUSIVA DE LA APP
              </Text>
            )}

            <Text style={styles.comercio}>
              {nombreComercio(promo.comercioId)}
            </Text>

            <Text style={styles.promo}>{promo.titulo}</Text>

            {promo.descuento !== null && (
              <Text style={styles.descuento}>
                {promo.descuento}% de descuento
              </Text>
            )}

            <Text style={styles.detalle}>{promo.detalle}</Text>

            <Text style={styles.vencimiento}>
              {categoria === "proximas"
                ? `Comienza el ${new Date(promo.desde).toLocaleDateString("es-AR")}`
                : `Válida hasta el ${new Date(promo.hasta).toLocaleDateString("es-AR")}`}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 35,
    paddingBottom: 30,
    backgroundColor: "#ffffff",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 16,
    textAlign: "center",
    color: "#666666",
    marginBottom: 25,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
  },
  filtros: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 22,
  },
  filtrosRubros: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 25,
  },
  botonFiltro: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#eeeeee",
  },
  filtroActivo: {
    backgroundColor: "#2563eb",
  },
  textoFiltro: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "600",
  },
  textoFiltroActivo: {
    color: "#ffffff",
  },
  card: {
    width: "100%",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#f2f2f2",
    marginBottom: 15,
  },
  etiqueta: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
  },
  comercio: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 8,
  },
  promo: {
    fontSize: 17,
    marginBottom: 8,
  },
  descuento: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#15803d",
    marginBottom: 8,
  },
  detalle: {
    fontSize: 15,
    color: "#444444",
    marginBottom: 12,
  },
  vencimiento: {
    fontSize: 12,
    color: "#777777",
  },
  mensaje: {
    textAlign: "center",
    fontSize: 15,
    color: "#666666",
    marginTop: 25,
  },
});
