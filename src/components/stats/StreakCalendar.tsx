"use client";

import { getLast365Days, formatDateDisplay } from "@/lib/utils";

interface StreakCalendarProps {
  scores: Array<{ date: string; score: number }>;
}

function getColor(score: number): string {
  if (score === 0) return "#111827";
  if (score < 30) return "#1f2937";
  if (score < 50) return "#7f1d1d";
  if (score < 70) return "#ca8a04";
  if (score < 85) return "#16a34a";
  return "#F97316";
}

export function StreakCalendar({ scores }: StreakCalendarProps) {
  const days = getLast365Days();
  const scoreMap = new Map(scores.map((s) => [s.date, s.score]));

  // Group into weeks (columns)
  const weeks: string[][] = [];
  let week: string[] = [];

  // Pad the start of the first week
  const firstDay = new Date(days[0] + "T00:00:00").getDay();
  for (let i = 0; i < firstDay; i++) week.push("");

  for (const day of days) {
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

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1" style={{ minWidth: weeks.length * 14 }}>
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {w.map((day, di) => {
              if (!day) return <div key={di} className="w-3 h-3" />;
              const score = scoreMap.get(day) ?? 0;
              return (
                <div
                  key={day}
                  title={`${formatDateDisplay(day)}: ${Math.round(score)}`}
                  className="w-3 h-3 rounded-sm transition-all hover:scale-125 cursor-default"
                  style={{ backgroundColor: getColor(score) }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-gray-500">Less</span>
        {[0, 25, 50, 70, 90].map((s) => (
          <div
            key={s}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: getColor(s) }}
          />
        ))}
        <span className="text-xs text-gray-500">More</span>
      </div>
    </div>
  );
}
