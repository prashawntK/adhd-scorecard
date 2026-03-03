"use client";

import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function StreakBadge({ streak, size = "md", showLabel = true }: StreakBadgeProps) {
  if (streak === 0) return null;

  const flameSize = size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-xl";
  const numberSize = size === "sm" ? "text-xs" : size === "lg" ? "text-xl" : "text-sm";

  // Flame intensity based on streak length
  const isHot = streak >= 7;
  const isLegendary = streak >= 30;

  return (
    <div className={cn("flex items-center gap-1", isLegendary && "animate-pulse")}>
      <span className={cn(flameSize, isHot ? "flame-pulse" : "")}>{isLegendary ? "🔥" : "🔥"}</span>
      <span className={cn(numberSize, "font-bold", isLegendary ? "text-orange-300" : isHot ? "text-orange-400" : "text-orange-500")}>
        {streak}
      </span>
      {showLabel && (
        <span className={cn(numberSize, "text-gray-500")}>{streak === 1 ? "day" : "days"}</span>
      )}
    </div>
  );
}
