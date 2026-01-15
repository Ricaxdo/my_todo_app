"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy, UserPlus } from "lucide-react";

export default function InviteCodeCard({
  inviteCode,
  copied,
  onCopy,
}: {
  inviteCode: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <Card className="border-dashed bg-muted/30 p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Código de invitación</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <code className="min-w-0 w-full sm:flex-1 break-all rounded-md bg-background px-3 py-2 font-mono text-sm font-semibold tracking-wider">
            {inviteCode}
          </code>

          <Button
            size="sm"
            variant={copied ? "default" : "outline"}
            onClick={onCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copiar
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Comparte este código para invitar a otros a tu workspace
        </p>
      </div>
    </Card>
  );
}
