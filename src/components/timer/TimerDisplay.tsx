"use client";

import { useState } from "react";
import { Square } from "lucide-react";
import { useTimer } from "@/components/providers/TimerProvider";
import { LinearTimerBar } from "./LinearTimerBar";
import { formatTimerDisplay } from "@/lib/utils";
import { useToast } from "@/lib/toast";

import type { GoalWithProgress } from "@/types";

interface TimerDisplayProps {
  onRefresh: () => void;
  goals?: GoalWithProgress[];
}

export function TimerDisplay({ onRefresh, goals }: TimerDisplayProps) {
  const { timerState, displayTime, totalElapsed, stopTimer } = useTimer();
  const { success: toastSuccess } = useToast();
  const [toasted, setToasted] = useState(false);

  // Resolve name and emoji — universal fields first, then fallback to goal lookup
  const activeGoal = timerState.isRunning
    ? goals?.find((g) => g.id === timerState.goalId)
    : undefined;
  const timerName = timerState.targetName ?? activeGoal?.name ?? "Timer";
  const timerEmoji = timerState.targetEmoji ?? activeGoal?.emoji ?? "\u23F1\uFE0F";

  // Duration info
  const duration = timerState.targetDuration;
  const remainingSeconds = duration != null ? Math.max(0, duration - totalElapsed) : null;
  const isComplete = duration != null && totalElapsed >= duration;

  // Fire completion toast once
  if (isComplete && !toasted) {
    setToasted(true);
    toastSuccess("Timer complete!", `${timerEmoji} ${timerName}`);
  }

  if (!timerState.isRunning) return null;

  function handleStop() {
    stopTimer();
    setToasted(false);
    onRefresh();
  }

  // Format "elapsed / total" or "elapsed ✓" when done
  const timeLabel = (() => {
    if (duration == null) return null;
    if (remainingSeconds != null && remainingSeconds > 0) {
      return `${displayTime} / ${formatTimerDisplay(duration)}`;
    }
    return `${displayTime} ✓`;
  })();

  return (
    <div className="fixed bottom-20 left-0 right-0 mx-4 z-40 md:bottom-4 md:right-4 md:left-auto md:w-80">
      <div className="bg-surface-1 border border-primary/30 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
        <div className="p-3">
          {/* Name row */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{timerEmoji}</span>
            <p className="text-xs text-primary font-medium truncate flex-1">
              {timerName}
              {activeGoal?.currentStep ? ` · ${activeGoal.currentStep.name}` : ""}
            </p>
          </div>

          {/* Time + stop button */}
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-mono font-bold text-gray-100 tabular-nums">
                {timeLabel ?? displayTime}
              </p>
            </div>
            <button
              onClick={handleStop}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-error/20 hover:bg-error/30 text-error flex items-center justify-center transition-all"
            >
              <Square size={18} fill="currentColor" />
            </button>
          </div>

          {/* Linear progress bar */}
          <div className="mt-2">
            <LinearTimerBar elapsed={totalElapsed} duration={duration} />
          </div>
        </div>
      </div>
    </div>
  );
}
