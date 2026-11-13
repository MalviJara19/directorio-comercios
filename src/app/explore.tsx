
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";

import AppTabs from "@/components/app-tabs";

import {
  generarCodigoPromocion,
  obtenerMisUsos,
  obtenerPromocionesDisponibles,
  obtenerComercios,
  type EstadoPromocionesQR,
} from "@/servicios/api";

import type {
  Promocion,
  UsoDePromocion,
} from "@/tipos/comercios";

type ComercioBasico = {
  id: string;
  nombre: string;
};

export default function PromosScreen() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [comercios, setComercios] = useState<ComercioBasico[]>([]);
  const [misUsos, setMisUsos] = useState<UsoDePromocion[]>([]);

  const [estado, setEstado] =
    useState<EstadoPromocionesQR>("vigentes");

  const [soloApp, setSoloApp] = useState(false);
  const [mostrarMisCodigos, setMostrarMisCodigos] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [cargandoCodigos, setCargandoCodigos] = useState(false);
  const [generandoId, setGenerandoId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [errorCodigos, setErrorCodigos] = useState("");

  const [codigoGenerado, setCodigoGenerado] =
    useState<UsoDePromocion | null>(null);

  useEffect(() => {
    cargarDatos();
  }, [estado]);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const [promocionesObtenidas, respuestaComercios] =
        await Promise.all([
          obtenerPromocionesDisponibles(estado),
          obtenerComercios(1, 100),
        ]);

      setPromociones(promocionesObtenidas);

      const listaComercios: ComercioBasico[] =
        respuestaComercios.datos ?? [];

      setComercios(listaComercios);
    } catch (e) {
      console.error("Error al cargar promociones:", e);

      setError(
        "No se pudieron cargar las promociones. Intentá nuevamente.",
      );
    } finally {
      setCargando(false);
    }
  }

  async function cargarMisCodigos() {
    try {
      setCargandoCodigos(true);
      setErrorCodigos("");

      const usos = await obtenerMisUsos();

      setMisUsos(usos);
      setMostrarMisCodigos(true);
      setCodigoGenerado(null);
    } catch (e) {
      console.error("Error al obtener mis códigos:", e);

      setErrorCodigos(
        "No se pudieron cargar tus códigos QR. Intentá nuevamente.",
      );
    } finally {
      setCargandoCodigos(false);
    }
  }

  async function solicitarCodigo(promocion: Promocion) {
    try {
      setGenerandoId(promocion.id);
      setError("");

      const uso = await generarCodigoPromocion(promocion.id);

      setCodigoGenerado(uso);
      setMostrarMisCodigos(false);

      setMisUsos((anteriores) => {
        const existe = anteriores.some(
          (item) => item.id === uso.id,
        );

        if (existe) {
          return anteriores.map((item) =>
            item.id === uso.id ? uso : item,
          );
        }

        return [uso, ...anteriores];
      });
    } catch (e) {
      console.error("Error al generar el código QR:", e);

      setError(
        "No se pudo generar el código QR. Intentá nuevamente.",
      );
    } finally {
      setGenerandoId(null);
    }
  }

  function obtenerNombreComercio(comercioId: string) {
    const comercio = comercios.find(
      (item) => item.id === comercioId,
    );

    return comercio?.nombre ?? "Comercio adherido";
  }

  function formatearFecha(fecha: string) {
    if (!fecha) return "";

    const fechaObjeto = new Date(fecha);

    if (Number.isNaN(fechaObjeto.getTime())) {
      return fecha;
    }

    return fechaObjeto.toLocaleDateString("es-AR");
  }

  const promocionesFiltradas = soloApp
    ? promociones.filter((promo) => promo.soloApp)
    : promociones;

  function cambiarEstado(nuevoEstado: EstadoPromocionesQR) {
    setEstado(nuevoEstado);
    setCodigoGenerado(null);
    setMostrarMisCodigos(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titulo}>🎁 Promociones</Text>

        <Text style={styles.subtitulo}>
          Aprovechá las promociones de los comercios adheridos.
        </Text>

        <TouchableOpacity
          style={styles.botonMisCodigos}
          onPress={cargarMisCodigos}
          disabled={cargandoCodigos}
        >
          {cargandoCodigos ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBotonMisCodigos}>
              🎟️ Mis códigos QR
            </Text>
          )}
        </TouchableOpacity>

        {mostrarMisCodigos ? (
          <View style={styles.seccion}>
            <View style={styles.encabezadoSeccion}>
              <Text style={styles.tituloSeccion}>
                Mis códigos
              </Text>

              <TouchableOpacity
                onPress={() => setMostrarMisCodigos(false)}
              >
                <Text style={styles.volver}>Volver</Text>
              </TouchableOpacity>
            </View>

            {errorCodigos !== "" && (
              <Text style={styles.error}>{errorCodigos}</Text>
            )}

            {misUsos.length === 0 && errorCodigos === "" ? (
              <Text style={styles.mensajeVacio}>
                Todavía no tenés códigos QR generados.
              </Text>
            ) : (
              misUsos.map((uso) => {
                const promocion = promociones.find(
                  (item) => item.id === uso.promocionId,
                );

                return (
                  <View key={uso.id} style={styles.cardQR}>
                    <Text style={styles.tituloQR}>
                      {promocion?.titulo ?? "Código de promoción"}
                    </Text>

                    <View style={styles.qrContainer}>
                      <QRCode
                        value={uso.codigo}
                        size={180}
                      />
                    </View>

                    <Text style={styles.codigoTexto}>
                      {uso.codigo}
                    </Text>

                    <Text
                      style={[
                        styles.estadoQR,
                        uso.validadoEn
                          ? styles.validado
                          : styles.pendiente,
                      ]}
                    >
                      {uso.validadoEn
                        ? "✓ Código utilizado"
                        : "● Pendiente de validación"}
                    </Text>

                    {uso.validadoEn && (
                      <Text style={styles.fechaValidacion}>
                        Validado el{" "}
                        {formatearFecha(uso.validadoEn)}
                      </Text>
                    )}
                  </View>
                );
              })
            )}
          </View>
        ) : codigoGenerado ? (
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>
              ¡Tu código QR está listo!
            </Text>

            <View style={styles.cardQR}>
              <Text style={styles.tituloQR}>
                Presentá este código en el comercio.
              </Text>

              <View style={styles.qrContainer}>
                <QRCode
                  value={codigoGenerado.codigo}
                  size={200}
                />
              </View>

              <Text style={styles.codigoTexto}>
                {codigoGenerado.codigo}
              </Text>

              <Text style={styles.estadoQR}>
                Pendiente de validación
              </Text>

              <Text style={styles.instruccion}>
                El comercio deberá escanear este código para
                validar el uso de la promoción.
              </Text>

              <TouchableOpacity
                style={styles.botonSecundario}
                onPress={cargarMisCodigos}
              >
                <Text style={styles.textoBotonSecundario}>
                  Ver mis códigos
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setCodigoGenerado(null)}
            >
              <Text style={styles.volverLista}>
                Volver a las promociones
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.tituloSeccion}>
              Explorá las promociones
            </Text>

            <View style={styles.filtros}>
              <TouchableOpacity
                style={[
                  styles.filtro,
                  estado === "vigentes" && styles.filtroActivo,
                ]}
                onPress={() => cambiarEstado("vigentes")}
              >
                <Text
                  style={[
                    styles.textoFiltro,
                    estado === "vigentes" &&
                      styles.textoFiltroActivo,
                  ]}
                >
                  Vigentes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filtro,
                  estado === "proximas" && styles.filtroActivo,
                ]}
                onPress={() => cambiarEstado("proximas")}
              >
                <Text
                  style={[
                    styles.textoFiltro,
                    estado === "proximas" &&
                      styles.textoFiltroActivo,
                  ]}
                >
                  Próximas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filtro,
                  estado === "por-vencer" && styles.filtroActivo,
                ]}
                onPress={() => cambiarEstado("por-vencer")}
              >
                <Text
                  style={[
                    styles.textoFiltro,
                    estado === "por-vencer" &&
                      styles.textoFiltroActivo,
                  ]}
                >
                  Por vencer
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.filtroApp}
              onPress={() => setSoloApp(!soloApp)}
            >
              <View
                style={[
                  styles.checkbox,
                  soloApp && styles.checkboxActivo,
                ]}
              >
                {soloApp && (
                  <Text style={styles.check}>✓</Text>
                )}
              </View>

              <Text style={styles.textoFiltroApp}>
                Mostrar solamente promociones exclusivas de la app
              </Text>
            </TouchableOpacity>

            {error !== "" && (
              <View style={styles.mensajeError}>
                <Text style={styles.error}>{error}</Text>

                <TouchableOpacity onPress={cargarDatos}>
                  <Text style={styles.reintentar}>
                    Reintentar
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {cargando ? (
              <View style={styles.cargando}>
                <ActivityIndicator size="large" color="#3157A4" />
                <Text style={styles.textoCargando}>
                  Cargando promociones...
                </Text>
              </View>
            ) : promocionesFiltradas.length === 0 ? (
              <Text style={styles.mensajeVacio}>
                No hay promociones disponibles en esta categoría.
              </Text>
            ) : (
              promocionesFiltradas.map((promo) => (
                <View key={promo.id} style={styles.card}>
                  <View style={styles.cardEncabezado}>
                    <Text style={styles.comercio}>
                      {obtenerNombreComercio(promo.comercioId)}
                    </Text>

                    {promo.soloApp && (
                      <Text style={styles.etiquetaApp}>
                        Exclusiva app
                      </Text>
                    )}
                  </View>

                  <Text style={styles.promo}>
                    {promo.titulo}
                  </Text>

                  {promo.descuento !== null && (
                    <Text style={styles.descuento}>
                      {promo.descuento}% de descuento
                    </Text>
                  )}

                  <Text style={styles.detalle}>
                    {promo.detalle}
                  </Text>

                  <Text style={styles.fecha}>
                    Desde: {formatearFecha(promo.desde)}
                  </Text>

                  <Text style={styles.fecha}>
                    Hasta: {formatearFecha(promo.hasta)}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.botonQR,
                      generandoId === promo.id &&
                        styles.botonDeshabilitado,
                    ]}
                    onPress={() => solicitarCodigo(promo)}
                    disabled={generandoId !== null}
                  >
                    {generandoId === promo.id ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.textoBotonQR}>
                        Generar código QR
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      <AppTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  scroll: {
    flex: 1,
  },

  contenido: {
    padding: 20,
    paddingBottom: 30,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 8,
  },

  subtitulo: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
  },

  tituloSeccion: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#222222",
    marginTop: 20,
    marginBottom: 15,
  },

  botonMisCodigos: {
    backgroundColor: "#3157A4",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  textoBotonMisCodigos: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  filtros: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 15,
  },

  filtro: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#E5E8F0",
    alignItems: "center",
  },

  filtroActivo: {
    backgroundColor: "#3157A4",
  },

  textoFiltro: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444444",
  },

  textoFiltroActivo: {
    color: "#FFFFFF",
  },

  filtroApp: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#3157A4",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxActivo: {
    backgroundColor: "#3157A4",
  },

  check: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  textoFiltroApp: {
    flex: 1,
    fontSize: 14,
    color: "#444444",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  cardEncabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },

  comercio: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#3157A4",
    flexShrink: 1,
  },

  etiquetaApp: {
    backgroundColor: "#E8F0FF",
    color: "#3157A4",
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    overflow: "hidden",
  },

  promo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 8,
  },

  descuento: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#16834A",
    marginBottom: 8,
  },

  detalle: {
    fontSize: 15,
    color: "#555555",
    marginBottom: 12,
    lineHeight: 22,
  },

  fecha: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 4,
  },

  botonQR: {
    backgroundColor: "#3157A4",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  textoBotonQR: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  cargando: {
    alignItems: "center",
    padding: 35,
  },

  textoCargando: {
    marginTop: 12,
    color: "#666666",
    fontSize: 14,
  },

  mensajeVacio: {
    textAlign: "center",
    color: "#777777",
    padding: 25,
    fontSize: 15,
  },

  mensajeError: {
    backgroundColor: "#FDECEC",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  error: {
    color: "#C62828",
    fontSize: 14,
    textAlign: "center",
  },

  reintentar: {
    color: "#3157A4",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },

  seccion: {
    marginTop: 10,
  },

  encabezadoSeccion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  volver: {
    color: "#3157A4",
    fontWeight: "bold",
    fontSize: 15,
  },

  cardQR: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  tituloQR: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222222",
    marginBottom: 20,
  },

  qrContainer: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 15,
  },

  codigoTexto: {
    color: "#444444",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },

  estadoQR: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#B7791F",
    textAlign: "center",
  },

  validado: {
    color: "#16834A",
  },

  pendiente: {
    color: "#B7791F",
  },

  fechaValidacion: {
    fontSize: 12,
    color: "#777777",
    marginTop: 6,
  },

  instruccion: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 21,
  },

  botonSecundario: {
    backgroundColor: "#3157A4",
    padding: 13,
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },

  textoBotonSecundario: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  volverLista: {
    color: "#3157A4",
    fontWeight: "bold",
    textAlign: "center",
    padding: 15,
  },
});
