"use client";

import { GoalCard } from "./GoalCard";
import type { GoalWithProgress } from "@/types";

interface GoalGridProps {
  goals: GoalWithProgress[];
  onRefresh: () => void;
}

const PRIORITY_ORDER = ["must", "should", "want"] as const;
const PRIORITY_LABELS = { must: "Must Do", should: "Should Do", want: "Want to Do" };

export function GoalGrid({ goals, onRefresh }: GoalGridProps) {
  const activeGoals = goals.filter((g) => g.isActiveToday);

  if (activeGoals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-3">😎</span>
        <p className="text-gray-400 font-medium">No goals active today</p>
        <p className="text-sm text-gray-600 mt-1">
          Add goals or adjust your active days in Goal settings
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {PRIORITY_ORDER.map((priority) => {
        const priorityGoals = activeGoals.filter((g) => g.priority === priority);
        if (priorityGoals.length === 0) return null;

        return (
          <div key={priority}>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {PRIORITY_LABELS[priority]}
            </h2>
            <div className="space-y-3">
              {priorityGoals
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onRefresh={onRefresh} />
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
