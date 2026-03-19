"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatHours } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  name: string;
  emoji: string;
}

interface StepData {
  name: string;
  hours: number;
}

interface GoalBreakdownSectionProps {
  goals: Goal[];
  period: string;
}

export function GoalBreakdownSection({ goals, period }: GoalBreakdownSectionProps) {
  // The first goal starts open
  const [openGoalId, setOpenGoalId] = useState<string | null>(goals[0]?.id ?? null);
  // Cache: key = `${goalId}::${period}`
  const [stepCache, setStepCache] = useState<Record<string, StepData[]>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const fetchedRef = useRef<Set<string>>(new Set());

  const fetchSteps = useCallback(
    async (goalId: string) => {
      const key = `${goalId}::${period}`;
      if (fetchedRef.current.has(key)) return;
      fetchedRef.current.add(key);

      setLoadingIds((prev) => new Set(prev).add(goalId));
      try {
        const res = await fetch(
          `/api/stats/charts?type=hours_by_step&goalId=${goalId}&period=${period}`
        );
        const data = await res.json();
        setStepCache((prev) => ({
          ...prev,
          [key]: Array.isArray(data) ? data : [],
        }));
      } finally {
        setLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(goalId);
          return next;
        });
      }
    },
    [period]
  );

  // When period changes, clear cache so we re-fetch
  useEffect(() => {
    fetchedRef.current = new Set();
    setStepCache({});
  }, [period]);

  // Pre-fetch the open goal whenever it changes or period changes
  useEffect(() => {
    if (openGoalId) fetchSteps(openGoalId);
  }, [openGoalId, fetchSteps]);

  const toggle = (goalId: string) => {
    setOpenGoalId((prev) => (prev === goalId ? null : goalId));
  };

  if (goals.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Goal Breakdown
      </h2>

      <div className="glass-card overflow-hidden divide-y divide-surface-2/60">
        {goals.map((goal) => {
          const cacheKey = `${goal.id}::${period}`;
          const isOpen = openGoalId === goal.id;
          const steps = stepCache[cacheKey] ?? [];
          const isLoading = loadingIds.has(goal.id);
          const totalHours = steps.reduce((sum, s) => sum + s.hours, 0);
          const maxHours = Math.max(...steps.map((s) => s.hours), 0.01);
          const hasActivity = totalHours > 0;

          return (
            <div key={goal.id}>
              {/* ── Goal header row ─────────────────────────────────────── */}
              <button
                onClick={() => toggle(goal.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 transition-colors group cursor-pointer text-left",
                  isOpen ? "bg-surface-2/30" : "hover:bg-surface-2/20"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base leading-none">{goal.emoji}</span>
                  <span className="text-sm font-medium text-primary truncate">
                    {goal.name}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0 ml-4">
                  {/* Total time badge */}
                  {!isLoading && hasActivity && (
                    <span className="text-xs tabular-nums text-secondary bg-surface-2 px-2 py-0.5 rounded-full">
                      {formatHours(totalHours)}
                    </span>
                  )}
                  {/* Chevron */}
                  {isOpen ? (
                    <ChevronDown size={14} className="text-primary" />
                  ) : (
                    <ChevronRight
                      size={14}
                      className="text-secondary group-hover:text-primary transition-colors"
                    />
                  )}
                </div>
              </button>

              {/* ── Step rows ────────────────────────────────────────────── */}
              {isOpen && (
                <div className="px-4 pb-4 pt-2 space-y-3 bg-surface-1/20">
                  {isLoading ? (
                    /* Loading skeleton */
                    <div className="space-y-3 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between">
                            <div className="h-3 w-1/3 bg-surface-2 rounded" />
                            <div className="h-3 w-10 bg-surface-2 rounded" />
                          </div>
                          <div className="h-1.5 bg-surface-2 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : steps.length === 0 ? (
                    <p className="text-xs text-secondary py-1 pl-1">
                      No activity logged in this period.
                    </p>
                  ) : (
                    steps.map((step, i) => {
                      const isLast = i === steps.length - 1;
                      const pct = (step.hours / maxHours) * 100;

                      return (
                        <div key={step.name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs gap-2">
                            {/* tree line + name */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-surface-3 flex-shrink-0 font-mono text-[10px]">
                                {isLast ? "└" : "├"}
                              </span>
                              <span className="text-secondary truncate">{step.name}</span>
                            </div>
                            {/* time */}
                            <span className="text-secondary/60 flex-shrink-0 tabular-nums">
                              {formatHours(step.hours)}
                            </span>
                          </div>
                          {/* progress bar */}
                          <div className="ml-4 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                background:
                                  pct >= 80
                                    ? "var(--color-success)"
                                    : pct >= 40
                                    ? "var(--color-primary)"
                                    : "var(--color-secondary)",
                                opacity: 0.75,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
