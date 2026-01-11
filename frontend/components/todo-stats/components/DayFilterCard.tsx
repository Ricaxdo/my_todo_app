"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import StatCard from "./StatCard";

type DayFilterCardProps = {
  selectedDate: Date;
  onOpen: () => void;
};

export default function DayFilterCard({
  selectedDate,
  onOpen,
}: DayFilterCardProps) {
  return (
    <StatCard
      asButton
      onClick={onOpen}
      label="Día seleccionado"
      icon={
        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-500 group-hover:scale-110 transition-transform">
          <CalendarIcon className="w-5 h-5" />
        </div>
      }
      decoClassName="bg-purple-500/10 group-hover:bg-purple-500/20"
    >
      <div className="space-y-1">
        <p className="text-3xl font-bold tracking-tight capitalize text-purple-500">
          {format(selectedDate, "EEEE", { locale: es })}
        </p>
        <p className="text-sm text-muted-foreground font-medium pt-1">
          {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/50 font-medium group-hover:text-muted-foreground transition-colors">
        Click para cambiar →
      </div>
    </StatCard>
  );
}
