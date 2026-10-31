import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "token_usuario";
const USUARIO_KEY = "usuario_actual";

// Guardar el token
export async function guardarToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

// Obtener el token
export async function obtenerToken() {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

// Guardar los datos del usuario
export async function guardarUsuario(usuario: object) {
  await SecureStore.setItemAsync(
    USUARIO_KEY,
    JSON.stringify(usuario),
  );
}

// Obtener los datos del usuario
export async function obtenerUsuario() {
  const usuario = await SecureStore.getItemAsync(USUARIO_KEY);

  return usuario ? JSON.parse(usuario) : null;
}

// Cerrar sesión
export async function cerrarSesion() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USUARIO_KEY);
}