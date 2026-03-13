"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { ExtraCurricularWithStatus } from "@/types";

interface Props {
  items: ExtraCurricularWithStatus[];
  onRefresh: () => void;
}

function staleBadge(item: ExtraCurricularWithStatus) {
  if (item.completedToday) {
    return <span className="text-xs font-medium text-success">today</span>;
  }
  if (item.lastPerformedDaysAgo === null) {
    return <span className="text-xs font-medium text-gray-500">never</span>;
  }
  const d = item.lastPerformedDaysAgo;
  if (d <= 2) {
    return <span className="text-xs font-medium text-success">{d}d ago</span>;
  }
  if (d <= 5) {
    return <span className="text-xs font-medium text-streak">{d}d ago</span>;
  }
  return <span className="text-xs font-medium text-error">{d}d ago</span>;
}

export function ExtraCurricularSection({ items, onRefresh }: Props) {
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const [addName, setAddName] = useState("");
  const [addEmoji, setAddEmoji] = useState("✨");
  const [adding, setAdding] = useState(false);

  // Sort: unchecked first (by staleness desc), checked sink to bottom
  const sorted = [...items].sort((a, b) => {
    const aChecked = optimistic[a.id] ?? a.completedToday;
    const bChecked = optimistic[b.id] ?? b.completedToday;
    if (aChecked !== bChecked) return aChecked ? 1 : -1;
    // Both unchecked — most stale first (null = never = top)
    const aStale = a.lastPerformedDaysAgo ?? Infinity;
    const bStale = b.lastPerformedDaysAgo ?? Infinity;
    if (aStale !== bStale) return bStale - aStale;
    return a.sortOrder - b.sortOrder;
  });

  function handleToggle(id: string, currentlyCompleted: boolean) {
    const newVal = !(optimistic[id] ?? currentlyCompleted);
    setOptimistic((prev) => ({ ...prev, [id]: newVal }));

    fetch("/api/extra-curriculars/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(() => onRefresh())
      .catch(() => setOptimistic((prev) => ({ ...prev, [id]: !newVal })));
  }

  async function handleAdd() {
    if (!addName.trim()) return;
    setAdding(true);
    try {
      await fetch("/api/extra-curriculars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName.trim(), emoji: addEmoji || "✨" }),
      });
      setAddName("");
      setAddEmoji("✨");
      onRefresh();
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Extra-Curriculars
      </h2>

      <div className="glass-card divide-y divide-white/[0.06]">
        {sorted.map((item) => {
          const checked = optimistic[item.id] ?? item.completedToday;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-3 transition-opacity"
              style={{ opacity: checked ? 0.6 : 1 }}
            >
              <button
                onClick={() => handleToggle(item.id, item.completedToday)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  checked
                    ? "bg-success border-success text-white"
                    : "border-gray-500 hover:border-gray-300"
                }`}
              >
                {checked && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <span className="text-base">{item.emoji}</span>
              <span className={`flex-1 text-sm font-medium ${checked ? "line-through text-gray-500" : "text-gray-200"}`}>
                {item.name}
              </span>

              {staleBadge(item)}
            </div>
          );
        })}

        {/* Quick-add row */}
        <div className="flex items-center gap-2 px-4 py-3">
          <input
            type="text"
            value={addEmoji}
            onChange={(e) => setAddEmoji(e.target.value)}
            className="w-10 text-center bg-transparent border border-white/10 rounded-md text-base py-1 focus:outline-none focus:border-primary"
            maxLength={2}
            placeholder="✨"
          />
          <input
            type="text"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 bg-transparent border border-white/10 rounded-md px-3 py-1 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary"
            placeholder="Add extra-curricular..."
          />
          <button
            onClick={handleAdd}
            disabled={!addName.trim() || adding}
            className="p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-40 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
