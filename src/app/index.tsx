import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Horario {
  dia: number;
  abre: string;
  cierra: string;
}

interface Comercio {
  id: string;
  nombre: string;
  rubro: string;
  direccion: string;
  horarios: Horario[];
  puntaje: number;
  cantidadResenas: number;
  promo?: string; // Agregado según la tarjeta de la consigna
}

function ahoraDia() {
  return new Date().getDay();
}

function estaAbiertoAhora(horarios: Horario[]): boolean {
  const ahora = new Date();
  const diaActual = ahora.getDay();
  const horaActualStr = ahora.toTimeString().slice(0, 5);

  return horarios.some((h) => {
    if (h.dia !== diaActual) return false;
    return horaActualStr >= h.abre && horaActualStr <= h.cierra;
  });
}

const comerciosMock: Comercio[] = [
  {
    id: "1",
    nombre: "Ferretería El Tornillo",
    rubro: "Ferretería",
    direccion: "9 de Julio 855",
    puntaje: 4.6,
    cantidadResenas: 38,
    horarios: [{ dia: ahoraDia(), abre: "08:00", cierra: "20:30" }],
    promo: "PROMO: 15% en pinturas",
  },
  {
    id: "2",
    nombre: "Moda Urbana",
    rubro: "Indumentaria",
    direccion: "Galarza 1200",
    puntaje: 4.2,
    cantidadResenas: 19,
    horarios: [{ dia: ahoraDia(), abre: "08:00", cierra: "20:00" }],
    promo: "PROMO: 20% en camperas",
  },
  {
    id: "3",
    nombre: "Tecno Centro",
    rubro: "Tecnología",
    direccion: "San Martín 750",
    puntaje: 4.9,
    cantidadResenas: 52,
    horarios: [{ dia: ahoraDia(), abre: "09:00", cierra: "19:00" }],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [soloAbiertos, setSoloAbiertos] = useState(false);

  const comerciosFiltrados = comerciosMock.filter((comercio) => {
    const coincideTexto =
      comercio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      comercio.rubro.toLowerCase().includes(busqueda.toLowerCase());

    if (!coincideTexto) return false;
    if (soloAbiertos && !estaAbiertoAhora(comercio.horarios)) return false;

    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Directorio de Comercios</Text>
      <Text style={styles.subtitulo}>
        Centro Comercial de Concepción del Uruguay
      </Text>

      {/* Buscador exigido */}
      <TextInput
        style={styles.busqueda}
        placeholder="Buscar en la ciudad..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* Filtro Abierto Ahora (Toggle) */}
      <TouchableOpacity
        style={[styles.botonAbierto, soloAbiertos && styles.botonAbiertoActivo]}
        onPress={() => setSoloAbiertos(!soloAbiertos)}
      >
        <Text
          style={[
            styles.textoBotonAbierto,
            soloAbiertos && styles.textoBotonActivo,
          ]}
        >
          {soloAbiertos ? "✓ Abierto ahora (Filtrando)" : "⏱️ Abierto ahora"}
        </Text>
      </TouchableOpacity>

      {/* Listado de tarjetas idéntico al diseño del PRD */}
      <FlatList
        data={comerciosFiltrados}
        keyExtractor={(item) => item.id}
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const abierto = estaAbiertoAhora(item.horarios);
          const horarioHoy = item.horarios.find((h) => h.dia === ahoraDia());
          const cierreStr = horarioHoy ? ` - Cierra ${horarioHoy.cierra}` : "";

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/comercio/${item.id}`)}
            >
              <Text style={styles.comercio}>{item.nombre}</Text>
              <Text style={styles.rubroTexto}>
                {item.rubro} {abierto ? `- Abierto${cierreStr}` : "- Cerrado"}
              </Text>
              <Text style={styles.estrellas}>
                ⭐ {item.puntaje} estrellas ({item.cantidadResenas})
              </Text>
              {item.promo && (
                <View style={styles.promoBadge}>
                  <Text style={styles.promoText}>{item.promo}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
  },
  busqueda: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 10,
  },
  botonAbierto: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#0a7ea4",
    padding: 8,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
    backgroundColor: "#f4f9fb",
  },
  botonAbiertoActivo: {
    backgroundColor: "#0a7ea4",
  },
  textoBotonAbierto: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  textoBotonActivo: {
    color: "#fff",
  },
  card: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  comercio: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },
  rubroTexto: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  estrellas: {
    fontSize: 13,
    color: "#444",
    marginTop: 2,
  },
  promoBadge: {
    marginTop: 6,
    backgroundColor: "#e8f5e9",
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  promoText: {
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "bold",
  },
});
