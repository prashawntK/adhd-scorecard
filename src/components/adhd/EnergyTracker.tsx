"use client";

import { useEffect, useState } from "react";

const LEVELS = [
  { level: 1, emoji: "🪫", label: "Drained" },
  { level: 2, emoji: "😴", label: "Low" },
  { level: 3, emoji: "😐", label: "Okay" },
  { level: 4, emoji: "😊", label: "Good" },
  { level: 5, emoji: "⚡", label: "High" },
];

export function EnergyTracker() {
  const [current, setCurrent] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/energy")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.length > 0) {
          setCurrent(data[data.length - 1].level);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSelect(level: number) {
    setCurrent(level);
    setOpen(false);
    await fetch("/api/energy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level }),
    });
  }

  const currentInfo = LEVELS.find((l) => l.level === current);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/[0.08] transition-all"
      >
        <span className="text-base">{currentInfo?.emoji ?? "⚡"}</span>
        {currentInfo && (
          <span className="text-xs text-gray-400 hidden sm:block">{currentInfo.label}</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 bg-surface-1 border border-white/[0.08] rounded-2xl shadow-xl p-2 min-w-[140px]">
            <p className="text-xs text-gray-500 px-2 py-1 font-medium">Energy level</p>
            {LEVELS.map((l) => (
              <button
                key={l.level}
                onClick={() => handleSelect(l.level)}
                className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-xl text-sm hover:bg-surface-2 transition-all text-left ${
                  current === l.level ? "bg-surface-2 text-gray-100" : "text-gray-400"
                }`}
              >
                <span>{l.emoji}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
