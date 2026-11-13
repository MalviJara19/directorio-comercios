
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  TouchableOpacity,
  FlatList,
  Linking,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppTabs from '@/components/app-tabs';
import { obtenerComercios, obtenerRubros } from '../servicios/api';

type Rubro = {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  orden: number;
};

type Comercio = {
  id: string;
  nombre: string;
  rubroId: string;
  rubro: string;
  direccion: string;
  latitud: number;
  longitud: number;
  distancia?: number | null;
};

const REGION_INICIAL: Region = {
  latitude: -32.48,
  longitude: -58.23,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function calcularDistancia(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export default function MapaScreen() {
  const mapaRef = useRef<MapView>(null);

  const [ubicacion, setUbicacion] =
    useState<Location.LocationObjectCoords | null>(null);

  const [filtro, setFiltro] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  const [seleccionado, setSeleccionado] =
    useState<Comercio | null>(null);

  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarComercios();
    preguntarUbicacion();
  }, []);

  async function cargarComercios() {
    try {
      setCargando(true);

      const [respuestaComercios, respuestaRubros] = await Promise.all([
        obtenerComercios(),
        obtenerRubros(),
      ]);

      const listaRubros: Rubro[] = respuestaRubros;

      setRubros(
        [...listaRubros].sort((a, b) => a.orden - b.orden)
      );

      let todosLosComercios = [...(respuestaComercios.datos ?? [])];

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
        .filter((comercio: any) => {
          const lat = Number(comercio.coordenadas?.latitud);
          const lon = Number(comercio.coordenadas?.longitud);

          return (
            comercio.activo !== false &&
            comercio.coordenadas &&
            Number.isFinite(lat) &&
            Number.isFinite(lon) &&
            lat >= -90 &&
            lat <= 90 &&
            lon >= -180 &&
            lon <= 180
          );
        })
        .map((comercio: any) => {
          const rubroEncontrado = listaRubros.find(
            (rubro) => rubro.id === comercio.rubroId
          );

          return {
            id: comercio.id,
            nombre: comercio.nombre,
            rubroId: comercio.rubroId,
            rubro: rubroEncontrado?.nombre ?? 'Otros',
            direccion: comercio.direccion,
            latitud: Number(comercio.coordenadas.latitud),
            longitud: Number(comercio.coordenadas.longitud),
          };
        });

      setComercios(comerciosAdaptados);

      if (comerciosAdaptados.length > 0) {
        const primerComercio = comerciosAdaptados[0];

        setTimeout(() => {
          mapaRef.current?.animateToRegion(
            {
              latitude: primerComercio.latitud,
              longitude: primerComercio.longitud,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            },
            1000
          );
        }, 500);
      }
    } catch (error) {
      console.error('Error al cargar comercios:', error);

      Alert.alert(
        'Error',
        'No pudimos cargar los comercios. Verificá que el servidor esté funcionando.'
      );
    } finally {
      setCargando(false);
    }
  }

  async function preguntarUbicacion() {
    try {
      const permisoActual =
        await Location.getForegroundPermissionsAsync();

      if (permisoActual.status === 'granted') {
        await obtenerUbicacion();
        return;
      }

      if (!permisoActual.canAskAgain) {
        Alert.alert(
          'Ubicación desactivada',
          'Para utilizar tu ubicación, habilitá el permiso desde la configuración de tu dispositivo.',
          [
            {
              text: 'Ahora no',
              style: 'cancel',
            },
            {
              text: 'Ir a configuración',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return;
      }

      Alert.alert(
        '¿Querés habilitar tu ubicación?',
        'Esto nos permitirá mostrarte los comercios cercanos y calcular la distancia hasta ellos.',
        [
          {
            text: 'Ahora no',
            style: 'cancel',
          },
          {
            text: 'Habilitar',
            onPress: () => solicitarPermisoUbicacion(),
          },
        ]
      );
    } catch (error) {
      console.log('Error al consultar el permiso:', error);
    }
  }

  async function solicitarPermisoUbicacion() {
    try {
      const permiso =
        await Location.requestForegroundPermissionsAsync();

      if (permiso.status === 'granted') {
        await obtenerUbicacion();
      }
    } catch (error) {
      console.log('Error al solicitar permiso:', error);
    }
  }

  async function obtenerUbicacion() {
    try {
      const posicion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUbicacion(posicion.coords);
    } catch (error) {
      console.log('No se pudo obtener la ubicación:', error);
    }
  }

  const nombresRubros = [
    'Todos',
    ...rubros.map((rubro) => rubro.nombre),
  ];

  const comerciosFiltrados = comercios
    .filter((comercio) => {
      const coincideRubro =
        filtro === 'Todos' || comercio.rubro === filtro;

      const coincideBusqueda =
        normalizarTexto(comercio.nombre).includes(
          normalizarTexto(busqueda)
        );

      return coincideRubro && coincideBusqueda;
    })
    .map((comercio) => ({
      ...comercio,
      distancia: ubicacion
        ? calcularDistancia(
            ubicacion.latitude,
            ubicacion.longitude,
            comercio.latitud,
            comercio.longitud
          )
        : null,
    }))
    .sort((a, b) => {
      if (a.distancia === null || b.distancia === null) {
        return 0;
      }

      return a.distancia - b.distancia;
    });

  function centrarComercio(comercio: Comercio) {
    Keyboard.dismiss();
    setSeleccionado(comercio);

    mapaRef.current?.animateToRegion(
      {
        latitude: comercio.latitud,
        longitude: comercio.longitud,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      800
    );
  }

  function centrarMiUbicacion() {
    Keyboard.dismiss();

    if (!ubicacion) {
      preguntarUbicacion();
      return;
    }

    mapaRef.current?.animateToRegion({
      latitude: ubicacion.latitude,
      longitude: ubicacion.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    });
  }

  async function abrirRuta(
    comercio: Comercio,
    modo: 'walking' | 'driving'
  ) {
    Keyboard.dismiss();

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${comercio.latitud},${comercio.longitud}` +
      `&travelmode=${modo}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
    }
  }

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.contenido}>
          <Text style={styles.titulo}>📍 Mapa</Text>

          <Text style={styles.subtitulo}>
            Encontrá comercios cerca tuyo
          </Text>

          <View
            style={styles.contenedorBusqueda}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => {}}
          >
            <Text style={styles.iconoBusqueda}>⌕</Text>

            <TextInput
              style={styles.inputBusqueda}
              placeholder="Buscar comercio por nombre..."
              placeholderTextColor="#888"
              value={busqueda}
              onChangeText={setBusqueda}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onFocus={() => {}}
            />

            {busqueda.length > 0 && (
              <TouchableOpacity
                onPress={() => setBusqueda('')}
                hitSlop={10}
              >
                <Text style={styles.limpiarBusqueda}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filtros}>
            {nombresRubros.map((rubro) => (
              <TouchableOpacity
                key={rubro}
                style={[
                  styles.filtro,
                  filtro === rubro && styles.filtroActivo,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setFiltro(rubro);
                }}
              >
                <Text
                  style={
                    filtro === rubro
                      ? styles.textoFiltroActivo
                      : styles.textoFiltro
                  }
                >
                  {rubro}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.mapaContenedor}>
            <MapView
              ref={mapaRef}
              style={styles.mapa}
              initialRegion={REGION_INICIAL}
              showsUserLocation={!!ubicacion}
              showsMyLocationButton={false}
              onPress={() => Keyboard.dismiss()}
            >
              {comerciosFiltrados.map((comercio) => (
                <Marker
                  key={comercio.id}
                  coordinate={{
                    latitude: comercio.latitud,
                    longitude: comercio.longitud,
                  }}
                  title={comercio.nombre}
                  description={comercio.direccion}
                  onPress={() => {
                    Keyboard.dismiss();
                    setSeleccionado(comercio);
                  }}
                />
              ))}
            </MapView>

            <TouchableOpacity
              style={styles.botonUbicacion}
              onPress={centrarMiUbicacion}
            >
              <Text style={styles.iconoUbicacion}>📍</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.encabezadoLista}>
            <Text style={styles.tituloLista}>
              Comercios encontrados ({comerciosFiltrados.length})
            </Text>

            {cargando && <ActivityIndicator color="#347a54" />}
          </View>

          <FlatList
            style={styles.lista}
            data={comerciosFiltrados}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listaContenido}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => Keyboard.dismiss()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.tarjeta}
                onPress={() => centrarComercio(item)}
              >
                <View style={styles.infoComercio}>
                  <Text style={styles.nombre}>
                    {item.nombre}
                  </Text>

                  <Text style={styles.detalle}>
                    {item.rubro} · {item.direccion}
                  </Text>

                  {item.distancia !== null && (
                    <Text style={styles.distancia}>
                      A {item.distancia.toFixed(2)} km de tu ubicación
                    </Text>
                  )}
                </View>

                <Text style={styles.flecha}>›</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.vacio}>
                {cargando
                  ? 'Cargando comercios...'
                  : busqueda.trim().length > 0
                    ? 'No encontramos comercios con ese nombre.'
                    : 'No hay comercios disponibles.'}
              </Text>
            }
          />
        </View>

        {seleccionado && (
          <View style={styles.panelRutas}>
            <View style={styles.encabezadoRuta}>
              <Text style={styles.nombre} numberOfLines={1}>
                {seleccionado.nombre}
              </Text>

              <TouchableOpacity
                onPress={() => setSeleccionado(null)}
                hitSlop={10}
              >
                <Text style={styles.cerrar}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.detalle} numberOfLines={2}>
              {seleccionado.direccion}
            </Text>

            <View style={styles.botonesRuta}>
              <TouchableOpacity
                style={styles.botonRuta}
                onPress={() => abrirRuta(seleccionado, 'walking')}
              >
                <Text style={styles.textoRuta}>
                  🚶 Caminando
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botonRuta}
                onPress={() => abrirRuta(seleccionado, 'driving')}
              >
                <Text style={styles.textoRuta}>
                  🚗 En auto
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <AppTabs />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  contenido: {
    flex: 1,
    padding: 15,
    minHeight: 0,
  },

  titulo: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  subtitulo: {
    fontSize: 15,
    color: '#666',
    marginBottom: 15,
  },

  contenedorBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },

  iconoBusqueda: {
    fontSize: 25,
    color: '#666',
    marginRight: 8,
  },

  inputBusqueda: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 8,
  },

  limpiarBusqueda: {
    fontSize: 18,
    color: '#777',
    paddingHorizontal: 8,
  },

  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },

  filtro: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#eeeeee',
  },

  filtroActivo: {
    backgroundColor: '#347a54',
  },

  textoFiltro: {
    color: '#333',
  },

  textoFiltroActivo: {
    color: '#fff',
    fontWeight: 'bold',
  },

  mapaContenedor: {
    height: 260,
    borderRadius: 15,
    overflow: 'hidden',
  },

  mapa: {
    flex: 1,
  },

  botonUbicacion: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#fff',
    width: 42,
    height: 42,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },

  iconoUbicacion: {
    fontSize: 20,
  },

  encabezadoLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
  },

  tituloLista: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  lista: {
    flex: 1,
    minHeight: 0,
  },

  listaContenido: {
    paddingBottom: 10,
  },

  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  infoComercio: {
    flex: 1,
  },

  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },

  detalle: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },

  distancia: {
    fontSize: 12,
    color: '#347a54',
    marginTop: 4,
  },

  flecha: {
    fontSize: 26,
    color: '#777',
    marginLeft: 10,
  },

  vacio: {
    padding: 15,
    color: '#777',
  },

  panelRutas: {
    position: 'absolute',
    bottom: 85,
    left: 15,
    right: 15,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dce8df',
    elevation: 10,
    zIndex: 999,
  },

  encabezadoRuta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },

  cerrar: {
    fontSize: 18,
    paddingHorizontal: 8,
    color: '#666',
  },

  botonesRuta: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  botonRuta: {
    flex: 1,
    backgroundColor: '#347a54',
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
  },

  textoRuta: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
