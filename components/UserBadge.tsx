import { starsDisplay, getUserLabel } from "@/lib/utils";

interface UserBadgeProps {
  trustStars: number;
  displayName?: string | null;
  size?: "sm" | "md";
}

export default function UserBadge({ trustStars, displayName, size = "sm" }: UserBadgeProps) {
  const label = displayName || getUserLabel(trustStars);
  const stars = starsDisplay(trustStars);

  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center gap-1.5 ${textSize}`}>
      <span className="text-amber-400" title={`${trustStars} estrellas`}>{stars}</span>
      <span className="text-foreground/60">{label}</span>
    </div>
  );
}
