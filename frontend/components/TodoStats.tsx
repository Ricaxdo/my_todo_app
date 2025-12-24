// src/components/todo/TodoStats.tsx
"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, ListTodo } from "lucide-react";
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
  completionRate,
  selectedDate,
  onChangeDate,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const today = startOfDay(new Date());

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Pending */}
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-secondary text-primary">
            <ListTodo className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            PENDING
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-4xl font-bold tracking-tighter">{activeCount}</p>
          <p className="text-sm text-muted-foreground">Tasks waiting for you</p>
        </div>
      </div>

      {/* Efficiency */}
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-secondary text-primary">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            EFFICIENCY
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-4xl font-bold tracking-tighter">
            {completionRate}%
          </p>
          <p className="text-sm text-muted-foreground">
            Completion rate for this day
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
          <div
            className="h-full bg-white transition-all duration-1000 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Day Filter (Modal) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-secondary text-primary">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            DAY FILTER
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-2xl font-medium tracking-tight">
            {format(selectedDate, "EEEE d", { locale: es })}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(selectedDate, "MMMM yyyy", { locale: es })}
          </p>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-auto p-4">
          <DialogHeader>
            <DialogTitle>Selecciona una fecha</DialogTitle>
            <DialogDescription>Filtra tus tareas por día.</DialogDescription>
          </DialogHeader>

          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d: Date | undefined) => {
                if (!d) return;
                onChangeDate(startOfDay(d));
                setOpen(false); // ✅ cierra al elegir
              }}
              disabled={(date: Date) => startOfDay(date) > today}
              initialFocus
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
