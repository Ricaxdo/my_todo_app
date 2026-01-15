"use client";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full border border-border rounded-2xl p-6 bg-card">
        <h2 className="text-xl font-semibold">Algo falló en el dashboard</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Intenta recargar. Si sigue fallando, revisa tu conexión o vuelve a
          iniciar sesión.
        </p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
          >
            Reintentar
          </button>
        </div>

        <pre className="mt-4 text-xs text-muted-foreground whitespace-pre-wrap">
          {error.message}
        </pre>
      </div>
    </div>
  );
}
