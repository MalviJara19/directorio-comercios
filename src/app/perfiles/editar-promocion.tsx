import { useEffect, useState } from "react";
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

import { useLocalSearchParams, useRouter } from "expo-router";
import { editarPromocion, obtenerMisPromociones } from "@/servicios/api";

export default function EditarPromocion() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [descuento, setDescuento] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [soloApp, setSoloApp] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const promociones = await obtenerMisPromociones();

        const promocion = promociones.find((item: any) => item.id === id);

        if (!promocion) {
          Alert.alert("Error", "No se encontró la promoción.");
          router.back();
          return;
        }

        setTitulo(promocion.titulo);
        setDetalle(promocion.detalle);
        setDescuento(
          promocion.descuento !== null ? String(promocion.descuento) : "",
        );

        setDesde(new Date(promocion.desde).toISOString().slice(0, 10));
        setHasta(new Date(promocion.hasta).toISOString().slice(0, 10));
        setSoloApp(promocion.soloApp);
      } catch (error) {
        console.error("Error al cargar la promoción:", error);
        Alert.alert("Error", "No se pudieron cargar los datos.");
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, [id]);

  async function guardar() {
    if (!titulo.trim() || !detalle.trim() || !desde || !hasta) {
      Alert.alert("Atención", "Completá todos los campos obligatorios.");
      return;
    }

    const fechaDesde = new Date(`${desde}T00:00:00`);
    const fechaHasta = new Date(`${hasta}T23:59:59`);

    if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
      Alert.alert("Atención", "Ingresá fechas válidas.");
      return;
    }

    if (fechaHasta <= fechaDesde || fechaHasta <= new Date()) {
      Alert.alert("Atención", "Revisá las fechas de la promoción.");
      return;
    }

    const descuentoNumerico =
      descuento.trim() === "" ? null : Number(descuento);

    if (
      descuentoNumerico !== null &&
      (!Number.isInteger(descuentoNumerico) ||
        descuentoNumerico < 1 ||
        descuentoNumerico > 100)
    ) {
      Alert.alert("Atención", "El descuento debe estar entre 1 y 100.");
      return;
    }

    try {
      setGuardando(true);

      await editarPromocion(id, {
        titulo: titulo.trim(),
        detalle: detalle.trim(),
        descuento: descuentoNumerico,
        desde: fechaDesde.toISOString(),
        hasta: fechaHasta.toISOString(),
        imagenUrl: null,
        soloApp,
      });

      Alert.alert("¡Éxito!", "La promoción se actualizó correctamente.", [
        {
          text: "Aceptar",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Error al editar promoción:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error?.mensaje ||
          "No se pudo actualizar la promoción.",
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <View style={estilos.cargando}>
        <ActivityIndicator size="large" />
        <Text>Cargando promoción...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <TouchableOpacity
        style={estilos.botonVolver}
        onPress={() => router.back()}
      >
        <Text style={estilos.textoVolver}>‹ Volver</Text>
      </TouchableOpacity>

      <Text style={estilos.titulo}>Editar promoción</Text>

      <Text style={estilos.etiqueta}>Título</Text>
      <TextInput
        style={estilos.input}
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Título de la promoción"
      />

      <Text style={estilos.etiqueta}>Detalle</Text>
      <TextInput
        style={[estilos.input, estilos.inputMultilinea]}
        value={detalle}
        onChangeText={setDetalle}
        placeholder="Descripción de la promoción"
        multiline
      />

      <Text style={estilos.etiqueta}>Descuento (%)</Text>
      <TextInput
        style={estilos.input}
        value={descuento}
        onChangeText={setDescuento}
        placeholder="Ej. 15"
        keyboardType="numeric"
      />

      <Text style={estilos.etiqueta}>Fecha desde (AAAA-MM-DD)</Text>
      <TextInput
        style={estilos.input}
        value={desde}
        onChangeText={setDesde}
        placeholder="2026-11-10"
      />

      <Text style={estilos.etiqueta}>Fecha hasta (AAAA-MM-DD)</Text>
      <TextInput
        style={estilos.input}
        value={hasta}
        onChangeText={setHasta}
        placeholder="2026-11-30"
      />

      <TouchableOpacity
        style={estilos.opcion}
        onPress={() => setSoloApp(!soloApp)}
      >
        <Text style={estilos.textoOpcion}>
          {soloApp ? "☑" : "☐"} Promoción exclusiva de la aplicación
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={estilos.botonGuardar}
        onPress={guardar}
        disabled={guardando}
      >
        <Text style={estilos.textoBotonGuardar}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 20,
    backgroundColor: "#F5F5F5",
    flexGrow: 1,
  },
  cargando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#222222",
  },
  etiqueta: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: "#333333",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  inputMultilinea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  botonVolver: {
    marginBottom: 20,
  },
  textoVolver: {
    color: "#0a7ea4",
    fontSize: 16,
    fontWeight: "600",
  },
  opcion: {
    marginTop: 20,
    marginBottom: 20,
    padding: 12,
  },
  textoOpcion: {
    fontSize: 15,
    color: "#333333",
  },
  botonGuardar: {
    backgroundColor: "#228B55",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  textoBotonGuardar: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
