"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon,
  ListTodo,
  Sparkles,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import * as React from "react";

import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  activeCount: number;
  userActiveCount: number;
  completionRate: number;
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function TodoStats({
  activeCount,
  userActiveCount,
  completionRate,
  selectedDate,
  onChangeDate,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const today = startOfDay(new Date());

  const getEfficiencyColor = (rate: number) => {
    if (rate >= 80) return "text-emerald-500";
    if (rate >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getEfficiencyBg = (rate: number) => {
    if (rate >= 80) return "bg-emerald-500/20";
    if (rate >= 50) return "bg-amber-500/20";
    return "bg-red-500/20";
  };

  const getEfficiencyBarColor = (rate: number) => {
    if (rate >= 80) return "bg-emerald-500";
    if (rate >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Pending Tasks */}
      <div className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-4 transition-all hover:shadow-lg hover:border-primary/30">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500 group-hover:scale-110 transition-transform">
            <ListTodo className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Pendientes
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold tracking-tighter bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-blue-500">
              {activeCount}
            </p>
            <TrendingUp className="w-8 h-8 text-blue-500 mb-1 opacity-70 font-bold" />
          </div>
          <p className="text-sm text-muted-foreground">Tareas activas</p>

          <div className="pt-2 mt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-blue-500/80">
              <User className="w-6 h-6" />
              <span className="text-xl font-bold text-white">
                {userActiveCount}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                Asignadas a ti
              </span>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
      </div>

      {/* Efficiency Rate */}
      <div className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-4 transition-all hover:shadow-lg hover:border-primary/30">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`p-2 rounded-lg ${getEfficiencyBg(
              completionRate
            )} ${getEfficiencyColor(
              completionRate
            )} group-hover:scale-110 transition-transform`}
          >
            <Target className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Eficiencia
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-end gap-2">
            <p
              className={`text-4xl font-bold tracking-tighter ${getEfficiencyColor(
                completionRate
              )}`}
            >
              {completionRate}%
            </p>
            {completionRate >= 80 && (
              <Sparkles className="w-4 h-4 text-emerald-500 mb-1 animate-pulse" />
            )}
          </div>
          <p className="text-sm text-muted-foreground font-medium pt-1">
            Ratio de finalización de tareas
          </p>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary/50">
          <div
            className={`h-full ${getEfficiencyBarColor(
              completionRate
            )} transition-all duration-1000 ease-out shadow-lg`}
            style={{ width: `${completionRate}%` }}
          />
        </div>

        {/* Decorative gradient */}
        <div
          className={`absolute -top-8 -right-8 w-24 h-24 ${getEfficiencyBg(
            completionRate
          )} rounded-full blur-3xl transition-colors`}
        />
      </div>

      {/* Day Filter */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-4 text-left transition-all hover:shadow-lg hover:border-primary/30 cursor-pointer flex flex-col"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-500 group-hover:scale-110 transition-transform">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Día seleccionado
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight capitalize text-purple-500">
            {format(selectedDate, "EEEE", { locale: es })}
          </p>
          <p className="text-sm text-muted-foreground font-medium pt-1">
            {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>

        {/* Click indicator */}
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/50 font-medium group-hover:text-muted-foreground transition-colors">
          Click para cambiar →
        </div>

        {/* Decorative gradient */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Seleccciona una fecha{" "}
            </DialogTitle>
            <DialogDescription className="text-base">
              Filtra tus tareas por día para enfocarte en lo que importa.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center mt-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d: Date | undefined) => {
                if (!d) return;
                onChangeDate(startOfDay(d));
                setOpen(false);
              }}
              disabled={(date: Date) => startOfDay(date) > today}
              initialFocus
              className="rounded-xl border shadow-sm"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
