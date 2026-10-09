import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, FlatList } from 'react-native';

// Definimos la estructura del comercio
interface Comercio {
  id: string;
  nombre: string;
  rubro: string;
  direccion: string;
}

// Datos simulados para el directorio
const comerciosMock: Comercio[] = [
  {
    id: '1',
    nombre: 'Ferretería El Tornillo',
    rubro: 'Ferretería',
    direccion: 'Concepción del Uruguay',
  },
  {
    id: '2',
    nombre: 'Moda Urbana',
    rubro: 'Indumentaria',
    direccion: 'Concepción del Uruguay',
  },
  {
    id: '3',
    nombre: 'Tecno Centro',
    rubro: 'Tecnología',
    direccion: 'Concepción del Uruguay',
  },
];

export default function HomeScreen() {
  const [busqueda, setBusqueda] = useState('');

  // Filtramos los comercios según lo que escribas en el buscador (por nombre o rubro)
  const comerciosFiltrados = comerciosMock.filter((comercio) =>
    comercio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    comercio.rubro.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Directorio de Comercios</Text>

      <Text style={styles.subtitulo}>
        Encontrá lo que necesitás cerca tuyo
      </Text>

      <TextInput
        style={styles.busqueda}
        placeholder="🔎 Buscar un comercio..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <FlatList
        data={comerciosFiltrados}
        keyExtractor={(item) => item.id}
        style={{ width: '100%' }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.comercio}>🏪 {item.nombre}</Text>
            <Text style={styles.rubroTexto}>{item.rubro}</Text>
            <Text style={styles.bienvenida}>📍 {item.direccion}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  busqueda: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  card: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
    marginTop: 12,
  },
  comercio: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rubroTexto: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  bienvenida: {
    fontSize: 14,
    color: '#666',
  },
});