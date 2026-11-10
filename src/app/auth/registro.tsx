import { Link, useRouter } from "expo-router";
import { useState } from "react";

import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";

import { registrarUsuario } from "../../servicios/api";
import { guardarToken, guardarUsuario } from "../../servicios/sesion";
import { registrarDispositivoParaNotificaciones } from "../../servicios/notificaciones";

export default function RegistroScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [Email, setEmail] = useState("");
  const [Contraseña, setContraseña] = useState("");
  const [ConfirmarContraseña, setConfirmarContraseña] = useState("");

  const handleRegistro = async () => {
  
  if (
    !nombre.trim() ||
    !Email.trim() ||
    !Contraseña ||
    !ConfirmarContraseña
  ) {
    Alert.alert("Campos incompletos", "Completá todos los campos.");
    return;
  }

  
  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!formatoEmail.test(Email.trim())) {
    Alert.alert("Correo inválido", "Ingresá un correo válido.");
    return;
  }

 
  if (Contraseña.length < 8) {
    Alert.alert(
      "Contraseña inválida",
      "Debe tener al menos 8 caracteres.",
    );
    return;
  }

  
  if (Contraseña !== ConfirmarContraseña) {
    Alert.alert("Error", "Las contraseñas no coinciden.");
    return;
  }

  try {
   
    const respuesta = await registrarUsuario(
      nombre.trim(),
      Email.trim(),
      Contraseña,
    );

    await guardarToken(respuesta.datos.token);
    await guardarUsuario(respuesta.datos.usuario);

  
    try {
      await registrarDispositivoParaNotificaciones();
    } catch (error) {
      console.log("No se pudo registrar el dispositivo:", error);
    }

    Alert.alert(
      "¡Registro exitoso!",
      `Bienvenida/o ${respuesta.datos.usuario.nombre}`,
      [
        {
          text: "Continuar",
          onPress: () => router.replace("/"),
        },
      ],
    );
  } catch (error: any) {
    console.log(
      "Error al registrar usuario:",
      error.response?.data || error.message,
    );

    const mensaje =
      error.response?.data?.error?.mensaje ||
      error.response?.data?.mensaje ||
      "No se pudo registrar la cuenta. Intentá nuevamente.";

    Alert.alert("Error al registrarse", mensaje);
  }
};
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Directorio de Comercios</Text>
        <Text style={styles.subtitle}> Registrate </Text>
        <Text style={styles.label}>Nombre completo</Text>

        <TextInput
          style={styles.input}
          placeholder="Ingresá tu nombre y apellido"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
        />
        <Text style={styles.label}>Correo electrónico</Text>

        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          value={Email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.label}>Contraseña</Text>

        <TextInput
          style={styles.input}
          placeholder="Ingresá tu contraseña"
          value={Contraseña}
          onChangeText={setContraseña}
          secureTextEntry
          autoCapitalize="none"
        />

        <Text style={styles.label}>Confirmar contraseña</Text>

        <TextInput
          style={styles.input}
          placeholder="Confirmá tu contraseña"
          value={ConfirmarContraseña}
          onChangeText={setConfirmarContraseña}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handleRegistro}>
          <Text style={styles.buttonText}>Registrarme</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tenés una cuenta?</Text>

          <Link href="/auth/login" style={styles.loginLink}>
            Iniciar sesión
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

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },

  loginText: {
    fontSize: 14,
    color: "#667085",
  },

  loginLink: {
    fontSize: 14,
    color: "#23395B",
    fontWeight: "bold",
    marginLeft: 4,
  },
});
