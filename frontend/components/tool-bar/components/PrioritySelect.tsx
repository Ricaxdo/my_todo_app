"use client";

import { SlidersHorizontal } from "lucide-react";
import type { PriorityFilter } from "../types/toolbar.types";

type Props = {
  value: PriorityFilter;
  onChange: (v: PriorityFilter) => void;
};

export default function PrioritySelect({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PriorityFilter)}
        className="bg-secondary/50 border border-border rounded-full px-3 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-white/20 transition-all cursor-pointer hover:bg-secondary"
      >
        <option value="all">All Priorities</option>
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>
    </div>
  );
}
