import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppTabs from "@/components/app-tabs";
import { cerrarSesion, obtenerUsuario } from "@/servicios/sesion";
import type { Usuario } from "@/tipos/usuario";

const opciones = [
  {
    icono: "🏪",
    titulo: "Datos del comercio",
    descripcion: "Editá información, horarios y medios de pago.",
  },
  {
    icono: "📷",
    titulo: "Fotos y videos",
    descripcion: "Administrá las imágenes y el video de tu comercio.",
  },
  {
    icono: "🎁",
    titulo: "Mis promociones",
    descripcion: "Cargá, editá y administrá tus promociones.",
  },
  {
    icono: "📷",
    titulo: "Validar promociones",
    descripcion: "Escaneá el código QR de tus clientes.",
  },
  {
    icono: "📊",
    titulo: "Estadísticas",
    descripcion: "Consultá cuántas veces se usaron tus promociones.",
  },
  {
    icono: "⭐",
    titulo: "Reseñas",
    descripcion: "Leé y respondé las opiniones de tus clientes.",
  },
];

export default function PerfilComercio() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    async function cargarUsuario() {
      const datos = await obtenerUsuario();
      setUsuario(datos);
    }

    cargarUsuario();
  }, []);

  const handleCerrarSesion = async () => {
    await cerrarSesion();
    router.replace("/bienvenida");
  };

  const mostrarProximamente = (seccion: string) => {
    Alert.alert(seccion, "Esta funcionalidad estará disponible próximamente.");
  };

  if (!usuario) {
    return (
      <View style={styles.contenedor}>
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <ScrollView
        style={styles.contenido}
        contentContainerStyle={styles.contenidoInterno}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.iconoPrincipal}>🏪</Text>

        <Text style={styles.titulo}>Mi comercio</Text>

        <Text style={styles.nombre}>{usuario.nombre}</Text>
        <Text style={styles.email}>{usuario.email}</Text>

        <View style={styles.separador} />

        <Text style={styles.subtitulo}>Administrá tu comercio</Text>

        {opciones.map((opcion) => (
          <TouchableOpacity
            key={opcion.titulo}
            style={styles.tarjeta}
            activeOpacity={0.7}
            onPress={() => {
              if (opcion.titulo === "Datos del comercio") {
                router.push("/perfiles/datos-comercio");
              } else if (opcion.titulo === "Fotos y videos") {
                router.push("/perfiles/fotos-videos");
              } else if (opcion.titulo === "Mis promociones") {
                router.push("/perfiles/mis-promociones");
              } else if (opcion.titulo === "Estadísticas") {
                router.push("/perfiles/estadisticas");
              } else if (opcion.titulo === "Validar promociones") {
                router.push("/perfiles/validar-promociones");
              } else if (opcion.titulo === "Reseñas") {
                router.push("/perfiles/resenas-comercio");
              } else {
                mostrarProximamente(opcion.titulo);
              }
            }}
          >
            <Text style={styles.iconoTarjeta}>{opcion.icono}</Text>

            <View style={styles.textosTarjeta}>
              <Text style={styles.tituloTarjeta}>{opcion.titulo}</Text>
              <Text style={styles.descripcion}>{opcion.descripcion}</Text>
            </View>

            <Text style={styles.flecha}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.botonCerrar}
          onPress={handleCerrarSesion}
        >
          <Text style={styles.textoCerrar}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <AppTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  contenido: {
    flex: 1,
  },
  contenidoInterno: {
    padding: 20,
    paddingBottom: 120,
  },
  iconoPrincipal: {
    fontSize: 42,
    textAlign: "center",
    marginTop: 15,
  },
  titulo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#263238",
    textAlign: "center",
    marginTop: 10,
  },
  nombre: {
    fontSize: 19,
    fontWeight: "600",
    color: "#263238",
    textAlign: "center",
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    marginTop: 5,
  },
  separador: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 25,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#263238",
    marginBottom: 15,
  },
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  iconoTarjeta: {
    fontSize: 28,
    marginRight: 14,
  },
  textosTarjeta: {
    flex: 1,
  },
  tituloTarjeta: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#263238",
  },
  descripcion: {
    fontSize: 13,
    color: "#718096",
    marginTop: 5,
    lineHeight: 19,
  },
  flecha: {
    fontSize: 26,
    color: "#0a7ea4",
    marginLeft: 8,
  },
  botonCerrar: {
    backgroundColor: "#263238",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  textoCerrar: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
