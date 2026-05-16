import type { LocationValidation } from "@/types";
import { LOCATION_VALIDATION_LABELS, LOCATION_VALIDATION_COLORS } from "@/lib/constants";

export default function LocationBadge({ status }: { status: LocationValidation }) {
  const label = LOCATION_VALIDATION_LABELS[status];
  const color = LOCATION_VALIDATION_COLORS[status];

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-4xl"
      style={{ backgroundColor: `${color}15`, color }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      {label}
    </span>
  );
}
