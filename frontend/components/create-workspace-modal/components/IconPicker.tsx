"use client";

import { cn } from "@/lib/utils";
import type { IconItem } from "../constants/workspaces.constants";
import type { IconId } from "../types/workspaces.types";

type Props = {
  items: IconItem[];
  value: IconId;
  onChange: (id: IconId) => void;
};

export default function IconPicker({ items, value, onChange }: Props) {
  return (
    <div className="grid grid-cols-5 min-[420px]:grid-cols-6 sm:grid-cols-8 gap-2 place-items-center">
      {items.map((it) => {
        const selected = it.id === value;

        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            className={cn(
              "h-12 w-12 rounded-md border transition-all flex items-center justify-center",
              "hover:bg-accent/50",
              selected
                ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                : "border-border"
            )}
            aria-label={it.label}
            title={it.label}
          >
            <it.Icon
              className={cn(
                "h-5 w-5",
                selected ? "text-primary" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
