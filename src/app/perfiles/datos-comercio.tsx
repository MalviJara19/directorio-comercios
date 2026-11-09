import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { actualizarMiComercio, obtenerMiComercio } from "@/servicios/api";
import { useRouter } from "expo-router";

type Turno = {
  abre: string;
  cierra: string;
};

type Horario = {
  dia: number;
  abre: string;
  cierra: string;
};

const DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const MEDIOS_PAGO = [
  { valor: "efectivo", etiqueta: "Efectivo" },
  { valor: "debito", etiqueta: "Tarjeta de débito" },
  { valor: "credito", etiqueta: "Tarjeta de crédito" },
  { valor: "transferencia", etiqueta: "Transferencia bancaria" },
  { valor: "billetera_virtual", etiqueta: "Billeteras virtuales" },
];

const HORARIOS_INICIALES: Record<number, Turno[]> = {
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
};

export default function DatosComercio() {
  const router = useRouter();
  const [comercio, setComercio] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");

  const [horarios, setHorarios] =
    useState<Record<number, Turno[]>>(HORARIOS_INICIALES);

  const [mediosPago, setMediosPago] = useState<string[]>([]);

  useEffect(() => {
    cargarComercio();
  }, []);

  const cargarComercio = async () => {
    try {
      const datos = await obtenerMiComercio();

      console.log("Datos del comercio:", datos);

      setComercio(datos);

      setNombre(datos.nombre || "");
      setDescripcion(datos.descripcion || "");
      setDireccion(datos.direccion || "");
      setTelefono(datos.telefono || "");
      setWhatsapp(datos.whatsapp || "");
      setInstagram(datos.instagram || "");

      const horariosCargados: Record<number, Turno[]> = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
      };

      (datos.horarios || []).forEach((horario: Horario) => {
        if (horariosCargados[horario.dia]) {
          horariosCargados[horario.dia].push({
            abre: horario.abre,
            cierra: horario.cierra,
          });
        }
      });

      setHorarios(horariosCargados);

      setMediosPago(datos.mediosDePago || []);
    } catch (error: any) {
      console.log(
        "Error al obtener el comercio:",
        error.response?.data || error.message,
      );

      Alert.alert(
        "Error",
        error.response?.data?.error?.mensaje ||
          "No se pudieron cargar los datos del comercio.",
      );
    } finally {
      setCargando(false);
    }
  };

  const cambiarMedioPago = (medio: string) => {
    setMediosPago((actuales) =>
      actuales.includes(medio)
        ? actuales.filter((item) => item !== medio)
        : [...actuales, medio],
    );
  };

  const cambiarDia = (dia: number, activo: boolean) => {
    setHorarios((actuales) => ({
      ...actuales,
      [dia]: activo ? [{ abre: "08:00", cierra: "12:00" }] : [],
    }));
  };

  const modificarTurno = (
    dia: number,
    indice: number,
    campo: "abre" | "cierra",
    valor: string,
  ) => {
    setHorarios((actuales) => ({
      ...actuales,
      [dia]: actuales[dia].map((turno, i) =>
        i === indice ? { ...turno, [campo]: valor } : turno,
      ),
    }));
  };

  // Agrega otro turno al mismo día.
  const agregarTurno = (dia: number) => {
    setHorarios((actuales) => ({
      ...actuales,
      [dia]: [...actuales[dia], { abre: "16:00", cierra: "20:00" }],
    }));
  };

  // Elimina un turno.
  const eliminarTurno = (dia: number, indice: number) => {
    setHorarios((actuales) => ({
      ...actuales,
      [dia]: actuales[dia].filter((_, i) => i !== indice),
    }));
  };

  // Convierte HH:mm a minutos para poder comparar horarios.
  const convertirAMinutos = (hora: string) => {
    const [horas, minutos] = hora.split(":").map(Number);
    return horas * 60 + minutos;
  };

  const validarHorarios = (lista: Horario[]) => {
    for (let dia = 0; dia <= 6; dia++) {
      const turnosDelDia = lista.filter((turno) => turno.dia === dia);

      for (const turno of turnosDelDia) {
        const formatoValido = /^([01]\d|2[0-3]):[0-5]\d$/;

        if (
          !formatoValido.test(turno.abre) ||
          !formatoValido.test(turno.cierra)
        ) {
          return `Revisá el formato de las horas del ${DIAS[dia]}. Usá HH:mm, por ejemplo 08:30.`;
        }

        if (convertirAMinutos(turno.cierra) <= convertirAMinutos(turno.abre)) {
          return `La hora de cierre debe ser posterior a la apertura el ${DIAS[dia]}.`;
        }
      }

      // Comprobamos que los turnos del mismo día no se superpongan.
      const turnosOrdenados = [...turnosDelDia].sort(
        (a, b) => convertirAMinutos(a.abre) - convertirAMinutos(b.abre),
      );

      for (let i = 0; i < turnosOrdenados.length - 1; i++) {
        if (
          convertirAMinutos(turnosOrdenados[i + 1].abre) <
          convertirAMinutos(turnosOrdenados[i].cierra)
        ) {
          return `Los horarios del ${DIAS[dia]} se superponen. Revisalos antes de guardar.`;
        }
      }
    }

    return null;
  };

  const guardarCambios = async () => {
    // Convertimos los horarios al formato que espera la API.
    const horariosParaEnviar: Horario[] = [];

    for (let dia = 0; dia <= 6; dia++) {
      horarios[dia].forEach((turno) => {
        horariosParaEnviar.push({
          dia,
          abre: turno.abre.trim(),
          cierra: turno.cierra.trim(),
        });
      });
    }

    const errorHorario = validarHorarios(horariosParaEnviar);

    if (errorHorario) {
      Alert.alert("Revisá los horarios", errorHorario);
      return;
    }

    try {
      setGuardando(true);

      const datosActualizados = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim() || null,
        whatsapp: whatsapp.trim() || null,
        instagram: instagram.trim() || null,
        horarios: horariosParaEnviar,
        mediosDePago: mediosPago,
      };

      await actualizarMiComercio(datosActualizados);

      Alert.alert(
        "Cambios guardados",
        "Los datos, horarios y medios de pago se actualizaron correctamente.",
      );
    } catch (error: any) {
      console.log(
        "Error al actualizar el comercio:",
        error.response?.data || error.message,
      );

      Alert.alert(
        "Error",
        error.response?.data?.error?.mensaje ||
          "No se pudieron guardar los cambios.",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text>Cargando datos del comercio...</Text>
      </View>
    );
  }

  if (!comercio) {
    return (
      <View style={styles.centrado}>
        <Text>No se encontraron datos del comercio.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenido}
    >
      <TouchableOpacity
        style={styles.botonVolver}
        onPress={() => router.back()}
      >
        <Text style={styles.textoVolver}>‹ Volver</Text>
      </TouchableOpacity>
      <Text style={styles.titulo}>Datos del comercio</Text>

      {/* DATOS GENERALES */}
      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo}>Información general</Text>

        <Text style={styles.etiqueta}>Nombre del comercio</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre del comercio"
        />

        <Text style={styles.etiqueta}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.inputMultilinea]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Descripción del comercio"
          multiline
        />

        <Text style={styles.etiqueta}>Dirección</Text>
        <TextInput
          style={styles.input}
          value={direccion}
          onChangeText={setDireccion}
          placeholder="Dirección"
        />

        <Text style={styles.etiqueta}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Teléfono"
          keyboardType="phone-pad"
        />

        <Text style={styles.etiqueta}>WhatsApp</Text>
        <TextInput
          style={styles.input}
          value={whatsapp}
          onChangeText={setWhatsapp}
          placeholder="WhatsApp"
          keyboardType="phone-pad"
        />

        <Text style={styles.etiqueta}>Instagram</Text>
        <TextInput
          style={styles.input}
          value={instagram}
          onChangeText={setInstagram}
          placeholder="@usuario"
        />
      </View>

      {/* HORARIOS */}
      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo}>Horarios de atención</Text>

        <Text style={styles.descripcionSeccion}>
          Activá los días en los que abre el comercio y cargá sus turnos.
        </Text>

        {DIAS.map((diaNombre, dia) => {
          const turnos = horarios[dia];

          return (
            <View key={dia} style={styles.diaContainer}>
              <View style={styles.filaDia}>
                <Text style={styles.nombreDia}>{diaNombre}</Text>

                <View style={styles.filaSwitch}>
                  <Text style={styles.textoSwitch}>
                    {turnos.length > 0 ? "Abierto" : "Cerrado"}
                  </Text>

                  <Switch
                    value={turnos.length > 0}
                    onValueChange={(activo) => cambiarDia(dia, activo)}
                    trackColor={{ false: "#DDE2E8", true: "#A5D6E7" }}
                    thumbColor={turnos.length > 0 ? "#0a7ea4" : "#f4f3f4"}
                  />
                </View>
              </View>

              {turnos.map((turno, indice) => (
                <View key={indice} style={styles.turnoContainer}>
                  <Text style={styles.etiquetaTurno}>Turno {indice + 1}</Text>

                  <View style={styles.filaHoras}>
                    <View style={styles.campoHora}>
                      <Text style={styles.etiquetaHora}>Abre</Text>
                      <TextInput
                        style={styles.inputHora}
                        value={turno.abre}
                        onChangeText={(valor) =>
                          modificarTurno(dia, indice, "abre", valor)
                        }
                        placeholder="08:00"
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                      />
                    </View>

                    <View style={styles.campoHora}>
                      <Text style={styles.etiquetaHora}>Cierra</Text>
                      <TextInput
                        style={styles.inputHora}
                        value={turno.cierra}
                        onChangeText={(valor) =>
                          modificarTurno(dia, indice, "cierra", valor)
                        }
                        placeholder="12:00"
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                      />
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => eliminarTurno(dia, indice)}>
                    <Text style={styles.textoEliminar}>Eliminar turno</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {turnos.length > 0 && (
                <TouchableOpacity
                  style={styles.botonAgregarTurno}
                  onPress={() => agregarTurno(dia)}
                >
                  <Text style={styles.textoAgregarTurno}>
                    + Agregar otro turno
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      {/* MEDIOS DE PAGO */}
      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo}>Medios de pago</Text>

        <Text style={styles.descripcionSeccion}>
          Seleccioná los medios de pago que acepta el comercio.
        </Text>

        {MEDIOS_PAGO.map((medio) => {
          const seleccionado = mediosPago.includes(medio.valor);

          return (
            <TouchableOpacity
              key={medio.valor}
              style={styles.opcionPago}
              onPress={() => cambiarMedioPago(medio.valor)}
            >
              <View
                style={[
                  styles.checkbox,
                  seleccionado && styles.checkboxSeleccionado,
                ]}
              >
                {seleccionado && <Text style={styles.check}>✓</Text>}
              </View>

              <Text style={styles.textoPago}>{medio.etiqueta}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* GUARDAR */}
      <TouchableOpacity
        style={[styles.botonGuardar, guardando && styles.botonDeshabilitado]}
        onPress={guardarCambios}
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.textoBoton}>Guardar cambios</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#263238",
    marginVertical: 20,
  },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  subtitulo: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#263238",
    marginBottom: 8,
  },
  descripcionSeccion: {
    color: "#718096",
    fontSize: 14,
    marginBottom: 15,
  },
  etiqueta: {
    fontSize: 13,
    color: "#718096",
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDE2E8",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#263238",
    backgroundColor: "#FFFFFF",
    marginTop: 6,
  },
  inputMultilinea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  diaContainer: {
    borderTopWidth: 1,
    borderTopColor: "#EDF0F2",
    paddingVertical: 14,
  },
  filaDia: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nombreDia: {
    fontSize: 16,
    fontWeight: "600",
    color: "#263238",
  },
  filaSwitch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textoSwitch: {
    fontSize: 13,
    color: "#718096",
  },
  turnoContainer: {
    backgroundColor: "#F7F8FA",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  etiquetaTurno: {
    fontWeight: "600",
    color: "#263238",
    marginBottom: 8,
  },
  filaHoras: {
    flexDirection: "row",
    gap: 12,
  },
  campoHora: {
    flex: 1,
  },
  etiquetaHora: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 5,
  },
  inputHora: {
    borderWidth: 1,
    borderColor: "#DDE2E8",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#263238",
    backgroundColor: "#FFFFFF",
    textAlign: "center",
  },
  textoEliminar: {
    color: "#D9534F",
    fontSize: 13,
    marginTop: 12,
    textAlign: "right",
  },
  botonAgregarTurno: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  textoAgregarTurno: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  opcionPago: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#EDF0F2",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: "#AAB4BE",
    borderRadius: 5,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSeleccionado: {
    backgroundColor: "#0a7ea4",
    borderColor: "#0a7ea4",
  },
  check: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  textoPago: {
    fontSize: 15,
    color: "#263238",
  },
  botonGuardar: {
    backgroundColor: "#0a7ea4",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  botonVolver: {
    alignSelf: "flex-start",
    marginBottom: 20,
    paddingVertical: 8,
  },

  textoVolver: {
    fontSize: 16,
    color: "#0a7ea4",
    fontWeight: "600",
  },
});
