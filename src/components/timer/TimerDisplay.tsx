"use client";

import { useState, useEffect } from "react";
import { Square, X } from "lucide-react";
import { useTimer } from "@/components/providers/TimerProvider";
import { formatTimerDisplay } from "@/lib/utils";
import { useToast } from "@/lib/toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { GoalWithProgress } from "@/types";

interface TimerDisplayProps {
  onRefresh: () => void;
  goals?: GoalWithProgress[];
}

export function TimerDisplay({ onRefresh, goals }: TimerDisplayProps) {
  const { timerState, displayTime, totalElapsed, stopTimer, cancelTimer } = useTimer();
  const { success: toastSuccess } = useToast();
  const { theme } = useTheme();
  const isLight = theme === "lucid-light";
  const [toasted, setToasted] = useState(false);
  const [hovered, setHovered] = useState(false);

  const activeGoal = timerState.isRunning
    ? goals?.find((g) => g.id === timerState.goalId)
    : undefined;

  const timerName = timerState.targetName ?? activeGoal?.name ?? "Timer";
  const timerEmoji = timerState.targetEmoji ?? activeGoal?.emoji ?? "⏱️";
  const stepLabel = activeGoal?.currentStep?.name ?? null;

  const duration = timerState.targetDuration;
  const isComplete = duration != null && totalElapsed >= duration;
  const pct = duration ? Math.min((totalElapsed / duration) * 100, 100) : 0;
  const color = isComplete ? "#22C55E" : pct > 80 ? "#34D399" : pct > 50 ? "#F59E0B" : "var(--color-primary)";

  useEffect(() => {
    if (isComplete && !toasted) {
      setToasted(true);
      toastSuccess("Timer complete!", `${timerEmoji} ${timerName}`);
    }
  }, [isComplete, toasted, timerEmoji, timerName, toastSuccess]);

  if (!timerState.isRunning) return null;

  function handleStop() {
    stopTimer();
    setToasted(false);
    onRefresh();
  }

  function handleCancel() {
    cancelTimer();
    setToasted(false);
    onRefresh();
  }

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 md:bottom-6">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="overflow-hidden transition-all duration-300"
        style={{
          background: isLight ? "rgba(255,255,255,0.85)" : "#0a0a0a",
          border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.08)",
          borderRadius: hovered ? "20px" : "999px",
          boxShadow: isLight
            ? `0 4px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)`
            : `0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Pill row */}
        <div className="flex items-center gap-2.5 px-4 py-2">
          {/* Pulsing live dot */}
          <span className="relative flex-shrink-0">
            <span className="absolute inline-flex h-2 w-2 rounded-full opacity-75 animate-ping" style={{ background: color }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
          </span>

          <span className="text-sm flex-shrink-0">{timerEmoji}</span>

          <span className="text-xs font-mono font-bold tabular-nums flex-shrink-0" style={{ color }}>
            {displayTime}
            {duration && (
              <span className="text-gray-600 font-normal"> / {formatTimerDisplay(duration)}</span>
            )}
          </span>

          <span className={`text-xs max-w-[80px] truncate hidden sm:block ${isLight ? "text-gray-500" : "text-gray-500"}`}>
            {timerName}
          </span>
        </div>

        {/* Hover panel */}
        <div
          className={`transition-all duration-300 overflow-hidden min-w-[200px] ${hovered ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className={`px-4 pb-3 border-t ${isLight ? "border-black/[0.06]" : "border-white/[0.05]"}`}>
            {stepLabel && (
              <p className="text-[11px] text-gray-500 mt-2 truncate">{stepLabel}</p>
            )}

            {duration && (
              <div className={`${stepLabel ? "mt-1.5" : "mt-2.5"} h-1 rounded-full overflow-hidden`} style={{ background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleCancel}
                className={`flex-1 py-1.5 rounded-xl text-xs hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-1 border ${isLight ? "border-black/10 text-gray-500" : "border-white/[0.06] text-gray-400"}`}
              >
                <X size={10} /> Discard
              </button>
              <button
                onClick={handleStop}
                className="flex-1 py-1.5 rounded-xl text-xs bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all flex items-center justify-center gap-1"
              >
                <Square size={9} fill="currentColor" /> Stop & Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
