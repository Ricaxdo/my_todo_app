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

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Tareas activas</p>

          <div className="flex items-center gap-1.5 text-blue-500/80">
            <User className="w-4 h-4" />
            <span className="text-lg font-bold text-white">
              {userActiveCount}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              asignadas
            </span>
          </div>
        </div>
      </div>
    </StatCard>
  );
}
