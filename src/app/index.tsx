
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AppTabs from "@/components/app-tabs";
import { Comercio } from "@/tipos/comercios";
import { estaAbiertoAhora } from "@/utilidades/horarios";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  agregarFavorito,
  obtenerComercios as obtenerComerciosAPI,
  obtenerMiPerfil,
  quitarFavorito,
} from "../servicios/api";
import { obtenerToken } from "../servicios/sesion";

const RUBROS_POR_ID: Record<string, string> = {
  "rub-gastronomia": "gastronomia",
  "rub-indumentaria": "indumentaria",
  "rub-hogar": "hogar",
  "rub-ferreteria": "ferreteria y construccion",
  "rub-salud": "salud y farmacia",
  "rub-servicios": "servicios",
  "rub-tecnologia": "tecnologia",
  "rub-libreria": "libreria",
  "rub-otros": "otros",
};

const LISTA_RUBROS: {
  label: string;
  value: string;
}[] = [
  { label: "Todos", value: "todos" },
  { label: "Gastronomía", value: "gastronomia" },
  { label: "Indumentaria", value: "indumentaria" },
  { label: "Hogar", value: "hogar" },
  { label: "Ferretería y Constr.", value: "ferreteria y construccion" },
  { label: "Salud y Farmacia", value: "salud y farmacia" },
  { label: "Servicios", value: "servicios" },
  { label: "Tecnología", value: "tecnologia" },
  { label: "Librería", value: "libreria" },
  { label: "Otros", value: "otros" },
];

