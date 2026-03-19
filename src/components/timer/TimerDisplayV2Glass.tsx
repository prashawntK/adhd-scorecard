"use client";

/**
 * VARIANT 2 — Glassmorphic Banner
 * Full-width glass card at bottom. Left accent glow matches progress color.
 * Compact two-row layout: name+time top, step+bar+controls bottom.
 */

import { Square, X } from "lucide-react";

interface Props {
  timerName: string;
  timerEmoji: string;
  stepLabel?: string;
  displayTime: string;
  totalElapsed: number;
  duration: number | null;
  isComplete: boolean;
  onStop: () => void;
  onCancel: () => void;
}

export function TimerDisplayV2Glass({
  timerName, timerEmoji, stepLabel, displayTime,
  totalElapsed, duration, isComplete, onStop, onCancel,
}: Props) {
  const pct = duration ? Math.min((totalElapsed / duration) * 100, 100) : 0;
  const accentColor = isComplete ? "#22C55E" : pct > 80 ? "#34D399" : pct > 50 ? "#F59E0B" : "var(--color-primary)";
  const barBg = isComplete ? "rgba(34,197,94,0.55)" : pct > 80 ? "rgba(52,211,153,0.55)" : pct > 50 ? "rgba(245,158,11,0.55)" : "var(--color-primary)";

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:bottom-4 md:right-4 md:left-auto md:w-80">
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: `0 0 0 1px var(--glass-border), 0 8px 40px rgba(0,0,0,0.35), 0 0 24px ${accentColor}22`,
        }}
      >
        {/* Left accent bar */}
        <div className="flex">
          <div className="w-[3px] self-stretch rounded-l-2xl" style={{ background: accentColor, boxShadow: `0 0 10px 1px ${accentColor}` }} />

          <div className="flex-1 px-3 py-3">
            {/* Row 1: emoji + name + time */}
            <div className="flex items-center gap-2">
              <span className="text-base flex-shrink-0">{timerEmoji}</span>
              <p className="flex-1 text-sm font-semibold text-primary truncate">{timerName}</p>
              <span className="text-sm font-mono font-bold tabular-nums flex-shrink-0" style={{ color: accentColor }}>
                {displayTime}
              </span>
            </div>

            {/* Row 2: step label */}
            {stepLabel && (
              <p className="text-[11px] text-secondary mt-0.5 ml-6 truncate">{stepLabel}</p>
            )}

            {/* Progress bar */}
            {duration && (
              <div className="mt-2.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: barBg }}
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-end gap-1.5 mt-2.5">
              <button
                onClick={onCancel}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-secondary hover:text-error hover:bg-error/10 transition-all"
              >
                <X size={10} /> Discard
              </button>
              <button
                onClick={onStop}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] bg-error/15 text-error hover:bg-error/25 transition-all"
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
