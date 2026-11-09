import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppTabs from "@/components/app-tabs";
import {
  obtenerMiPerfil,
  obtenerComercios,
  quitarFavorito,
} from "../../servicios/api";
import type { Comercio } from "../../tipos/comercios";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoritosScreen() {
  const router = useRouter();

  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const cargarFavoritos = async () => {
    try {
      setCargando(true);

      const perfil = await obtenerMiPerfil();
      const idsFavoritos: string[] = perfil?.favoritos ?? [];

      if (idsFavoritos.length === 0) {
        setComercios([]);
        return;
      }

      const primeraPagina = await obtenerComercios(1, 20);

      let todosLosComercios: Comercio[] = [
        ...(primeraPagina.datos ?? []),
      ];

      const total =
        primeraPagina.meta?.total ?? todosLosComercios.length;

      const porPagina =
        primeraPagina.meta?.porPagina ?? 20;

      let pagina = 2;

      while (todosLosComercios.length < total) {
        const siguiente = await obtenerComercios(pagina, porPagina);

        if (!siguiente.datos || siguiente.datos.length === 0) {
          break;
        }

        todosLosComercios = [
          ...todosLosComercios,
          ...siguiente.datos,
        ];

        pagina++;
      }

      const favoritos = todosLosComercios.filter((comercio) =>
        idsFavoritos.includes(comercio.id)
      );

      setComercios(favoritos);
    } catch (error) {
      console.log("Error al cargar favoritos:", error);
      Alert.alert(
        "Error",
        "No se pudieron cargar tus comercios favoritos."
      );
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarFavoritos();
    }, [])
  );

  const eliminarFavorito = async (comercioId: string) => {
    try {
      setEliminando(comercioId);

      await quitarFavorito(comercioId);

      setComercios((anteriores) =>
        anteriores.filter((comercio) => comercio.id !== comercioId)
      );
    } catch (error) {
      console.log("Error al quitar favorito:", error);
      Alert.alert(
        "Error",
        "No se pudo quitar el comercio de tus favoritos."
      );
    } finally {
      setEliminando(null);
    }
  };

  const confirmarEliminar = (comercio: Comercio) => {
    Alert.alert(
      "Quitar favorito",
      `¿Querés quitar a ${comercio.nombre} de tus favoritos?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Quitar",
          style: "destructive",
          onPress: () => eliminarFavorito(comercio.id),
        },
      ]
    );
  };

  // Abrir la misma ficha de comercio que se utiliza desde Home.
  const abrirComercio = (comercioId: string) => {
    router.push({
      pathname: "/comercio/[id]",
      params: { id: comercioId },
    });
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      <View style={styles.encabezado}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.volver}>‹ Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>❤️ Mis favoritos</Text>

        <Text style={styles.subtitulo}>
          Los comercios que guardaste para encontrar fácilmente.
        </Text>
      </View>

      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#263238" />
          <Text style={styles.mensaje}>Cargando favoritos...</Text>
        </View>
      ) : (
        <FlatList
          data={comercios}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <Text style={styles.iconoVacio}>♡</Text>

              <Text style={styles.tituloVacio}>
                Todavía no tenés favoritos
              </Text>

              <Text style={styles.mensajeVacio}>
                Cuando marques un comercio con el corazón, aparecerá acá.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              {/* Al tocar los datos se abre la ficha del comercio */}
              <TouchableOpacity
                style={styles.datosComercio}
                activeOpacity={0.7}
                onPress={() => abrirComercio(item.id)}
              >
                <Text style={styles.nombreComercio}>
                  {item.nombre}
                </Text>

                <Text style={styles.rubro}>
                  {item.rubroId}
                </Text>

                <Text style={styles.direccion}>
                  📍 {item.direccion}
                </Text>

                {item.puntaje > 0 && (
                  <Text style={styles.estrellas}>
                    ⭐ {item.puntaje} estrellas
                    {" "}({item.cantidadResenas})
                  </Text>
                )}

              </TouchableOpacity>

              {/* El corazón sigue quitando el favorito */}
              <TouchableOpacity
                style={styles.botonEliminar}
                onPress={() => confirmarEliminar(item)}
                disabled={eliminando === item.id}
              >
                {eliminando === item.id ? (
                  <ActivityIndicator color="#D32F2F" />
                ) : (
                  <Text style={styles.corazon}>♥</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <AppTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  encabezado: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },

  volver: {
    fontSize: 16,
    color: "#1976D2",
    marginBottom: 20,
  },

  titulo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#263238",
  },

  subtitulo: {
    fontSize: 14,
    color: "#78909C",
    marginTop: 8,
  },

  lista: {
    padding: 16,
    paddingBottom: 25,
    flexGrow: 1,
  },

  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  datosComercio: {
    flex: 1,
  },

  nombreComercio: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#263238",
  },

  rubro: {
    fontSize: 13,
    color: "#1976D2",
    marginTop: 5,
    textTransform: "capitalize",
  },

  direccion: {
    fontSize: 14,
    color: "#546E7A",
    marginTop: 7,
  },

  estrellas: {
    fontSize: 13,
    color: "#795548",
    marginTop: 7,
  },

  verDetalle: {
    fontSize: 13,
    color: "#1976D2",
    marginTop: 9,
    fontWeight: "600",
  },

  botonEliminar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  corazon: {
    fontSize: 29,
    color: "#E53935",
  },

  centrado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  mensaje: {
    marginTop: 12,
    color: "#78909C",
  },

  vacio: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  iconoVacio: {
    fontSize: 65,
    color: "#B0BEC5",
  },

  tituloVacio: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#263238",
    marginTop: 15,
    textAlign: "center",
  },

  mensajeVacio: {
    fontSize: 14,
    color: "#78909C",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },
});
