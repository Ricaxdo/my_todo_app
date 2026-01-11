"use client";

import { ListTodo, TrendingUp, User } from "lucide-react";
import StatCard from "./StatCard";

type PendingCardProps = {
  activeCount: number;
  userActiveCount: number;
};

export default function PendingCard({
  activeCount,
  userActiveCount,
}: PendingCardProps) {
  return (
    <StatCard
      label="Pendientes"
      icon={
        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500 group-hover:scale-110 transition-transform">
          <ListTodo className="w-5 h-5" />
        </div>
      }
      decoClassName="bg-blue-500/10 group-hover:bg-blue-500/20"
    >
      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <p className="text-4xl font-bold tracking-tighter bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-blue-500">
            {activeCount}
          </p>
          <TrendingUp className="w-8 h-8 text-blue-500 mb-1 opacity-70 font-bold" />
        </div>

        <p className="text-sm text-muted-foreground">Tareas activas</p>

        {/* Sub-bloque “Asignadas a ti” */}
        <div className="pt-2 mt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-blue-500/80">
            <User className="w-6 h-6" />
            <span className="text-xl font-bold text-white">
              {userActiveCount}
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              Asignadas a ti
            </span>
          </div>
        </div>
      </div>
    </StatCard>
  );
}
