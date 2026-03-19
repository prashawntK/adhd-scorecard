"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Maximize2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

interface DayScore {
  date: string;
  goalsCompleted: number;
  goalsTotal: number;
}

interface LifeInWeeksCardProps {
  scores: DayScore[];
  year: number;
  className?: string;
  accountCreatedAt?: string | null; // ISO string from DB
}

type WeekStatus = "green" | "red" | "amber" | "future";

interface Week {
  weekNum: number;
  start: string; // "YYYY-MM-DD"
  end: string;   // "YYYY-MM-DD"
}

interface Quarter {
  label: string;
  weeks: Week[];
}

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Builds weeks that respect Sun–Sat boundaries, but clipped to each quarter.
 *
 * Rules:
 * - Each quarter's first week starts on the quarter's first day (Jan 1, Apr 1,
 *   Jul 1, Oct 1) and ends on the first Saturday on or after that day.
 * - Subsequent weeks run Sun–Sat as normal.
 * - The quarter's last week is truncated at the quarter's last day, even if
 *   that falls before Saturday.
 * - Week numbers are sequential across the whole year.
 */
function getQuartersWithWeeks(year: number): Quarter[] {
  const quarterDefs = [
    { label: "Q1", start: new Date(year, 0, 1),  end: new Date(year, 2, 31)  },
    { label: "Q2", start: new Date(year, 3, 1),  end: new Date(year, 5, 30)  },
    { label: "Q3", start: new Date(year, 6, 1),  end: new Date(year, 8, 30)  },
    { label: "Q4", start: new Date(year, 9, 1),  end: new Date(year, 11, 31) },
  ];

  let weekNum = 1;

  return quarterDefs.map(({ label, start, end }) => {
    const weeks: Week[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const weekStart = format(new Date(cursor), "yyyy-MM-dd");

      // Find next Saturday (dayOfWeek: 0=Sun … 6=Sat)
      const dow = cursor.getDay();
      const daysUntilSat = dow === 6 ? 0 : 6 - dow;
      const endDate = new Date(cursor);
      endDate.setDate(endDate.getDate() + daysUntilSat);

      // Clip to quarter end
      if (endDate > end) endDate.setTime(end.getTime());

      weeks.push({
        weekNum: weekNum++,
        start: weekStart,
        end: format(endDate, "yyyy-MM-dd"),
      });

      // Advance cursor to the Sunday after this Saturday.
      // Must copy endDate's full timestamp first — setDate() alone loses the
      // month if endDate crossed a month boundary (e.g. Jan 26 → Feb 1).
      cursor.setTime(endDate.getTime());
      cursor.setDate(cursor.getDate() + 1);
    }

    return { label, weeks };
  });
}

function getWeekStatus(
  week: Week,
  scores: DayScore[],
  today: string,
  accountCreatedDate?: string | null
): { status: WeekStatus; rate: number; completed: number; total: number } {
  // Weeks entirely before account creation → blank (future style)
  if (accountCreatedDate && week.end < accountCreatedDate) {
    return { status: "future", rate: 0, completed: 0, total: 0 };
  }
  if (week.start > today) return { status: "future", rate: 0, completed: 0, total: 0 };

  const days = scores.filter(
    (s) => s.date >= week.start && s.date <= week.end && s.goalsTotal > 0
  );

  if (days.length === 0) {
    return {
      status: week.end < today ? "red" : "amber",
      rate: 0,
      completed: 0,
      total: 0,
    };
  }

  const completed = days.reduce((s, d) => s + d.goalsCompleted, 0);
  const total = days.reduce((s, d) => s + d.goalsTotal, 0);
  const rate = total > 0 ? completed / total : 0;
  const isCurrent = week.start <= today && week.end >= today;

  const status: WeekStatus =
    isCurrent
      ? rate >= 0.51
        ? "green"
        : "amber"
      : rate >= 0.51
      ? "green"
      : "red";

  return { status, rate, completed, total };
}

