import { HorarioAtencion } from "../../directorio-comercios/src/tipos/comercios";

export const estaAbiertoAhora = (
  horarios: HorarioAtencion & { enVacaciones?: boolean },
  fechaActual: Date = new Date(),
): boolean => {
  if (!horarios) return false;

  // 1. REGLA DE VACACIONES: Si está de vacaciones, siempre está cerrado
  if (horarios.enVacaciones) {
    return false;
  }

  const diaSemana = fechaActual.getDay();
  const horaActual = fechaActual.getHours();
  const minutosActuales = fechaActual.getMinutes();
  const minutosTotalesActuales = horaActual * 60 + minutosActuales;

  // 2. Validación para Domingos (0)
  if (diaSemana === 0) {
    return false;
  }

  // 3. Validación para Sábados (6)
  if (diaSemana === 6) {
    if (
      !horarios.atiendeSabados ||
      !horarios.cierreSabado ||
      !horarios.aperturaManana
    ) {
      return false;
    }

    const aperturaM = convertirAMinutos(horarios.aperturaManana);
    const cierreS = convertirAMinutos(horarios.cierreSabado);
    return (
      minutosTotalesActuales >= aperturaM && minutosTotalesActuales < cierreS
    );
  }

  // 4. Días de semana (Lunes a Viernes: 1 al 5)
  // Turno Mañana
  if (horarios.aperturaManana && horarios.cierreManana) {
    const abreM = convertirAMinutos(horarios.aperturaManana);
    const cierreM = convertirAMinutos(horarios.cierreManana);
    if (minutosTotalesActuales >= abreM && minutosTotalesActuales < cierreM) {
      return true;
    }
  }

  // Turno Tarde
  if (horarios.aperturaTarde && horarios.cierreTarde) {
    const abreT = convertirAMinutos(horarios.aperturaTarde);
    const cierreT = convertirAMinutos(horarios.cierreTarde);
    if (minutosTotalesActuales >= abreT && minutosTotalesActuales < cierreT) {
      return true;
    }
  }

  return false;
};

const convertirAMinutos = (horaStr: string): number => {
  const [horas, minutos] = horaStr.split(":").map(Number);
  return horas * 60 + minutos;
};
