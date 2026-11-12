import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "@/servicios/api";
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

  const videoSource = comercio?.videoUrl || "";

  const player = useVideoPlayer(videoSource, (playerInstance) => {
    playerInstance.loop = false;
  });

  useEffect(() => {
    async function cargarDetalle() {
      if (!id) {
        setCargando(false);
        return;
      }

      try {
        setCargando(true);

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
          videoLocal = await descargarArchivo(videoLocal, comercioConFotos.id);
        }

        setComercio({
          ...comercioConFotos,
          imagenes: imagenesLocales,
          videoUrl: videoLocal,
        });
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
                const archivo = await obtenerArchivoLocal(
                  url,
                  comercioLocal.id,
                );
                return archivo;
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
        }
      } finally {
        setCargando(false);
      }
    }

    cargarDetalle();
  }, [id]);

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

  imagenComercio: {
    width: 260,
    height: 180,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#eeeeee",
  },
});
