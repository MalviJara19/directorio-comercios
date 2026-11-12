
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "@/servicios/api";
import { obtenerUsuario } from "@/servicios/sesion";
import { obtenerComerciosGuardados } from "@/servicios/base-datos";
import * as FileSystem from "expo-file-system/legacy";

type ComercioDetalle = {
  id: string;
  nombre: string;
  rubroId: string;
  descripcion: string;
  direccion: string;
  coordenadas: {
    latitud: number;
    longitud: number;
  };
  telefono: string | null;
  whatsapp: string | null;
  instagram: string | null;
  imagenes: string[];
  videoUrl: string | null;
  horarios: {
    dia: number;
    abre: string;
    cierra: string;
  }[];
  mediosDePago: string[];
  puntaje: number;
  cantidadResenas: number;
};

type Resena = {
  id: string;
  comercioId: string;
  usuarioId: string;
  nombreUsuario?: string;
  estrellas: 1 | 2 | 3 | 4 | 5;
  comentario: string;
  respuesta: string | null;
  reportada: boolean;
  creadaEn: string;
  sincronizada: boolean;
};

type UsuarioActual = {
  id: string;
  nombre: string;
  rol: "vecino" | "comercio";
  comercioId: string | null;
};

const NOMBRES_RUBROS: Record<string, string> = {
  "rub-gastronomia": "Gastronomía",
  "rub-indumentaria": "Indumentaria",
  "rub-hogar": "Hogar",
  "rub-ferreteria": "Ferretería y construcción",
  "rub-salud": "Salud y farmacia",
  "rub-servicios": "Servicios",
  "rub-tecnologia": "Tecnología",
  "rub-libreria": "Librería",
  "rub-otros": "Otros",
};

async function descargarArchivo(
  url: string,
  comercioId: string,
): Promise<string> {
  const directorio = `${FileSystem.documentDirectory}comercios/${comercioId}/`;

  await FileSystem.makeDirectoryAsync(directorio, {
    intermediates: true,
  });

  const nombreArchivo = url.split("/").pop() || "archivo";

  const rutaLocal = `${directorio}${nombreArchivo}`;

  const archivoExiste = await FileSystem.getInfoAsync(rutaLocal);

  if (archivoExiste.exists) {
    return rutaLocal;
  }

  const descarga = await FileSystem.downloadAsync(url, rutaLocal);
  const informacion = await FileSystem.getInfoAsync(descarga.uri);

  if (informacion.exists && !informacion.isDirectory) {
    console.log("TAMAÑO DEL VIDEO:", informacion.size, "bytes");
  }

  return descarga.uri;
}

async function obtenerArchivoLocal(
  url: string,
  comercioId: string,
): Promise<string | null> {
  const nombreArchivo = url.split("/").pop() || "archivo";

  const rutaLocal = `${FileSystem.documentDirectory}comercios/${comercioId}/${nombreArchivo}`;

  const archivo = await FileSystem.getInfoAsync(rutaLocal);

  return archivo.exists ? rutaLocal : null;
}

