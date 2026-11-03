import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

import { obtenerUsuario, cerrarSesion } from "../../servicios/sesion";
import AppTabs from "@/components/app-tabs";
import type { Usuario } from "../../tipos/usuario";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PerfilVecino() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    const datos = await obtenerUsuario();
    setUsuario(datos);
  };

  const handleCerrarSesion = async () => {
    await cerrarSesion();
    router.replace("/auth/login");
  };

  if (!usuario) {
    return (
      <View style={styles.contenedor}>
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView
        style={styles.contenido}
        contentContainerStyle={styles.contenidoInterno}
        showsVerticalScrollIndicator={false}>

       <Text style={styles.titulo}>Hola,</Text>

       <Text style={styles.nombre}>{usuario.nombre} 👋</Text>


       <Text style={styles.descripcion}>
        ¡Bienvenido! Desde acá podrás consultar tus comercios favoritos,
        promociones y reseñas.
       </Text>

       <View style={styles.seccion}>
        <Text style={styles.tituloSeccion}>Mis preferencias</Text>

       <View style={styles.opcion}>
       <Text style={styles.textoOpcion}>❤️ Comercios favoritos</Text>
       <Text style={styles.detalle}>
         {(usuario.favoritos ?? []).length} comercios guardados
       </Text>
       </View>

       <View style={styles.opcion}>
       <Text style={styles.textoOpcion}>🏷️ Rubros de interés</Text>
       <Text style={styles.detalle}>
        {(usuario.rubrosDeInteres ?? []).length} rubros seleccionados
       </Text>
       </View>
      </View>

      <View style={styles.opcion}>
       <Text style={styles.textoOpcion}>🔔 Avisos y notificaciones</Text>

       <Text style={styles.detalle}>
        {usuario.avisosActivos ? "Avisos activados" : "Avisos desactivados"}
       </Text>
      </View>

      <TouchableOpacity
        style={styles.boton}
        onPress={handleCerrarSesion}
      >
        <Text style={styles.textoBoton}>Cerrar sesión</Text>
      </TouchableOpacity>
     </ScrollView>
     <AppTabs />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#fff",
},

contenido: {
  flex: 1,
},

contenidoInterno: {
  alignItems: "center",
  padding: 24,
  paddingBottom: 30,
},
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,                                                                                                                                            
    color: "#263238",
  },
  nombre: {
    fontSize: 28,
    fontWeight: "600",
    color: "#37474F",
  },
  email: {
    fontSize: 15,
    color: "#78909C",
    marginTop: 6,
},
  rol: {
    fontSize: 16,
    color: "#2196F3",
    marginTop: 8,
    fontWeight: "bold",
  },
  descripcion: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 25,
    color: "#546E7A",
    lineHeight: 23,
  },
  seccion: {
  width: "100%",
  marginTop: 30,
},

tituloSeccion: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#263238",
  marginBottom: 15,
},

opcion: {
  backgroundColor: "#F5F6FA",
  padding: 16,
  borderRadius: 10,
  marginBottom: 12,
},

textoOpcion: {
  fontSize: 16,
  fontWeight: "600",
  color: "#37474F",
},

detalle: {
  fontSize: 14,
  color: "#78909C",
  marginTop: 6,
},
  boton: {
    backgroundColor: "#263238",
    paddingVertical: 13,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 35,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});