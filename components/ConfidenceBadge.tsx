import { getConfidenceLevel } from "@/lib/confidence";

export default function ConfidenceBadge({ score }: { score: number }) {
  const { label, color } = getConfidenceLevel(score);

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-4xl"
      style={{ backgroundColor: `${color}15`, color }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill={color}>
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
      </svg>
      {label}
    </span>
  );
}
