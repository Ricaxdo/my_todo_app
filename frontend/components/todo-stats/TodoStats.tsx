// src/features/todo/components/TodoStats/TodoStats.tsx
"use client";

import * as React from "react";
import type { TodoStatsProps } from "./types/todoStats.types";

import DatePickerDialog from "./DatePickerDialog";
import DayFilterCard from "./DayFilterCard";
import EfficiencyCard from "./EfficiencyCard";
import PendingCard from "./PendingCard";

/**
 * TodoStats: muestra 3 tarjetas:
 * 1) Pendientes (totales + asignadas a ti)
 * 2) Eficiencia (completion rate con barra)
 * 3) Filtro por día (abre calendario)
 */
export default function TodoStats({
  activeCount,
  userActiveCount,
  completionRate,
  selectedDate,
  onChangeDate,
}: TodoStatsProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <PendingCard
        activeCount={activeCount}
        userActiveCount={userActiveCount}
      />

      <EfficiencyCard completionRate={completionRate} />

      <DayFilterCard selectedDate={selectedDate} onOpen={() => setOpen(true)} />

      <DatePickerDialog
        open={open}
        onOpenChange={setOpen}
        selectedDate={selectedDate}
        onPickDate={onChangeDate}
      />
    </section>
  );
}
