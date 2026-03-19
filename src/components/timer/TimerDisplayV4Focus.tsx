"use client";

/**
 * VARIANT 4 — Focus Mode Card
 * Centered floating card, large time display, arc ring, goal + step clearly visible.
 * Feels like a dedicated focus/pomodoro session widget.
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

function ArcProgress({ pct, color }: { pct: number; color: string }) {
  // Semi-circle arc from 210° to -30° (bottom-left to bottom-right = 240° sweep)
  const r = 52;
  const cx = 64, cy = 64;
  const startAngle = 210;
  const sweep = 240;
  const endAngle = startAngle + sweep * Math.min(pct / 100, 1);

  function polar(angle: number) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const bg1 = polar(startAngle);
  const bg2 = polar(startAngle + sweep);
  const fg2 = polar(endAngle);
  const circ = 2 * Math.PI * r;
  const dashLen = (sweep / 360) * circ;
  const activeDash = (Math.min(pct / 100, 1) * sweep / 360) * circ;

  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"
        strokeDasharray={`${dashLen} ${circ}`}
        strokeDashoffset={(circ - dashLen) / 2}
        strokeLinecap="round" transform="rotate(120 64 64)"
      />
      {/* Progress */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${activeDash} ${circ}`}
        strokeDashoffset={(circ - dashLen) / 2}
        strokeLinecap="round" transform="rotate(120 64 64)"
        style={{ transition: "stroke-dasharray 0.6s ease", filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
}

export function TimerDisplayV4Focus({
  timerName, timerEmoji, stepLabel, displayTime,
  totalElapsed, duration, isComplete, onStop, onCancel,
}: Props) {
  const pct = duration ? Math.min((totalElapsed / duration) * 100, 100) : 0;
  const color = isComplete ? "#22C55E" : pct > 80 ? "#34D399" : pct > 50 ? "#F59E0B" : "var(--color-primary)";

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 md:bottom-6">
      <div
        className="flex flex-col items-center gap-0 px-6 pt-4 pb-5 rounded-3xl shadow-2xl w-64"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 32px ${color}18`,
        }}
      >
        {/* Arc ring with time */}
        <div className="relative">
          <ArcProgress pct={pct} color={color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pb-2">
            <span className="text-2xl">{timerEmoji}</span>
            <span className="text-lg font-mono font-black tabular-nums mt-0.5 leading-none" style={{ color }}>
              {displayTime}
            </span>
            {duration && (
              <span className="text-[10px] text-secondary mt-0.5">{Math.round(pct)}%</span>
            )}
          </div>
        </div>

        {/* Goal name + step */}
        <p className="text-sm font-semibold text-primary max-w-[200px] truncate text-center -mt-1">{timerName}</p>
        {stepLabel && (
          <p className="text-[11px] text-secondary mt-0.5 max-w-[200px] truncate text-center">{stepLabel}</p>
        )}

        {/* Controls */}
        <div className="flex gap-2 mt-4 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-xs text-secondary hover:text-error hover:bg-error/10 transition-all border border-surface-3 flex items-center justify-center gap-1"
          >
            <X size={11} /> Discard
          </button>
          <button
            onClick={onStop}
            className="flex-1 py-2 rounded-xl text-xs bg-error/15 text-error hover:bg-error/25 transition-all flex items-center justify-center gap-1"
          >
            <Square size={10} fill="currentColor" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
