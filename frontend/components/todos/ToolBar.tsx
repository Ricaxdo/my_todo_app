"use client";

import {
  ArrowUpDown,
  CheckCheck,
  CheckCircle2,
  Circle,
  Search,
  SlidersHorizontal,
} from "lucide-react";

type Filter = "all" | "active" | "completed";
type PriorityFilter = "all" | "low" | "medium" | "high";
type SortOption = "date-asc" | "date-desc" | "priority";

type Props = {
  activeFilter: Filter;
  setActiveFilter: (f: Filter) => void;
  priorityFilter?: PriorityFilter;
  setPriorityFilter?: (p: PriorityFilter) => void;
  sortOption?: SortOption;
  setSortOption?: (s: SortOption) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
};

export default function Toolbar({
  activeFilter,
  setActiveFilter,
  priorityFilter = "all",
  setPriorityFilter,
  sortOption = "date-asc",
  setSortOption,
  searchQuery = "",
  setSearchQuery,
}: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap border-b border-border pb-4">
      {/* Status Filters with Icons */}
      <div className="flex items-center gap-2 max-[349px]:ml-[-10px]">
        <button
          onClick={() => setActiveFilter("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-smc max-[349px]:text-xs font-medium transition-all ${
            activeFilter === "all"
              ? "bg-white text-black shadow-sm"
              : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Todas
        </button>

        <button
          onClick={() => setActiveFilter("active")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm max-[349px]:text-xs font-medium transition-all ${
            activeFilter === "active"
              ? "bg-white text-black shadow-sm"
              : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Circle className="w-3.5 h-3.5" />
          Activas
        </button>

        <button
          onClick={() => setActiveFilter("completed")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm max-[349px]:text-xs font-medium transition-all ${
            activeFilter === "completed"
              ? "bg-white text-black shadow-sm"
              : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completadas
        </button>
      </div>

      {/* Priority Filter */}
      {setPriorityFilter && (
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as PriorityFilter)
            }
            className="bg-secondary/50 border border-border rounded-full px-3 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-white/20 transition-all cursor-pointer hover:bg-secondary"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      )}

      {/* Sort Options */}
      {setSortOption && (
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="bg-secondary/50 border border-border rounded-full px-3 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-white/20 transition-all cursor-pointer hover:bg-secondary"
          >
            <option value="date-asc">Oldest First</option>
            <option value="date-desc">Newest First</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      )}

      <div className="flex-1 min-w-[200px]" />

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery?.(e.target.value)}
          className="bg-secondary/50 border border-border rounded-full py-1.5 pl-9 pr-4 text-sm w-64 focus:ring-1 focus:ring-white/20 focus:bg-secondary transition-all"
        />
      </div>
    </div>
  );
}
