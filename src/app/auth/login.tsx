import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { iniciarSesion } from "../../servicios/api";
import { guardarToken, guardarUsuario } from "../../servicios/sesion";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [contraseña, setcontraseña] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    console.log("Se presionó el botón de iniciar sesión");
    if (!email.trim() || !contraseña) {
      Alert.alert("error", "Por favor, complete todos los campos requeridos");
      return;
    }

    //  Comprobar el formato del correo
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(email.trim())) {
      Alert.alert("Correo inválido", "Ingresá una dirección de correo válida.");
      return;
    }

    // Comprobar la longitud
    if (contraseña.length < 8) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe tener al menos 8 caracteres.",
      );
      return;
    }

    // Conectar con la API
    try {
      const respuesta = await iniciarSesion(email.trim(), contraseña);

// Guardar el token de autenticación
await guardarToken(respuesta.datos.token);

// Guardar los datos del usuario
await guardarUsuario(respuesta.datos.usuario);

console.log("Usuario autenticado:", respuesta.datos.usuario);

Alert.alert(
  "¡Bienvenido!",
  `Hola ${respuesta.datos.usuario.nombre}`,
);

router.replace("/");
    } catch (error: any) {
      console.log(
        "Error al iniciar sesión:",
        error.response?.data || error.message,
      );

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.message ||
        "No se pudo conectar con el servidor. Intentá nuevamente.";

      Alert.alert("Error al iniciar sesión", mensaje);
    }
  };

  // pantalla de inicio de sesion
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Directorio de Comercios</Text>
        <Text style={styles.subtitle}> Ingresá a tu cuenta </Text>
        <Text style={styles.label}>Correo electrónico</Text>

        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none" //desactivar mayusculas
          autoCorrect={false} //autorrector false
        />

        <Text style={styles.label}>Contraseña</Text>

        <TextInput
          style={styles.input}
          placeholder="Ingresá tu contraseña"
          value={contraseña}
          onChangeText={setcontraseña}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿Todavía no tenés una cuenta?</Text>

          <Link href="/auth/registro" style={styles.registerLink}>
            Registrarme
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    justifyContent: "center",
    padding: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 18,
    elevation: 3,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#23395B",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#667085",
    textAlign: "center",
    marginBottom: 28,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344054",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
  },

  button: {
    backgroundColor: "#23395B",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  registerContainer: {
    alignItems: "center",
    marginTop: 24,
  },

  registerText: {
    color: "#667085",
    marginBottom: 8,
  },

  registerLink: {
    color: "#23395B",
    fontWeight: "bold",
    fontSize: 16,
  },
});
