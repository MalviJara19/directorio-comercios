import { Comercio } from "@/tipos/comercios";
import * as SQLite from "expo-sqlite";
import Storage from "expo-sqlite/kv-store";


const conexion = SQLite.openDatabaseAsync("directorio.db");

export async function inicializarBaseDatos() {
  const db = await conexion;

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS comercios (
      id TEXT PRIMARY KEY NOT NULL,
      datos TEXT NOT NULL,
      actualizado_en TEXT NOT NULL
    );
  `);

  await db.execAsync(`
  CREATE TABLE IF NOT EXISTS favoritos (
    usuario_id TEXT NOT NULL,
    comercio_id TEXT NOT NULL,
    PRIMARY KEY (usuario_id, comercio_id)
  );
`);

await db.execAsync(`
  CREATE TABLE IF NOT EXISTS favoritos_pendientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id TEXT NOT NULL,
    comercio_id TEXT NOT NULL,
    accion TEXT NOT NULL
  );
`);

await db.execAsync(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_favoritos_pendientes_usuario_comercio
  ON favoritos_pendientes (usuario_id, comercio_id);
`);

  console.log("Base de datos inicializada correctamente.");

  return db;
}

export async function guardarComercios(comercios: Comercio[]) {
  const db = await conexion;
  const fechaActual = new Date().toISOString();

  for (const comercio of comercios) {
    await db.runAsync(
      `INSERT OR REPLACE INTO comercios (id, datos, actualizado_en)
       VALUES (?, ?, ?)`,
      comercio.id,
      JSON.stringify(comercio),
      fechaActual,
    );
  }
  await Storage.setItem("ultima_actualizacion_comercios", fechaActual);
  console.log("Comercios guardados en SQLite:", comercios.length);
}

export async function obtenerComerciosGuardados(): Promise<Comercio[]> {
  const db = await conexion;

  const registros = await db.getAllAsync<{
    id: string;
    datos: string;
    actualizado_en: string;
  }>("SELECT * FROM comercios ORDER BY id");

  return registros.map((registro) => JSON.parse(registro.datos) as Comercio);
}

export async function obtenerUltimaActualizacion(): Promise<string | null> {
  return await Storage.getItem("ultima_actualizacion_comercios");
}



export async function guardarFavoritos(
  usuarioId: string,
  favoritos: string[],
) {
  const db = await conexion;

  await db.runAsync(
    "DELETE FROM favoritos WHERE usuario_id = ?",
    usuarioId,
  );

  for (const comercioId of favoritos) {
    await db.runAsync(
      "INSERT OR IGNORE INTO favoritos (usuario_id, comercio_id) VALUES (?, ?)",
      usuarioId,
      comercioId,
    );
  }

  console.log("Favoritos guardados localmente:", favoritos.length);
}


export async function obtenerFavoritos(
  usuarioId: string,
): Promise<string[]> {
  const db = await conexion;

  const registros = await db.getAllAsync<{ comercio_id: string }>(
    "SELECT comercio_id FROM favoritos WHERE usuario_id = ?",
    usuarioId,
  );

  return registros.map((registro) => registro.comercio_id);
}


// Registramos un cambio de favorito pendiente de sincronización.
export async function registrarFavoritoPendiente(
  usuarioId: string,
  comercioId: string,
  accion: "agregar" | "quitar",
) {
  const db = await conexion;

  await db.runAsync(
    `INSERT INTO favoritos_pendientes (usuario_id, comercio_id, accion)
     VALUES (?, ?, ?)
     ON CONFLICT(usuario_id, comercio_id)
     DO UPDATE SET accion = excluded.accion`,
    usuarioId,
    comercioId,
    accion,
  );
}

// Recuperamos los cambios pendientes de un usuario.
export async function obtenerFavoritosPendientes(usuarioId: string) {
  const db = await conexion;

  return await db.getAllAsync<{
    id: number;
    usuario_id: string;
    comercio_id: string;
    accion: "agregar" | "quitar";
  }>(
    `SELECT * FROM favoritos_pendientes
     WHERE usuario_id = ?
     ORDER BY id`,
    usuarioId,
  );
}

// Eliminamos un cambio cuando ya se sincronizó correctamente.
export async function eliminarFavoritoPendiente(id: number) {
  const db = await conexion;

  await db.runAsync(
    "DELETE FROM favoritos_pendientes WHERE id = ?",
    id,
  );
}