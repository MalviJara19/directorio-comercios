import {
  COMERCIOS_MOCK,
  PROMOCIONES_MOCK,
  RESENAS_MOCK,
} from '../mocks/comerciosMock';

import type {
  Comercio,
  Promocion,
  Resena,
} from '../tipos/comercios';

// Simula un pequeño retraso de red
const simularRed = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Obtener el listado completo de comercios
export async function obtenerComercios(): Promise<Comercio[]> {
  await simularRed();
  return COMERCIOS_MOCK;
}

// Obtener un comercio por su ID
export async function obtenerComercioPorId(
  id: string
): Promise<Comercio | null> {
  await simularRed();
  const comercio = COMERCIOS_MOCK.find((c) => c.id === id);
  return comercio ?? null;
}

// Obtener todas las promociones
export async function obtenerPromociones(): Promise<Promocion[]> {
  await simularRed();
  return PROMOCIONES_MOCK;
}

// Obtener las reseñas de un comercio específico
export async function obtenerResenasPorComercio(
  comercioId: string
): Promise<Resena[]> {
  await simularRed();
  return RESENAS_MOCK.filter((r) => r.comercioId === comercioId);
}