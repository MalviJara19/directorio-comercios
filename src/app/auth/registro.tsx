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
import { Link } from "expo-router";



export default function RegistroScreen() {
  const [Email, setEmail] = useState("");
  const [Contraseña, setContraseña] = useState("");
  const [ConfirmarContraseña, setConfirmarContraseña] = useState("");

  
const handleRegistro = () => {
  // 1. Comprobar que no haya campos vacíos
  if (!Email.trim() || !Contraseña || !ConfirmarContraseña) {
    Alert.alert(
      "Campos incompletos",
      "Por favor, completá todos los campos."
    );
    return;
  }

  // 2. Comprobar el formato del correo
  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!formatoEmail.test(Email.trim())) {
    Alert.alert(
      "Correo inválido",
      "Ingresá una dirección de correo válida."
    );
    return;
  }

  // 3. Comprobar la longitud de la contraseña
  if (Contraseña.length < 8) {
    Alert.alert(
      "Contraseña demasiado corta",
      "La contraseña debe tener al menos 8 caracteres."
    );
    return;
  }

  // 4. Comprobar que las contraseñas coincidan
  if (Contraseña !== ConfirmarContraseña) {
    Alert.alert(
      "Contraseñas diferentes",
      "Las contraseñas no coinciden."
    );
    return;
  }

  // 5. Por ahora, el registro es una prueba
  Alert.alert(
    "Validación correcta",
    "Los datos son válidos. Cuando tengamos la API, podremos registrar la cuenta."
  );
};

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Directorio de Comercios</Text>
        <Text style={styles.subtitle}> Registrate </Text>
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

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegistro}
        >
          <Text style={styles.buttonText}>Registrarme</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            ¿Ya tenés una cuenta?
          </Text>

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