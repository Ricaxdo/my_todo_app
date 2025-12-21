export default function TodoHeader() {
  return (
    <header className="pt-12 space-y-4">
      <div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          StaiFocus on <br /> what matters.
        </h1>
      </div>
      <p className="text-lg text-muted-foreground w-full font-light">
        Una herramienta diseñada para mantener tu flujo de trabajo limpio,
        organizado y eficiente.
      </p>
    </header>
  );
}
