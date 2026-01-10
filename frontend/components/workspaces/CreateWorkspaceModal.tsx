"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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

import { UserPlus } from "lucide-react";

import { useMemo, useState } from "react";

type TabKey = "create" | "join";

type IconId =
  | "home"
  | "team"
  | "work"
  | "rocket"
  | "sparkles"
  | "coffee"
  | "heart"
  | "gym"
  | "shop"
  | "book"
  | "folder"
  | "calendar"
  | "code"
  | "design"
  | "music"
  | "games"
  | "tools"
  | "travel"
  | "school"
  | "location"
  | "camera"
  | "laptop"
  | "wallet"
  | "security";

const ICONS: { id: IconId; label: string; Icon: React.ElementType }[] = [
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

export function CreateWorkspaceModal({
  open,
  onOpenChange,
  maxReached,
  onCreate,
  onJoin,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  maxReached: boolean;
  onCreate: (payload: { name: string; iconId: IconId }) => Promise<void> | void;

  // ✅ nuevo
  onJoin: (inviteCode: string) => Promise<void> | void;
}) {
  const [tab, setTab] = useState<TabKey>("create");

  // CREATE state
  const [name, setName] = useState("");
  const [iconId, setIconId] = useState<IconId>("team");
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // JOIN state
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);

  const canCreate = useMemo(() => {
    const n = name.trim();
    return !maxReached && n.length >= 2 && n.length <= 60 && !isSaving;
  }, [name, maxReached, isSaving]);

  const canJoin = useMemo(() => {
    return !joining && joinCode.trim().length >= 4;
  }, [joining, joinCode]);

  const closeAndReset = () => {
    onOpenChange(false);

    // reset UI
    setTab("create");
    setName("");
    setIconId("team");
    setIsSaving(false);
    setCreateError(null);

    setJoinCode("");
    setJoining(false);
    setJoinMsg(null);
  };

  const submitCreate = async () => {
    setCreateError(null);

    if (maxReached) {
      setCreateError("Ya tienes 2 workspaces. No puedes crear otro.");
      return;
    }

    const clean = name.trim();
    if (clean.length < 2)
      return setCreateError("El nombre debe tener al menos 2 caracteres.");
    if (clean.length > 60)
      return setCreateError("El nombre no puede exceder 60 caracteres.");

    try {
      setIsSaving(true);
      await onCreate({ name: clean, iconId });
      closeAndReset();
    } catch (e: unknown) {
      setCreateError(
        e instanceof Error ? e.message : "No se pudo crear el workspace"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const submitJoin = async () => {
    const clean = joinCode.trim().toUpperCase();
    if (!clean) return;

    setJoinMsg(null);
    try {
      setJoining(true);
      await onJoin(clean);
      setJoinMsg("✅ Te uniste al workspace");
      // opcional: cerrar modal automáticamente
      closeAndReset();
    } catch (e: unknown) {
      setJoinMsg(e instanceof Error ? e.message : "No se pudo unir");
    } finally {
      setJoining(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        // si cierras con overlay/esc, resetea
        if (!v) closeAndReset();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="sm:max-w-[560px] gap-5">
        <DialogHeader>
          <DialogTitle>Workspaces</DialogTitle>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as TabKey)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Crear
            </TabsTrigger>
            <TabsTrigger value="join" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Unirse
            </TabsTrigger>
          </TabsList>

          {/* ===================== CREATE ===================== */}
          <TabsContent value="create" className="space-y-4 pt-4">
            {maxReached ? (
              <Card className="p-4 border-dashed">
                <p className="text-sm font-medium">Límite alcanzado</p>
                <p className="text-sm text-muted-foreground">
                  Ya tienes personal + adicional. No puedes crear otro.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Aún puedes ir a la pestaña <b>Unirse</b> si tienes un código.
                </p>
              </Card>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Casa, Roomies, Equipo"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {name.trim().length}/60
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Ícono</p>

                  <div className="grid grid-cols-5 min-[420px]:grid-cols-6 sm:grid-cols-8 gap-2 place-items-center">
                    {ICONS.map((it) => {
                      const selected = it.id === iconId;
                      return (
                        <button
                          key={it.id}
                          type="button"
                          onClick={() => setIconId(it.id)}
                          className={cn(
                            // ✅ tamaño fijo cuadrado + centrado
                            "h-12 w-12 rounded-md border transition-all flex items-center justify-center",
                            "hover:bg-accent/50",
                            // ✅ anillo/estilo cuando está seleccionado
                            selected
                              ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                              : "border-border"
                          )}
                          aria-label={it.label}
                          title={it.label}
                        >
                          <it.Icon
                            className={cn(
                              "h-5 w-5",
                              selected
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {createError && (
                  <Card className="p-3 border-destructive/50 bg-destructive/10">
                    <p className="text-sm">{createError}</p>
                  </Card>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={closeAndReset}>
                    Cancelar
                  </Button>

                  <Button
                    onClick={submitCreate}
                    disabled={!canCreate}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Creando...
                      </>
                    ) : (
                      "Crear"
                    )}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* ===================== JOIN ===================== */}
          <TabsContent value="join" className="space-y-4 pt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Ingresa el código de invitación para unirte a un workspace
                existente
              </p>

              <div className="flex gap-2 mb-5">
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC123XYZ"
                  maxLength={12}
                  className="font-mono uppercase"
                />

                <Button
                  onClick={submitJoin}
                  disabled={!canJoin}
                  className="gap-2"
                >
                  {joining ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Uniendo...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Unirme
                    </>
                  )}
                </Button>
              </div>
            </div>

            {joinMsg && (
              <Card
                className={cn(
                  "p-10",
                  joinMsg.startsWith("✅")
                    ? "border-green-500/50 bg-green-500/10"
                    : "border-destructive/50 bg-destructive/10"
                )}
              >
                <p className="text-sm">{joinMsg}</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
