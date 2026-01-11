/**
 * Normaliza una fecha a las 00:00:00 para comparar por día (sin horas).
 */
export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Devuelve clases Tailwind para representar "eficiencia" por rangos.
 * Mantenerlo centralizado evita duplicación.
 */
export function efficiencyStyles(rate: number) {
  if (rate >= 80) {
    return {
      text: "text-emerald-500",
      bg: "bg-emerald-500/20",
      bar: "bg-emerald-500",
    };
  }

  if (rate >= 50) {
    return {
      text: "text-amber-500",
      bg: "bg-amber-500/20",
      bar: "bg-amber-500",
    };
  }

  return {
    text: "text-red-500",
    bg: "bg-red-500/20",
    bar: "bg-red-500",
  };
}
