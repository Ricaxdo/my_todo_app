import { cn } from "@/lib/utils";

/**
 * Estilos de chip (pill) según si está activo.
 * Centralizarlo evita 3 templates repetidos.
 */
export function chipClass(isActive: boolean) {
  return cn(
    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm max-[349px]:text-xs font-medium transition-all",
    isActive
      ? "bg-white text-black shadow-sm"
      : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
  );
}
