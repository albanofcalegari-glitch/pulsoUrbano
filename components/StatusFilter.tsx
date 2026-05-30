"use client";

import { useState, useRef, useEffect } from "react";
import type { CategoryGroup } from "@/types";
import { CATEGORY_GROUP_LABELS, CATEGORY_GROUP_DESCRIPTIONS, isServicesMode } from "@/lib/constants";

const MAIN_GROUPS: CategoryGroup[] = [
  "all", "dumpsters", "construction", "obstructions", "waste", "neighborhood_share",
];

const SERVICE_SUB_GROUPS: CategoryGroup[] = ["services_seek", "services_offer"];

interface StatusFilterProps {
  selected: CategoryGroup;
  onChange: (group: CategoryGroup) => void;
}

export default function StatusFilter({ selected, onChange }: StatusFilterProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [showServiceMenu, setShowServiceMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isServiceActive = isServicesMode(selected);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowServiceMenu(false);
      }
    }
    if (showServiceMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showServiceMenu]);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-1.5 overflow-x-auto pb-1 px-1 no-scrollbar flex-1">
        {MAIN_GROUPS.map((group) => (
          <button
            key={group}
            onClick={() => { onChange(group); setShowServiceMenu(false); }}
            className={`shrink-0 px-2 py-1 sm:px-3 sm:py-1.5 rounded-4xl text-[11px] sm:text-xs font-medium transition-all active:translate-y-px ${
              selected === group
                ? "bg-primary text-white shadow-sm shadow-primary/25"
                : "bg-secondary text-foreground/70 ring-1 ring-foreground/10 hover:bg-muted"
            }`}
          >
            {CATEGORY_GROUP_LABELS[group]}
          </button>
        ))}

        {/* Servicios dropdown */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setShowServiceMenu(!showServiceMenu)}
            className={`shrink-0 px-2 py-1 sm:px-3 sm:py-1.5 rounded-4xl text-[11px] sm:text-xs font-medium transition-all active:translate-y-px flex items-center gap-1 ${
              isServiceActive
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/25"
                : "bg-secondary text-foreground/70 ring-1 ring-foreground/10 hover:bg-muted"
            }`}
          >
            🔧 Servicios
            <svg className={`w-3 h-3 transition-transform ${showServiceMenu ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 5l3 3 3-3" />
            </svg>
          </button>

          {showServiceMenu && (
            <div className="absolute left-0 top-full mt-1 z-50 w-48 bg-card rounded-xl ring-1 ring-foreground/10 shadow-xl py-1 overflow-hidden">
              {SERVICE_SUB_GROUPS.map((sub) => (
                <button
                  key={sub}
                  onClick={() => { onChange(sub); setShowServiceMenu(false); }}
                  className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-colors flex items-center gap-2 ${
                    selected === sub
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "text-foreground/70 hover:bg-muted"
                  }`}
                >
                  <span>{sub === "services_seek" ? "🔍" : "🛠️"}</span>
                  {CATEGORY_GROUP_LABELS[sub]}
                </button>
              ))}
            </div>
          )}
        </div>
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
              {[...MAIN_GROUPS, ...SERVICE_SUB_GROUPS].map((group) => (
                <div key={group} className="flex gap-2">
                  <span className="text-xs font-medium text-primary shrink-0 w-24">{CATEGORY_GROUP_LABELS[group]}</span>
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
