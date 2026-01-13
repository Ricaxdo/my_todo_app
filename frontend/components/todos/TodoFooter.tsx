"use client";

import { ArrowUpRight, Code2, Palette } from "lucide-react";

type TodoFooterProps = {
  onBack: () => void;
};

export default function TodoFooter({ onBack }: TodoFooterProps) {
  return (
    <footer className="h-[100dvh] w-full bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      <div className="relative h-full">
        <div
          className="
            max-w-[1200px] mx-auto px-6
            pt-6 pb-0 lg:pt-8
            h-full
            flex flex-col
            min-h-0
          "
        >
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [webkit-overflow-scrolling:touch]">
            {/* Header */}
            <div className="mb-6 lg:mb-7">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
                Sobre el Proyecto
              </p>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance leading-tight mb-3 lg:mb-4">
                Una experiencia de gestión instantánea y fluida.
              </h1>

              <p className="text-base lg:text-lg text-muted-foreground max-w-2xl leading-relaxed text-pretty">
                Este dashboard de tareas combina actualizaciones optimistas con
                un diseño moderno, ofreciendo feedback inmediato y una
                experiencia de usuario excepcional.
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 pb-6">
              {/* Card 1 */}
              <div className="group relative rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 lg:p-7 hover:border-border transition-all duration-300">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  <h2 className="text-xl font-semibold mb-4 text-foreground">
                    Stack Tecnológico
                  </h2>

                  <div className="space-y-3">
                    <div className="group/item p-3 rounded-xl border border-border/40 bg-background/40 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground/70 mb-1">
                            Frontend
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            Next.js 16 + TypeScript
                          </p>
                        </div>
                        <Code2 className="w-4 h-4 text-muted-foreground/50" />
                      </div>
                    </div>

                    <div className="group/item p-3 rounded-xl border border-border/40 bg-background/40 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground/70 mb-1">
                            Diseño
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            Tailwind v4 + shadcn/ui
                          </p>
                        </div>
                        <Palette className="w-4 h-4 text-muted-foreground/50" />
                      </div>
                    </div>

                    <div className="group/item p-3 rounded-xl border border-border/40 bg-background/40 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground/70 mb-1">
                            Backend
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            Express + API REST
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground/50" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 lg:p-7 hover:border-border transition-all duration-300">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  <h2 className="text-xl font-semibold mb-4 text-foreground">
                    Características Clave
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="group/feature p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        Optimistic UI
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Respuesta instantánea antes de la confirmación del
                        servidor
                      </p>
                    </div>

                    <div className="group/feature p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        Dark Mode
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Tema oscuro con sistema de colores consistente
                      </p>
                    </div>

                    <div className="group/feature p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        Bento Layout
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Diseño adaptativo inspirado en interfaces modernas
                      </p>
                    </div>

                    <div className="group/feature p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        TypeScript
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Type safety completa para mayor confiabilidad
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground/60 leading-relaxed">
                    Arquitectura components-first con separación clara entre
                    lógica y UI
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 pb-6 lg:pb-8 shrink-0">
            <button
              onClick={onBack}
              className="group inline-flex items-center gap-3 rounded-2xl bg-foreground text-background px-7 py-3 font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-foreground/10"
            >
              <span>Volver al Dashboard</span>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
