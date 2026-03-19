"use client";

import { format } from "date-fns";
import { useTheme } from "@/components/providers/ThemeProvider";

interface StreakCalendarProps {
  scores: Array<{ date: string; score: number }>;
  year: number;
  showFullYear?: boolean;
  accountCreatedAt?: string | null;
}

function getColor(score: number, isLight: boolean): string {
  if (isLight) {
    if (score === 0) return "#E2E8F0";           // slate-200  — empty, clearly visible
    if (score < 30)  return "#FCA5A5";           // red-300    — low activity
    if (score < 50)  return "#FCD34D";           // amber-300  — partial
    if (score < 70)  return "#86EFAC";           // green-300  — decent
    if (score < 85)  return "#4ADE80";           // green-400  — good
    return "#22C55E";                            // green-500  — excellent
  }
  // Dark themes — semantic colours
  if (score === 0) return "rgba(255,255,255,0.09)"; // ghost square — clearly a cell
  if (score < 30)  return "rgba(239,68,68,0.45)";   // faint red
  if (score < 50)  return "rgba(245,158,11,0.55)";  // amber
  if (score < 70)  return "rgba(34,197,94,0.55)";   // light green
  if (score < 85)  return "#16a34a";                // solid green
  return "#22C55E";                                  // bright success
}

export function StreakCalendar({ scores, year, showFullYear = false, accountCreatedAt }: StreakCalendarProps) {
  const { theme } = useTheme();
  const isLight = theme === "lucid-light";
  const today = format(new Date(), "yyyy-MM-dd");
  const accountCreatedDate = accountCreatedAt
    ? format(new Date(accountCreatedAt), "yyyy-MM-dd")
    : `${year}-01-01`;
  const startDate = `${year}-01-01`;
  const endDate = showFullYear ? `${year}-12-31` : today;

  const scoreMap = new Map(scores.map((s) => [s.date, s.score]));

  // Generate all days from Jan 1 to today (or Dec 31 if showFullYear)
  const allDays: string[] = [];
  const cursor = new Date(startDate + "T00:00:00");
  while (format(cursor, "yyyy-MM-dd") <= endDate) {
    allDays.push(format(cursor, "yyyy-MM-dd"));
    cursor.setDate(cursor.getDate() + 1);
  }

  // Group into week columns (Sun → Sat)
  const weeks: string[][] = [];
  let week: string[] = [];

  const firstDayOfWeek = new Date(startDate + "T00:00:00").getDay();
  for (let i = 0; i < firstDayOfWeek; i++) week.push("");

  for (const day of allDays) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push("");
    weeks.push(week);
  }

  // Month label positions — one label per month, at the first column that contains that month
  const monthLabels = new Map<number, string>();
  weeks.forEach((w, wi) => {
    const firstReal = w.find((d) => d !== "");
    if (firstReal) {
      const m = new Date(firstReal + "T00:00:00").getMonth();
      if (!Array.from(monthLabels.values()).includes(format(new Date(firstReal + "T00:00:00"), "MMM"))) {
        monthLabels.set(wi, format(new Date(firstReal + "T00:00:00"), "MMM"));
      }
    }
  });

  return (
    <div className="overflow-x-auto">
      {/* Month labels row */}
      <div className="flex gap-1 mb-1" style={{ minWidth: weeks.length * 14 }}>
        {weeks.map((_, wi) => (
          <div key={wi} className="w-3 flex-shrink-0 text-center">
            {monthLabels.has(wi) && (
              <span className="text-[9px] text-gray-500 font-medium leading-none">
                {monthLabels.get(wi)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Week columns */}
      <div className="flex gap-1" style={{ minWidth: weeks.length * 14 }}>
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {w.map((day, di) => {
              if (!day) return <div key={di} className="w-3 h-3" />;
              const score = scoreMap.get(day) ?? 0;
              const isPreAccount = day < accountCreatedDate;
              return (
                <div
                  key={day}
                  title={`${format(new Date(day + "T00:00:00"), "EEE, MMM d")}: ${isPreAccount ? "before account creation" : Math.round(score)}`}
                  className="w-3 h-3 rounded-sm transition-all hover:scale-125 cursor-default flex items-center justify-center"
                  style={{ backgroundColor: getColor(score, isLight) }}
                >
                  {isPreAccount && <span className="text-[5px] leading-none text-gray-400 select-none">×</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {[
          { score: 0,  label: "None"  },
          { score: 20, label: "<30"   },
          { score: 40, label: "30–50" },
          { score: 60, label: "50–70" },
          { score: 75, label: "70–85" },
          { score: 90, label: "85+"   },
        ].map(({ score, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: getColor(score, isLight) }}
            />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
