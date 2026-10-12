import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const comerciosMockDetalle = [
  {
    id: "1",
    nombre: "Ferretería El Tornillo",
    rubro: "Ferretería",
    direccion: "9 de Julio 855",
    telefono: "3442-123456",
    whatsapp: "3442-998877",
    descripcion:
      "Todo tipo de herramientas, herrajes y materiales para la construcción con la mejor atención de la ciudad.",
    mediosDePago: ["Efectivo", "Tarjeta de débito", "Transferencia"],
    puntaje: 4.6,
    cantidadResenas: 38,
    promoVigente: "15% en pinturas - hasta el 30/09",
  },
  {
    id: "2",
    nombre: "Moda Urbana",
    rubro: "Indumentaria",
    direccion: "Galarza 1200",
    telefono: "3442-654321",
    whatsapp: "3442-112233",
    descripcion: "Ropa urbana, calzado y accesorios para toda la familia.",
    mediosDePago: ["Efectivo", "Tarjeta de crédito"],
    puntaje: 4.2,
    cantidadResenas: 19,
    promoVigente: "20% en camperas - hasta el 15/10",
  },
  {
    id: "3",
    nombre: "Tecno Centro",
    rubro: "Tecnología",
    direccion: "San Martín 750",
    telefono: null,
    whatsapp: "3442-554433",
    descripcion:
      "Celulares, insumos de computación y servicio técnico especializado.",
    mediosDePago: ["Efectivo", "Mercado Pago"],
    puntaje: 4.9,
    cantidadResenas: 52,
    promoVigente: null,
  },
];

export default function DetalleComercioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const comercio = comerciosMockDetalle.find((c) => c.id === id);

  if (!comercio) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se encontró el comercio.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.botonVolver}
        >
          <Text style={styles.textoVolver}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Botón Volver */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.botonVolver}
      >
        <Text style={styles.textoVolver}>← Volver al listado</Text>
      </TouchableOpacity>

      {/* Encabezado Ficha */}
      <Text style={styles.titulo}>{comercio.nombre}</Text>
      <Text style={styles.subTituloInfo}>
        {comercio.rubro} • {comercio.direccion}
      </Text>
      <Text style={styles.estrellasDetalle}>
        ⭐ {comercio.puntaje} ({comercio.cantidadResenas} reseñas)
      </Text>

      {/* Botones de acción rápida: Llamar, WhatsApp, Ir (Mapa) */}
      <View style={styles.botonesContacto}>
        {comercio.telefono && (
          <TouchableOpacity style={styles.botonAccion}>
            <Text style={styles.textoBoton}>📞 Llamar</Text>
          </TouchableOpacity>
        )}
        {comercio.whatsapp && (
          <TouchableOpacity style={[styles.botonAccion, styles.botonWhatsapp]}>
            <Text style={styles.textoBoton}>💬 WhatsApp</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.botonAccion, styles.botonIr]}>
          <Text style={styles.textoBoton}>📍 Ir</Text>
        </TouchableOpacity>
      </View>

      {/* Sección de Promoción Vigente (exigida en el PRD) */}
      {comercio.promoVigente && (
        <View style={styles.seccionPromo}>
          <Text style={styles.tituloPromo}>PROMOCIÓN VIGENTE</Text>
          <Text style={styles.textoPromo}>{comercio.promoVigente}</Text>
          <TouchableOpacity style={styles.botonPromoCodigo}>
            <Text style={styles.textoBotonPromo}>Mostrar mi código</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Información general */}
      <View style={styles.seccion}>
        <Text style={styles.subtituloSeccion}>Descripción</Text>
        <Text style={styles.texto}>{comercio.descripcion}</Text>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.subtituloSeccion}>Medios de pago</Text>
        <Text style={styles.texto}>{comercio.mediosDePago.join(", ")}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  botonVolver: {
    marginBottom: 12,
  },
  textoVolver: {
    color: "#0a7ea4",
    fontSize: 15,
    fontWeight: "600",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },
  subTituloInfo: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  estrellasDetalle: {
    fontSize: 13,
    color: "#444",
    marginTop: 4,
    marginBottom: 15,
  },
  botonesContacto: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  botonAccion: {
    flex: 1,
    backgroundColor: "#0a7ea4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  botonWhatsapp: {
    backgroundColor: "#25D366",
  },
  botonIr: {
    backgroundColor: "#555",
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  seccionPromo: {
    backgroundColor: "#fff9c4",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fbc02d",
    marginBottom: 16,
  },
  tituloPromo: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#f57f17",
    marginBottom: 4,
  },
  textoPromo: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  botonPromoCodigo: {
    backgroundColor: "#f57f17",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  textoBotonPromo: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  seccion: {
    marginBottom: 14,
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  subtituloSeccion: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  texto: {
    fontSize: 14,
    color: "#555",
  },
  errorText: {
    fontSize: 16,
    color: "#c62828",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 20,
  },
});
