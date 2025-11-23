import { Calendar, Clock, ListTodo } from "lucide-react";

type Props = {
  activeCount: number;
  completionRate: number;
};

export default function TodoStats({ activeCount, completionRate }: Props) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Pending */}
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-secondary text-primary">
            <ListTodo className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            PENDING
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-4xl font-bold tracking-tighter">{activeCount}</p>
          <p className="text-sm text-muted-foreground">Tasks waiting for you</p>
        </div>
      </div>

      {/* Efficiency */}
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-secondary text-primary">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            EFFICIENCY
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-4xl font-bold tracking-tighter">
            {completionRate}%
          </p>
          <p className="text-sm text-muted-foreground">Completion rate today</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
          <div
            className="h-full bg-white transition-all duration-1000 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Today */}
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-secondary text-primary">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono text-muted-foreground">TODAY</span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-medium tracking-tight">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
