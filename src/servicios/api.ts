
import axios from "axios";
import { obtenerToken } from "./sesion";

export const api = axios.create({
  baseURL: "http://192.168.1.68:3000",
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
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string | null;
  whatsapp: string | null;
  instagram: string | null;
}) {
  const respuesta = await api.patch("/mi-comercio", datos);
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
  const respuesta = await api.put(
    `/yo/favoritos/${comercioId}`
  );

  return respuesta.data;
}

export async function quitarFavorito(comercioId: string) {
  const respuesta = await api.delete(
    `/yo/favoritos/${comercioId}`
  );

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
// RESEÑAS
// ================================

// Obtener las reseñas de un comercio.
// Devuelve datos y metadatos de paginación.
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

// Crear una reseña.
export async function crearResena(
  comercioId: string,
  datos: {
    estrellas: 1 | 2 | 3 | 4 | 5;
    comentario: string;
  },
) {
  const respuesta = await api.post(
    `/comercios/${comercioId}/resenas`,
    datos,
  );

  return respuesta.data.datos;
}

// Editar una reseña propia.
export async function editarResena(
  resenaId: string,
  datos: {
    estrellas?: 1 | 2 | 3 | 4 | 5;
    comentario?: string;
  },
) {
  const respuesta = await api.patch(
    `/resenas/${resenaId}`,
    datos,
  );

  return respuesta.data.datos;
}

// Eliminar una reseña propia.
export async function eliminarResena(resenaId: string) {
  await api.delete(`/resenas/${resenaId}`);
}

// Reportar una reseña.
export async function reportarResena(resenaId: string) {
  const respuesta = await api.post(
    `/resenas/${resenaId}/reportes`,
  );

  return respuesta.data.datos;
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
