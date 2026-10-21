// Rubros oficiales pedidos por el Centro Comercial
export type RubroComercio =
  | "gastronomia"
  | "indumentaria"
  | "hogar"
  | "ferreteria y construccion"
  | "salud y farmacia"
  | "servicios"
  | "tecnologia"
  | "libreria"
  | "otros";

export interface HorarioAtencion {
  aperturaManana: string | null;
  cierreManana: string | null;
  aperturaTarde: string | null;
  cierreTarde: string | null;
  atiendeSabados: boolean;
  cierreSabado: string | null;
}

export interface Comercio {
  id: string;
  nombre: string;
  rubro: RubroComercio;
  descripcion: string;
  direccion: string;
  latitud: number;
  longitud: number;
  telefono: string | null;
  whatsapp: string | null;
  redesSociales: string | null;
  mediosDePago: string[];
  fotos: string[];
  videoPresentacion: string | null;
  horarios: HorarioAtencion;
  estaAbiertoPorVacaciones: boolean;
  promedioEstrellas: number;
  totalResenas: number;
}

export interface Promocion {
  id: string;
  comercioId: string;
  titulo: string;
  descripcion: string;
  descuentoPorcentaje: number | null;
  fechaInicio: string;
  fechaFin: string;
  condiciones: string | null;
  esExclusivaApp: boolean;
  codigoPromo: string | null;
}

export interface Resena {
  id: string;
  comercioId: string;
  usuarioId: string;
  nombreUsuario: string;
  estrellas: number;
  comentario: string;
  fechaCreacion: string;
  respuestaComercio: string | null;
}
