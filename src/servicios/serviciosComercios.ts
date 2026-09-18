import { Comercio, Promocion, Resena } from '../tipos/comercios'; // Ajustá si tu archivo en tipos se llama diferente (ej: comercios.ts)
import { COMERCIOS_MOCK, PROMOCIONES_MOCK, RESENAS_MOCK } from '../mocks/comerciosMock.ts';

// Función auxiliar para simular un retraso de red (latencia)
const simularRed = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Obtener el listado completo de comercios
export async function obtenerComercios(): Promise<Comercio[]> {
  await simularRed();
  return COMERCIOS_MOCK;
}

// Obtener un comercio por su ID (para la ficha de detalle)
export async function obtenerComercioPorId(id: string): Promise<Comercio | null> {
  await simularRed();
  const comercio = COMERCIOS_MOCK.find((c) => c.id === id);
  return comercio || null;
}

// Obtener todas las promociones vigentes
export async function obtenerPromociones(): Promise<Promocion[]> {
  await simularRed();
  return PROMOCIONES_MOCK;
}

// Obtener las reseñas de un comercio específico
export async function obtenerResenasPorComercio(comercioId: string): Promise<Resena[]> {
  await simularRed();
  return RESENAS_MOCK.filter((r) => r.comercioId === comercioId);
}