import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { obtenerComercioPorId } from "@/servicios/serviciosComercios";
import { Comercio } from "@/tipos/comercios";

export default function DetalleComercioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  // Configuración del reproductor de video (Expo Video)
  const videoSource = comercio?.videoPresentacion || "";
  const player = useVideoPlayer(videoSource, (playerInstance) => {
    playerInstance.loop = true;
  });

  useEffect(() => {
    async function cargarDetalle() {
      if (!id) return;
      try {
        const datos = await obtenerComercioPorId(id);
        setComercio(datos);
      } catch (error) {
        console.error("Error al cargar el detalle del comercio:", error);
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Botón Volver */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.botonVolver}
      >
        <Text style={styles.textoVolver}>← Volver al listado</Text>
      </TouchableOpacity>

      {/* Encabezado Ficha */}
      <Text style={styles.titulo}>{comercio.nombre}</Text>
      <Text style={styles.subTituloInfo}>
        {comercio.rubro.toUpperCase()} • {comercio.direccion}
      </Text>
      <Text style={styles.estrellasDetalle}>
        ⭐ {comercio.promedioEstrellas} ({comercio.totalResenas} reseñas)
      </Text>

      {/* Video de presentación (Expo Video - Requisito técnico) */}
      {comercio.videoPresentacion ? (
        <View style={styles.seccionVideo}>
          <Text style={styles.tituloVideo}>🎥 Video de Presentación (30s)</Text>
          <VideoView
            player={player}
            style={styles.video}
            nativeControls={true}
          />
        </View>
      ) : null}

      {/* Botones de acción rápida: Llamar, WhatsApp, Ir (Mapa) */}
      <View style={styles.botonesContacto}>
        {comercio.telefono && (
          <TouchableOpacity
            style={styles.botonAccion}
            onPress={() => Linking.openURL(`tel:${comercio.telefono}`)}
          >
            <Text style={styles.textoBoton}>📞 Llamar</Text>
          </TouchableOpacity>
        )}

        {comercio.whatsapp && (
          <TouchableOpacity
            style={[styles.botonAccion, styles.botonWhatsapp]}
            onPress={() => {
              const numeroLimpio = comercio.whatsapp?.replace(/\D/g, "") || "";
              const urlWhatsapp = `https://api.whatsapp.com/send?phone=${numeroLimpio}`;

              Linking.openURL(urlWhatsapp).catch((err) =>
                console.error("Error al abrir WhatsApp:", err)
              );
            }}
          >
            <Text style={styles.textoBoton}>💬 WhatsApp</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.botonAccion, styles.botonIr]}
          onPress={() => {
            const url = `https://www.google.com/maps/search/?api=1&query=${comercio.latitud},${comercio.longitud}`;
            Linking.openURL(url);
          }}
        >
          <Text style={styles.textoBoton}>📍 Ir</Text>
        </TouchableOpacity>
      </View>

      {/* Información general */}
      <View style={styles.seccion}>
        <Text style={styles.subtituloSeccion}>📄 Descripción</Text>
        <Text style={styles.texto}>{comercio.descripcion}</Text>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.subtituloSeccion}>💳 Medios de pago aceptados</Text>
        <Text style={styles.texto}>{comercio.mediosDePago.join(", ")}</Text>
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
  errorText: {
    fontSize: 16,
    color: "#c62828",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 20,
  },
});