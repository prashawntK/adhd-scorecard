"use client";

import { useState } from "react";
import { Pencil, Archive, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { ExtraCurricularForm, type ExtraCurricularFormData } from "./ExtraCurricularForm";
import type { ExtraCurricular } from "@/types";
import { useToast } from "@/lib/toast";

type DayStatus = { date: string; completed: boolean };
type ECWithTime = ExtraCurricular & {
  targetMinutes?: number | null;
  last7Days?: DayStatus[];
};

interface ExtraCurricularListProps {
  items: ECWithTime[];
  onRefresh: () => void;
}

function timeLabel(minutes: number | null | undefined): string | null {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h${m}m` : `${h}h`;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
function getDayLabel(dateStr: string): string {
  return DAY_LABELS[new Date(dateStr + "T12:00:00").getDay()];
}

type Staleness = "fresh" | "fading" | "stale" | "empty";

function getStaleness(days: DayStatus[]): Staleness {
  if (days.length === 0) return "empty";
  const todayDone = days[days.length - 1]?.completed;
  if (todayDone) return "fresh";
  const lastDoneIdx = [...days].reverse().findIndex((d) => d.completed);
  if (lastDoneIdx === -1) return "empty";
  if (lastDoneIdx <= 2) return "fading";
  return "stale";
}

function getOrbStyles(staleness: Staleness) {
  switch (staleness) {
    case "fresh":
      return {
        background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18) 0%, transparent 60%), rgba(16,185,129,0.18)",
        boxShadow: "0 0 18px 4px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
        borderColor: "rgba(16,185,129,0.5)",
      };
    case "fading":
      return {
        background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.15) 0%, transparent 60%), rgba(245,158,11,0.15)",
        boxShadow: "0 0 14px 3px rgba(245,158,11,0.28), inset 0 1px 0 rgba(255,255,255,0.2)",
        borderColor: "rgba(245,158,11,0.4)",
      };
    case "stale":
      return {
        background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.12) 0%, transparent 60%), rgba(239,68,68,0.12)",
        boxShadow: "0 0 12px 2px rgba(239,68,68,0.22), inset 0 1px 0 rgba(255,255,255,0.15)",
        borderColor: "rgba(239,68,68,0.35)",
      };
    default:
      return {
        background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.08) 0%, transparent 60%), rgba(255,255,255,0.05)",
        boxShadow: "0 0 0 0 transparent, inset 0 1px 0 rgba(255,255,255,0.1)",
        borderColor: "rgba(255,255,255,0.12)",
      };
  }
}

export function ExtraCurricularList({ items, onRefresh }: ExtraCurricularListProps) {
  const [editingItem, setEditingItem] = useState<ECWithTime | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  async function handleEdit(data: ExtraCurricularFormData) {
    if (!editingItem) return;
    try {
      await fetch(`/api/extra-curriculars/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setEditingItem(null);
      onRefresh();
      toastSuccess("Activity updated", data.name);
    } catch {
      toastError("Failed to update activity");
    }
  }

  async function handleArchive(item: ECWithTime) {
    try {
      await fetch(`/api/extra-curriculars/${item.id}`, { method: "DELETE" });
      onRefresh();
      toastSuccess("Activity archived", item.name);
    } catch {
      toastError("Failed to archive activity");
    }
  }

  async function handleRestore(item: ECWithTime) {
    try {
      await fetch(`/api/extra-curriculars/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: false, archivedAt: null }),
      });
      onRefresh();
      toastSuccess("Activity restored", item.name);
    } catch {
      toastError("Failed to restore activity");
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-3xl mb-2">✨</p>
        <p>No extra-curriculars yet — add your first one!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 pt-1 px-0.5">
        {items.map((item) => {
          const days = item.last7Days ?? [];
          const staleness = getStaleness(days);
          const orbStyles = getOrbStyles(staleness);
          const time = timeLabel(item.targetMinutes);
          const streak = [...days].reverse().findIndex((d) => !d.completed);
          const currentStreak = streak === -1 ? days.filter(d => d.completed).length : streak;

          return (
            <div
              key={item.id}
              className={cn(
                "relative rounded-2xl border p-4 flex flex-col items-center gap-3 group transition-all duration-300",
                "hover:-translate-y-0.5",
                item.isArchived && "opacity-40"
              )}
              style={{
                background: "var(--glass-bg)",
                backdropFilter: "blur(12px)",
                borderColor: orbStyles.borderColor,
                boxShadow: `0 0 0 0 transparent, 0 2px 12px rgba(0,0,0,0.08)`,
              }}
            >
              {/* Action buttons — top right */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {!item.isArchived ? (
                  <>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/10 transition-all"
                      title="Edit"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={() => handleArchive(item)}
                      className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/10 transition-all"
                      title="Archive"
                    >
                      <Archive size={11} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRestore(item)}
                    className="p-1 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-white/10 transition-all"
                    title="Restore"
                  >
                    <RotateCcw size={11} />
                  </button>
                )}
              </div>

              {/* Orb */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border"
                style={{
                  background: orbStyles.background,
                  boxShadow: orbStyles.boxShadow,
                  borderColor: orbStyles.borderColor,
                }}
              >
                {item.emoji}
              </div>

              {/* Name */}
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-100 leading-tight line-clamp-1">{item.name}</p>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  {time && <span className="text-[10px] text-gray-500">{time}</span>}
                  {currentStreak > 0 && (
                    <span className="text-[10px] text-amber-400 font-medium">🔥{currentStreak}d</span>
                  )}
                </div>
              </div>

              {/* 7-day dot strip */}
              {days.length > 0 && (
                <div className="flex items-end gap-1">
                  {days.map((day, i) => {
                    const isToday = i === days.length - 1;
                    return (
                      <div key={day.date} className="flex flex-col items-center gap-0.5">
                        <div
                          className={cn(
                            "rounded-full transition-all duration-200",
                            isToday ? "w-2.5 h-2.5" : "w-2 h-2",
                            day.completed
                              ? "bg-emerald-400 shadow-sm shadow-emerald-400/60"
                              : isToday
                              ? "bg-gray-400/60 ring-1 ring-gray-400"
                              : "bg-gray-400/25"
                          )}
                        />
                        <span className="text-[7px] text-gray-600 leading-none font-medium">
                          {getDayLabel(day.date)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Edit Extra-Curricular"
      >
        {editingItem && (
          <ExtraCurricularForm
            initial={{
              name: editingItem.name,
              emoji: editingItem.emoji,
              targetMinutes: editingItem.targetMinutes ?? null,
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditingItem(null)}
            submitLabel="Update"
          />
        )}
      </Modal>
    </>
  );
}
