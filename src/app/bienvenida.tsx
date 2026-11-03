import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Bienvenida() {
  const router = useRouter();

  const handleIniciarSesion = () => {
    router.push("/auth/login");
  };

  const handleRegistrarse = () => {
    router.push("/auth/registro");
  };

  const handleContinuar = () => {
    router.replace("/");
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.contenido}>
        <Text style={styles.icono}>🏪</Text>

        <Text style={styles.titulo}>
          Directorio de Comercios
        </Text>

        <Text style={styles.descripcion}>
          Descubrí comercios, promociones y servicios
          cerca tuyo.
        </Text>

        <TouchableOpacity
          style={styles.botonPrincipal}
          onPress={handleIniciarSesion}
        >
          <Text style={styles.textoBotonPrincipal}>
            Iniciar sesión
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonSecundario}
          onPress={handleRegistrarse}
        >
          <Text style={styles.textoBotonSecundario}>
            Registrarme
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonVisitante}
          onPress={handleContinuar}
        >
          <Text style={styles.textoVisitante}>
            Continuar sin iniciar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  contenido: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },

  icono: {
    fontSize: 60,
    marginBottom: 20,
  },

  titulo: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#263238",
    textAlign: "center",
  },

  descripcion: {
    fontSize: 16,
    color: "#607D8B",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 35,
    lineHeight: 24,
  },

  botonPrincipal: {
    width: "100%",
    backgroundColor: "#263238",
    paddingVertical: 15,
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
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },

  textoBotonSecundario: {
    color: "#263238",
    fontSize: 16,
    fontWeight: "bold",
  },

  botonVisitante: {
    marginTop: 25,
    padding: 10,
  },

  textoVisitante: {
    color: "#2196F3",
    fontSize: 15,
    fontWeight: "600",
  },
});