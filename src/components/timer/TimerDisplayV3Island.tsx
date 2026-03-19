"use client";

/**
 * VARIANT 3 — Dynamic Island Style
 * Ultra-compact pill at top-center (or bottom). Expands on hover to reveal controls.
 * Inspired by iPhone Dynamic Island — minimal when not focused, rich when focused.
 */

import { useState } from "react";
import { Square, X, ChevronDown } from "lucide-react";

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

export function TimerDisplayV3Island({
  timerName, timerEmoji, stepLabel, displayTime,
  totalElapsed, duration, isComplete, onStop, onCancel,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const pct = duration ? Math.min((totalElapsed / duration) * 100, 100) : 0;
  const color = isComplete ? "#22C55E" : pct > 80 ? "#34D399" : pct > 50 ? "#F59E0B" : "var(--color-primary)";

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 md:bottom-6">
      <div
        onClick={() => setExpanded(s => !s)}
        className="cursor-pointer rounded-full overflow-hidden transition-all duration-300"
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)`,
          borderRadius: expanded ? "20px" : "999px",
        }}
      >
        {/* Collapsed pill */}
        <div className="flex items-center gap-2.5 px-4 py-2">
          {/* Pulsing dot */}
          <span className="relative flex-shrink-0">
            <span className="absolute inline-flex h-2 w-2 rounded-full opacity-75 animate-ping" style={{ background: color }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
          </span>

          <span className="text-sm flex-shrink-0">{timerEmoji}</span>

          <span className="text-xs font-mono font-bold tabular-nums flex-shrink-0" style={{ color }}>
            {displayTime}
          </span>

          {!expanded && (
            <span className="text-xs text-gray-500 max-w-[90px] truncate hidden sm:block">
              {timerName}
            </span>
          )}

          <ChevronDown
            size={12}
            className="text-gray-600 flex-shrink-0 transition-transform duration-300"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="px-4 pb-3 border-t border-white/[0.05] mt-0.5" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-semibold text-white mt-2.5 truncate">{timerName}</p>
            {stepLabel && <p className="text-[11px] text-gray-500 mt-0.5 truncate">{stepLabel}</p>}

            {duration && (
              <div className="mt-2.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={onCancel}
                className="flex-1 py-1.5 rounded-xl text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/[0.06]"
              >
                Discard
              </button>
              <button
                onClick={onStop}
                className="flex-1 py-1.5 rounded-xl text-xs bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all flex items-center justify-center gap-1"
              >
                <Square size={9} fill="currentColor" /> Stop & Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
