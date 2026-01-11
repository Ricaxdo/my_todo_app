"use client";

import { ConfirmActionDialog } from "@/components/create-workspace-modal/ConfirmActionDialog";
import type { Member } from "../types/workspaceModal.types";

export default function RemoveMemberDialog({
  open,
  onOpenChange,
  member,
  loading,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  member: Member | null;
  loading: boolean;
  onConfirm: () => void;
}) {
  const title = "Remover miembro";
  const description = member
    ? `¿Seguro que quieres remover a ${member.name}${
        member.lastName ? ` ${member.lastName}` : ""
      } del workspace?`
    : "¿Seguro que quieres remover a este miembro?";

  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText="Sí, remover"
      cancelText="Cancelar"
      variant="destructive"
      loading={loading}
      onConfirm={onConfirm}
    />
  );
}
