
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  agregarFavorito,
  obtenerComercios,
  obtenerMiPerfil,
  obtenerRubros,
  quitarFavorito,
} from '../servicios/api';

type Comercio = {
  id: string;
  nombre: string;
  rubroId: string;
  rubro: string;
  direccion: string;
};

type Rubro = {
  id: string;
  nombre: string;
};

export default function BuscarScreen() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState<string[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);

      const [respuestaComercios, respuestaRubros] = await Promise.all([
        obtenerComercios(),
        obtenerRubros(),
      ]);

      const listaRubros: Rubro[] = respuestaRubros;

      let todosLosComercios = [
        ...(respuestaComercios.datos ?? []),
      ];

      const total =
        respuestaComercios.meta?.total ?? todosLosComercios.length;

      const porPagina =
        respuestaComercios.meta?.porPagina ?? 20;

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

      const comerciosAdaptados: Comercio[] = todosLosComercios
        .filter((comercio: any) => comercio.activo !== false)
        .map((comercio: any) => {
          const rubroEncontrado = listaRubros.find(
            (rubro) => rubro.id === comercio.rubroId
          );

          return {
            id: comercio.id,
            nombre: comercio.nombre,
            rubroId: comercio.rubroId,
            rubro: rubroEncontrado?.nombre ?? 'Otros',
            direccion: comercio.direccion ?? 'Dirección no disponible',
          };
        });

      setComercios(comerciosAdaptados);

      console.log('Comercios cargados:', comerciosAdaptados.length);

      try {
        const perfil = await obtenerMiPerfil();

        const listaFavoritos =
          perfil?.favoritos ??
          perfil?.comerciosFavoritos ??
          [];

        const idsFavoritos = listaFavoritos
          .map((favorito: any) => {
            if (typeof favorito === 'string') {
              return favorito;
            }

            return (
              favorito.comercioId ??
              favorito.comercio?.id ??
              favorito.id
            );
          })
          .filter((id: any) => id);

        setFavoritos(idsFavoritos);

        console.log('Favoritos cargados:', idsFavoritos);
      } catch (error) {
        console.log('No se pudieron recuperar los favoritos:', error);
      }

    } catch (error) {
      console.error('Error al cargar comercios:', error);

      Alert.alert(
        'Error',
        'No se pudieron cargar los comercios. Verificá que la API esté funcionando.'
      );
    } finally {
      setCargando(false);
    }
  }

  async function cambiarFavorito(comercioId: string) {
    if (actualizando.includes(comercioId)) {
      return;
    }

    const yaEsFavorito = favoritos.includes(comercioId);

    try {
      setActualizando((actuales) => [...actuales, comercioId]);

      if (yaEsFavorito) {
        await quitarFavorito(comercioId);

        setFavoritos((actuales) =>
          actuales.filter((id) => id !== comercioId)
        );
      } else {
        await agregarFavorito(comercioId);

        setFavoritos((actuales) => [...actuales, comercioId]);
      }

    } catch (error) {
      console.error('Error al actualizar favorito:', error);

      Alert.alert(
        'Error',
        'No se pudo actualizar el favorito. Verificá tu sesión e intentá nuevamente.'
      );
    } finally {
      setActualizando((actuales) =>
        actuales.filter((id) => id !== comercioId)
      );
    }
  }

  const comerciosFiltrados = comercios.filter((comercio) => {
    const texto = busqueda.toLowerCase().trim();

    return (
      comercio.nombre.toLowerCase().includes(texto) ||
      comercio.rubro.toLowerCase().includes(texto) ||
      comercio.direccion.toLowerCase().includes(texto)
    );
  });

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🔎 Buscar comercios</Text>

      <TextInput
        style={styles.busqueda}
        placeholder="Buscar un comercio..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <View style={styles.encabezado}>
        <Text style={styles.resultados}>
          Comercios encontrados ({comerciosFiltrados.length})
        </Text>

        {cargando && (
          <ActivityIndicator color="#347a54" />
        )}
      </View>

      <FlatList
        data={comerciosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => {
          const esFavorito = favoritos.includes(item.id);
          const estaActualizando = actualizando.includes(item.id);

          return (
            <View style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.comercio}>
                  🏪 {item.nombre}
                </Text>

                <Text style={styles.rubro}>
                  {item.rubro}
                </Text>

                <Text style={styles.direccion}>
                  📍 {item.direccion}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.botonFavorito}
                onPress={() => cambiarFavorito(item.id)}
                disabled={estaActualizando}
                activeOpacity={0.7}
              >
                <Text style={styles.corazon}>
                  {estaActualizando ? '...' : esFavorito ? '♥' : '♥'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.vacio}>
            {cargando
              ? 'Cargando comercios...'
              : 'No se encontraron comercios.'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 25,
  },

  busqueda: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },

  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  resultados: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  lista: {
    paddingBottom: 20,
  },

  card: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  info: {
    flex: 1,
  },

  comercio: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  rubro: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },

  direccion: {
    fontSize: 13,
    color: '#666',
  },

  botonFavorito: {
    width: 50,
    height: 50,
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: '#ff0000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  corazon: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
  },

  vacio: {
    textAlign: 'center',
    color: '#777',
    marginTop: 30,
    fontSize: 15,
  },
});
