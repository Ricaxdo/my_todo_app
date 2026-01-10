// src/features/todo/components/Toolbar/Toolbar.tsx
"use client";

import type { ToolbarProps } from "./types/toolbar.types";

import PrioritySelect from "./PrioritySelect";
import SearchInput from "./SearchInput";
import SortSelect from "./SortSelect";
import StatusFilterChips from "./StatusFilterChips";

export default function Toolbar(props: ToolbarProps) {
  const {
    activeFilter,
    setActiveFilter,
    priorityFilter = "all",
    setPriorityFilter,
    sortOption = "date-asc",
    setSortOption,
    searchQuery = "",
    setSearchQuery,
  } = props;

  const showPriority = typeof setPriorityFilter === "function";
  const showSort = typeof setSortOption === "function";
  const showSearch = typeof setSearchQuery === "function";

  return (
    <div className="flex items-center gap-3 flex-wrap border-b border-border pb-4">
      <StatusFilterChips
        activeFilter={activeFilter}
        onChange={setActiveFilter}
      />

      {showPriority ? (
        <PrioritySelect value={priorityFilter} onChange={setPriorityFilter} />
      ) : null}

      {showSort ? (
        <SortSelect value={sortOption} onChange={setSortOption} />
      ) : null}

      <div className="flex-1 min-w-[200px]" />

      {showSearch ? (
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      ) : null}
    </div>
  );
}
