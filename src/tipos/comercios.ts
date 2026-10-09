// Rubros oficiales pedidos por el Centro Comercial
export type RubroComercio =
  | 'gastronomia'
  | 'indumentaria'
  | 'hogar'
  | 'ferreteria y construccion'
  | 'salud y farmacia'
  | 'servicios'
  | ' tecnologia'
  | 'libreria'
  | 'otros';

export interface HorarioAtencion {
  aperturaManana: string | null; // Formato "HH:MM"
  cierreManana: string | null;
  aperturaTarde: string | null;
  cierreTarde: string | null;
  atiendeSabados: boolean;
  cierreSabado: string | null;
}

export interface Comercio {
  id: string; // Identificadores como cadenas de texto, nunca números
  nombre: string;
  rubro: RubroComercio;
  direccion: string;
  latitud: number;
  longitud: number;
  telefono: string | null;
  whatsapp: string | null;
  redesSociales: string | null;
  mediosDePago: string[];
  fotos: string[];
  videoPresentacion: string | null; // URL del video corto de 30s (null si no tiene)
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
  descuentoPorcentaje: number | null; // Descuento en porcentaje entero (ej: 15)
  fechaInicio: string; // ISO 8601 con zona
  fechaFin: string; // ISO 8601 con zona
  condiciones: string | null;
  esExclusivaApp: boolean;
  codigoPromo: string | null; // Código para mostrar en pantalla / escanear QR
}

export interface Resena {
  id: string;
  comercioId: string;
  usuarioId: string;
  nombreUsuario: string;
  estrellas: number; // 1 a 5
  comentario: string;
  fechaCreacion: string;
  respuestaComercio: string | null; // El comercio puede responder una vez
}