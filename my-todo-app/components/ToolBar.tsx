import { Search } from "lucide-react";

type Filter = "all" | "active" | "completed";

type Props = {
  activeFilter: Filter;
  setActiveFilter: (f: Filter) => void;
};

export default function Toolbar({ activeFilter, setActiveFilter }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
      <div className="flex items-center gap-2">
        {(["all", "active", "completed"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "bg-white text-black"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        <input
          type="text"
          placeholder="Search tasks..."
          className="bg-secondary/50 border-none rounded-full py-1.5 pl-9 pr-4 text-sm w-full md:w-64 focus:ring-1 focus:ring-white/20 transition-all"
        />
      </div>
    </div>
  );
}
