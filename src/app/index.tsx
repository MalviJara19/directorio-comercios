import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
<Text style={styles.titulo}>
  Directorio de Comercios
</Text>

<Image
  source={require('../../assets/images/comercios.jpg')}
  style={styles.imagen}
  resizeMode="contain"
/>

      <Text style={styles.eslogan}>
        Todo lo que buscás, cerca tuyo.
      </Text>

      <View style={styles.separador} />

      <Text style={styles.descripcion}>
        Descubrí los comercios de nuestra ciudad en un solo lugar.
        {"\n\n"}
        Encontrá negocios, conocé qué ofrecen y descubrí promociones
        para aprovechar.
      </Text>

      <Pressable
        style={styles.boton}
        onPress={() => router.push('/buscar')}
      >
        <Text style={styles.textoBoton}>
          Explorar comercios  →
        </Text>
      </Pressable>

      <Text style={styles.pie}>
        Los comercios de nuestra ciudad, más cerca de vos.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  icono: {
    fontSize: 58,
    marginBottom: 14,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#245746',
    textAlign: 'center',
    marginBottom: 10,
  },
  eslogan: {
    fontSize: 18,
    color: '#537568',
    textAlign: 'center',
    marginBottom: 20,
  },
  separador: {
    width: 65,
    height: 4,
    backgroundColor: '#77B69A',
    borderRadius: 5,
    marginBottom: 24,
  },
  descripcion: {
    fontSize: 16,
    lineHeight: 25,
    color: '#394B43',
    textAlign: 'center',
    marginBottom: 25,
  },
  ilustracion: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
    marginBottom: 32,
  },
  emoji: {
    fontSize: 42,
  },
  boton: {
    backgroundColor: '#28664F',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  pie: {
    fontSize: 12,
    color: '#708078',
    textAlign: 'center',
    marginTop: 25,
  },
  imagen: {
  width: '100%',
  height: 200,
  marginBottom: 20,
},
});
