import { Comercio, Promocion, Resena } from "../tipos/comercios";

const API_URL = "http://localhost:3000";

// Obtener el listado completo de comercios
export async function obtenerComercios(): Promise<Comercio[]> {
  try {
    const response = await fetch(`${API_URL}/comercios`);
    if (!response.ok) {
      throw new Error("Error al obtener los comercios de la API");
    }
    const resultado = await response.json();
    return Array.isArray(resultado) ? resultado : resultado.datos || [];
  } catch (error) {
    console.error(
      "Fallo la conexión con la API, usando mocks de respaldo:",
      error,
    );
    const { COMERCIOS_MOCK } = await import("../mocks/comerciosMock");
    return COMERCIOS_MOCK;
  }
}

// Obtener un comercio por su ID (para la ficha de detalle)
export async function obtenerComercioPorId(
  id: string,
): Promise<Comercio | null> {
  try {
    const response = await fetch(`${API_URL}/comercios/${id}`);
    if (!response.ok) return null;
    const resultado = await response.json();
    return resultado.datos || resultado;
  } catch (error) {
    console.error("Error al obtener comercio por ID:", error);
    const { COMERCIOS_MOCK } = await import("../mocks/comerciosMock");
    return COMERCIOS_MOCK.find((c) => c.id === id) || null;
  }
}

// Obtener todas las promociones vigentes
export async function obtenerPromociones(): Promise<Promocion[]> {
  try {
    const response = await fetch(`${API_URL}/promociones`);
    if (!response.ok) return [];
    const resultado = await response.json();
    return Array.isArray(resultado) ? resultado : resultado.datos || [];
  } catch (error) {
    const { PROMOCIONES_MOCK } = await import("../mocks/comerciosMock");
    return PROMOCIONES_MOCK;
  }
}

// Obtener las reseñas de un comercio específico
export async function obtenerResenasPorComercio(
  comercioId: string,
): Promise<Resena[]> {
  try {
    const response = await fetch(`${API_URL}/comercios/${comercioId}/resenas`);
    if (!response.ok) return [];
    const resultado = await response.json();
    return Array.isArray(resultado) ? resultado : resultado.datos || [];
  } catch (error) {
    const { RESENAS_MOCK } = await import("../mocks/comerciosMock");
    return RESENAS_MOCK.filter((r) => r.comercioId === comercioId);
  }
}
