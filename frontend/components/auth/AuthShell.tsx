"use client";

import { CheckCircle2 } from "lucide-react";
import type React from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  maxWidthClassName?: string; // por si Signup quiere más ancho
};

export default function AuthShell({
  title,
  subtitle,
  children,
  maxWidthClassName = "max-w-md",
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-[0.05]" />

      <div
        className={`relative w-full ${maxWidthClassName} shadow-[0_0_24px_rgba(255,255,255,0.2)] rounded-2xl`}
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          {/* Brand */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-b from-white via-zinc-200 to-zinc-400 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-zinc-700" />
              </div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-b from-black via-neutral-800 to-neutral-700 bg-clip-text text-transparent">
                StaiFocus
              </h1>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-balance">
              {title}
            </h2>
            <p className="text-muted-foreground text-pretty">{subtitle}</p>
          </div>

          {children}
        </div>

        <div className="absolute -top-24 -right-24 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}
