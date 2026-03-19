"use client";

import { useState } from "react";
import { TimerDisplayV1Orbital } from "@/components/timer/TimerDisplayV1Orbital";
import { TimerDisplayV2Glass } from "@/components/timer/TimerDisplayV2Glass";
import { TimerDisplayV3Island } from "@/components/timer/TimerDisplayV3Island";
import { TimerDisplayV4Focus } from "@/components/timer/TimerDisplayV4Focus";

const MOCK = {
  timerName: "Job Search",
  timerEmoji: "💼",
  stepLabel: "Search for Nepali BackEnd Jobs",
  displayTime: "24:32",
  totalElapsed: 1472,
  duration: 1800, // 30 min
  isComplete: false,
};

const VARIANTS = [
  { id: 1, label: "Orbital Ring",        desc: "Circular progress ring, time lives inside" },
  { id: 2, label: "Glass Banner",        desc: "Full-width card with left accent glow" },
  { id: 3, label: "Dynamic Island",      desc: "Compact pill that expands on tap" },
  { id: 4, label: "Focus Mode",          desc: "Large arc + emoji, centered card" },
];

export default function TimerPreviewPage() {
  const [active, setActive] = useState<number | null>(null);

  const noop = () => {};
  const mockProps = { ...MOCK, onStop: noop, onCancel: noop };

  return (
    <div className="min-h-screen bg-[var(--background)] text-primary p-6">
      <h1 className="text-xl font-bold mb-1">Timer Display — Design Variants</h1>
      <p className="text-sm text-secondary mb-8">Click a card to preview that variant in place. The widget appears at the bottom.</p>

      {/* Variant selector cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(active === v.id ? null : v.id)}
            className={`text-left p-4 rounded-2xl border transition-all ${
              active === v.id
                ? "border-primary/60 bg-primary/10"
                : "border-surface-3 bg-surface-2 hover:border-primary/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${active === v.id ? "bg-primary text-white" : "bg-surface-3 text-secondary"}`}>
                {v.id}
              </span>
              <span className="font-semibold text-sm">{v.label}</span>
            </div>
            <p className="text-xs text-secondary ml-8">{v.desc}</p>
          </button>
        ))}
      </div>

      <p className="text-xs text-secondary mt-6">
        {active ? `Showing variant ${active} — ${VARIANTS[active - 1].label}` : "Select a variant above to preview it."}
      </p>

      {/* Render active variant */}
      {active === 1 && <TimerDisplayV1Orbital {...mockProps} />}
      {active === 2 && <TimerDisplayV2Glass {...mockProps} />}
      {active === 3 && <TimerDisplayV3Island {...mockProps} />}
      {active === 4 && <TimerDisplayV4Focus {...mockProps} />}
    </div>
  );
}
