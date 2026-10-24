import { Comercio, Promocion, Resena } from "../tipos/comercios";

export const COMERCIOS_MOCK: Comercio[] = [
  {
    id: "1",
    nombre: "Almacén Don Jose",
    rubro: "servicios",
    descripcion:
      "Almacén de barrio con gran variedad de productos de almacén, limpieza y bebidas.",
    direccion: "Belgrano 456",
    latitud: -32.48,
    longitud: -58.23,
    telefono: "3442123456",
    whatsapp: "5493442123456", // <-- Agregamos el 549 adelante
    redesSociales: "@donjose",
    mediosDePago: ["Efectivo", "Transferencia"],
    fotos: [],
    videoPresentacion: null,
    horarios: {
      aperturaManana: "08:00",
      cierreManana: "12:30",
      aperturaTarde: "16:30",
      cierreTarde: "20:30",
      atiendeSabados: true,
      cierreSabado: "13:00",
    },
    estaAbiertoPorVacaciones: false,
    promedioEstrellas: 4.8,
    totalResenas: 24,
  },
  {
    id: "2",
    nombre: "Verdulería La Estación",
    rubro: "otros",
    descripcion:
      "Frutas y verduras frescas cosechadas en el día, atendido por sus propios dueños.",
    direccion: "Rivadavia 789",
    latitud: -32.49,
    longitud: -58.24,
    telefono: null,
    whatsapp: null,
    redesSociales: null,
    mediosDePago: ["Efectivo"],
    fotos: [],
    videoPresentacion: null,
    horarios: {
      aperturaManana: "08:30",
      cierreManana: "12:30",
      aperturaTarde: "17:00",
      cierreTarde: "20:00",
      atiendeSabados: true,
      cierreSabado: "13:00",
    },
    estaAbiertoPorVacaciones: false,
    promedioEstrellas: 4.5,
    totalResenas: 15,
  },
  {
    id: "3",
    nombre: "Panadería El Sol",
    rubro: "gastronomia",
    descripcion:
      "Especialidad en facturas artesanales, pan caliente todas las mañanas y repostería.",
    direccion: "San Martín 321",
    latitud: -32.47,
    longitud: -58.22,
    telefono: "3442654321",
    whatsapp: "5493442654321", // <-- Agregamos el 549 adelante
    redesSociales: null,
    mediosDePago: ["Efectivo", "Débito"],
    fotos: [],
    videoPresentacion: null,
    horarios: {
      aperturaManana: "07:00",
      cierreManana: "13:00",
      aperturaTarde: "16:00",
      cierreTarde: "20:30",
      atiendeSabados: true,
      cierreSabado: "14:00",
    },
    estaAbiertoPorVacaciones: false,
    promedioEstrellas: 4.9,
    totalResenas: 40,
  },
];

export const PROMOCIONES_MOCK: Promocion[] = [
  {
    id: "p1",
    comercioId: "1",
    titulo: "20% de descuento en fideos",
    descripcion: "Presentando este cupón los días martes.",
    descuentoPorcentaje: 20,
    fechaInicio: "2026-01-01T00:00:00Z",
    fechaFin: "2026-12-31T23:59:59Z",
    condiciones: "Válido solo en efectivo.",
    esExclusivaApp: true,
    codigoPromo: "DONJOSE20",
  },
];

export const RESENAS_MOCK: Resena[] = [
  {
    id: "r1",
    comercioId: "1",
    usuarioId: "u1",
    nombreUsuario: "Juan Pérez",
    estrellas: 5,
    comentario: "Excelente atención y precios.",
    fechaCreacion: "2026-03-01T10:00:00Z",
    respuestaComercio: "¡Muchas gracias Juan!",
  },
];