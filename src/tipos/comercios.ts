// Coordenadas geográficas de un comercio
export interface Coordenadas {
  latitud: number;
  longitud: number;
}

// Horarios de atención
export interface Horario {
  dia: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo
  abre: string; // Ejemplo: "08:00"
  cierra: string; // Ejemplo: "12:00"
}

// Información de un comercio
export interface Comercio {
  id: string;
  nombre: string;
  rubroId: string;
  descripcion: string;
  direccion: string;
  coordenadas: Coordenadas;
  telefono: string | null;
  whatsapp: string | null;
  instagram: string | null;
  imagenes: string[];
  videoUrl: string | null;
  horarios: Horario[];
  mediosDePago: string[];
  puntaje: number;
  cantidadResenas: number;
  codigoQr: string | null;
  activo: boolean;
}

// Rubros de comercios
export interface Rubro {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  orden: number;
}

// Promociones
export interface Promocion {
  id: string;
  comercioId: string;
  titulo: string;
  detalle: string;
  descuento: number | null;
  desde: string;
  hasta: string;
  imagenUrl: string | null;
  soloApp: boolean;
  usos: number;
  activa: boolean;
}

// Reseñas
export interface Resena {
  id: string;
  comercioId: string;
  usuarioId: string;
  estrellas: 1 | 2 | 3 | 4 | 5;
  comentario: string;
  respuesta: string | null;
  reportada: boolean;
  creadaEn: string;
  sincronizada: boolean;
}

// Registro de uso de una promoción
export interface UsoDePromocion {
  id: string;
  promocionId: string;
  usuarioId: string;
  codigo: string;
  validadoEn: string | null;
}