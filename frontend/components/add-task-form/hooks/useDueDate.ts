import { addWeeks } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import type { DueDateOption } from "../types/addTaskForm.types";
import { startOfDay } from "../utils/addTaskForm.utils";

export function useDueDate(params: {
  dueDate: Date;
  setDueDate: (d: Date) => void;
}) {
  const { dueDate, setDueDate } = params;

  const [dueDateOption, setDueDateOption] = useState<DueDateOption>("today");
  const [customDate, setCustomDate] = useState<Date>(() => startOfDay(dueDate));
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  // ✅ estable (no cambia entre renders)
  const today = useMemo(() => startOfDay(new Date()), []);

  // ✅ fecha efectiva según opción seleccionada
  const effectiveDate = useMemo(() => {
    if (dueDateOption === "today") return today;
    if (dueDateOption === "week") return addWeeks(today, 1);
    return customDate;
  }, [dueDateOption, customDate, today]);

  // ✅ empuja al parent solo si cambió realmente
  useEffect(() => {
    const next = effectiveDate.getTime();
    const curr = startOfDay(dueDate).getTime();
    if (curr !== next) setDueDate(effectiveDate);
  }, [effectiveDate, dueDate, setDueDate]);

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
