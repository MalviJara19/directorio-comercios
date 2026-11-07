import { Comercio } from "../tipos/comercios";

export const estaAbiertoAhora = (
  comercio: Comercio,
  fechaActual: Date = new Date(),
): boolean => {
  // Si el comercio no está activo, está cerrado
  if (!comercio.activo) return false;

  const diaActual = fechaActual.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const hora = String(fechaActual.getHours()).padStart(2, "0");
  const minutos = String(fechaActual.getMinutes()).padStart(2, "0");
  const horaActualStr = `${hora}:${minutos}`;
  return comercio.horarios.some((h) => {
    if (h.dia !== diaActual) return false;
    return horaActualStr >= h.abre && horaActualStr < h.cierra;
  });
};
