"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function WorkspaceLoading({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:max-w-[600px] max-h-[85vh] overflow-hidden gap-6">
        <DialogHeader>
          <DialogTitle>Workspace</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">
              Cargando workspace...
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
