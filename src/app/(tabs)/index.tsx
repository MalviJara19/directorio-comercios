
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Button,
} from "react-native";

import { obtenerComercios as obtenerComerciosApi } from "@/servicios/api";
import { Comercio } from "@/tipos/comercios";
import { estaAbiertoAhora } from "@/utilidades/horarios";

type RubroComercio =
  | "gastronomia"
  | "indumentaria"
  | "hogar"
  | "ferreteria y construccion"
  | "salud y farmacia"
  | "servicios"
  | "tecnologia"
  | "libreria"
  | "otros";

const LISTA_RUBROS: {
  label: string;
  value: RubroComercio | "todos";
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
  const [errorCarga, setErrorCarga] = useState<string>("");

  const [busqueda, setBusqueda] = useState<string>("");
  const [rubroSeleccionado, setRubroSeleccionado] = useState<
    RubroComercio | "todos"
  >("todos");
  const [soloAbiertos, setSoloAbiertos] = useState<boolean>(false);

  useEffect(() => {
    async function cargar() {
      try {
        setErrorCarga("");

        const todosLosComercios: Comercio[] = [];
        let pagina = 1;
        let total = 0;

        while (pagina === 1 || todosLosComercios.length < total) {
          const respuesta = await obtenerComerciosApi(pagina, 20);

          const datos = Array.isArray(respuesta)
            ? respuesta
            : respuesta?.datos;

          if (!Array.isArray(datos)) {
            throw new Error(
              "La API no devolvió una lista válida de comercios.",
            );
          }

          todosLosComercios.push(...datos);

          total = Number(
            respuesta?.meta?.total ?? todosLosComercios.length,
          );

          if (datos.length === 0 || datos.length < 20) {
            break;
          }

          pagina++;
        }

        setComercios(todosLosComercios);
      } catch (error) {
        console.error("Error al cargar comercios:", error);
        setErrorCarga(
          "No se pudieron cargar los comercios. Verificá la conexión con el servidor.",
        );
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

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

    const coincideRubro = quitarAcentos(comercio.rubroId).includes(
      busquedaLimpia,
    );

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

    if (
      rubroSeleccionado !== "todos" &&
      comercio.rubroId !== rubroSeleccionado
    ) {
      return false;
    }

    if (soloAbiertos && !estaAbiertoAhora(comercio.horarios)) {
      return false;
    }

    return true;
  });

  return (
    <View style={styles.container}>
      <Button
        title="Cerrar sesión"
        onPress={() => router.replace("/auth/login")}
      />

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
        contentContainerStyle={{ paddingRight: 10 }}
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
          {soloAbiertos
            ? "✓ Abierto ahora (Filtrando)"
            : "⏱️ Abierto ahora"}
        </Text>
      </TouchableOpacity>

      {cargando ? (
        <View style={styles.cargandoContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.textoCargando}>
            Cargando comercios...
          </Text>
        </View>
      ) : errorCarga ? (
        <Text style={styles.error}>{errorCarga}</Text>
      ) : (
        <FlatList
          data={comerciosFiltrados}
          keyExtractor={(item) => item.id}
          style={{ width: "100%" }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              {soloAbiertos && !busqueda && rubroSeleccionado === "todos"
                ? "En este momento todos los comercios están cerrados."
                : "No se encontraron comercios que coincidan con la búsqueda."}
            </Text>
          }
          renderItem={({ item }) => {
            const abierto = estaAbiertoAhora(item.horarios);

            const nombreRubro =
              LISTA_RUBROS.find((r) => r.value === item.rubroId)?.label ??
              item.rubroId;

            return (
              <TouchableOpacity
                style={styles.card}
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
                  {nombreRubro} {abierto ? "• Abierto" : "• Cerrado"}
                </Text>

                <Text style={styles.estrellas}>
                  ⭐ {item.puntaje} estrellas ({item.cantidadResenas} reseñas)
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
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
    fontSize: 22,
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
    padding: 10,
    fontSize: 15,
    marginBottom: 10,
  },
  rubrosContainer: {
    maxHeight: 38,
    marginBottom: 10,
  },
  chipRubro: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  chipRubroActivo: {
    backgroundColor: "#0a7ea4",
    borderColor: "#0a7ea4",
  },
  textoChip: {
    fontSize: 12,
    color: "#333",
  },
  textoChipActivo: {
    color: "#fff",
    fontWeight: "bold",
  },
  botonAbierto: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#0a7ea4",
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
    backgroundColor: "#f4f9fb",
  },
  botonAbiertoActivo: {
    backgroundColor: "#0a7ea4",
  },
  textoBotonAbierto: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  textoBotonActivo: {
    color: "#fff",
  },
  card: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
  error: {
    textAlign: "center",
    color: "#c62828",
    marginTop: 30,
    fontSize: 14,
  },
});
