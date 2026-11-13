
import { Comercio } from "@/tipos/comercios";
import * as SQLite from "expo-sqlite";
import Storage from "expo-sqlite/kv-store";

const conexion = SQLite.openDatabaseAsync("directorio.db");

// Tipo de reseña guardada localmente y pendiente de sincronización.
export type ResenaPendiente = {
  id: string;
  comercioId: string;
  usuarioId: string;
  estrellas: 1 | 2 | 3 | 4 | 5;
  comentario: string;
  creadaEn: string;
  sincronizada: false;
};

const conexionLista = async () => {
  const db = await conexion;

  // Garantiza que las tablas estén creadas antes de utilizarlas.
  await inicializarBaseDatos();

  return db;
};

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

  // Nueva tabla para reseñas pendientes de sincronización.
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS resenas_pendientes (
      id TEXT PRIMARY KEY NOT NULL,
      comercio_id TEXT NOT NULL,
      usuario_id TEXT NOT NULL,
      estrellas INTEGER NOT NULL,
      comentario TEXT NOT NULL,
      creada_en TEXT NOT NULL
    );
  `);

  console.log("Base de datos inicializada correctamente.");

  return db;
}

// --------------------------------------------------
// COMERCIOS
// --------------------------------------------------

export async function guardarComercios(comercios: Comercio[]) {
  const db = await conexionLista();
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
  const db = await conexionLista();

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

// --------------------------------------------------
// FAVORITOS
// --------------------------------------------------

export async function guardarFavoritos(
  usuarioId: string,
  favoritos: string[],
) {
  const db = await conexionLista();

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
  const db = await conexionLista();

  const registros = await db.getAllAsync<{ comercio_id: string }>(
    "SELECT comercio_id FROM favoritos WHERE usuario_id = ?",
    usuarioId,
  );

  return registros.map((registro) => registro.comercio_id);
}

export async function registrarFavoritoPendiente(
  usuarioId: string,
  comercioId: string,
  accion: "agregar" | "quitar",
) {
  const db = await conexionLista();

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

export async function obtenerFavoritosPendientes(usuarioId: string) {
  const db = await conexionLista();

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

export async function eliminarFavoritoPendiente(id: number) {
  const db = await conexionLista();

  await db.runAsync(
    "DELETE FROM favoritos_pendientes WHERE id = ?",
    id,
  );
}

// --------------------------------------------------
// RESEÑAS PENDIENTES
// --------------------------------------------------

// Guardamos una reseña localmente antes de intentar enviarla al servidor.
export async function guardarResenaPendiente(
  resena: ResenaPendiente,
) {
  const db = await conexionLista();

  await db.runAsync(
    `INSERT OR REPLACE INTO resenas_pendientes
      (id, comercio_id, usuario_id, estrellas, comentario, creada_en)
     VALUES (?, ?, ?, ?, ?, ?)`,
    resena.id,
    resena.comercioId,
    resena.usuarioId,
    resena.estrellas,
    resena.comentario,
    resena.creadaEn,
  );

  console.log("Reseña guardada localmente:", resena.id);
}

// Recuperamos las reseñas pendientes de un usuario.
export async function obtenerResenasPendientes(
  usuarioId: string,
): Promise<ResenaPendiente[]> {
  const db = await conexionLista();

  const registros = await db.getAllAsync<{
    id: string;
    comercio_id: string;
    usuario_id: string;
    estrellas: number;
    comentario: string;
    creada_en: string;
  }>(
    `SELECT * FROM resenas_pendientes
     WHERE usuario_id = ?
     ORDER BY creada_en DESC`,
    usuarioId,
  );

  return registros.map((registro) => ({
    id: registro.id,
    comercioId: registro.comercio_id,
    usuarioId: registro.usuario_id,
    estrellas: registro.estrellas as 1 | 2 | 3 | 4 | 5,
    comentario: registro.comentario,
    creadaEn: registro.creada_en,
    sincronizada: false,
  }));
}

// Eliminamos la reseña local únicamente después de confirmar
// que el servidor la recibió correctamente.
export async function eliminarResenaPendiente(id: string) {
  const db = await conexionLista();

  await db.runAsync(
    "DELETE FROM resenas_pendientes WHERE id = ?",
    id,
  );

  console.log("Reseña sincronizada y eliminada de la cola:", id);
}
