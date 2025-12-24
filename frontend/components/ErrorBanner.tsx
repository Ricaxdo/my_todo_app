"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle } from "lucide-react";

type ErrorBannerProps = {
  title?: string;
  message: unknown; // 👈 antes: string | null
  onClose?: () => void;
};

function toErrorString(err: unknown): string | null {
  if (!err) return null;

  if (typeof err === "string") return err;

  if (err instanceof Error) return err.message;

  if (typeof err === "object") {
    const anyErr = err as Record<string, unknown>;
    const msg = anyErr.message;
    if (typeof msg === "string") return msg;

    // fallback por si llega algo raro
    try {
      return JSON.stringify(err);
    } catch {
      return "Unexpected error";
    }
  }

  return String(err);
}

export default function ErrorBanner({
  title = "Something went wrong",
  message,
  onClose,
}: ErrorBannerProps) {
  const text = toErrorString(message);
  if (!text) return null;

  return (
    <Alert className="mb-4 border-red-500/40 bg-red-500/10 flex">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <XCircle className="mt-0.5 h-5 w-5 text-red-500" />
          <div className="flex gap-2 flex-col">
            <AlertTitle className="text-red-500">{title}</AlertTitle>
            <AlertDescription className="text-red-500/90">
              {text}
            </AlertDescription>
          </div>
        </div>
      </div>
    </Alert>
  );
}
