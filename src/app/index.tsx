import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Directorio de Comercios</Text>

      <Text style={styles.subtitulo}>
        Encontrá lo que necesitás cerca tuyo
      </Text>

      <Text style={styles.bienvenida}>
        🏪 Próximamente vas a poder buscar comercios, promociones y mucho más.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },

  subtitulo: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },

  bienvenida: {
    fontSize: 16,
    textAlign: 'center',
  },
});