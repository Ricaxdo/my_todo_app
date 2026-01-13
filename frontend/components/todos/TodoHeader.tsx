"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Props = {
  onCollapsedChange?: (collapsed: boolean) => void;
};

export default function TodoHeader({ onCollapsedChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    onCollapsedChange?.(collapsed);
  }, [collapsed, onCollapsedChange]);

  return (
    <header
      onClick={() => setCollapsed((v) => !v)}
      className="rounded-lg  cursor-pointer select-none"
      title="👀 click"
    >
      <div>
        <h1
          className={cn(
            "font-bold  from-white to-black transition-all duration-300 ease-out",
            collapsed
              ? "text-3xl font-bold pb-1"
              : "text-6xl text-hero-responsive pb-4"
          )}
        >
          Stay focused on what matters.
        </h1>
      </div>

      <p
        className={cn(
          "text-lg text-subhero-responsive text-muted-foreground w-full font-light overflow-hidden transition-all duration-300 ease-out",
          collapsed ? "max-h-0 opacity-0" : "max-h-40 opacity-100"
        )}
      >
        Una herramienta diseñada para mantener tu flujo de trabajo limpio,
        organizado y eficiente.
      </p>
    </header>
  );
}
