"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  max?: Date;
};

export function DatePickerCard({ value, onChange, max = new Date() }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* tu card clickable */}
        <button
          type="button"
          className={cn(
            "group relative overflow-hidden rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/20"
          )}
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
              {format(value, "EEEE d", { locale: es })}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(value, "MMMM yyyy", { locale: es })}
            </p>
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-3" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            if (!d) return;
            onChange(d);
          }}
          disabled={(date) => date > max}
          initialFocus
        />

        <div className="pt-3 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onChange(new Date())}
          >
            Hoy
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
