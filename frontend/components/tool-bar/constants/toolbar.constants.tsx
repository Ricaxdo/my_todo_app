import { CheckCheck, CheckCircle2, Circle } from "lucide-react";
import type { Filter } from "../types/toolbar.types";

export const STATUS_ITEMS: Array<{
  value: Filter;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "all", label: "Todas", Icon: CheckCheck },
  { value: "active", label: "Activas", Icon: Circle },
  { value: "completed", label: "Completadas", Icon: CheckCircle2 },
];
