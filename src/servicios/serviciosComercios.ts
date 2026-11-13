
import {
  RESENAS_MOCK
} from "../mocks/comerciosMock";

import {
  ComercioListado,
  Promocion,
  Resena,
  UsoDePromocion,
} from "../tipos/comercios";
import { api } from "./api";

// Convertir los IDs de rubros de la API al formato que utiliza la pantalla.
const RUBROS_POR_ID: Record<string, ComercioListado["rubro"]> = {
  "rub-gastronomia": "gastronomia",
  "rub-indumentaria": "indumentaria",
  "rub-hogar": "hogar",
  "rub-ferreteria": "ferreteria y construccion",
  "rub-salud": "salud y farmacia",
  "rub-servicios": "servicios",
  "rub-tecnologia": "tecnologia",
  "rub-libreria": "libreria",
  "rub-otros": "otros",
};

// Obtener los comercios reales de la API.
export async function obtenerComercios(): Promise<ComercioListado[]> {
  const primeraRespuesta = await api.get("/comercios", {
    params: { pagina: 1, porPagina: 20 },
  });

  const todosLosComercios = [
    ...(primeraRespuesta.data.datos ?? []),
  ];

  const totalPaginas = Math.ceil(
    (primeraRespuesta.data.meta?.total ?? todosLosComercios.length) /
    (primeraRespuesta.data.meta?.porPagina ?? 20)
  );

  for (let pagina = 2; pagina <= totalPaginas; pagina++) {
    const respuesta = await api.get("/comercios", {
      params: { pagina, porPagina: 20 },
    });

    todosLosComercios.push(...(respuesta.data.datos ?? []));
  }

  return todosLosComercios
    .filter((c) => c.activo !== false)
    .map((c) => ({
      id: c.id,
      nombre: c.nombre,
      rubro: RUBROS_POR_ID[c.rubroId] || "otros",
      descripcion: c.descripcion || "",
      direccion: c.direccion || "",
      latitud: Number(c.coordenadas?.latitud ?? 0),
      longitud: Number(c.coordenadas?.longitud ?? 0),
      telefono: c.telefono || null,
      whatsapp: c.whatsapp || null,
      redesSociales: c.instagram || null,
      mediosDePago: c.mediosDePago || [],
      fotos: c.imagenes || [],
      videoPresentacion: c.videoUrl || null,
      horarios: c.horarios || [],
      estaAbiertoPorVacaciones: false,
      promedioEstrellas: Number(c.puntaje ?? 0),
      totalResenas: Number(c.cantidadResenas ?? 0),
    }));
}
export type EstadoPromociones = "vigentes" | "proximas" | "por-vencer";

export async function obtenerPromociones(
  estado: EstadoPromociones = "vigentes",
): Promise<Promocion[]> {
  const porPagina = 20;

  const primeraRespuesta = await api.get("/promociones", {
    params: { estado, pagina: 1, porPagina },
  });

  const promociones = [
    ...(primeraRespuesta.data.datos ?? []),
  ];

  const totalPaginas = Math.ceil(
    (primeraRespuesta.data.meta?.total ?? promociones.length) /
    (primeraRespuesta.data.meta?.porPagina ?? porPagina)
  );

  for (let pagina = 2; pagina <= totalPaginas; pagina++) {
    const respuesta = await api.get("/promociones", {
      params: { estado, pagina, porPagina },
    });

    promociones.push(...(respuesta.data.datos ?? []));
  }

  return promociones;
}

// Generar u obtener el código de una promoción exclusiva.
export async function generarCodigoPromocion(
  promocionId: string,
): Promise<UsoDePromocion> {
  const respuesta = await api.post(
    `/promociones/${promocionId}/usos`
  );

  return respuesta.data.datos;
}
// Obtener los códigos de promociones del usuario autenticado.
export async function obtenerMisUsos(
  pagina = 1,
  porPagina = 20,
): Promise<UsoDePromocion[]> {
  const respuesta = await api.get("/yo/usos", {
    params: { pagina, porPagina },
  });

  return respuesta.data.datos ?? [];
}
// Validar un código de promoción desde la cuenta del comercio.
export async function validarCodigoPromocion(
  codigo: string,
): Promise<UsoDePromocion> {
  const respuesta = await api.post(
    "/mi-comercio/usos/validar",
    { codigo },
  );

  return respuesta.data.datos;
}
// Las reseñas siguen utilizando los datos de prueba por ahora.
export async function obtenerResenasPorComercio(
  comercioId: string,
): Promise<Resena[]> {
  return RESENAS_MOCK.filter((r) => r.comercioId === comercioId);
}
