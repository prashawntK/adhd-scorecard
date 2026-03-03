"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ForgivenessBannerProps {
  yesterdayScore: number | null;
}

const MESSAGES = [
  "Yesterday was tough. Today is a fresh start — no guilt, just progress.",
  "Every day is a reset. What matters is that you showed up today.",
  "Missing a day doesn't erase your progress. You're still doing great.",
  "Welcome back! ADHD brains need rest too. Ready to get back on track?",
];

export function ForgivenessBanner({ yesterdayScore }: ForgivenessBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Only show if yesterday was a low/missed day
  if (dismissed || yesterdayScore === null || yesterdayScore >= 20) return null;

  const message = MESSAGES[new Date().getDay() % MESSAGES.length];

  return (
    <div className="bg-info-muted/40 border border-info/20 rounded-2xl p-4 flex items-start gap-3">
      <span className="text-2xl flex-shrink-0">💙</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-info font-medium">No worries</p>
        <p className="text-sm text-info/70 mt-0.5">{message}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-info/40 hover:text-info/70 transition-all"
      >
        <X size={16} />
      </button>
    </div>
  );
}
