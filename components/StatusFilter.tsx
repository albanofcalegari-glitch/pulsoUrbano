"use client";

import { useState } from "react";
import type { CategoryGroup } from "@/types";
import { CATEGORY_GROUP_LABELS, CATEGORY_GROUP_DESCRIPTIONS } from "@/lib/constants";

const GROUPS: CategoryGroup[] = [
  "all", "dumpsters", "construction", "obstructions", "waste", "neighborhood_share",
];

interface StatusFilterProps {
  selected: CategoryGroup;
  onChange: (group: CategoryGroup) => void;
}

export default function StatusFilter({ selected, onChange }: StatusFilterProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-1.5 overflow-x-auto pb-1 px-1 no-scrollbar flex-1">
        {GROUPS.map((group) => (
          <button
            key={group}
            onClick={() => onChange(group)}
            className={`shrink-0 px-2 py-1 sm:px-3 sm:py-1.5 rounded-4xl text-[11px] sm:text-xs font-medium transition-all active:translate-y-px ${
              selected === group
                ? "bg-primary text-white shadow-sm shadow-primary/25"
                : "bg-secondary text-foreground/70 ring-1 ring-foreground/10 hover:bg-muted"
            }`}
          >
            {CATEGORY_GROUP_LABELS[group]}
          </button>
        ))}
      </div>
      <div className="relative shrink-0">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="h-7 w-7 flex items-center justify-center rounded-full text-foreground/30 hover:text-foreground/60 hover:bg-muted transition-colors text-xs font-bold"
          aria-label="Ayuda sobre categorías"
        >
          ?
        </button>
        {showHelp && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowHelp(false)} />
            <div className="absolute right-0 top-9 z-50 w-64 sm:w-72 bg-card rounded-xl ring-1 ring-foreground/10 shadow-xl p-3 space-y-2">
              <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide mb-2">Categorías</p>
              {GROUPS.map((group) => (
                <div key={group} className="flex gap-2">
                  <span className="text-xs font-medium text-primary shrink-0 w-20">{CATEGORY_GROUP_LABELS[group]}</span>
                  <span className="text-xs text-foreground/50">{CATEGORY_GROUP_DESCRIPTIONS[group]}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
