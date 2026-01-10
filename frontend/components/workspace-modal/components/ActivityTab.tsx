"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatActivity } from "@/lib/activity.format";
import type { ActivityItem } from "@/types/activity.types"; // 👈 usa el tipo real
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type ActivityState = {
  isLoading: boolean;
  error: string | null;
  items: ActivityItem[];
  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
};

export default function ActivityTab({ activity }: { activity: ActivityState }) {
  return (
    <Card className="p-4">
      {activity.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando actividad...</p>
      ) : activity.error ? (
        <p className="text-sm text-destructive">{activity.error}</p>
      ) : activity.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no hay actividad.</p>
      ) : (
        <>
          <div className="max-h-[360px] overflow-y-auto pr-2 space-y-2">
            {activity.items.map((it) => (
              <div key={it.id} className="rounded-md border p-3">
                <p className="text-sm font-medium">{formatActivity(it)}</p>

                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(it.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            ))}
          </div>

          {activity.hasMore && (
            <div className="mt-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={activity.loadMore}
                disabled={activity.isLoadingMore}
              >
                {activity.isLoadingMore ? "Cargando..." : "Cargar más"}
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
