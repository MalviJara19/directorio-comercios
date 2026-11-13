import { Horario } from "../tipos/comercios";

interface HorariosAntiguos {
  aperturaManana?: string | null;
  cierreManana?: string | null;
  aperturaTarde?: string | null;
  cierreTarde?: string | null;
  atiendeSabados?: boolean;
  cierreSabado?: string | null;
}

type Horarios = Horario[] | HorariosAntiguos | null | undefined;

const convertirAMinutos = (hora: string): number => {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
};

export const estaAbiertoAhora = (
  horarios: Horarios,
  fechaActual: Date = new Date(),
): boolean => {
  if (!horarios) return false;

  const dia = fechaActual.getDay();
  const minutos =
    fechaActual.getHours() * 60 + fechaActual.getMinutes();

  if (Array.isArray(horarios)) {
    return horarios.some((horario) => {
      if (horario.dia !== dia) return false;

      return (
        minutos >= convertirAMinutos(horario.abre) &&
        minutos <= convertirAMinutos(horario.cierra)
      );
    });
  }

  if (dia === 0) return false;

  if (dia === 6) {
    if (!horarios.atiendeSabados || !horarios.cierreSabado) {
      return false;
    }

    return (
      !!horarios.aperturaManana &&
      minutos >= convertirAMinutos(horarios.aperturaManana) &&
      minutos <= convertirAMinutos(horarios.cierreSabado)
    );
  }

  const turnos = [
    [horarios.aperturaManana, horarios.cierreManana],
    [horarios.aperturaTarde, horarios.cierreTarde],
  ];

  return turnos.some(([abre, cierra]) => {
    if (!abre || !cierra) return false;

    return (
      minutos >= convertirAMinutos(abre) &&
      minutos <= convertirAMinutos(cierra)
    );
  });
};