function formatWeekLabel(week: Week): string {
  const start = new Date(week.start + "T00:00:00");
  const end = new Date(week.end + "T00:00:00");
  return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
}

// ─── box colours — mirrors StreakCalendar's getColor palette ────────────────

function getBoxStyle(status: WeekStatus, isLight: boolean): React.CSSProperties {
  if (isLight) {
    switch (status) {
      case "green":  return { backgroundColor: "#22C55E" };
      case "red":    return { backgroundColor: "#FCA5A5" };
      case "amber":  return { backgroundColor: "#FCD34D" };
      case "future":
      default:       return { backgroundColor: "#E2E8F0" };
    }
  }
  switch (status) {
    case "green":  return { backgroundColor: "#16a34a" };
    case "red":    return { backgroundColor: "rgba(239,68,68,0.55)" };
    case "amber":  return { backgroundColor: "rgba(245,158,11,0.55)" };
    case "future":
    default:       return { backgroundColor: "rgba(255,255,255,0.12)" };
  }
}

// Outline colour so boxes are always visible regardless of theme
const BOX_OUTLINE = "shadow-[inset_0_0_0_1px_rgba(128,128,128,0.25)]";

// ─── grid sub-component ──────────────────────────────────────────────────────

interface WeekGridProps {
  quarters: Quarter[];
  scores: DayScore[];
  today: string;
  boxSize: "sm" | "lg";
  accountCreatedDate?: string | null;
  isLight: boolean;
}

