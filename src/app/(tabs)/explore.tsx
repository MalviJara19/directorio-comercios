import { StyleSheet, Text, View } from 'react-native';

export default function PromosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🏷️ Promociones</Text>

      <Text style={styles.subtitulo}>
        Aprovechá las promociones de los comercios
      </Text>

      <View style={styles.card}>
        <Text style={styles.comercio}>Ferretería El Tornillo</Text>

        <Text style={styles.promo}>15% de descuento en pinturas</Text>

        <Text style={styles.detalle}>
          Presentando el código de la aplicación.
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

  card: {
    width: '100%',
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#f2f2f2',
  },

  comercio: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  promo: {
    fontSize: 18,
    marginBottom: 10,
  },

  detalle: {
    fontSize: 15,
  },
});