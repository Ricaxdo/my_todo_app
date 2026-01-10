"use client";

import { STATUS_ITEMS } from "./constants/toolbar.constants";
import type { Filter } from "./types/toolbar.types";
import { chipClass } from "./utils/toolbar.utils";

type Props = {
  activeFilter: Filter;
  onChange: (f: Filter) => void;
};

/**
 * Chips principales (Todas / Activas / Completadas).
 * Separado para que Toolbar no se llene de markup repetido.
 */
export default function StatusFilterChips({ activeFilter, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 max-[349px]:ml-[-10px]">
      {STATUS_ITEMS.map(({ value, label, Icon }) => {
        const isActive = activeFilter === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={chipClass(isActive)}
            aria-pressed={isActive}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
