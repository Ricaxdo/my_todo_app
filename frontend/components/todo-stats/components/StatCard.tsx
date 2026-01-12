"use client";

import { cn } from "@/lib/utils";
import type * as React from "react";

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;

  decoClassName?: string;

  asButton?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";

  className?: string;
};

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
    "group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-4 w-full min-w-0 transition-all hover:shadow-lg hover:border-primary/30";

  const content = (
    <>
      <div className="flex items-center justify-between mb-3 min-w-0 gap-3">
        <div className="shrink-0">{icon}</div>

        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase truncate">
          {label}
        </span>
      </div>

      {children}

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
