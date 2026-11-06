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
