import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function BuscarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🔎 Buscar comercios</Text>

      <TextInput
        style={styles.busqueda}
        placeholder="Buscar un comercio..."
      />

      <View style={styles.card}>
        <Text style={styles.comercio}>🏪 Ferretería El Tornillo</Text>
        <Text>Ferretería</Text>
        <Text>📍 Concepción del Uruguay</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.comercio}>👗 Moda Urbana</Text>
        <Text>Indumentaria</Text>
        <Text>📍 Concepción del Uruguay</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.comercio}>💻 Tecno Centro</Text>
        <Text>Tecnología</Text>
        <Text>📍 Concepción del Uruguay</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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

  card: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
    marginBottom: 15,
  },

  comercio: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});