"use client";

import { ArrowUpDown } from "lucide-react";
import type { SortOption } from "../types/toolbar.types";

type Props = {
  value: SortOption;
  onChange: (v: SortOption) => void;
};

export default function SortSelect({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-muted-foreground" />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="bg-secondary/50 border border-border rounded-full px-3 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-white/20 transition-all cursor-pointer hover:bg-secondary"
      >
        <option value="date-asc">Oldest First</option>
        <option value="date-desc">Newest First</option>
        <option value="priority">Priority</option>
      </select>
    </div>
  );
}
