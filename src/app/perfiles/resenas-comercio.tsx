import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AppTabs from "@/components/app-tabs";
import { obtenerResenasPorComercio, responderResena } from "@/servicios/api";
import { obtenerUsuario } from "@/servicios/sesion";
import type { Resena } from "@/tipos/comercios";

export default function ResenasComercio() {
  const router = useRouter();

  const [resenas, setResenas] = useState<Resena[]>([]);
  const [cargando, setCargando] = useState(true);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [respondiendo, setRespondiendo] = useState<string | null>(null);

  const cargarResenas = useCallback(async () => {
    try {
      setCargando(true);

      const usuario = await obtenerUsuario();

      if (!usuario?.comercioId) {
        Alert.alert("Error", "No se encontró el identificador de tu comercio.");
        return;
      }

      const resultado = await obtenerResenasPorComercio(
        usuario.comercioId,
        1,
        20,
      );

      setResenas(resultado.datos);
    } catch (error) {
      console.error("Error al cargar reseñas:", error);
      Alert.alert("Error", "No se pudieron cargar las reseñas.");
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarResenas();
    }, [cargarResenas]),
  );

  const actualizarRespuesta = (resenaId: string, texto: string) => {
    setRespuestas((actuales) => ({
      ...actuales,
      [resenaId]: texto,
    }));
  };

  const enviarRespuesta = async (resena: Resena) => {
    const texto = respuestas[resena.id]?.trim();

    if (!texto) {
      Alert.alert("Atención", "Escribí una respuesta antes de enviarla.");
      return;
    }

    if (resena.respuesta) {
      Alert.alert("Atención", "Esta reseña ya tiene una respuesta.");
      return;
    }

    try {
      setRespondiendo(resena.id);

      await responderResena(resena.id, texto);

      setResenas((actuales) =>
        actuales.map((item) =>
          item.id === resena.id ? { ...item, respuesta: texto } : item,
        ),
      );

      setRespuestas((actuales) => ({
        ...actuales,
        [resena.id]: "",
      }));

      Alert.alert(
        "¡Respuesta enviada!",
        "Tu respuesta se publicó correctamente.",
      );
    } catch (error: any) {
      console.error("Error al responder reseña:", error);

      Alert.alert(
        "No se pudo responder",
        error.response?.data?.error?.mensaje ||
          "Ocurrió un problema al enviar tu respuesta.",
      );
    } finally {
      setRespondiendo(null);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR");
  };

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.textoCargando}>Cargando reseñas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <ScrollView
        style={styles.contenido}
        contentContainerStyle={styles.contenidoInterno}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => router.back()}
        >
          <Text style={styles.textoVolver}>‹ Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Reseñas de mi comercio</Text>

        <Text style={styles.subtitulo}>
          Leé las opiniones de tus clientes y respondé sus comentarios.
        </Text>

        <View style={styles.resumen}>
          <Text style={styles.total}>{resenas.length} reseñas</Text>
        </View>

        {resenas.length === 0 ? (
          <Text style={styles.sinResenas}>Todavía no recibiste reseñas.</Text>
        ) : (
          resenas.map((resena) => (
            <View key={resena.id} style={styles.tarjeta}>
              <Text style={styles.estrellas}>
                {"★".repeat(resena.estrellas)}
                {"☆".repeat(5 - resena.estrellas)}
              </Text>

              <Text style={styles.fecha}>
                {formatearFecha(resena.creadaEn)}
              </Text>

              <Text style={styles.comentario}>{resena.comentario}</Text>

              {resena.reportada && (
                <Text style={styles.reportada}>
                  ⚠️ Esta reseña fue reportada.
                </Text>
              )}

              {resena.respuesta ? (
                <View style={styles.respuestaExistente}>
                  <Text style={styles.tituloRespuesta}>Tu respuesta</Text>
                  <Text style={styles.textoRespuesta}>{resena.respuesta}</Text>
                </View>
              ) : (
                <View style={styles.seccionRespuesta}>
                  <Text style={styles.tituloRespuesta}>
                    Responder a esta reseña
                  </Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Escribí tu respuesta..."
                    placeholderTextColor="#999"
                    multiline
                    value={respuestas[resena.id] || ""}
                    onChangeText={(texto) =>
                      actualizarRespuesta(resena.id, texto)
                    }
                  />

                  <TouchableOpacity
                    style={[
                      styles.botonResponder,
                      respondiendo === resena.id && styles.botonDeshabilitado,
                    ]}
                    disabled={respondiendo !== null}
                    onPress={() => enviarRespuesta(resena)}
                  >
                    {respondiendo === resena.id ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.textoBoton}>Enviar respuesta</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <AppTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  contenido: {
    flex: 1,
  },
  contenidoInterno: {
    padding: 20,
    paddingBottom: 120,
  },
  cargando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
  },
  textoCargando: {
    marginTop: 12,
    color: "#718096",
  },
  botonVolver: {
    marginBottom: 20,
  },
  textoVolver: {
    color: "#0a7ea4",
    fontSize: 16,
    fontWeight: "600",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#263238",
  },
  subtitulo: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
    lineHeight: 21,
  },
  resumen: {
    backgroundColor: "#E8F3F7",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 15,
  },
  total: {
    color: "#0a7ea4",
    fontSize: 16,
    fontWeight: "bold",
  },
  sinResenas: {
    textAlign: "center",
    color: "#718096",
    marginTop: 35,
    fontSize: 15,
  },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  estrellas: {
    color: "#E5A000",
    fontSize: 22,
    letterSpacing: 2,
  },
  fecha: {
    color: "#999999",
    fontSize: 12,
    marginTop: 5,
  },
  comentario: {
    color: "#263238",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  reportada: {
    color: "#C0392B",
    fontSize: 13,
    marginTop: 10,
  },
  respuestaExistente: {
    backgroundColor: "#EAF5EE",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  tituloRespuesta: {
    fontWeight: "bold",
    color: "#228B55",
    marginBottom: 8,
  },
  textoRespuesta: {
    color: "#263238",
    lineHeight: 21,
  },
  seccionRespuesta: {
    marginTop: 18,
  },
  input: {
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#DCE2E8",
    borderRadius: 8,
    padding: 12,
    minHeight: 85,
    textAlignVertical: "top",
    color: "#263238",
  },
  botonResponder: {
    backgroundColor: "#228B55",
    padding: 13,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
