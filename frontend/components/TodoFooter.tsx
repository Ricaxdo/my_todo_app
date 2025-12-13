export default function TodoFooter() {
  return (
    <footer className="border-t border-border pt-8 text-sm text-muted-foreground space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-foreground font-medium mb-2">
            About this Project
          </h3>
          <p className="leading-relaxed max-w-md">
            Este ToDo list utiliza React y TypeScript con Tailwind CSS v4.
            Implementa un diseño de Bento Grid para las métricas y utiliza un
            estado local optimista para una respuesta instantánea sincronizada
            con un backend en Express.
          </p>
        </div>
        <div>
          <h3 className="text-foreground font-medium mb-2">Key Features</h3>
          <ul className="grid grid-cols-2 gap-2">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Optimistic UI
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Dark Mode First
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Responsive Grid
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              TypeScript Strict
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
