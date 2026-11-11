import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  actualizarMiComercio,
  obtenerMiComercio,
  subirArchivo,
} from "@/servicios/api";
import { useVideoPlayer, VideoView } from "expo-video";

export default function FotosVideos() {
  const router = useRouter();

  const [imagenes, setImagenes] = useState<string[]>([]);
  const [imagenesNuevas, setImagenesNuevas] = useState<
    ImagePicker.ImagePickerAsset[]
  >([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoNuevo, setVideoNuevo] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [guardandoVideo, setGuardandoVideo] = useState(false);
  const reproductor = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
  });

  // cargar las imagenes que ya tiene guardadas el comercio
  useEffect(() => {
    async function cargarComercio() {
      try {
        const comercio = await obtenerMiComercio();
        setImagenes(comercio.imagenes || []);
        setVideoUrl(comercio.videoUrl || null);
      } catch (error) {
        Alert.alert(
          "Error",
          "No se pudieron cargar las imágenes del comercio.",
        );
      } finally {
        setCargando(false);
      }
    }

    cargarComercio();
  }, []);

  useEffect(() => {
    const videoAReproducir = videoNuevo?.uri || videoUrl;

    reproductor.replaceAsync(videoAReproducir);
  }, [videoNuevo, videoUrl, reproductor]);

  // seleccionar imagenes de la galeria
  async function seleccionarFotos() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceder a tus fotos para agregarlas al comercio.",
      );
      return;
    }

    const cantidadDisponible = 8 - imagenes.length - imagenesNuevas.length;

    if (cantidadDisponible <= 0) {
      Alert.alert("Límite alcanzado", "Podés tener un máximo de 8 imágenes.");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: cantidadDisponible,
      quality: 1,
    });

    if (!resultado.canceled) {
      const nuevas = resultado.assets.map((foto) => foto.uri);

      setImagenesNuevas((actuales) => [...actuales, ...resultado.assets]);
    }
  }

  // Tomar una foto con la cámara
  async function tomarFoto() {
    const cantidadDisponible = 8 - imagenes.length - imagenesNuevas.length;

    if (cantidadDisponible <= 0) {
      Alert.alert("Límite alcanzado", "Podés tener un máximo de 8 imágenes.");
      return;
    }

    const permiso = await ImagePicker.requestCameraPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceder a la cámara para tomar una foto.",
      );
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!resultado.canceled) {
      setImagenesNuevas((actuales) => [...actuales, resultado.assets[0]]);
    }
  }

  // Seleccionar un video de la galería
  async function seleccionarVideo() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert("Permiso necesario", "Necesitamos acceder a tus videos.");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!resultado.canceled) {
      const video = resultado.assets[0];

      if (video.fileSize && video.fileSize > 30 * 1024 * 1024) {
        Alert.alert(
          "Video demasiado grande",
          "El video no puede superar los 30 MB.",
        );
        return;
      }

      const esMp4 =
        video.mimeType === "video/mp4" ||
        video.fileName?.toLowerCase().endsWith(".mp4");

      if (!esMp4) {
        Alert.alert(
          "Formato no compatible",
          "Por ahora solamente podemos utilizar videos MP4.",
        );
        return;
      }

      setVideoNuevo(video);
      
    }
  }

  async function grabarVideo() {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceder a la cámara para grabar videos.",
      );
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ["videos"],
      quality: 1,
    });

    if (!resultado.canceled) {
      const video = resultado.assets[0];

      if (video.fileSize && video.fileSize > 30 * 1024 * 1024) {
        Alert.alert(
          "Video demasiado grande",
          "El video no puede superar los 30 MB.",
        );
        return;
      }

      const esMp4 =
        video.mimeType === "video/mp4" ||
        video.fileName?.toLowerCase().endsWith(".mp4");

      if (!esMp4) {
        Alert.alert(
          "Formato no compatible",
          "La grabación debe estar en formato MP4.",
        );
        return;
      }

      setVideoNuevo(video);
      
    }
  }

  async function guardarVideo() {
    if (!videoNuevo) {
      Alert.alert("Atención", "Primero seleccioná un video.");
      return;
    }

    // Comprobar el tamaño máximo: 30 MB
    if (videoNuevo.fileSize && videoNuevo.fileSize > 30 * 1024 * 1024) {
      Alert.alert(
        "Video demasiado grande",
        "El video no puede superar los 30 MB.",
      );
      return;
    }

    // Comprobar que sea MP4
    const esMp4 =
      videoNuevo.mimeType === "video/mp4" ||
      videoNuevo.fileName?.toLowerCase().endsWith(".mp4");

    if (!esMp4) {
      Alert.alert("Formato no compatible", "Solamente se permiten videos MP4.");
      return;
    }

    // Comprobar duración máxima: 30 segundos
    if (videoNuevo.duration && videoNuevo.duration > 30000) {
      Alert.alert(
        "Video demasiado largo",
        "El video no puede superar los 30 segundos.",
      );
      return;
    }

    try {
      setGuardandoVideo(true);

      // Subir el archivo a la API
      const resultado = await subirArchivo({
        uri: videoNuevo.uri,
        name: videoNuevo.fileName || `video-${Date.now()}.mp4`,
        type: videoNuevo.mimeType || "video/mp4",
      });

      // Guardar la URL del video en el comercio
      await actualizarMiComercio({
        videoUrl: resultado.url,
      });

      // Actualizar la pantalla
      setVideoUrl(resultado.url);
      setVideoNuevo(null);

      Alert.alert("¡Listo!", "El video se guardó correctamente.");
    } catch (error: any) {
      console.error(
        "Error al guardar el video:",
        error.response?.data || error,
      );

      Alert.alert("Error", "No se pudo guardar el video. Intentá nuevamente.");
    } finally {
      setGuardandoVideo(false);
    }
  }

  async function eliminarVideo() {
    Alert.alert(
      "Eliminar video",
      "¿Estás segura de que querés eliminar el video del comercio?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setGuardandoVideo(true);

              await actualizarMiComercio({
                videoUrl: null,
              });

              setVideoUrl(null);

              Alert.alert(
                "Video eliminado",
                "El video se eliminó correctamente.",
              );
            } catch (error: any) {
              console.error(
                "Error al eliminar el video:",
                error.response?.data || error,
              );

              Alert.alert(
                "Error",
                "No se pudo eliminar el video. Intentá nuevamente.",
              );
            } finally {
              setGuardandoVideo(false);
            }
          },
        },
      ],
    );
  }

  async function probarSubida() {
    if (imagenesNuevas.length === 0) {
      Alert.alert("Atención", "Primero seleccioná una imagen.");
      return;
    }

    try {
      const imagen = imagenesNuevas[0];

      const resultado = await subirArchivo({
        uri: imagen.uri,
        name: imagen.fileName || `foto-${Date.now()}.jpg`,
        type: imagen.mimeType || "image/jpeg",
      });

      console.log("Resultado de la subida:", resultado);

      Alert.alert(
        "Prueba realizada",
        "La API respondió. Revisá la consola para ver los datos devueltos.",
      );
    } catch (error: any) {
      console.log("Error al subir archivo:", error.response?.data || error);

      Alert.alert(
        "Error al subir",
        error.response?.data?.error?.mensaje ||
          "No se pudo subir la imagen al servidor.",
      );
    }
  }

  async function guardarImagenes() {
    if (imagenesNuevas.length === 0) {
      Alert.alert("Atención", "Primero agregá alguna imagen.");
      return;
    }

    try {
      setGuardando(true);

      // Subir cada imagen al servidor
      const respuestas = await Promise.all(
        imagenesNuevas.map((imagen) =>
          subirArchivo({
            uri: imagen.uri,
            name: imagen.fileName || `foto-${Date.now()}.jpg`,
            type: imagen.mimeType || "image/jpeg",
          }),
        ),
      );

      // Obtener las URL devueltas por la API
      const nuevasUrl = respuestas.map((respuesta) => respuesta.url);

      // Combinar las imágenes anteriores con las nuevas
      const todasLasImagenes = [...imagenes, ...nuevasUrl];

      // Guardar las URL en el comercio
      await actualizarMiComercio({
        imagenes: todasLasImagenes,
      });

      setImagenes(todasLasImagenes);
      setImagenesNuevas([]);

      Alert.alert("¡Listo!", "Las imágenes se guardaron correctamente.");
    } catch (error: any) {
      console.log("Error al guardar imágenes:", error.response?.data || error);

      Alert.alert(
        "Error",
        error.response?.data?.error?.mensaje ||
          "No se pudieron guardar las imágenes.",
      );
    } finally {
      setGuardando(false);
    }
  }

  // Quitar una imagen que todavía no fue subida
  function quitarImagenNueva(uri: string) {
    setImagenesNuevas((actuales) =>
      actuales.filter((imagen) => imagen.uri !== uri),
    );
  }

  if (cargando) {
    return (
      <View style={estilos.cargando}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text>Cargando imágenes...</Text>
      </View>
    );
  }
  async function eliminarImagen(uri: string) {
    Alert.alert(
      "Eliminar imagen",
      "¿Estás segura de que querés quitar esta imagen del comercio?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const imagenesActualizadas = imagenes.filter(
                (imagen) => imagen !== uri,
              );

              await actualizarMiComercio({
                imagenes: imagenesActualizadas,
              });

              setImagenes(imagenesActualizadas);

              Alert.alert(
                "Imagen eliminada",
                "La imagen se quitó correctamente del comercio.",
              );
            } catch (error: any) {
              console.log(
                "Error al eliminar imagen:",
                error.response?.data || error,
              );

              Alert.alert("Error", "No se pudo eliminar la imagen.");
            }
          },
        },
      ],
    );
  }

  return (
    <ScrollView style={estilos.contenedor}>
      <TouchableOpacity
        style={estilos.botonVolver}
        onPress={() => router.back()}
      >
        <Text style={estilos.textoVolver}>‹ Volver</Text>
      </TouchableOpacity>

      <Text style={estilos.titulo}>Fotos y videos</Text>

      <Text style={estilos.descripcion}>
        Administrá las imágenes y los videos que muestran tu comercio.
      </Text>

      <View style={estilos.tarjeta}>
        <Text style={estilos.subtitulo}>Fotos del comercio</Text>

        <Text style={estilos.aclaracion}>Podés agregar hasta 8 imágenes.</Text>

        <View style={estilos.botones}>
          <TouchableOpacity style={estilos.boton} onPress={seleccionarFotos}>
            <Text style={estilos.textoBoton}>🖼️ Elegir de galería</Text>
          </TouchableOpacity>

          <TouchableOpacity style={estilos.botonSecundario} onPress={tomarFoto}>
            <Text style={estilos.textoBotonSecundario}>📷 Tomar foto</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[estilos.boton, { marginTop: 12, marginBottom: 20 }]}
          onPress={guardarImagenes}
          disabled={guardando}
        >
          <Text style={estilos.textoBoton}>
            {guardando ? "Guardando imágenes..." : "Guardar imágenes"}
          </Text>
        </TouchableOpacity>

        <Text style={estilos.subtitulo}>Imágenes guardadas</Text>

        {imagenes.length === 0 ? (
          <Text style={estilos.vacio}>Todavía no hay imágenes guardadas.</Text>
        ) : (
          <View style={estilos.galeria}>
            {imagenes.map((uri, indice) => (
              <View key={`${uri}-${indice}`}>
                <Image source={{ uri }} style={estilos.imagen} />

                <TouchableOpacity
                  style={estilos.botonEliminar}
                  onPress={() => eliminarImagen(uri)}
                >
                  <Text style={estilos.textoEliminar}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {imagenesNuevas.length > 0 && (
          <>
            <Text style={estilos.subtitulo}>Imágenes nuevas (pendientes)</Text>

            <View style={estilos.galeria}>
              {imagenesNuevas.map((uri, indice) => (
                <View key={`${uri}-${indice}`}>
                  <Image source={{ uri: uri.uri }} style={estilos.imagen} />

                  <TouchableOpacity
                    style={estilos.botonEliminar}
                    onPress={() => quitarImagenNueva(uri.uri)}
                  >
                    <Text style={estilos.textoEliminar}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}
        <Text style={estilos.subtitulo}>Video del comercio</Text>

        <Text style={estilos.aclaracion}>
          Podés seleccionar un video o grabarlo con tu cámara. El tamaño máximo
          permitido es de 30 MB.
        </Text>

        <View style={estilos.botones}>
          <TouchableOpacity style={estilos.boton} onPress={seleccionarVideo}>
            <Text style={estilos.textoBoton}>🎬 Elegir video de galería</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.botonSecundario}
            onPress={grabarVideo}
          >
            <Text style={estilos.textoBotonSecundario}>📹 Grabar video</Text>
          </TouchableOpacity>
        </View>

        {videoNuevo && (
          <View style={{ marginTop: 10 }}>
            <Text style={estilos.subtitulo}>
              Video seleccionado (pendiente)
            </Text>

            <Text style={estilos.vacio}>
              Archivo: {videoNuevo?.fileName || "Video seleccionado"}
            </Text>

            <VideoView
              player={reproductor}
              style={{
                width: "100%",
                height: 220,
                borderRadius: 12,
                marginTop: 10,
              }}
              nativeControls
              contentFit="contain"
            />

            <TouchableOpacity
              style={[estilos.boton, guardandoVideo && { opacity: 0.6 }]}
              onPress={guardarVideo}
              disabled={guardandoVideo}
            >
              {guardandoVideo ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={estilos.textoBoton}>Guardar video</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={estilos.botonEliminar}
              onPress={() => setVideoNuevo(null)}
            >
              <Text style={estilos.textoEliminar}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {videoUrl && !videoNuevo && (
          <View style={{ marginTop: 15 }}>
            <Text style={estilos.subtitulo}>Video del comercio</Text>

            <VideoView
              player={reproductor}
              style={{
                width: "100%",
                height: 220,
                borderRadius: 12,
              }}
              nativeControls
              contentFit="contain"
            />
            <TouchableOpacity
              style={estilos.botonEliminar}
              onPress={eliminarVideo}
              disabled={guardandoVideo}
            >
              <Text style={estilos.textoEliminar}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    padding: 20,
  },
  cargando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
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
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
  },
  descripcion: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    marginBottom: 20,
  },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    marginBottom: 30,
  },
  subtitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
    marginBottom: 8,
  },
  aclaracion: {
    color: "#777",
    fontSize: 13,
    marginBottom: 15,
  },
  botones: {
    gap: 10,
    marginBottom: 20,
  },
  boton: {
    backgroundColor: "#0a7ea4",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  botonSecundario: {
    backgroundColor: "#EAF4F7",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBotonSecundario: {
    color: "#0a7ea4",
    fontWeight: "600",
    fontSize: 15,
  },
  vacio: {
    color: "#888",
    fontSize: 14,
    marginVertical: 12,
  },
  galeria: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  imagen: {
    width: 95,
    height: 95,
    borderRadius: 10,
  },
  botonEliminar: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#D93636",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textoEliminar: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