function WeekGrid({ quarters, scores, today, boxSize, accountCreatedDate, isLight }: WeekGridProps) {

  const sizeClass = boxSize === "sm" ? "w-[14px] h-[14px]" : "w-6 h-6";
  const gapClass  = boxSize === "sm" ? "gap-[4px]" : "gap-1.5";

  return (
    <div className="space-y-2">
      {quarters.map(({ label, weeks: qWeeks }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-6 flex-shrink-0 font-medium">{label}</span>
          <div className={cn("flex flex-wrap", gapClass)}>
            {qWeeks.map((week) => {
              const { status, rate, completed, total } = getWeekStatus(week, scores, today, accountCreatedDate);
              const pct = Math.round(rate * 100);
              const tooltip =
                status === "future"
                  ? `Week ${week.weekNum} (${formatWeekLabel(week)}): upcoming`
                  : total === 0
                  ? `Week ${week.weekNum} (${formatWeekLabel(week)}): no data`
                  : `Week ${week.weekNum} (${formatWeekLabel(week)}): ${completed}/${total} goals (${pct}%)`;

              const isPreAccount = accountCreatedDate ? week.end < accountCreatedDate : false;
              const finalTooltip = isPreAccount
                ? `Week ${week.weekNum} (${formatWeekLabel(week)}): before account creation`
                : tooltip;
              const isCurrent = week.start <= today && week.end >= today;
              return (
                <div
                  key={week.weekNum}
                  title={finalTooltip}
                  style={getBoxStyle(status, isLight)}
                  className={cn(
                    sizeClass,
                    "rounded-[2px] transition-all duration-150 cursor-default flex items-center justify-center",
                    BOX_OUTLINE,
                    isCurrent && "ring-2 ring-white/50 ring-offset-[1px] ring-offset-surface-1"
                  )}
                >
                  {isPreAccount && <span className="text-[5px] leading-none text-gray-500 select-none">×</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── legend ──────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex items-center gap-4 mt-3 flex-wrap">
      {[
        { cls: "bg-success/80", label: "≥51% done" },
        { cls: "bg-streak/70",  label: "In progress" },
        { cls: "bg-error/70",   label: "Missed" },
        { cls: "bg-surface-3 opacity-40", label: "Upcoming" },
      ].map(({ cls, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={cn("w-3 h-3 rounded-[2px]", cls)} />
          <span className="text-xs text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── main card ───────────────────────────────────────────────────────────────

export function LifeInWeeksCard({ scores, year, className, accountCreatedAt }: LifeInWeeksCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === "lucid-light";
  const today = format(new Date(), "yyyy-MM-dd");

  // Normalise account creation to a date string (YYYY-MM-DD)
  // Fall back to Jan 1 of the current year if not available
  const accountCreatedDate = accountCreatedAt
    ? format(new Date(accountCreatedAt), "yyyy-MM-dd")
    : `${year}-01-01`;
  const accountCreationYear = new Date(accountCreatedDate!).getFullYear();

  // Compact: current year only
  const quarters = getQuartersWithWeeks(year);
  const allWeeks = quarters.flatMap((q) => q.weeks);
  const greenCount = allWeeks.filter((w) => getWeekStatus(w, scores, today, accountCreatedDate).status === "green").length;
  const totalPast = allWeeks.filter((w) => w.end <= today && (!accountCreatedDate || w.start >= accountCreatedDate)).length;

  return (
    <>
      <div className={cn("glass-card p-4 group flex flex-col", className)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider group-hover:text-primary transition-colors">
              Your Life in Weeks — {year}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {greenCount} / {totalPast} weeks on track
            </p>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-surface-2 transition-colors cursor-pointer"
            title="Maximize"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        {/* Compact grid — current year */}
        <WeekGrid quarters={quarters} scores={scores} today={today} boxSize="sm" accountCreatedDate={accountCreatedDate} isLight={isLight} />
        <Legend />
      </div>

      {/* Expanded modal — from account creation year, one row per year, no quarter grouping */}
      {(() => {
        const startYear = year;
        const endYear = year + 10;
        const totalYears = endYear - startYear + 1;
        return (
          <Modal
            open={expanded}
            onClose={() => setExpanded(false)}
            title="Your Life in Weeks"
            className="max-w-4xl"
          >
            <div className="pt-1">
              <p className="text-xs text-gray-500 mb-4">
                {startYear} → {endYear} · each row = one year · {greenCount}/{totalPast} weeks on track this year
              </p>
              <div className="space-y-2 overflow-y-auto max-h-[70vh]">
                {Array.from({ length: totalYears }, (_, i) => {
                  const y = startYear + i;
                  const yWeeks = getQuartersWithWeeks(y).flatMap((q) => q.weeks);
                  const isCurrent = y === year;
                  return (
                    <div key={y} className="flex items-center gap-3">
                      <span className={cn("text-xs font-semibold w-10 flex-shrink-0", isCurrent ? "text-primary" : "text-gray-500")}>
                        {y}
                      </span>
                      <div className="flex flex-wrap gap-[3px]">
                        {yWeeks.map((week) => {
                          const { status, rate, completed, total } = getWeekStatus(week, scores, today, accountCreatedDate);
                          const pct = Math.round(rate * 100);
                          const tooltip = status === "future"
                            ? `${formatWeekLabel(week)}: upcoming`
                            : total === 0
                            ? `${formatWeekLabel(week)}: no data`
                            : `${formatWeekLabel(week)}: ${completed}/${total} goals (${pct}%)`;
                          const isPreAccount = accountCreatedDate ? week.end < accountCreatedDate : false;
                          const finalTooltip = isPreAccount
                            ? `${formatWeekLabel(week)}: before account creation`
                            : tooltip;
                          const isCurrent = week.start <= today && week.end >= today;
                          return (
                            <div
                              key={week.weekNum}
                              title={finalTooltip}
                              style={getBoxStyle(status, isLight)}
                              className={cn(
                                "w-[10px] h-[10px] rounded-[2px] transition-all duration-150 cursor-default flex items-center justify-center",
                                BOX_OUTLINE,
                                isCurrent && "ring-2 ring-white/50 ring-offset-[1px] ring-offset-surface-1"
                              )}
                            >
                              {isPreAccount && <span className="text-[5px] leading-none text-gray-500 select-none">×</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Legend />
            </div>
          </Modal>
        );
      })()}
    </>
  );
}
