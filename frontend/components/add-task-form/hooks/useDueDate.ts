import { addWeeks } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import type { DueDateOption } from "../types/addTaskForm.types";
import { startOfDay } from "../utils/addTaskForm.utils";

/**
 * Hook para manejar la fecha de vencimiento (due date) con 3 modos:
 * - today: hoy (inicio del día)
 * - week: hoy + 1 semana
 * - custom: una fecha elegida por el usuario
 *
 * Devuelve estado para UI (popover, opción seleccionada) y sincroniza
 * la fecha efectiva hacia el padre solo cuando realmente cambia.
 */
export function useDueDate(params: {
  dueDate: Date;
  setDueDate: (d: Date) => void;
}) {
  const { dueDate, setDueDate } = params;

  /** Opción seleccionada (controla el modo de cálculo) */
  const [dueDateOption, setDueDateOption] = useState<DueDateOption>("today");

  /** Fecha manual cuando la opción es "custom" */
  const [customDate, setCustomDate] = useState<Date>(() => startOfDay(dueDate));

  /** Estado de UI: popover/calendario abierto */
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  /**
   * "Hoy" estable:
   * Se memoiza para que no cambie entre renders dentro de la misma sesión del componente,
   * evitando recalcular effectiveDate por renders normales.
   */
  const today = useMemo(() => startOfDay(new Date()), []);

  /**
   * Fecha efectiva según la opción actual:
   * - today: hoy
   * - week: hoy + 1 semana
   * - custom: fecha elegida
   */
  const effectiveDate = useMemo(() => {
    if (dueDateOption === "today") return today;
    if (dueDateOption === "week") return addWeeks(today, 1);
    return customDate;
  }, [dueDateOption, customDate, today]);

  /**
   * Sincronización con el parent:
   * Solo se empuja el cambio si la fecha efectiva realmente cambió (por timestamp),
   * para evitar loops / renders extra (y respetar "startOfDay").
   */
  useEffect(() => {
    const next = effectiveDate.getTime();
    const curr = startOfDay(dueDate).getTime();
    if (curr !== next) setDueDate(effectiveDate);
  }, [effectiveDate, dueDate, setDueDate]);

  /**
   * Handler del calendario:
   * Normaliza la fecha a inicio de día, cambia a modo "custom"
   * y cierra el popover.
   */
  const handleCustomDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setCustomDate(startOfDay(date));
    setDueDateOption("custom");
    setIsDatePopoverOpen(false);
  };

  return {
    today,
    dueDateOption,
    setDueDateOption,
    customDate,
    setCustomDate,
    effectiveDate,
    isDatePopoverOpen,
    setIsDatePopoverOpen,
    handleCustomDateSelect,
  };
}
