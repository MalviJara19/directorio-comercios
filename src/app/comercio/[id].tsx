
import { useLocalSearchParams, useRouter } from "expo-router";
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

import { RUBROS_MOCK } from "../../mocks/comerciosMock";
import { obtenerComercioPorId } from "../../servicios/serviciosComercios";
import type { Comercio } from "../../tipos/comercios";

export default function DetalleComercioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargarDetalle() {
      if (!id) {
        setCargando(false);
        return;
      }

      try {
        const datos = await obtenerComercioPorId(id);
        if (activo) setComercio(datos);
      } catch (error) {
        console.error("Error al cargar el comercio:", error);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarDetalle();

    return () => {
      activo = false;
    };
  }, [id]);

  async function abrirEnlace(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      console.error("No se pudo abrir el enlace.");
    }
  }

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.textoCargando}>
          Cargando ficha del comercio...
        </Text>
      </View>
    );
  }

  if (!comercio) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.errorText}>
          No se encontró el comercio.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.boton}
        >
          <Text style={styles.textoBoton}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rubro =
    RUBROS_MOCK.find((r) => r.id === comercio.rubroId)?.nombre ??
    comercio.rubroId;

  const urlMapa =
    `https://www.google.com/maps/search/?api=1&query=` +
    `${comercio.coordenadas.latitud},${comercio.coordenadas.longitud}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.volver}
      >
        <Text style={styles.textoVolver}>‹ Volver</Text>
      </TouchableOpacity>

      <Text style={styles.rubro}>{rubro.toUpperCase()}</Text>
      <Text style={styles.titulo}>{comercio.nombre}</Text>
      <Text style={styles.direccion}>{comercio.direccion}</Text>

      <Text style={styles.estrellas}>
        ⭐ {comercio.puntaje} ({comercio.cantidadResenas} reseñas)
      </Text>

      <View style={styles.seccion}>
        <Text style={styles.subtitulo}>Descripción</Text>
        <Text style={styles.texto}>
          {comercio.descripcion || "Sin descripción disponible."}
        </Text>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.subtitulo}>Medios de pago</Text>
        <Text style={styles.texto}>
          {comercio.mediosDePago.length > 0
            ? comercio.mediosDePago.join(", ")
            : "Sin información disponible."}
        </Text>
      </View>

      {comercio.horarios.length > 0 && (
        <View style={styles.seccion}>
          <Text style={styles.subtitulo}>Horarios</Text>
          {comercio.horarios.map((horario, indice) => (
            <Text key={`${horario.dia}-${indice}`} style={styles.texto}>
              Día {horario.dia}: {horario.abre} a {horario.cierra}
            </Text>
          ))}
        </View>
      )}

      {comercio.videoUrl && (
        <View style={styles.seccion}>
          <Text style={styles.subtitulo}>Video de presentación</Text>
          <TouchableOpacity
            onPress={() => abrirEnlace(comercio.videoUrl!)}
          >
            <Text style={styles.enlace}>Ver video</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.botones}>
        <TouchableOpacity
          style={styles.boton}
          onPress={() => abrirEnlace(urlMapa)}
        >
          <Text style={styles.textoBoton}>Ver ubicación</Text>
        </TouchableOpacity>

        {comercio.telefono && (
          <TouchableOpacity
            style={styles.boton}
            onPress={() =>
              abrirEnlace(`tel:${comercio.telefono}`)
            }
          >
            <Text style={styles.textoBoton}>Llamar</Text>
          </TouchableOpacity>
        )}

        {comercio.whatsapp && (
          <TouchableOpacity
            style={[styles.boton, styles.botonWhatsapp]}
            onPress={() =>
              abrirEnlace(
                `https://wa.me/${comercio.whatsapp!.replace(/\D/g, "")}`
              )
            }
          >
            <Text style={styles.textoBoton}>WhatsApp</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contenido: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 35,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  textoCargando: {
    marginTop: 10,
    color: "#555",
  },
  volver: {
    marginBottom: 20,
  },
  textoVolver: {
    color: "#0a7ea4",
    fontSize: 16,
    fontWeight: "600",
  },
  rubro: {
    color: "#0a7ea4",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111",
  },
  direccion: {
    fontSize: 15,
    color: "#555",
    marginTop: 6,
  },
  estrellas: {
    fontSize: 15,
    color: "#444",
    marginTop: 12,
    marginBottom: 20,
  },
  seccion: {
    marginBottom: 14,
    backgroundColor: "#f8f9fa",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 7,
  },
  texto: {
    fontSize: 14,
    lineHeight: 21,
    color: "#555",
  },
  botones: {
    gap: 10,
    marginTop: 5,
  },
  boton: {
    backgroundColor: "#0a7ea4",
    padding: 13,
    borderRadius: 8,
    alignItems: "center",
  },
  botonWhatsapp: {
    backgroundColor: "#25D366",
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  enlace: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "#c62828",
    marginBottom: 20,
    textAlign: "center",
  },
});
