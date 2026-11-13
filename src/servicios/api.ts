
import axios from "axios";
import { obtenerToken } from "./sesion";
import type {
  Promocion,
  UsoDePromocion,
} from "@/tipos/comercios";

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

// ================================
// AUTENTICACIÓN
// ================================

export async function iniciarSesion(
  email: string,
  contrasena: string,
) {
  const respuesta = await api.post("/auth/ingreso", {
    email,
    contrasena,
  });

  return respuesta.data;
}

export async function registrarUsuario(
  nombre: string,
  email: string,
  contrasena: string,
) {
  const respuesta = await api.post("/auth/registro", {
    nombre,
    email,
    contrasena,
  });

  return respuesta.data;
}

// ================================
// MI COMERCIO
// ================================

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

// ================================
// ARCHIVOS
// ================================

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

// ================================
// PROMOCIONES
// ================================

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
  const respuesta = await api.post(
    "/mi-comercio/promociones",
    datos,
  );

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
  const respuesta = await api.patch(
    `/mi-comercio/promociones/${id}`,
    datos,
  );

  return respuesta.data.datos;
}

export async function desactivarPromocion(id: string) {
  const respuesta = await api.delete(
    `/mi-comercio/promociones/${id}`,
  );

  return respuesta.data.datos;
}

// Obtener promociones disponibles para los usuarios.
export type EstadoPromocionesQR =
  | "vigentes"
  | "proximas"
  | "por-vencer";

export async function obtenerPromocionesDisponibles(
  estado: EstadoPromocionesQR = "vigentes",
): Promise<Promocion[]> {
  const porPagina = 20;

  const primeraRespuesta = await api.get("/promociones", {
    params: {
      estado,
      pagina: 1,
      porPagina,
    },
  });

  const promociones: Promocion[] = [
    ...(primeraRespuesta.data.datos ?? []),
  ];

  const totalPaginas = Math.ceil(
    (primeraRespuesta.data.meta?.total ?? promociones.length) /
      (primeraRespuesta.data.meta?.porPagina ?? porPagina),
  );

  for (let pagina = 2; pagina <= totalPaginas; pagina++) {
    const respuesta = await api.get("/promociones", {
      params: {
        estado,
        pagina,
        porPagina,
      },
    });

    promociones.push(...(respuesta.data.datos ?? []));
  }

  return promociones;
}

// ================================
// CÓDIGOS QR DE PROMOCIONES
// ================================

// Validar un código QR desde el comercio.
export async function validarUsoPromocion(codigo: string) {
  const respuesta = await api.post(
    "/mi-comercio/usos/validar",
    { codigo },
  );

  return respuesta.data.datos;
}

// Generar o recuperar el código QR de una promoción.
export async function generarCodigoPromocion(
  promocionId: string,
): Promise<UsoDePromocion> {
  const respuesta = await api.post(
    `/promociones/${promocionId}/usos`,
  );

  return respuesta.data.datos;
}

// Obtener los códigos QR del usuario autenticado.
export async function obtenerMisUsos(
  pagina: number = 1,
  porPagina: number = 20,
): Promise<UsoDePromocion[]> {
  const respuesta = await api.get("/yo/usos", {
    params: {
      pagina,
      porPagina,
    },
  });

  return respuesta.data.datos ?? [];
}

// ================================
// COMERCIOS
// ================================

export async function obtenerComercios(
  pagina = 1,
  porPagina = 20,
) {
  const respuesta = await api.get("/comercios", {
    params: {
      pagina,
      porPagina,
    },
  });

  return respuesta.data;
}

export async function obtenerRubros() {
  const respuesta = await api.get("/rubros");
  return respuesta.data.datos;
}

// ================================
// FAVORITOS
// ================================

export async function agregarFavorito(comercioId: string) {
  const respuesta = await api.put(
    `/yo/favoritos/${comercioId}`,
  );

  return respuesta.data;
}

export async function quitarFavorito(comercioId: string) {
  const respuesta = await api.delete(
    `/yo/favoritos/${comercioId}`,
  );

  return respuesta.data;
}

// ================================
// PERFIL
// ================================

export async function obtenerMiPerfil() {
  const respuesta = await api.get("/yo");
  return respuesta.data.datos;
}

export async function actualizarRubrosDeInteres(
  rubrosDeInteres: string[],
) {
  const respuesta = await api.patch("/yo", {
    rubrosDeInteres,
  });

  return respuesta.data.datos;
}

export async function actualizarAvisosActivos(
  avisosActivos: boolean,
) {
  const respuesta = await api.patch("/yo", {
    avisosActivos,
  });

  return respuesta.data.datos;
}

// ================================
// RESEÑAS
// ================================

// Obtener las reseñas de un comercio.
export async function obtenerResenasPorComercio(
  comercioId: string,
  pagina = 1,
  porPagina = 20,
) {
  const respuesta = await api.get(
    `/comercios/${comercioId}/resenas`,
    {
      params: {
        pagina,
        porPagina,
      },
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

// ================================
// CUENTA
// ================================

// Actualizar datos personales de la cuenta.
export async function actualizarDatosCuenta(datos: {
  nombre?: string;
  email?: string;
  contrasenaActual?: string;
  nuevaContrasena?: string;
}) {
  const respuesta = await api.patch("/yo/cuenta", datos);
  return respuesta.data.datos;
}