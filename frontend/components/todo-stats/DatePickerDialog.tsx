// src/features/todo/components/TodoStats/components/DatePickerDialog.tsx
"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as React from "react";
import { startOfDay } from "./utils/todoStats.utils";

type DatePickerDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedDate: Date;

  /** Se dispara cuando el usuario elige una fecha válida */
  onPickDate: (date: Date) => void;
};

export default function DatePickerDialog({
  open,
  onOpenChange,
  selectedDate,
  onPickDate,
}: DatePickerDialogProps) {
  const today = React.useMemo(() => startOfDay(new Date()), []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Seleccciona una fecha
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
              onPickDate(startOfDay(d));
              onOpenChange(false);
            }}
            disabled={(date: Date) => startOfDay(date) > today}
            initialFocus
            className="rounded-xl border shadow-sm"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