export default function HomeScreen() {
  const router = useRouter();

  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>("");
  const [rubroSeleccionado, setRubroSeleccionado] = useState<string | "todos">(
    "todos",
  );
  const [soloAbiertos, setSoloAbiertos] = useState<boolean>(false);

  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [actualizando, setActualizando] = useState<string[]>([]);

  useEffect(() => {
    cargarComercios();
    cargarFavoritos();
  }, []);

  async function cargarComercios() {
    try {
      setCargando(true);

      let todosLosComercios: any[] = [];
      let pagina = 1;
      const porPagina = 20;
      let total = 0;

      do {
        const respuesta = await obtenerComerciosAPI(pagina, porPagina);
        const datos = respuesta.datos || [];

        if (pagina === 1) {
          console.log(
            "HORARIOS QUE ENVÍA LA API:",
            datos.map((c: any) => ({
              nombre: c.nombre,
              horarios: c.horarios,
            })),
          );

          console.log(
            "DETALLE DE HORARIOS:",
            JSON.stringify(datos[0]?.horarios, null, 2),
          );
        }

        todosLosComercios = [...todosLosComercios, ...datos];
        total = respuesta.meta?.total || todosLosComercios.length;

        pagina++;

        if (datos.length === 0) {
          break;
        }
      } while (todosLosComercios.length < total);

      const comerciosAdaptados: Comercio[] = todosLosComercios
        .filter((c) => c.activo !== false)
        .map((c) => ({
          id: c.id,
          nombre: c.nombre,
          rubroId: c.rubroId,
          descripcion: c.descripcion || "",
          direccion: c.direccion || "",

          coordenadas: {
            latitud: Number(c.coordenadas?.latitud ?? 0),
            longitud: Number(c.coordenadas?.longitud ?? 0),
          },

          telefono: c.telefono || null,
          whatsapp: c.whatsapp || null,
          instagram: c.instagram || null,

          imagenes: c.imagenes || [],
          videoUrl: c.videoUrl || null,

          horarios: c.horarios || [],
          mediosDePago: c.mediosDePago || [],

          puntaje: Number(c.puntaje ?? 0),
          cantidadResenas: Number(c.cantidadResenas ?? 0),

          codigoQr: c.codigoQr || null,
          activo: c.activo,
        }));

      setComercios(comerciosAdaptados);

      console.log("Comercios reales cargados:", comerciosAdaptados.length);
    } catch (error) {
      console.error("Error al cargar comercios reales:", error);
      Alert.alert("Error", "No se pudieron cargar los comercios.");
    } finally {
      setCargando(false);
    }
  }

  async function cargarFavoritos() {
    try {
      const token = await obtenerToken();

      // Si no hay sesión, no se consulta el perfil.
      if (!token) {
        setFavoritos([]);
        return;
      }

      const perfil = await obtenerMiPerfil();

      const listaFavoritos =
        perfil?.favoritos ?? perfil?.comerciosFavoritos ?? [];

      const idsFavoritos = listaFavoritos
        .map((favorito: any) => {
          if (typeof favorito === "string") {
            return favorito;
          }

          return favorito.comercioId ?? favorito.comercio?.id ?? favorito.id;
        })
        .filter((id: any) => id);

      setFavoritos(idsFavoritos);

      console.log("Favoritos de Home:", idsFavoritos);
    } catch (error) {
      console.log("No se pudieron cargar los favoritos:", error);
    }
  }

  async function cambiarFavorito(comercioId: string) {
    if (actualizando.includes(comercioId)) {
      return;
    }

    // Comprobar si el usuario inició sesión antes de llamar a la API.
    try {
      const token = await obtenerToken();

      if (!token) {
        Alert.alert(
          "Iniciá sesión",
          "Para guardar comercios en favoritos, primero tenés que iniciar sesión.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Iniciar sesión",
              onPress: () => router.push("/auth/login"),
            },
          ],
        );

        return;
      }
    } catch (error) {
      console.error("Error al verificar la sesión:", error);
      Alert.alert(
        "Error",
        "No se pudo verificar tu sesión. Intentá nuevamente.",
      );
      return;
    }

    const yaEsFavorito = favoritos.includes(comercioId);

    try {
      setActualizando((actuales) => [...actuales, comercioId]);

      if (yaEsFavorito) {
        await quitarFavorito(comercioId);

        setFavoritos((actuales) =>
          actuales.filter((id) => id !== comercioId),
        );
      } else {
        await agregarFavorito(comercioId);

        setFavoritos((actuales) => [...actuales, comercioId]);
      }
    } catch (error) {
      console.error("Error al actualizar favorito:", error);

      Alert.alert(
        "Error",
        "No se pudo actualizar el favorito. Intentá nuevamente.",
      );
    } finally {
      setActualizando((actuales) =>
        actuales.filter((id) => id !== comercioId),
      );
    }
  }

  const quitarAcentos = (texto: string) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const comerciosFiltrados = comercios.filter((comercio) => {
    const busquedaLimpia = quitarAcentos(busqueda);

    const coincideNombre = quitarAcentos(comercio.nombre).includes(
      busquedaLimpia,
    );

    const rubro = RUBROS_POR_ID[comercio.rubroId] || "otros";

    const coincideRubro = quitarAcentos(rubro).includes(busquedaLimpia);

    const coincideDireccion = quitarAcentos(comercio.direccion).includes(
      busquedaLimpia,
    );

    const coincideDescripcion = comercio.descripcion
      ? quitarAcentos(comercio.descripcion).includes(busquedaLimpia)
      : false;

    const coincideTexto =
      coincideNombre ||
      coincideRubro ||
      coincideDireccion ||
      coincideDescripcion;

    if (!coincideTexto) return false;

    if (rubroSeleccionado !== "todos" && rubro !== rubroSeleccionado) {
      return false;
    }

    const cerradoPorVacaciones = comercio.horarios.length === 0;

    if (
      soloAbiertos &&
      (cerradoPorVacaciones || !estaAbiertoAhora(comercio.horarios))
    ) {
      return false;
    }

    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Directorio de Comercios</Text>

      <Text style={styles.subtitulo}>
        Centro Comercial de Concepción del Uruguay
      </Text>

      <TextInput
        style={styles.busqueda}
        placeholder="Buscar en la ciudad..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.rubrosContainer}
        contentContainerStyle={styles.rubrosContenido}
      >
        {LISTA_RUBROS.map((r) => {
          const activo = rubroSeleccionado === r.value;

          return (
            <TouchableOpacity
              key={r.value}
              style={[styles.chipRubro, activo && styles.chipRubroActivo]}
              onPress={() => setRubroSeleccionado(r.value)}
            >
              <Text
                style={[styles.textoChip, activo && styles.textoChipActivo]}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[styles.botonAbierto, soloAbiertos && styles.botonAbiertoActivo]}
        onPress={() => setSoloAbiertos(!soloAbiertos)}
      >
        <Text
          style={[
            styles.textoBotonAbierto,
            soloAbiertos && styles.textoBotonActivo,
          ]}
        >
          {soloAbiertos ? "✓ Abierto ahora (Filtrando)" : "⏱️ Abierto ahora"}
        </Text>
      </TouchableOpacity>

      {cargando ? (
        <View style={styles.cargandoContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.textoCargando}>Cargando comercios...</Text>
        </View>
      ) : (
        <FlatList
          data={comerciosFiltrados}
          keyExtractor={(item) => item.id}
          style={{ width: "100%" }}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              {soloAbiertos && !busqueda && rubroSeleccionado === "todos"
                ? "En este momento todos los comercios están cerrados."
                : "No se encontraron comercios que coincidan con la búsqueda."}
            </Text>
          }
          renderItem={({ item }) => {
            const cerradoPorVacaciones = item.horarios.length === 0;

            const abierto =
              !cerradoPorVacaciones && estaAbiertoAhora(item.horarios);

            const esFavorito = favoritos.includes(item.id);
            const estaActualizando = actualizando.includes(item.id);

            return (
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.infoComercio}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/comercio/[id]",
                      params: { id: item.id },
                    })
                  }
                >
                  <Text style={styles.comercio}>{item.nombre}</Text>

                  <Text style={styles.rubroTexto}>
                    {(RUBROS_POR_ID[item.rubroId] || "otros").toUpperCase()}{" "}
                    {abierto ? "• Abierto" : "• Cerrado"}
                  </Text>

                  <Text style={styles.estrellas}>
                    ⭐ {item.puntaje} estrellas ({item.cantidadResenas})
                  </Text>

                  {cerradoPorVacaciones && (
                    <View style={styles.vacacionesBadge}>
                      <Text style={styles.vacacionesText}>
                        🏖️ Cerrado por vacaciones
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botonFavorito}
                  onPress={() => cambiarFavorito(item.id)}
                  disabled={estaActualizando}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.corazon,
                      {
                        color: esFavorito ? "#e53935" : "#777777",
                      },
                    ]}
                  >
                    {estaActualizando ? "..." : esFavorito ? "♥" : "♡"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      <AppTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    paddingTop: 40,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitulo: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },

  busqueda: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },

  rubrosContainer: {
    minHeight: 60,
    marginBottom: 12,
    flexGrow: 0,
  },

  rubrosContenido: {
    alignItems: "center",
    paddingRight: 10,
    paddingVertical: 4,
  },

  chipRubro: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    minHeight: 44,
    alignItems: "center",
  },

  chipRubroActivo: {
    backgroundColor: "#0a7ea4",
    borderColor: "#0a7ea4",
  },

  textoChip: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },

  textoChipActivo: {
    color: "#fff",
    fontWeight: "bold",
  },

  botonAbierto: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#0a7ea4",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 14,
    alignItems: "center",
    backgroundColor: "#f4f9fb",
  },

  botonAbiertoActivo: {
    backgroundColor: "#0a7ea4",
  },

  textoBotonAbierto: {
    color: "#0a7ea4",
    fontWeight: "600",
    fontSize: 14,
  },

  textoBotonActivo: {
    color: "#fff",
  },

  lista: {
    paddingBottom: 100,
  },

  card: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
  },

  infoComercio: {
    flex: 1,
  },

  comercio: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },

  rubroTexto: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },

  estrellas: {
    fontSize: 13,
    color: "#444",
    marginTop: 2,
  },

  vacacionesBadge: {
    marginTop: 6,
    backgroundColor: "#fff3e0",
    padding: 4,
    borderRadius: 4,
  },

  vacacionesText: {
    fontSize: 12,
    color: "#e65100",
  },

  botonFavorito: {
    width: 48,
    height: 48,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  corazon: {
    fontSize: 32,
    fontWeight: "bold",
    includeFontPadding: false,
  },

  cargandoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  textoCargando: {
    marginTop: 8,
    color: "#666",
  },

  vacio: {
    textAlign: "center",
    color: "#777",
    marginTop: 30,
    fontSize: 14,
  },
});
