import type { LucideProps } from "lucide-react";
import {
  Book,
  Briefcase,
  Calendar,
  Camera,
  Code2,
  Coffee,
  Dumbbell,
  Folder,
  Gamepad2,
  Heart,
  Home,
  Laptop,
  MapPin,
  Music,
  Palette,
  Plane,
  Rocket,
  School,
  Shield,
  ShoppingCart,
  Sparkles,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { ComponentType } from "react";
import type { IconId } from "../types/workspaces.types";

export type IconItem = {
  id: IconId;
  label: string;
  Icon: ComponentType<LucideProps>;
};

export const ICONS: IconItem[] = [
  { id: "home", label: "Casa", Icon: Home },
  { id: "team", label: "Equipo", Icon: Users },
  { id: "work", label: "Trabajo", Icon: Briefcase },
  { id: "rocket", label: "Proyecto", Icon: Rocket },
  { id: "sparkles", label: "Personalizado", Icon: Sparkles },

  { id: "coffee", label: "Café", Icon: Coffee },
  { id: "heart", label: "Salud", Icon: Heart },
  { id: "gym", label: "Gym", Icon: Dumbbell },
  { id: "shop", label: "Compras", Icon: ShoppingCart },
  { id: "book", label: "Estudio", Icon: Book },

  { id: "folder", label: "Carpeta", Icon: Folder },
  { id: "calendar", label: "Calendario", Icon: Calendar },
  { id: "code", label: "Código", Icon: Code2 },
  { id: "design", label: "Diseño", Icon: Palette },
  { id: "music", label: "Música", Icon: Music },

  { id: "games", label: "Juegos", Icon: Gamepad2 },
  { id: "tools", label: "Herramientas", Icon: Wrench },
  { id: "travel", label: "Viaje", Icon: Plane },
  { id: "school", label: "Escuela", Icon: School },
  { id: "security", label: "Seguridad", Icon: Shield },

  { id: "location", label: "Ubicación", Icon: MapPin },
  { id: "camera", label: "Fotos", Icon: Camera },
  { id: "laptop", label: "Tecnología", Icon: Laptop },
  { id: "wallet", label: "Finanzas", Icon: Wallet },
];

export const DEFAULT_TAB = "create" as const;
export const DEFAULT_ICON_ID = "team" as const;

export const NAME_MIN = 2;
export const NAME_MAX = 60;
export const JOIN_MIN = 4;
export const JOIN_MAX = 12;
