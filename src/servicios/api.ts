
import axios from "axios";
import { obtenerToken } from "./sesion";

export const api = axios.create({
 baseURL: "http://10.113.120.56:3000",
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