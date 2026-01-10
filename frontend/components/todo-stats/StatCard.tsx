// src/features/todo/components/TodoStats/components/StatCard.tsx
"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

type StatCardProps = {
  /** Icon wrapper (ya con sus bg/text si quieres) */
  icon: React.ReactNode;
  /** Etiqueta superior derecha */
  label: string;
  /** Contenido principal del card */
  children: React.ReactNode;

  /** Gradiente decorativo */
  decoClassName?: string;

  /** Si es botón, pasa onClick y type */
  asButton?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";

  className?: string;
};

/**
 * Card base para stats: borde + hover + header (icon + label) + "blob" decorativo.
 * Mantener este “frame” único hace que los otros mini-cards solo definan contenido.
 */
export default function StatCard({
  icon,
  label,
  children,
  decoClassName,
  asButton,
  onClick,
  type = "button",
  className,
}: StatCardProps) {
  const base =
    "group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-4 transition-all hover:shadow-lg hover:border-primary/30";

  const content = (
    <>
      <div className="flex items-center justify-between mb-3">
        {icon}
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </span>
      </div>

      {children}

      {/* Decorative blob (opcional) */}
      {decoClassName ? (
        <div
          className={cn(
            "absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl transition-colors",
            decoClassName
          )}
        />
      ) : null}
    </>
  );

  if (asButton) {
    return (
      <button
        type={type}
        onClick={onClick}
        className={cn(
          base,
          "text-left cursor-pointer flex flex-col",
          className
        )}
      >
        {content}
      </button>
    );
  }

  return <div className={cn(base, className)}>{content}</div>;
}
