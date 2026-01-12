export default function TodoHeader() {
  return (
    <header className="rounded-lg shadow-md">
      <div>
        <h1 className="text-6xl text-hero-responsive font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 pb-4">
          Stay focused on what matters.
        </h1>
      </div>

      <p className="text-lg text-subhero-responsive text-muted-foreground w-full font-light">
        Una herramienta diseñada para mantener tu flujo de trabajo limpio,
        organizado y eficiente.
      </p>
    </header>
  );
}
