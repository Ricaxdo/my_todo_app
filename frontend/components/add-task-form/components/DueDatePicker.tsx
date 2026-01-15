"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronDown } from "lucide-react";

import { startOfDay } from "../utils/addTaskForm.utils";

type Props = {
  /**
   * Estado/control externo (viene del hook useDueDate).
   * Este componente solo renderiza UI y dispara eventos.
   */
  due: {
    dueDateOption: "today" | "week" | "custom";
    setDueDateOption: (v: "today" | "week" | "custom") => void;
    customDate: Date;
    isDatePopoverOpen: boolean;
    setIsDatePopoverOpen: (v: boolean) => void;
    handleCustomDateSelect: (d: Date | undefined) => void;
  };
};

/**
 * Selector de vencimiento con 3 presets (Hoy / 1 Semana / Custom).
 * UI controlada: el estado vive arriba (hook / parent).
 */
export default function DueDatePicker({ due }: Props) {
  const {
    dueDateOption,
    setDueDateOption,
    customDate,
    isDatePopoverOpen,
    setIsDatePopoverOpen,
    handleCustomDateSelect,
  } = due;

  /**
   * Label que se muestra en el trigger:
   * - Presets: texto fijo
   * - Custom: fecha formateada (locale español)
   */
  const getLabel = () => {
    if (dueDateOption === "today") return "Hoy";
    if (dueDateOption === "week") return "1 Semana";
    return format(customDate, "d MMM", { locale: es });
  };

  return (
    <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
      <PopoverTrigger asChild>
        {/* Trigger compacto estilo "chip" */}
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/40 hover:border-border transition-all text-sm max-[349px]:text-xs font-medium text-foreground/80 hover:text-foreground shrink-0"
        >
          <CalendarIcon className="w-4 h-4" />
          <span>{getLabel()}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          {/* Presets rápidos: cambian el modo de cálculo en el hook */}
          <div className="p-2 border-b border-border space-y-1">
            <button
              type="button"
              onClick={() => setDueDateOption("today")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                dueDateOption === "today"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-secondary"
              }`}
            >
              Hoy
            </button>

            <button
              type="button"
              onClick={() => setDueDateOption("week")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                dueDateOption === "week"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-secondary"
              }`}
            >
              1 Semana
            </button>

            <button
              type="button"
              onClick={() => setDueDateOption("custom")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                dueDateOption === "custom"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-secondary"
              }`}
            >
              Elige el día
            </button>
          </div>

          {/* Calendario solo cuando el modo es custom */}
          {dueDateOption === "custom" && (
            <div className="p-3">
              <Calendar
                mode="single"
                selected={customDate}
                onSelect={handleCustomDateSelect}
                /**
                 * Regla UX:
                 * No permitir fechas pasadas (normalizado a startOfDay para evitar bugs por hora).
                 */
                disabled={(date: Date) =>
                  startOfDay(date) < startOfDay(new Date())
                }
                initialFocus
                locale={es}
                className="rounded-md border-0"
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
