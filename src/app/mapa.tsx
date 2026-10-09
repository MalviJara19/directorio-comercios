import { StyleSheet, Text, View } from 'react-native';

export default function MapaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📍 Mapa</Text>

      <Text style={styles.subtitulo}>
        Encontrá comercios cerca tuyo
      </Text>

      <View style={styles.mapa}>
        <Text style={styles.mapaTexto}>
          🗺️ Aquí aparecerá el mapa
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  subtitulo: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 30,
  },

  mapa: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapaTexto: {
    fontSize: 18,
  },
});