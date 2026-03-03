"use client";

import { useState } from "react";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import type { GoalWithProgress } from "@/types";

interface MorningViewProps {
  goals: GoalWithProgress[];
  yesterdayScore: number | null;
  overallStreak: { currentStreak: number; longestStreak: number };
  onDismiss: () => void;
}

const GREETINGS = [
  "Good morning! Let's make today count 🌟",
  "Rise and shine! Your goals are waiting 🌅",
  "A fresh day, a fresh start! Let's do this 💪",
  "Today is a new opportunity. You've got this! 🎯",
];

export function MorningView({ goals, yesterdayScore, overallStreak, onDismiss }: MorningViewProps) {
  const [dismissed, setDismissed] = useState(false);
  const greeting = GREETINGS[new Date().getDay() % GREETINGS.length];

  const topGoals = goals
    .filter((g) => g.isActiveToday)
    .sort((a, b) => {
      const p = { must: 0, should: 1, want: 2 };
      return (p[a.priority] ?? 3) - (p[b.priority] ?? 3);
    })
    .slice(0, 3);

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    onDismiss();
  }

  return (
    <div className="bg-gradient-to-br from-primary-subtle to-surface-2 border border-primary/20 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-100 font-semibold">{greeting}</p>
          {yesterdayScore !== null && (
            <p className="text-sm text-gray-400 mt-0.5">
              Yesterday you scored <span className="text-primary font-semibold">{Math.round(yesterdayScore)}</span>
            </p>
          )}
        </div>
        <button onClick={handleDismiss} className="text-gray-600 hover:text-gray-400 text-xs transition-all">
          Dismiss
        </button>
      </div>

      {overallStreak.currentStreak > 0 && (
        <div className="flex items-center gap-2 mb-4 py-2 px-3 bg-streak/10 rounded-xl border border-streak/20">
          <StreakBadge streak={overallStreak.currentStreak} size="md" showLabel={true} />
          <span className="text-xs text-streak">streak — keep it alive today!</span>
        </div>
      )}

      {topGoals.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Today's top priorities
          </p>
          <div className="space-y-2">
            {topGoals.map((goal, i) => (
              <div key={goal.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-4">{i + 1}.</span>
                <span className="text-base">{goal.emoji}</span>
                <span className="text-sm text-gray-200 flex-1">{goal.name}</span>
                {goal.streak.currentStreak > 0 && (
                  <StreakBadge streak={goal.streak.currentStreak} size="sm" showLabel={false} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleDismiss}
        className="mt-4 w-full py-2.5 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
      >
        Let's go! 🚀
      </button>
    </div>
  );
}
