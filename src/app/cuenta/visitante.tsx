import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppTabs from "@/components/app-tabs";

export default function CuentaVisitante() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.contenedor}>
      <View style={styles.contenido}>
        <Text style={styles.icono}>👤</Text>

        <Text style={styles.titulo}>¡Hola!</Text>

        <Text style={styles.descripcion}>
          Iniciá sesión o creá una cuenta para dejar reseñas, guardar favoritos y usar
          promos.
        </Text>

        <TouchableOpacity
          style={styles.botonPrincipal}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.textoBotonPrincipal}>
            Iniciar sesión
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonSecundario}
          onPress={() => router.push("/auth/registro")}
        >
          <Text style={styles.textoBotonSecundario}>
            Crear una cuenta
          </Text>
        </TouchableOpacity>
      </View>

      <AppTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contenido: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  icono: {
    fontSize: 55,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#263238",
  },
  descripcion: {
    fontSize: 15,
    color: "#607D8B",
    textAlign: "center",
    lineHeight: 23,
    marginTop: 15,
    marginBottom: 30,
  },
  botonPrincipal: {
    width: "100%",
    backgroundColor: "#263238",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBotonPrincipal: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  botonSecundario: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#263238",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  textoBotonSecundario: {
    color: "#263238",
    fontSize: 16,
    fontWeight: "bold",
  },
});