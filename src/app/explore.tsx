
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  obtenerComercios,
  obtenerPromociones,
} from '../servicios/serviciosComercios';

import type {
  Comercio,
  Promocion,
} from '../tipos/comercios';

export default function PromosScreen() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        const [listaPromociones, listaComercios] =
          await Promise.all([
            obtenerPromociones(),
            obtenerComercios(),
          ]);

        if (activo) {
          setPromociones(listaPromociones);
          setComercios(listaComercios);
        }
      } catch {
        if (activo) {
          setError(true);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  const ahora = Date.now();

  const promocionesVigentes = promociones.filter((promocion) => {
    return (
      promocion.activa &&
      new Date(promocion.desde).getTime() <= ahora &&
      new Date(promocion.hasta).getTime() >= ahora
    );
  });

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
    >
      <Text style={styles.titulo}>Promociones</Text>

      <Text style={styles.subtitulo}>
        Aprovechá las promociones de los comercios de tu ciudad.
      </Text>

      {cargando ? (
        <View style={styles.estado}>
          <ActivityIndicator size="large" color="#287A55" />
          <Text style={styles.textoEstado}>
            Cargando promociones...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.estado}>
          <Text style={styles.textoEstado}>
            No pudimos cargar las promociones. Intentá nuevamente
            más tarde.
          </Text>
        </View>
      ) : promocionesVigentes.length === 0 ? (
        <View style={styles.estado}>
          <Text style={styles.textoEstado}>
            Por el momento no hay promociones vigentes.
          </Text>
        </View>
      ) : (
        promocionesVigentes.map((promocion) => {
          const comercio = comercios.find(
            (item) => item.id === promocion.comercioId
          );

          return (
            <View key={promocion.id} style={styles.tarjeta}>
              <View style={styles.etiqueta}>
                <Text style={styles.textoEtiqueta}>
                  {promocion.descuento !== null
                    ? `${promocion.descuento}% DE DESCUENTO`
                    : 'PROMOCIÓN ESPECIAL'}
                </Text>
              </View>

              <Text style={styles.tituloPromo}>
                {promocion.titulo}
              </Text>

              <Text style={styles.comercio}>
                {comercio?.nombre ?? 'Comercio participante'}
              </Text>

              {comercio?.direccion ? (
                <Text style={styles.direccion}>
                  {comercio.direccion}
                </Text>
              ) : null}

              <Text style={styles.detalle}>
                {promocion.detalle}
              </Text>

              <View style={styles.separador} />

              <Text style={styles.vigencia}>
                Vigente hasta el{' '}
                {new Date(promocion.hasta).toLocaleDateString(
                  'es-AR',
                  {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    timeZone: 'UTC',
                  }
                )}
              </Text>

              {promocion.soloApp ? (
                <Text style={styles.soloApp}>
                  Exclusiva de la aplicación
                </Text>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F4F7F5',
  },
  contenido: {
    padding: 20,
    paddingBottom: 32,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#194D38',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    lineHeight: 23,
    color: '#53665C',
    marginBottom: 24,
  },
  tarjeta: {
    width: '100%',
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE8DF',
    elevation: 2,
  },
  etiqueta: {
    alignSelf: 'flex-start',
    backgroundColor: '#DDF3E5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 14,
  },
  textoEtiqueta: {
    color: '#216641',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tituloPromo: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#26382D',
    marginBottom: 10,
  },
  comercio: {
    fontSize: 17,
    fontWeight: '600',
    color: '#287A55',
    marginBottom: 5,
  },
  direccion: {
    fontSize: 14,
    color: '#65736A',
    marginBottom: 12,
  },
  detalle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#414D45',
    marginTop: 6,
  },
  separador: {
    height: 1,
    backgroundColor: '#E5ECE7',
    marginVertical: 16,
  },
  vigencia: {
    fontSize: 14,
    color: '#53665C',
  },
  soloApp: {
    fontSize: 13,
    fontWeight: '600',
    color: '#287A55',
    marginTop: 10,
  },
  estado: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    gap: 12,
  },
  textoEstado: {
    fontSize: 15,
    lineHeight: 22,
    color: '#53665C',
    textAlign: 'center',
  },
});
