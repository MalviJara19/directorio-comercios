import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { obtenerUsuario } from "@/servicios/sesion";

const pestañas = [
  { nombre: "Home", ruta: "/", icono: "home-outline", iconoActivo: "home" },
  {
    nombre: "Promos",
    ruta: "/explore",
    icono: "pricetag-outline",
    iconoActivo: "pricetag",
  },
  { nombre: "Mapa", ruta: "/mapa", icono: "map-outline", iconoActivo: "map" },
  {
    nombre: "Mi perfil",
    ruta: "/perfiles/vecino",
    icono: "person-outline",
    iconoActivo: "person",
  },
] as const;

export default function AppTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const irAMiPerfil = async () => {
  const usuario = await obtenerUsuario();

  if (!usuario) {
    router.replace("/cuenta/visitante");
    return;
  }

  if (usuario.rol === "vecino") {
    router.replace("/perfiles/vecino");
  } else if (usuario.rol === "comercio") {
    router.replace("/perfiles/comercio");
  }
};

  return (
    <View
      style={[
        styles.contenedor,
        {
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      {pestañas.map((pestaña) => {
        const activa =
          pestaña.ruta === "/"
            ? pathname === "/" || pathname === "/buscar"
            : pathname === pestaña.ruta;

        return (
          <TouchableOpacity
            key={pestaña.ruta}
            style={styles.boton}
            activeOpacity={0.7}
            onPress={() => {
              if (pestaña.nombre === "Mi perfil") {
              irAMiPerfil();
              } else {
              router.replace(pestaña.ruta as any);
              }
}}
          >
            <Ionicons
              name={activa ? pestaña.iconoActivo : pestaña.icono}
              size={23}
              color={activa ? "#0a7ea4" : "#8A8A8A"}
            />

            <Text style={[styles.texto, activa && styles.textoActivo]}>
              {pestaña.nombre}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  boton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  texto: {
    color: "#8A8A8A",
    fontSize: 11,
  },
  textoActivo: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
});
