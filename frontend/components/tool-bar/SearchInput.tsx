"use client";

import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function SearchInput({ value, onChange }: Props) {
  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      <input
        type="text"
        placeholder="Search tasks..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-secondary/50 border border-border rounded-full py-1.5 pl-9 pr-4 text-sm w-64 focus:ring-1 focus:ring-white/20 focus:bg-secondary transition-all"
      />
    </div>
  );
}
