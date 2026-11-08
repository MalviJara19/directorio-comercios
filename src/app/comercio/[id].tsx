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
import { SafeAreaView } from "react-native-safe-area-context";

import { obtenerComercioPorId } from "@/servicios/serviciosComercios";
import { Comercio, Horario } from "@/tipos/comercios";
import { estaAbiertoAhora } from "@/utilidades/horarios";

const NOMBRES_DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// Función auxiliar para asegurar que las URLs de imágenes o videos apunten correctamente al backend si son relativas
function obtenerUrlCompleta(url: string | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // Si viene con barra inicial o sin ella, lo unimos al puerto 3000 del backend local
  const baseUrl = "http://localhost:3000";
  return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}

function ReproductorVideo({ videoUrl }: { videoUrl: string }) {
  const urlFinal = obtenerUrlCompleta(videoUrl);
  const player = useVideoPlayer(urlFinal, (player) => {
    player.loop = false;
  });

  return (
    <View style={styles.seccion}>
      <Text style={styles.seccionTitulo}>📹 Video de presentación</Text>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
}

function agruparHorariosPorDia(horarios: Horario[]) {
  const mapa: { [key: number]: string[] } = {};

  horarios.forEach((h) => {
    if (!mapa[h.dia]) {
      mapa[h.dia] = [];
    }
    mapa[h.dia].push(`${h.abre} a ${h.cierra} hs`);
  });

  return Object.keys(mapa)
    .map(Number)
    .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
    .map((diaNum) => ({
      nombreDia: NOMBRES_DIAS[diaNum],
      turnos: mapa[diaNum].join(" / "),
    }));
}

export default function DetalleComercioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    async function cargar() {
      if (!id) return;
      try {
        const datos = await obtenerComercioPorId(id);
        console.log("Comercio cargado exitosamente:", datos);
        console.log("Imágenes del comercio:", datos?.imagenes);
        console.log("Video URL del comercio:", datos?.videoUrl);
        setComercio(datos);
      } catch (error) {
        console.error("Error al obtener detalle del comercio:", error);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id]);

  const volverAlListado = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={{ marginTop: 10 }}>Cargando datos del comercio...</Text>
      </SafeAreaView>
    );
  }

  if (!comercio) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>No se encontró el comercio.</Text>
        <TouchableOpacity style={styles.botonVolver} onPress={volverAlListado}>
          <Text style={styles.textoBotonVolver}>← Volver al inicio</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const abierto = estaAbiertoAhora(comercio.horarios);
  const horariosAgrupados = comercio.horarios
    ? agruparHorariosPorDia(comercio.horarios)
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Barra superior con botón volver */}
        <TouchableOpacity style={styles.backBtn} onPress={volverAlListado}>
          <Text style={styles.backText}>← Volver al listado</Text>
        </TouchableOpacity>

        {/* Galería de Imágenes (Solo si existen) */}
        {comercio.imagenes && comercio.imagenes.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.galeria}
          >
            {comercio.imagenes.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: obtenerUrlCompleta(img) }}
                style={styles.imagen}
              />
            ))}
          </ScrollView>
        )}

        {/* Encabezado Principal */}
        <View style={styles.headerInfo}>
          <Text style={styles.nombre}>{comercio.nombre}</Text>
          <Text style={styles.subtituloHeader}>
            {comercio.rubroId} • {comercio.direccion}
          </Text>

          <View style={styles.estadoContainer}>
            <Text
              style={[
                styles.badgeEstado,
                abierto ? styles.abierto : styles.cerrado,
              ]}
            >
              {abierto ? "🟢 ABIERTO AHORA" : "🔴 CERRADO"}
            </Text>
            <Text style={styles.estrellas}>
              ⭐ {comercio.puntaje} ({comercio.cantidadResenas} reseñas)
            </Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>📄 Descripción</Text>
          <Text style={styles.descripcionText}>
            {comercio.descripcion ||
              "Este comercio no ha agregado una descripción todavía."}
          </Text>
        </View>

        {/* Video de presentación */}
        {comercio.videoUrl ? (
          <ReproductorVideo videoUrl={comercio.videoUrl} />
        ) : null}

        {/* Botones de Contacto Rápido */}
        {(comercio.telefono || comercio.whatsapp || comercio.instagram) && (
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>📞 Contacto e Interacción</Text>
            <View style={styles.botonesAccion}>
              {comercio.telefono && (
                <TouchableOpacity
                  style={[styles.btnAccion, { backgroundColor: "#0a7ea4" }]}
                  onPress={() => Linking.openURL(`tel:${comercio.telefono}`)}
                >
                  <Text style={styles.btnAccionTexto}>📞 Llamar</Text>
                </TouchableOpacity>
              )}

              {comercio.whatsapp && (
                <TouchableOpacity
                  style={[styles.btnAccion, { backgroundColor: "#25D366" }]}
                  onPress={() =>
                    Linking.openURL(`https://wa.me/${comercio.whatsapp}`)
                  }
                >
                  <Text style={styles.btnAccionTexto}>💬 WhatsApp</Text>
                </TouchableOpacity>
              )}

              {comercio.instagram && (
                <TouchableOpacity
                  style={[styles.btnAccion, { backgroundColor: "#C13584" }]}
                  onPress={() =>
                    Linking.openURL(
                      `https://instagram.com/${comercio.instagram.replace("@", "")}`,
                    )
                  }
                >
                  <Text style={styles.btnAccionTexto}>📸 Instagram</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Horarios de Atención */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>⏱️ Horarios de Atención</Text>
          {horariosAgrupados.length > 0 ? (
            horariosAgrupados.map((item, i) => (
              <View key={i} style={styles.filaHorario}>
                <Text style={styles.diaTexto}>{item.nombreDia}:</Text>
                <Text style={styles.turnosTexto}>{item.turnos}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.horarioVacio}>
              🏖️ Cerrado por vacaciones o sin horarios informados.
            </Text>
          )}
        </View>

        {/* Medios de Pago */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>💳 Medios de Pago Aceptados</Text>
          <View style={styles.chipsContainer}>
            {comercio.mediosDePago && comercio.mediosDePago.length > 0 ? (
              comercio.mediosDePago.map((medio, idx) => (
                <View key={idx} style={styles.chipPago}>
                  <Text style={styles.chipPagoTexto}>
                    {medio === "efectivo"
                      ? "💵"
                      : medio === "debito" || medio === "credito"
                        ? "💳"
                        : "📱"}{" "}
                    {medio.toUpperCase()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#777" }}>
                No especifica medios de pago.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#c00",
    marginBottom: 12,
  },
  botonVolver: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoBotonVolver: {
    color: "#fff",
    fontWeight: "bold",
  },
  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingRight: 12,
    marginBottom: 12,
  },
  backText: {
    color: "#0a7ea4",
    fontSize: 15,
    fontWeight: "600",
  },
  galeria: {
    height: 160,
    marginBottom: 16,
  },
  imagen: {
    width: 250,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  headerInfo: {
    marginBottom: 8,
  },
  nombre: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },
  subtituloHeader: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
    marginBottom: 10,
  },
  estadoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  badgeEstado: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 12,
  },
  abierto: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  cerrado: {
    backgroundColor: "#ffebee",
    color: "#c62828",
  },
  estrellas: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  seccion: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  descripcionText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#000",
  },
  botonesAccion: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  btnAccion: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnAccionTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  filaHorario: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  diaTexto: {
    fontWeight: "bold",
    color: "#444",
    width: 90,
  },
  turnosTexto: {
    color: "#555",
    flex: 1,
  },
  horarioVacio: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipPago: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  chipPagoTexto: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "bold",
  },
});
