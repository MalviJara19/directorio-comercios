import { HorarioAtencion } from "../../directorio-comercios/src/tipos/comercios";

export const estaAbiertoAhora = (
  horarios: HorarioAtencion,
  fechaActual: Date = new Date(),
): boolean => {
  if (!horarios) return false;

  const diaSemana = fechaActual.getDay(); // 0 = Domingo, 6 = Sábado
  const horaActual = fechaActual.getHours();
  const minutosActuales = fechaActual.getMinutes();
  const minutosTotalesActuales = horaActual * 60 + minutosActuales;

  // Si es domingo, por defecto cerrado (o podés ajustar según lógica)
  if (diaSemana === 0) return false;

  // Validación para Sábados
  if (diaSemana === 6) {
    if (!horarios.atiendeSabados || !horarios.cierreSabado) return false;

    const aperturaM = horarios.aperturaManana
      ? convertirAMinutos(horarios.aperturaManana)
      : null;
    const cierreS = convertirAMinutos(horarios.cierreSabado);

    if (
      aperturaM !== null &&
      minutosTotalesActuales >= aperturaM &&
      minutosTotalesActuales <= cierreS
    ) {
      return true;
    }
    return false;
  }

  // Días de semana (Lunes a Viernes)
  // Turno Mañana
  if (horarios.aperturaManana && horarios.cierreManana) {
    const abreM = convertirAMinutos(horarios.aperturaManana);
    const cierraM = convertirAMinutos(horarios.cierreManana);
    if (minutosTotalesActuales >= abreM && minutosTotalesActuales <= cierraM) {
      return true;
    }
  }

  // Turno Tarde
  if (horarios.aperturaTarde && horarios.cierreTarde) {
    const abreT = convertirAMinutos(horarios.aperturaTarde);
    const cierraT = convertirAMinutos(horarios.cierreTarde);
    if (minutosTotalesActuales >= abreT && minutosTotalesActuales <= cierraT) {
      return true;
    }
  }

  return false;
};

const convertirAMinutos = (horaStr: string): number => {
  const [horas, minutos] = horaStr.split(":").map(Number);
  return horas * 60 + minutos;
};
