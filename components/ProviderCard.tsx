"use client";

import type { ServiceProvider } from "@/types";
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_COLORS } from "@/lib/constants";
import { starsDisplay } from "@/lib/utils";

interface ProviderCardProps {
  provider: ServiceProvider;
  onClick?: () => void;
}

export default function ProviderCard({ provider, onClick }: ProviderCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-zinc-900 rounded-xl ring-1 ring-black/5 dark:ring-white/10 shadow-sm hover:shadow-md transition-all p-4 space-y-2"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-lg shrink-0">
          🛠️
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">
            {provider.user.displayName || "Proveedor"}
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="text-amber-500">{starsDisplay(provider.user.trustStars)}</span>
            {provider.averageRating > 0 && (
              <span>⭐ {provider.averageRating.toFixed(1)}</span>
            )}
            {provider.totalJobs > 0 && (
              <span>· {provider.totalJobs} trabajo{provider.totalJobs !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
        {provider.isVerified && (
          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full shrink-0">
            ✓ Verificado
          </span>
        )}
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1">
        {provider.skills.slice(0, 5).map((skill) => (
          <span
            key={skill}
            className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium"
            style={{ backgroundColor: SERVICE_CATEGORY_COLORS[skill] || "#7c5cfc" }}
          >
            {SERVICE_CATEGORY_LABELS[skill] || skill}
          </span>
        ))}
        {provider.skills.length > 5 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
            +{provider.skills.length - 5} más
          </span>
        )}
      </div>

      {/* Bio */}
      {provider.bio && (
        <p className="text-xs text-zinc-500 line-clamp-2">{provider.bio}</p>
      )}
    </button>
  );
}
