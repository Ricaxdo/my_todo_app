// src/components/workspaces/CreateWorkspaceModal/CreateWorkspaceModal.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, UserPlus } from "lucide-react";

import CreateTab from "./components/CreateTab";
import JoinTab from "./components/JoinTab";
import { useCreateWorkspaceModal } from "./hooks/workspaces.hooks";
import type { CreateWorkspaceModalProps } from "./types/workspaces.types";

export function CreateWorkspaceModal(props: CreateWorkspaceModalProps) {
  const { open, onOpenChange, maxReached, onCreate, onJoin } = props;

  const m = useCreateWorkspaceModal({
    onOpenChange,
    maxReached,
    onCreate,
    onJoin,
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        // Si cierras con overlay/esc, resetea.
        if (!v) m.closeAndReset();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="sm:max-w-[560px] gap-5">
        <DialogHeader>
          <DialogTitle>Workspaces</DialogTitle>
        </DialogHeader>

        <Tabs
          value={m.tab}
          onValueChange={(v) => m.setTab(v as "create" | "join")}
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

          <TabsContent value="create" className="space-y-4 pt-4">
            <CreateTab
              maxReached={maxReached}
              name={m.name}
              onChangeName={m.setName}
              iconId={m.iconId}
              onChangeIconId={m.setIconId}
              canCreate={m.canCreate}
              isSaving={m.isSaving}
              createError={m.createError}
              onCancel={m.closeAndReset}
              onSubmit={m.submitCreate}
            />
          </TabsContent>

          <TabsContent value="join" className="space-y-4 pt-4">
            <JoinTab
              joinCode={m.joinCode}
              onChangeJoinCode={m.setJoinCode}
              canJoin={m.canJoin}
              joining={m.joining}
              onSubmit={m.submitJoin}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default CreateWorkspaceModal;
