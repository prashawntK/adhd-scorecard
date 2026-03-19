"use client";

/**
 * VARIANT 1 — Orbital Ring
 * Circular progress ring floating bottom-center.
 * Time lives inside the ring, goal name + controls below.
 */

import { useState, useEffect } from "react";
import { Square, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
      <circle
        cx="48" cy="48" r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
}

export function TimerDisplayV1Orbital({
  timerName, timerEmoji, stepLabel, displayTime,
  totalElapsed, duration, isComplete, onStop, onCancel,
}: Props) {
  const pct = duration ? Math.min((totalElapsed / duration) * 100, 100) : 0;
  const color = isComplete ? "#22C55E" : pct > 80 ? "#34D399" : pct > 50 ? "#F59E0B" : "var(--color-primary)";

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 md:bottom-6">
      <div
        className="flex flex-col items-center gap-2 px-5 py-4 rounded-3xl shadow-2xl"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Ring + emoji + time */}
        <div className="relative">
          <Ring pct={pct} color={color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl">{timerEmoji}</span>
            <span className="text-xs font-mono font-bold tabular-nums" style={{ color }}>
              {displayTime}
            </span>
          </div>
        </div>

        {/* Name */}
        <p className="text-xs font-semibold text-primary max-w-[160px] truncate text-center">{timerName}</p>
        {stepLabel && <p className="text-[10px] text-secondary -mt-1.5 max-w-[160px] truncate text-center">{stepLabel}</p>}

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-xl text-xs text-secondary hover:text-error hover:bg-error/10 transition-all flex items-center gap-1"
          >
            <X size={11} /> Discard
          </button>
          <button
            onClick={onStop}
            className="px-3 py-1.5 rounded-xl text-xs bg-error/15 text-error hover:bg-error/25 transition-all flex items-center gap-1"
          >
            <Square size={10} fill="currentColor" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
