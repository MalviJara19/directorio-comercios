import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { obtenerMiComercio, actualizarMiComercio, } from "@/servicios/api";


export default function DatosComercio() {
  const [comercio, setComercio] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");

  useEffect(() => {
    cargarComercio();
  }, []);

  const cargarComercio = async () => {
    try {
      const datos = await obtenerMiComercio();
      console.log("Datos del comercio:", datos);
      setComercio(datos);
      setNombre(datos.nombre || "");
      setDescripcion(datos.descripcion || "");
      setDireccion(datos.direccion || "");
      setTelefono(datos.telefono || "");
      setWhatsapp(datos.whatsapp || "");
      setInstagram(datos.instagram || "");
    } catch (error: any) {
      console.log(
        "Error al obtener el comercio:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.error?.mensaje ||
          "No se pudieron cargar los datos del comercio."
      );
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text>Cargando datos del comercio...</Text>
      </View>
    );
  }

  if (!comercio) {
    return (
      <View style={styles.centrado}>
        <Text>No se encontraron datos del comercio.</Text>
      </View>
    );
  }

  const guardarCambios = async () => {
  try {
    const datosActualizados = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      direccion: direccion.trim(),
      telefono: telefono.trim() || null,
      whatsapp: whatsapp.trim() || null,
      instagram: instagram.trim() || null,
    };

    await actualizarMiComercio(datosActualizados);

    Alert.alert(
      "Cambios guardados",
      "Los datos del comercio se actualizaron correctamente."
    );

  } catch (error: any) {
    console.log(
      "Error al actualizar el comercio:",
      error.response?.data || error.message
    );

    Alert.alert(
      "Error",
      error.response?.data?.error?.mensaje ||
        "No se pudieron guardar los cambios."
    );
  }
};

  return (
    <ScrollView style={styles.contenedor}>
      <Text style={styles.titulo}>Datos del comercio</Text>

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Nombre del comercio</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre del comercio"
        />

       <Text style={styles.etiqueta}>Descripción</Text>
       <TextInput
          style={[styles.input, styles.inputMultilinea]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Descripción del comercio"
          multiline
        />

       <Text style={styles.etiqueta}>Dirección</Text>
       <TextInput
         style={styles.input}
         value={direccion}
         onChangeText={setDireccion}
         placeholder="Dirección"
       />

       <Text style={styles.etiqueta}>Teléfono</Text>
       <TextInput
          style={styles.input}
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Teléfono"
          keyboardType="phone-pad"
        />

       <Text style={styles.etiqueta}>WhatsApp</Text>
       <TextInput
         style={styles.input}
         value={whatsapp}
         onChangeText={setWhatsapp}
         placeholder="WhatsApp"
         keyboardType="phone-pad"
       />

       <Text style={styles.etiqueta}>Instagram</Text>
       <TextInput
         style={styles.input}
         value={instagram}
         onChangeText={setInstagram}
         placeholder="@usuario"
        />
    </View>
    <TouchableOpacity
      style={styles.botonGuardar}
      onPress={guardarCambios}
    >
    <Text style={styles.textoBoton}>Guardar cambios</Text>
  </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    padding: 20,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#263238",
    marginVertical: 20,
  },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  etiqueta: {
    fontSize: 13,
    color: "#718096",
    marginTop: 15,
  },
  valor: {
    fontSize: 16,
    color: "#263238",
    fontWeight: "500",
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDE2E8",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#263238",
    backgroundColor: "#FFFFFF",
    marginTop: 6,
},

inputMultilinea: {
  minHeight: 90,
  textAlignVertical: "top",
},

botonGuardar: {
  backgroundColor: "#0a7ea4",
  padding: 15,
  borderRadius: 10,
  alignItems: "center",
  marginBottom: 30,
},

textoBoton: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
},
});