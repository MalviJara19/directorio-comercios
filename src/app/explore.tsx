
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppTabs from "@/components/app-tabs";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  generarCodigoPromocion,
  obtenerComercios,
  obtenerMisUsos,
  obtenerPromociones,
  type EstadoPromociones,
} from "@/servicios/serviciosComercios";

import type {
  Promocion,
  RubroComercio,
  UsoDePromocion,
} from "@/tipos/comercios";

type Categoria = "vigentes" | "proximas" | "porVencer";

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

  const [codigos, setCodigos] = useState<Record<string, string>>({});
  const [generandoCodigo, setGenerandoCodigo] = useState<string | null>(null);
  const [erroresCodigo, setErroresCodigo] = useState<Record<string, string>>(
    {}
  );

  // Estados de Mis códigos.
  const [misUsos, setMisUsos] = useState<UsoDePromocion[]>([]);
  const [mostrarMisCodigos, setMostrarMisCodigos] = useState(false);
  const [cargandoMisCodigos, setCargandoMisCodigos] = useState(false);
  const [errorMisCodigos, setErrorMisCodigos] = useState("");

  // Cargar los comercios una sola vez.
  useEffect(() => {
    let activo = true;

    async function cargarComercios() {
      try {
        const comerciosApi = await obtenerComercios();

        if (activo) {
          setComercios(
            comerciosApi.map((comercio) => ({
              id: comercio.id,
              nombre: comercio.nombre,
              rubro: comercio.rubro,
            }))
          );
        }
      } catch (e) {
        console.error("Error al cargar comercios:", e);
      }
    }

    cargarComercios();

    return () => {
      activo = false;
    };
  }, []);

  // Cargar promociones según la categoría seleccionada.
  useEffect(() => {
    let activo = true;

    async function cargarPromociones() {
      setCargando(true);
      setError("");

      const estadoApi: EstadoPromociones =
        categoria === "porVencer" ? "por-vencer" : categoria;

      try {
        const promocionesApi = await obtenerPromociones(estadoApi);

        if (activo) {
          setPromociones(promocionesApi);
        }
      } catch (e) {
        console.error("Error al cargar promociones:", e);

        if (activo) {
          setError("No se pudieron cargar las promociones.");
          setPromociones([]);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarPromociones();

    return () => {
      activo = false;
    };
  }, [categoria]);

  const promocionesFiltradas = promociones.filter((promo) => {
    // Excluir promociones desactivadas.
    if (!promo.activa) {
      return false;
    }

    // Promociones exclusivas de la app.
    if (filtroApp && !promo.soloApp) {
      return false;
    }

    // Rubro del comercio.
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

  // Solicitar código para una promoción.
  async function solicitarCodigo(promocionId: string) {
    try {
      setGenerandoCodigo(promocionId);

      setErroresCodigo((anteriores) => ({
        ...anteriores,
        [promocionId]: "",
      }));

      const uso = await generarCodigoPromocion(promocionId);

      setCodigos((anteriores) => ({
        ...anteriores,
        [promocionId]: uso.codigo,
      }));
    } catch (e) {
      const errorApi = e as {
        response?: {
          data?: {
            error?: {
              mensaje?: string;
            };
          };
        };
      };

      setErroresCodigo((anteriores) => ({
        ...anteriores,
        [promocionId]:
          errorApi.response?.data?.error?.mensaje ??
          "No se pudo obtener el código. Intentá nuevamente.",
      }));
    } finally {
      setGenerandoCodigo(null);
    }
  }

  // Consultar los códigos obtenidos por el usuario.
  async function cargarMisCodigos() {
    setCargandoMisCodigos(true);
    setErrorMisCodigos("");

    try {
      const usos = await obtenerMisUsos();
      setMisUsos(usos);
      setMostrarMisCodigos(true);
    } catch (e) {
      const errorApi = e as {
        response?: {
          data?: {
            error?: {
              mensaje?: string;
            };
          };
        };
      };

      setErrorMisCodigos(
        errorApi.response?.data?.error?.mensaje ??
          "No se pudieron cargar tus códigos. Verificá que hayas iniciado sesión."
      );
      setMostrarMisCodigos(true);
    } finally {
      setCargandoMisCodigos(false);
    }
  }

  function alternarMisCodigos() {
    if (mostrarMisCodigos) {
      setMostrarMisCodigos(false);
    } else {
      cargarMisCodigos();
    }
  }

  const rubrosDisponibles = Array.from(
    new Set(comercios.map((comercio) => comercio.rubro))
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>🏷️ Promociones</Text>

        <Text style={styles.subtitulo}>
          Aprovechá las promociones de los comercios
        </Text>

        {/* Sección Mis códigos */}
        <View style={styles.seccionMisCodigos}>
          <TouchableOpacity
            style={styles.botonMisCodigos}
            onPress={alternarMisCodigos}
            disabled={cargandoMisCodigos}
          >
            <Text style={styles.textoBotonMisCodigos}>
              {cargandoMisCodigos
                ? "Cargando tus códigos..."
                : mostrarMisCodigos
                  ? "Ocultar mis códigos ▲"
                  : "🎟️ Mis códigos ▼"}
            </Text>
          </TouchableOpacity>

          {cargandoMisCodigos && (
            <ActivityIndicator
              size="small"
              color="#2563eb"
              style={styles.indicadorCodigos}
            />
          )}

          {mostrarMisCodigos && !cargandoMisCodigos && (
            <View style={styles.contenedorMisCodigos}>
              {!!errorMisCodigos && (
                <Text style={styles.errorCodigo}>{errorMisCodigos}</Text>
              )}

              {!errorMisCodigos && misUsos.length === 0 && (
                <Text style={styles.mensaje}>
                  Todavía no tenés códigos de promociones.
                </Text>
              )}

              {!errorMisCodigos &&
                misUsos.map((uso) => {
                  const promocion = promociones.find(
                    (promo) => promo.id === uso.promocionId
                  );

                  return (
                    <View key={uso.id} style={styles.cardMiCodigo}>
                      <Text style={styles.nombrePromoCodigo}>
                        {promocion?.titulo ?? "Promoción exclusiva"}
                      </Text>

                      <Text style={styles.textoCodigoTitulo}>
                        Código para presentar en el comercio:
                      </Text>

                      <View style={styles.contenedorQR}>
                        <QRCode
                          value={uso.codigo}
                          size={170}
                          backgroundColor="#FFFFFF"
                          color="#000000"
                        />
                      </View>

                      <Text style={styles.textoCodigo}>{uso.codigo}</Text>

                      <Text
                        style={[
                          styles.estadoCodigo,
                          uso.validadoEn
                            ? styles.codigoUtilizado
                            : styles.codigoPendiente,
                        ]}
                      >
                        {uso.validadoEn
                          ? "✓ Utilizado"
                          : "● Pendiente de uso"}
                      </Text>
                    </View>
                  );
                })}
            </View>
          )}
        </View>

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
                <Text style={styles.etiqueta}>EXCLUSIVA DE LA APP</Text>
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

              {promo.soloApp && (
                <View style={styles.seccionCodigo}>
                  <TouchableOpacity
                    style={styles.botonCodigo}
                    onPress={() => solicitarCodigo(promo.id)}
                    disabled={generandoCodigo === promo.id}
                  >
                    <Text style={styles.textoBotonCodigo}>
                      {generandoCodigo === promo.id
                        ? "Solicitando código..."
                        : codigos[promo.id]
                          ? "Código obtenido"
                          : "Obtener código"}
                    </Text>
                  </TouchableOpacity>

                  {codigos[promo.id] && (
                    <View style={styles.codigoGenerado}>
                      <Text style={styles.textoCodigoTitulo}>
                        Tu código para presentar en el comercio:
                      </Text>

                      <View style={styles.contenedorQR}>
                        <QRCode
                          value={codigos[promo.id]}
                          size={190}
                          backgroundColor="#FFFFFF"
                          color="#000000"
                        />
                      </View>

                      <Text style={styles.textoCodigo}>
                        {codigos[promo.id]}
                      </Text>
                    </View>
                  )}

                  {!!erroresCodigo[promo.id] && (
                    <Text style={styles.errorCodigo}>
                      {erroresCodigo[promo.id]}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <AppTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  contenido: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 25,
    paddingBottom: 100,
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
  seccionCodigo: {
    marginTop: 15,
  },
  botonCodigo: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBotonCodigo: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
  codigoGenerado: {
    marginTop: 12,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    alignItems: "center",
  },
  contenedorQR: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  textoCodigoTitulo: {
    fontSize: 13,
    color: "#555555",
    marginBottom: 8,
  },
  textoCodigo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#15803d",
    letterSpacing: 2,
  },
  errorCodigo: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 10,
  },
  seccionMisCodigos: {
    marginBottom: 25,
  },
  botonMisCodigos: {
    backgroundColor: "#e8efff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  textoBotonMisCodigos: {
    color: "#1d4ed8",
    fontWeight: "bold",
    fontSize: 16,
  },
  indicadorCodigos: {
    marginTop: 12,
  },
  contenedorMisCodigos: {
    marginTop: 12,
  },
  cardMiCodigo: {
    backgroundColor: "#f2f2f2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  nombrePromoCodigo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
    alignSelf: "flex-start",
  },
  estadoCodigo: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 10,
    alignSelf: "flex-start",
  },
  codigoUtilizado: {
    color: "#15803d",
  },
  codigoPendiente: {
    color: "#b45309",
  },
  mensaje: {
    textAlign: "center",
    fontSize: 15,
    color: "#666666",
    marginTop: 25,
  },
});
