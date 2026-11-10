import { Horario } from "@/tipos/comercios";

export const estaAbiertoAhora = (
  horarios: Horario[],
  fechaActual: Date = new Date(),
): boolean => {
  if (!horarios || horarios.length === 0) return false;

  const diaSemana = fechaActual.getDay();
  const horaActual = fechaActual.getHours();
  const minutosActuales = fechaActual.getMinutes();

  const minutosTotalesActuales = horaActual * 60 + minutosActuales;

  const horarioHoy = horarios.find(
    (horario) => horario.dia === diaSemana,
  );

  if (!horarioHoy) return false;

  const apertura = convertirAMinutos(horarioHoy.abre);
  const cierre = convertirAMinutos(horarioHoy.cierra);

  return (
    minutosTotalesActuales >= apertura &&
    minutosTotalesActuales <= cierre
  );
};

const convertirAMinutos = (horaStr: string): number => {
  const [horas, minutos] = horaStr.split(":").map(Number);
  return horas * 60 + minutos;
};