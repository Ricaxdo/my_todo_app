export type Filter = "all" | "active" | "completed";
export type PriorityFilter = "all" | "low" | "medium" | "high";
export type SortOption = "date-asc" | "date-desc" | "priority";

type OptionalControls =
  | {
      /** Si pasas estos setters, se muestran estos controles */
      priorityFilter?: PriorityFilter;
      setPriorityFilter: (p: PriorityFilter) => void;

      sortOption?: SortOption;
      setSortOption: (s: SortOption) => void;

      searchQuery?: string;
      setSearchQuery: (q: string) => void;
    }
  | {
      /** Si NO los pasas, Toolbar funciona solo con status filters */
      priorityFilter?: never;
      setPriorityFilter?: never;

      sortOption?: never;
      setSortOption?: never;

      searchQuery?: never;
      setSearchQuery?: never;
    };

export type ToolbarProps = {
  activeFilter: Filter;
  setActiveFilter: (f: Filter) => void;
} & OptionalControls;
