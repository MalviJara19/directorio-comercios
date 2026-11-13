
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  obtenerMiPerfil,
  actualizarDatosCuenta,
} from "../../servicios/api";

export default function EditarPerfil() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const perfil = await obtenerMiPerfil();

        setNombre(perfil?.nombre ?? "");
        setEmail(perfil?.email ?? "");
      } catch (error: any) {
        console.log(
          "Error al cargar los datos:",
          error.response?.data || error.message
        );

        Alert.alert(
          "Error",
          "No se pudieron cargar tus datos. Intentá nuevamente."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, []);

  const handleGuardar = async () => {
    if (!nombre.trim() || !email.trim()) {
      Alert.alert("Datos incompletos", "Completá tu nombre y email.");
      return;
    }

    const quiereCambiarContrasena =
      contrasenaActual.length > 0 ||
      nuevaContrasena.length > 0 ||
      confirmarContrasena.length > 0;

    if (quiereCambiarContrasena) {
      if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
        Alert.alert(
          "Contraseña incompleta",
          "Para cambiar tu contraseña completá los tres campos."
        );
        return;
      }

      if (nuevaContrasena.length < 8) {
        Alert.alert(
          "Contraseña inválida",
          "La nueva contraseña debe tener al menos 8 caracteres."
        );
        return;
      }

      if (nuevaContrasena !== confirmarContrasena) {
        Alert.alert(
          "Las contraseñas no coinciden",
          "Revisá la nueva contraseña y su confirmación."
        );
        return;
      }
    }

    const cambios: {
      nombre?: string;
      email?: string;
      contrasenaActual?: string;
      nuevaContrasena?: string;
    } = {};

    cambios.nombre = nombre.trim();
    cambios.email = email.trim().toLowerCase();

    if (quiereCambiarContrasena) {
      cambios.contrasenaActual = contrasenaActual;
      cambios.nuevaContrasena = nuevaContrasena;
    }

    try {
      setGuardando(true);

      await actualizarDatosCuenta(cambios);

      Alert.alert(
        "Datos actualizados",
        "Tus datos personales se guardaron correctamente.",
        [
          {
            text: "Aceptar",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.log(
        "Error al actualizar la cuenta:",
        error.response?.data || error.message
      );

      Alert.alert(
        "No se pudieron guardar los cambios",
        error.response?.data?.mensaje ||
          "Ocurrió un error al actualizar tus datos. Intentá nuevamente."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.contenedor}>
        <ActivityIndicator size="large" color="#263238" />
        <Text style={styles.textoCargando}>Cargando tus datos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <KeyboardAvoidingView
        style={styles.teclado}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.titulo}>Editar mis datos</Text>

          <Text style={styles.descripcion}>
            Actualizá tu información personal y mantené tu cuenta al día.
          </Text>

          <Text style={styles.etiqueta}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ingresá tu nombre"
            placeholderTextColor="#90A4AE"
            autoCapitalize="words"
            editable={!guardando}
          />

          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Ingresá tu email"
            placeholderTextColor="#90A4AE"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!guardando}
          />

          <View style={styles.separador} />

          <Text style={styles.subtitulo}>Cambiar contraseña</Text>

          <Text style={styles.aclaracion}>
            Si no querés cambiar tu contraseña, dejá estos campos vacíos.
          </Text>

          <Text style={styles.etiqueta}>Contraseña actual</Text>
          <TextInput
            style={styles.input}
            value={contrasenaActual}
            onChangeText={setContrasenaActual}
            placeholder="Ingresá tu contraseña actual"
            placeholderTextColor="#90A4AE"
            secureTextEntry
            autoCapitalize="none"
            editable={!guardando}
          />

          <Text style={styles.etiqueta}>Nueva contraseña</Text>
          <TextInput
            style={styles.input}
            value={nuevaContrasena}
            onChangeText={setNuevaContrasena}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#90A4AE"
            secureTextEntry
            autoCapitalize="none"
            editable={!guardando}
          />

          <Text style={styles.etiqueta}>Confirmar nueva contraseña</Text>
          <TextInput
            style={styles.input}
            value={confirmarContrasena}
            onChangeText={setConfirmarContrasena}
            placeholder="Repetí la nueva contraseña"
            placeholderTextColor="#90A4AE"
            secureTextEntry
            autoCapitalize="none"
            editable={!guardando}
          />

          <TouchableOpacity
            style={[
              styles.boton,
              guardando && styles.botonDeshabilitado,
            ]}
            onPress={handleGuardar}
            disabled={guardando}
            activeOpacity={0.8}
          >
            {guardando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.textoBoton}>Guardar cambios</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonCancelar}
            onPress={() => router.back()}
            disabled={guardando}
          >
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  teclado: {
    flex: 1,
  },

  contenido: {
    padding: 24,
    paddingBottom: 40,
  },

  titulo: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#263238",
    marginBottom: 10,
  },

  descripcion: {
    fontSize: 15,
    color: "#78909C",
    lineHeight: 22,
    marginBottom: 25,
  },

  subtitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#263238",
    marginBottom: 8,
  },

  aclaracion: {
    fontSize: 14,
    color: "#78909C",
    lineHeight: 21,
    marginBottom: 18,
  },

  etiqueta: {
    fontSize: 15,
    fontWeight: "600",
    color: "#37474F",
    marginBottom: 8,
    marginTop: 15,
  },

  input: {
    width: "100%",
    backgroundColor: "#F5F6FA",
    borderWidth: 1,
    borderColor: "#E0E5E9",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: "#263238",
  },

  separador: {
    height: 1,
    backgroundColor: "#E0E5E9",
    marginVertical: 28,
  },

  boton: {
    backgroundColor: "#263238",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  botonCancelar: {
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },

  textoCancelar: {
    color: "#546E7A",
    fontSize: 15,
    fontWeight: "600",
  },

  textoCargando: {
    textAlign: "center",
    marginTop: 15,
    color: "#546E7A",
  },
});