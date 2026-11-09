import { crearPromocion } from "@/servicios/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CrearPromocion() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [descuento, setDescuento] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [soloApp, setSoloApp] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    if (!titulo.trim() || !detalle.trim() || !desde || !hasta) {
      Alert.alert(
        "Campos incompletos",
        "Completá todos los campos obligatorios.",
      );
      return;
    }

    const fechaDesde = new Date(`${desde}T00:00:00`);
    const fechaHasta = new Date(`${hasta}T23:59:59`);

    if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
      Alert.alert(
        "Fechas inválidas",
        "Ingresá las fechas con formato AAAA-MM-DD.",
      );
      return;
    }

    if (fechaHasta <= fechaDesde || fechaHasta <= new Date()) {
      Alert.alert(
        "Fechas inválidas",
        "La fecha de vencimiento debe ser posterior a la fecha de inicio y a hoy.",
      );
      return;
    }

    let descuentoNumerico: number | null = null;

    if (descuento.trim() !== "") {
      descuentoNumerico = Number(descuento);

      if (
        !Number.isInteger(descuentoNumerico) ||
        descuentoNumerico < 1 ||
        descuentoNumerico > 100
      ) {
        Alert.alert(
          "Descuento inválido",
          "Ingresá un número entero entre 1 y 100.",
        );
        return;
      }
    }

    try {
      setGuardando(true);

      await crearPromocion({
        titulo: titulo.trim(),
        detalle: detalle.trim(),
        descuento: descuentoNumerico,
        desde: fechaDesde.toISOString(),
        hasta: fechaHasta.toISOString(),
        imagenUrl: null,
        soloApp,
      });

      Alert.alert("¡Éxito!", "La promoción se creó correctamente.", [
        {
          text: "Aceptar",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error al crear promoción:", error);
      Alert.alert(
        "Error",
        "No se pudo crear la promoción. Intentá nuevamente.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <TouchableOpacity
        style={estilos.botonVolver}
        onPress={() => router.back()}
      >
        <Text style={estilos.textoVolver}>‹ Volver</Text>
      </TouchableOpacity>
      <Text style={estilos.titulo}>Crear promoción</Text>

      <Text style={estilos.etiqueta}>Título</Text>
      <TextInput
        style={estilos.input}
        placeholder="Ej: 20% de descuento"
        value={titulo}
        onChangeText={setTitulo}
      />

      <Text style={estilos.etiqueta}>Descripción</Text>
      <TextInput
        style={[estilos.input, estilos.textarea]}
        placeholder="Describí la promoción"
        value={detalle}
        onChangeText={setDetalle}
        multiline
      />

      <Text style={estilos.etiqueta}>Descuento (%)</Text>
      <TextInput
        style={estilos.input}
        placeholder="Ej: 20"
        value={descuento}
        onChangeText={setDescuento}
        keyboardType="numeric"
      />

      <Text style={estilos.etiqueta}>Fecha de inicio</Text>
      <TextInput
        style={estilos.input}
        placeholder="AAAA-MM-DD"
        value={desde}
        onChangeText={setDesde}
      />

      <Text style={estilos.etiqueta}>Fecha de vencimiento</Text>
      <TextInput
        style={estilos.input}
        placeholder="AAAA-MM-DD"
        value={hasta}
        onChangeText={setHasta}
      />

      <TouchableOpacity
        style={estilos.opcionApp}
        onPress={() => setSoloApp(!soloApp)}
      >
        <View style={[estilos.checkbox, soloApp && estilos.checkboxActivo]}>
          {soloApp && <Text style={estilos.check}>✓</Text>}
        </View>

        <Text style={estilos.textoOpcion}>
          Promoción exclusiva para usuarios de la aplicación
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={estilos.botonGuardar}
        onPress={guardar}
        disabled={guardando}
      >
        <Text style={estilos.textoBoton}>
          {guardando ? "Guardando..." : "Crear promoción"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },

  opcionApp: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#888888",
    borderRadius: 5,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxActivo: {
    backgroundColor: "#228B55",
    borderColor: "#228B55",
  },

  check: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  textoOpcion: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
  },

  botonGuardar: {
    backgroundColor: "#228B55",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  botonVolver: {
    alignSelf: "flex-start",
    marginBottom: 20,
    paddingVertical: 8,
  },

  textoVolver: {
    fontSize: 16,
    color: "#0a7ea4",
    fontWeight: "600",
  },
});