export default function DetalleComercioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [comercio, setComercio] = useState<ComercioDetalle | null>(null);
  const [cargando, setCargando] = useState(true);

  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual | null>(null);
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [cargandoResenas, setCargandoResenas] = useState(true);

  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState("");
  const [guardandoResena, setGuardandoResena] = useState(false);

  const [resenaEditando, setResenaEditando] = useState<string | null>(null);
  const [comentarioEditado, setComentarioEditado] = useState("");
  const [estrellasEditadas, setEstrellasEditadas] = useState(5);

  const [resenaRespondiendo, setResenaRespondiendo] = useState<string | null>(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");

  const videoSource = comercio?.videoUrl || "";

  const player = useVideoPlayer(videoSource, (playerInstance) => {
    playerInstance.loop = false;
  });

  async function cargarResenas() {
    if (!id) {
      setCargandoResenas(false);
      return;
    }

    try {
      setCargandoResenas(true);

      const respuesta = await api.get(`/comercios/${id}/resenas`, {
        params: { pagina: 1, porPagina: 50 },
      });

      const datos = respuesta.data.datos || [];

      setResenas(datos);

      setComercio((actual) =>
        actual
          ? {
              ...actual,
              cantidadResenas: respuesta.data.total ?? datos.length,
            }
          : actual
      );
    } catch (error) {
      console.error("Error al cargar reseñas:", error);
      Alert.alert("Error", "No se pudieron cargar las reseñas.");
    } finally {
      setCargandoResenas(false);
    }
  }

  useEffect(() => {
    async function cargarDatos() {
      try {
        const usuario = await obtenerUsuario();
        setUsuarioActual(usuario);

        if (!id) {
          setCargando(false);
          setCargandoResenas(false);
          return;
        }

        const respuesta = await api.get(`/comercios/${id}`);

        console.log(
          "DETALLE COMPLETO DEL COMERCIO:",
          JSON.stringify(respuesta.data.datos, null, 2),
        );

        console.log(
          "IMÁGENES DEL COMERCIO:",
          JSON.stringify(respuesta.data.datos?.imagenes, null, 2),
        );

        const comercioConFotos = respuesta.data.datos;

        const imagenesLocales = await Promise.all(
          (comercioConFotos.imagenes ?? []).map((url: string) =>
            descargarArchivo(url, comercioConFotos.id),
          ),
        );

        let videoLocal = comercioConFotos.videoUrl;

        if (videoLocal) {
          videoLocal = await descargarArchivo(
            videoLocal,
            comercioConFotos.id,
          );
        }

        setComercio({
          ...comercioConFotos,
          imagenes: imagenesLocales,
          videoUrl: videoLocal,
        });

        await cargarResenas();
      } catch (error) {
        console.log("Sin conexión. Buscando el comercio en SQLite...");

        try {
          const comerciosLocales = await obtenerComerciosGuardados();

          const comercioLocal = comerciosLocales.find(
            (comercio) => comercio.id === id,
          );

          if (comercioLocal) {
            const imagenesLocales = await Promise.all(
              (comercioLocal.imagenes ?? []).map(async (url: string) => {
                return await obtenerArchivoLocal(url, comercioLocal.id);
              }),
            );

            let videoLocal: string | null = null;

            if (comercioLocal.videoUrl) {
              videoLocal = await obtenerArchivoLocal(
                comercioLocal.videoUrl,
                comercioLocal.id,
              );
            }

            setComercio({
              ...comercioLocal,
              imagenes: imagenesLocales.filter(
                (imagen): imagen is string => imagen !== null,
              ),
              videoUrl: videoLocal,
            });

            console.log(
              "Detalle recuperado desde SQLite:",
              comercioLocal.nombre,
            );
          } else {
            setComercio(null);
            console.log("El comercio no está guardado en SQLite.");
          }
        } catch (errorLocal) {
          console.error("Error al recuperar el detalle local:", errorLocal);
          setComercio(null);
        } finally {
          setCargandoResenas(false);
        }
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, [id]);

  async function publicarResena() {
    if (!comentario.trim()) {
      Alert.alert("Falta el comentario", "Escribí tu opinión antes de publicar.");
      return;
    }

    try {
      setGuardandoResena(true);

      await api.post(`/comercios/${id}/resenas`, {
        estrellas,
        comentario: comentario.trim(),
      });

      setComentario("");
      setEstrellas(5);

      Alert.alert("¡Listo!", "Tu reseña fue publicada.");
      await cargarResenas();
    } catch (error: any) {
      console.error("Error al publicar reseña:", error);
      Alert.alert(
        "No se pudo publicar",
        error?.response?.data?.mensaje ||
          "Verificá que hayas iniciado sesión y que no tengas otra reseña para este comercio."
      );
    } finally {
      setGuardandoResena(false);
    }
  }

  async function guardarEdicion(resenaId: string) {
    if (!comentarioEditado.trim()) {
      Alert.alert("Falta el comentario", "El comentario no puede estar vacío.");
      return;
    }

    try {
      await api.patch(`/resenas/${resenaId}`, {
        estrellas: estrellasEditadas,
        comentario: comentarioEditado.trim(),
      });

      setResenaEditando(null);
      setComentarioEditado("");

      Alert.alert("¡Listo!", "Tu reseña fue actualizada.");
      await cargarResenas();
    } catch (error: any) {
      console.error("Error al editar reseña:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.mensaje || "No se pudo editar la reseña."
      );
    }
  }

  function confirmarEliminar(resenaId: string) {
    Alert.alert(
      "Eliminar reseña",
      "¿Estás seguro de que querés eliminar esta reseña?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/resenas/${resenaId}`);
              Alert.alert("Listo", "La reseña fue eliminada.");
              await cargarResenas();
            } catch (error: any) {
              console.error("Error al eliminar reseña:", error);
              Alert.alert(
                "Error",
                error?.response?.data?.mensaje || "No se pudo eliminar la reseña."
              );
            }
          },
        },
      ]
    );
  }

  async function denunciarResena(resenaId: string) {
    Alert.alert(
      "Denunciar reseña",
      "¿Querés denunciar esta reseña por contenido inapropiado?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Denunciar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.post(`/resenas/${resenaId}/reportes`);
              Alert.alert("Gracias", "La reseña fue denunciada.");
              await cargarResenas();
            } catch (error: any) {
              console.error("Error al denunciar reseña:", error);
              Alert.alert(
                "Error",
                error?.response?.data?.mensaje || "No se pudo denunciar la reseña."
              );
            }
          },
        },
      ]
    );
  }

  async function enviarRespuesta(resenaId: string) {
    if (!textoRespuesta.trim()) {
      Alert.alert("Falta la respuesta", "Escribí una respuesta antes de enviarla.");
      return;
    }

    try {
      await api.post(`/resenas/${resenaId}/respuesta`, {
        respuesta: textoRespuesta.trim(),
      });

      setTextoRespuesta("");
      setResenaRespondiendo(null);

      Alert.alert("¡Listo!", "Tu respuesta fue publicada.");
      await cargarResenas();
    } catch (error: any) {
      console.error("Error al responder reseña:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.mensaje ||
          "No se pudo publicar la respuesta. Recordá que solo se permite una respuesta por reseña."
      );
    }
  }

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={{ marginTop: 8 }}>Cargando ficha del comercio...</Text>
      </View>
    );
  }

  if (!comercio) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se encontró el comercio.</Text>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.botonVolver}
        >
          <Text style={styles.textoVolver}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const nombreRubro = NOMBRES_RUBROS[comercio.rubroId] || comercio.rubroId;

  const latitud = comercio.coordenadas?.latitud ?? 0;
  const longitud = comercio.coordenadas?.longitud ?? 0;

  const miResena = resenas.find(
    (resena) => resena.usuarioId === usuarioActual?.id
  );

  const esComercioPropietario =
    usuarioActual?.rol === "comercio" &&
    usuarioActual.comercioId === comercio.id;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.botonVolver}
      >
        <Text style={styles.textoVolver}>← Volver al listado</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>{comercio.nombre}</Text>

      <Text style={styles.subTituloInfo}>
        {nombreRubro} • {comercio.direccion}
      </Text>

      <Text style={styles.estrellasDetalle}>
        ⭐ {comercio.puntaje} ({comercio.cantidadResenas} reseñas)
      </Text>

      {comercio.imagenes?.length > 0 && (
        <View style={styles.seccion}>
          <Text style={styles.subtituloSeccion}>📸 Fotos del comercio</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {comercio.imagenes.map((imagen, indice) => (
              <Image
                key={indice}
                source={{ uri: imagen }}
                style={styles.imagenComercio}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      )}

      {comercio.videoUrl ? (
        <View style={styles.seccionVideo}>
          <Text style={styles.tituloVideo}>🎥 Video de Presentación</Text>

          <VideoView
            player={player}
            style={styles.video}
            nativeControls
            contentFit="contain"
          />
        </View>
      ) : null}

      <View style={styles.botonesContacto}>
        {comercio.telefono ? (
          <TouchableOpacity
            style={styles.botonAccion}
            onPress={() => Linking.openURL(`tel:${comercio.telefono}`)}
          >
            <Text style={styles.textoBoton}>📞 Llamar</Text>
          </TouchableOpacity>
        ) : null}

        {comercio.whatsapp ? (
          <TouchableOpacity
            style={[styles.botonAccion, styles.botonWhatsapp]}
            onPress={() => {
              const numeroLimpio = comercio.whatsapp?.replace(/\D/g, "") || "";

              Linking.openURL(
                `https://api.whatsapp.com/send?phone=${numeroLimpio}`,
              ).catch((error) =>
                console.error("Error al abrir WhatsApp:", error),
              );
            }}
          >
            <Text style={styles.textoBoton}>💬 WhatsApp</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.botonAccion, styles.botonIr]}
          onPress={() => {
            const url = `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`;
            Linking.openURL(url);
          }}
        >
          <Text style={styles.textoBoton}>📍 Ir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.subtituloSeccion}>📄 Descripción</Text>
        <Text style={styles.texto}>
          {comercio.descripcion || "Sin descripción disponible."}
        </Text>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.subtituloSeccion}>🕒 Horarios de atención</Text>

        {comercio.horarios.length === 0 ? (
          <Text style={styles.texto}>🏖️ Cerrado por vacaciones.</Text>
        ) : (
          [
            "Domingo",
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
          ].map((dia, indice) => {
            const horariosDelDia = comercio.horarios.filter(
              (h) => h.dia === indice,
            );

            return (
              <Text key={dia} style={styles.texto}>
                <Text style={{ fontWeight: "bold" }}>{dia}: </Text>
                {horariosDelDia.length > 0
                  ? horariosDelDia
                      .map((h) => `${h.abre} a ${h.cierra}`)
                      .join(" / ")
                  : "Sin atención"}
              </Text>
            );
          })
        )}
      </View>

      <View style={styles.seccion}>
        <Text style={styles.subtituloSeccion}>💳 Medios de pago aceptados</Text>
        <Text style={styles.texto}>
          {comercio.mediosDePago?.length
            ? comercio.mediosDePago.join(", ")
            : "No se informaron medios de pago."}
        </Text>
      </View>

      {comercio.instagram ? (
        <View style={styles.seccion}>
          <Text style={styles.subtituloSeccion}>📷 Instagram</Text>

          <TouchableOpacity
            onPress={() => {
              const usuario = comercio.instagram?.replace(/^@/, "");
              Linking.openURL(`https://www.instagram.com/${usuario}`);
            }}
          >
            <Text style={styles.textoInstagram}>
              @{comercio.instagram.replace(/^@/, "")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* SECCIÓN DE RESEÑAS */}
      <View style={styles.seccionResenas}>
        <Text style={styles.tituloResenas}>⭐ Reseñas de clientes</Text>

        <Text style={styles.promedioResenas}>
          {comercio.puntaje} de 5 · {comercio.cantidadResenas} reseñas
        </Text>

        {usuarioActual?.rol === "vecino" && !miResena ? (
          <View style={styles.formularioResena}>
            <Text style={styles.subtituloSeccion}>Dejá tu opinión</Text>
            <Text style={styles.etiqueta}>Tu puntuación:</Text>

            <View style={styles.selectorEstrellas}>
              {[1, 2, 3, 4, 5].map((numero) => (
                <TouchableOpacity
                  key={numero}
                  onPress={() => setEstrellas(numero)}
                >
                  <Text style={styles.estrellaSeleccion}>
                    {numero <= estrellas ? "⭐" : "☆"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.inputComentario}
              placeholder="Contanos tu experiencia..."
              value={comentario}
              onChangeText={setComentario}
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.botonPublicar}
              onPress={publicarResena}
              disabled={guardandoResena}
            >
              <Text style={styles.textoBoton}>
                {guardandoResena ? "Publicando..." : "Publicar reseña"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {usuarioActual?.rol === "vecino" && miResena ? (
          <Text style={styles.aviso}>
            Ya publicaste una reseña para este comercio. Podés editarla o eliminarla.
          </Text>
        ) : null}

        {!usuarioActual ? (
          <Text style={styles.aviso}>
            Iniciá sesión para publicar una reseña.
          </Text>
        ) : null}

        {cargandoResenas ? (
          <ActivityIndicator
            size="small"
            color="#0a7ea4"
            style={{ marginTop: 15 }}
          />
        ) : resenas.length === 0 ? (
          <Text style={styles.aviso}>
            Este comercio todavía no tiene reseñas.
          </Text>
        ) : (
          resenas.map((resena) => {
            const esMiResena = resena.usuarioId === usuarioActual?.id;

            return (
              <View key={resena.id} style={styles.tarjetaResena}>
                <Text style={styles.autorResena}>
                  {resena.nombreUsuario || "Usuario"}
                </Text>

                <Text style={styles.estrellasResena}>
                  {"⭐".repeat(resena.estrellas)}
                </Text>

                <Text style={styles.fechaResena}>
                  {new Date(resena.creadaEn).toLocaleDateString("es-AR")}
                </Text>

                {resenaEditando === resena.id ? (
                  <View>
                    <Text style={styles.etiqueta}>Modificar puntuación:</Text>

                    <View style={styles.selectorEstrellas}>
                      {[1, 2, 3, 4, 5].map((numero) => (
                        <TouchableOpacity
                          key={numero}
                          onPress={() => setEstrellasEditadas(numero)}
                        >
                          <Text style={styles.estrellaSeleccion}>
                            {numero <= estrellasEditadas ? "⭐" : "☆"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TextInput
                      style={styles.inputComentario}
                      value={comentarioEditado}
                      onChangeText={setComentarioEditado}
                      multiline
                      maxLength={1000}
                      textAlignVertical="top"
                    />

                    <TouchableOpacity
                      style={styles.botonPublicar}
                      onPress={() => guardarEdicion(resena.id)}
                    >
                      <Text style={styles.textoBoton}>Guardar cambios</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setResenaEditando(null)}>
                      <Text style={styles.textoCancelar}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.comentarioResena}>
                    {resena.comentario}
                  </Text>
                )}

                {esMiResena && resenaEditando !== resena.id ? (
                  <View style={styles.accionesResena}>
                    <TouchableOpacity
                      onPress={() => {
                        setResenaEditando(resena.id);
                        setComentarioEditado(resena.comentario);
                        setEstrellasEditadas(resena.estrellas);
                      }}
                    >
                      <Text style={styles.textoAccion}>✏️ Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => confirmarEliminar(resena.id)}
                    >
                      <Text style={styles.textoEliminar}>🗑 Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {!esMiResena && usuarioActual && !resena.reportada ? (
                  <TouchableOpacity
                    onPress={() => denunciarResena(resena.id)}
                  >
                    <Text style={styles.textoDenunciar}>
                      ⚑ Denunciar reseña
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {resena.reportada ? (
                  <Text style={styles.avisoDenunciada}>
                    Esta reseña fue denunciada.
                  </Text>
                ) : null}

                {resena.respuesta ? (
                  <View style={styles.respuestaComercio}>
                    <Text style={styles.tituloRespuesta}>
                      Respuesta del comercio
                    </Text>
                    <Text style={styles.textoRespuesta}>
                      {resena.respuesta}
                    </Text>
                  </View>
                ) : null}

                {esComercioPropietario && !resena.respuesta ? (
                  <View style={styles.formularioRespuesta}>
                    {resenaRespondiendo === resena.id ? (
                      <>
                        <TextInput
                          style={styles.inputComentario}
                          placeholder="Escribí tu respuesta..."
                          value={textoRespuesta}
                          onChangeText={setTextoRespuesta}
                          multiline
                          maxLength={1000}
                          textAlignVertical="top"
                        />

                        <TouchableOpacity
                          style={styles.botonPublicar}
                          onPress={() => enviarRespuesta(resena.id)}
                        >
                          <Text style={styles.textoBoton}>
                            Enviar respuesta
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            setResenaRespondiendo(null);
                            setTextoRespuesta("");
                          }}
                        >
                          <Text style={styles.textoCancelar}>Cancelar</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setResenaRespondiendo(resena.id)}
                      >
                        <Text style={styles.textoAccion}>
                          💬 Responder reseña
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  botonVolver: {
    marginBottom: 12,
  },
  textoVolver: {
    color: "#0a7ea4",
    fontSize: 15,
    fontWeight: "600",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },
  subTituloInfo: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  estrellasDetalle: {
    fontSize: 13,
    color: "#444",
    marginTop: 4,
    marginBottom: 15,
  },
  seccionVideo: {
    marginBottom: 16,
  },
  tituloVideo: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#000",
  },
  botonesContacto: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  botonAccion: {
    flex: 1,
    backgroundColor: "#0a7ea4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  botonWhatsapp: {
    backgroundColor: "#25D366",
  },
  botonIr: {
    backgroundColor: "#555",
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  seccion: {
    marginBottom: 14,
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  subtituloSeccion: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  texto: {
    fontSize: 14,
    color: "#555",
  },
  textoInstagram: {
    fontSize: 14,
    color: "#0a7ea4",
  },
  errorText: {
    fontSize: 16,
    color: "#c62828",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  seccionResenas: {
    marginTop: 10,
    marginBottom: 30,
  },
  tituloResenas: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 5,
  },
  promedioResenas: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  formularioResena: {
    backgroundColor: "#f4f8fa",
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
  },
  etiqueta: {
    fontSize: 14,
    color: "#444",
    marginTop: 8,
    marginBottom: 5,
  },
  selectorEstrellas: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  estrellaSeleccion: {
    fontSize: 30,
  },
  inputComentario: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    fontSize: 14,
    marginBottom: 10,
  },
  botonPublicar: {
    backgroundColor: "#0a7ea4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 8,
  },
  aviso: {
    color: "#666",
    fontSize: 13,
    marginVertical: 12,
  },
  tarjetaResena: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
  },
  autorResena: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },
  estrellasResena: {
    fontSize: 18,
    marginTop: 5,
  },
  fechaResena: {
    fontSize: 12,
    color: "#888",
    marginTop: 3,
    marginBottom: 8,
  },
  comentarioResena: {
    fontSize: 14,
    color: "#444",
    lineHeight: 21,
  },
  accionesResena: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 12,
  },
  textoAccion: {
    color: "#0a7ea4",
    fontWeight: "600",
    fontSize: 14,
  },
  textoEliminar: {
    color: "#c62828",
    fontWeight: "600",
    fontSize: 14,
  },
  textoDenunciar: {
    color: "#b26a00",
    fontSize: 13,
    marginTop: 12,
  },
  avisoDenunciada: {
    color: "#b26a00",
    fontSize: 12,
    marginTop: 8,
  },
  respuestaComercio: {
    backgroundColor: "#eef6f8",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  tituloRespuesta: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#0a7ea4",
    marginBottom: 5,
  },
  textoRespuesta: {
    color: "#444",
    fontSize: 13,
    lineHeight: 19,
  },
  formularioRespuesta: {
    marginTop: 8,
  },
  textoCancelar: {
    color: "#666",
    marginTop: 8,
    marginBottom: 5,
  },
  imagenComercio: {
    width: 260,
    height: 180,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#eeeeee",
  },
});
