

import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.1.240:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function iniciarSesion(email: string, contrasena: string) {
  const respuesta = await api.post("/auth/ingreso", {
    email,
    contrasena,
  });

  return respuesta.data;
}
