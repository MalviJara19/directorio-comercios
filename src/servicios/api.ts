import axios from "axios";
import { obtenerToken } from "./sesion";

export const api = axios.create({
  baseURL: "http://192.168.1.240:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await obtenerToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function iniciarSesion(email: string, contrasena: string) {
  const respuesta = await api.post("/auth/ingreso", {
    email,
    contrasena,
  });

  return respuesta.data;
}

export async function obtenerMiComercio() {
  const respuesta = await api.get("/mi-comercio");
  return respuesta.data.datos;
}

export async function actualizarMiComercio(datos: {
  nombre?: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  horarios?: {
    dia: number;
    abre: string;
    cierra: string;
  }[];
  mediosDePago?: string[];
  imagenes?: string[];
  videoUrl?: string | null;
}) {
  const respuesta = await api.patch("/mi-comercio", datos);
  return respuesta.data.datos;
}

export async function subirArchivo(archivo: {
  uri: string;
  name: string;
  type: string;
}) {
  const formulario = new FormData();

  formulario.append("archivo", {
    uri: archivo.uri,
    name: archivo.name,
    type: archivo.type,
  } as any);

  const respuesta = await api.post("/archivos", formulario, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  console.log("Respuesta al subir archivo:", respuesta.data);

  return respuesta.data.datos;
}

export async function obtenerMisPromociones() {
  const respuesta = await api.get("/mi-comercio/promociones");
  return respuesta.data.datos;
}

export async function crearPromocion(datos: {
  titulo: string;
  detalle: string;
  descuento: number | null;
  desde: string;
  hasta: string;
  imagenUrl: string | null;
  soloApp: boolean;
}) {
  const respuesta = await api.post("/mi-comercio/promociones", datos);
  return respuesta.data.datos;
}

export async function editarPromocion(
  id: string,
  datos: {
    titulo: string;
    detalle: string;
    descuento: number | null;
    desde: string;
    hasta: string;
    imagenUrl: string | null;
    soloApp: boolean;
  },
) {
  const respuesta = await api.patch(`/mi-comercio/promociones/${id}`, datos);
  return respuesta.data.datos;
}

export async function desactivarPromocion(id: string) {
  const respuesta = await api.delete(`/mi-comercio/promociones/${id}`);
  return respuesta.data.datos;
}

export async function validarUsoPromocion(codigo: string) {
  const respuesta = await api.post("/mi-comercio/usos/validar", { codigo });
  return respuesta.data.datos;
}

export async function obtenerComercios(pagina = 1, porPagina = 20) {
  const respuesta = await api.get("/comercios", {
    params: { pagina, porPagina },
  });

  return respuesta.data;
}

export async function obtenerRubros() {
  const respuesta = await api.get("/rubros");
  return respuesta.data.datos;
}

export async function agregarFavorito(comercioId: string) {
  const respuesta = await api.put(`/yo/favoritos/${comercioId}`);
  return respuesta.data;
}

export async function quitarFavorito(comercioId: string) {
  const respuesta = await api.delete(`/yo/favoritos/${comercioId}`);
  return respuesta.data;
}

export async function obtenerMiPerfil() {
  const respuesta = await api.get("/yo");
  return respuesta.data.datos;
}

export async function actualizarRubrosDeInteres(rubrosDeInteres: string[]) {
  const respuesta = await api.patch("/yo", {
    rubrosDeInteres,
  });

  return respuesta.data.datos;
}

export async function actualizarAvisosActivos(avisosActivos: boolean) {
  const respuesta = await api.patch("/yo", {
    avisosActivos,
  });

  return respuesta.data.datos;
}

// ================================
// RESEÑAS DEL COMERCIO
// ================================

// Obtener reseñas recibidas por el comercio.
export async function obtenerResenasPorComercio(
  comercioId: string,
  pagina = 1,
  porPagina = 20,
) {
  const respuesta = await api.get(
    `/comercios/${comercioId}/resenas`,
    {
      params: { pagina, porPagina },
    },
  );

  return respuesta.data;
}

// Responder una reseña como comercio.
export async function responderResena(
  resenaId: string,
  respuestaTexto: string,
) {
  const respuesta = await api.post(
    `/resenas/${resenaId}/respuesta`,
    {
      respuesta: respuestaTexto,
    },
  );

  return respuesta.data.datos;
}
