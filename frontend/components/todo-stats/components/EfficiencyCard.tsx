"use client";

import { Sparkles, Target } from "lucide-react";
import { efficiencyStyles } from "../utils/todoStats.utils";
import StatCard from "./StatCard";

type EfficiencyCardProps = {
  completionRate: number; // 0..100
};

export default function EfficiencyCard({
  completionRate,
}: EfficiencyCardProps) {
  const s = efficiencyStyles(completionRate);

  return (
    <StatCard
      label="Eficiencia"
      icon={
        <div
          className={`p-2 rounded-lg ${s.bg} ${s.text} group-hover:scale-110 transition-transform`}
        >
          <Target className="w-5 h-5" />
        </div>
      }
      decoClassName={s.bg}
    >
      <div className="space-y-1">
        <div className="flex items-end gap-2">
          <p className={`text-4xl font-bold tracking-tighter ${s.text}`}>
            {completionRate}%
          </p>

          {/* “Easter egg” cuando está alto */}
          {completionRate >= 80 ? (
            <Sparkles className="w-4 h-4 text-emerald-500 mb-1 animate-pulse" />
          ) : null}
        </div>

        <p className="text-sm text-muted-foreground font-medium pt-1">
          Ratio de finalización de tareas
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary/50">
        <div
          className={`h-full ${s.bar} transition-all duration-1000 ease-out shadow-lg`}
          style={{ width: `${completionRate}%` }}
        />
      </div>
    </StatCard>
  );
}
