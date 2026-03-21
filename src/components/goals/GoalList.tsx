"use client";

import { useState } from "react";
import { Pencil, Archive, RotateCcw, Check, Flame, Target, Clock } from "lucide-react";
import { cn, CATEGORY_COLORS, CATEGORY_HEX, PRIORITY_COLORS, formatHours } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { GoalForm, type GoalFormData } from "./GoalForm";
import type { Goal } from "@/types";

interface GoalWithSteps extends Goal {
  steps?: { id: string; name: string; sortOrder: number; completedAt: Date | null }[];
  streak?: { currentStreak: number; longestStreak: number };
}

interface GoalListProps {
  goals: Goal[];
  onRefresh: () => void;
}

const PRIORITY_STRIP: Record<string, string> = {
  must:   "from-red-500/60 to-red-500/0",
  should: "from-amber-500/60 to-amber-500/0",
  want:   "from-emerald-500/60 to-emerald-500/0",
};

const PRIORITY_LABEL: Record<string, string> = {
  must:   "Must",
  should: "Should",
  want:   "Want",
};

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function GoalList({ goals, onRefresh }: GoalListProps) {
  const [editingGoal, setEditingGoal] = useState<GoalWithSteps | null>(null);

  async function handleEditClick(goal: Goal) {
    setEditingGoal(goal as GoalWithSteps);
    const res = await fetch(`/api/goals/${goal.id}`);
    const full = await res.json();
    setEditingGoal(full);
  }

  async function handleEdit(data: GoalFormData) {
    if (!editingGoal) return;
    await fetch(`/api/goals/${editingGoal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditingGoal(null);
    onRefresh();
  }

  async function handleArchive(goal: Goal) {
    await fetch(`/api/goals/${goal.id}`, { method: "DELETE" });
    onRefresh();
  }

  async function handleRestore(goal: Goal) {
    await fetch(`/api/goals/${goal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: false, archivedAt: null }),
    });
    onRefresh();
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-3">🎯</p>
        <p className="font-medium">No goals yet</p>
        <p className="text-sm mt-1 text-gray-600">Add your first goal to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {goals.map((goal) => {
          const g = goal as GoalWithSteps;
          const activeDays: number[] = Array.isArray(g.activeDays)
            ? (g.activeDays as number[])
            : [0, 1, 2, 3, 4, 5, 6];
          const steps = g.steps ?? [];
          const doneSteps = steps.filter((s) => s.completedAt !== null).length;
          const stepPct = steps.length > 0 ? (doneSteps / steps.length) * 100 : 0;
          const streak = g.streak?.currentStreak ?? 0;
          const categoryColor = CATEGORY_HEX[g.category] ?? "#6B7280";

          return (
            <div
              key={g.id}
              className={cn(
                "relative glass-card overflow-hidden group transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-lg",
                g.isArchived && "opacity-50"
              )}
            >
              {/* Priority strip — top gradient bar */}
              <div
                className={cn(
                  "absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r",
                  PRIORITY_STRIP[g.priority] ?? "from-gray-500/40 to-gray-500/0"
                )}
              />

              <div className="p-3.5 pt-4">
                {/* Top row: emoji + priority + actions */}
                <div className="flex items-start justify-between mb-2.5">
                  {/* Emoji bubble */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${categoryColor}1a`, border: `1px solid ${categoryColor}30` }}
                  >
                    {g.emoji}
                  </div>

                  {/* Priority badge + action buttons */}
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                      PRIORITY_COLORS[g.priority] ?? "text-gray-400 bg-gray-500/12"
                    )}>
                      {PRIORITY_LABEL[g.priority]}
                    </span>

                    {/* Action buttons — always visible on goals page */}
                    {!g.isArchived ? (
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(g)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/8 transition-all"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleArchive(g)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Archive size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRestore(g)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Goal name */}
                <p className="font-semibold text-gray-100 text-sm leading-tight mb-1 line-clamp-2">
                  {g.name}
                </p>

                {/* Category */}
                <p className={cn("text-[11px] font-medium mb-3", CATEGORY_COLORS[g.category] ?? "text-gray-400")}>
                  {g.category}
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-3 mb-3">
                  {/* Streak */}
                  <div className="flex items-center gap-1">
                    <Flame size={12} className={streak > 0 ? "text-orange-400" : "text-gray-600"} />
                    <span className={cn("text-xs font-semibold tabular-nums", streak > 0 ? "text-orange-400" : "text-gray-600")}>
                      {streak}
                    </span>
                  </div>

                  {/* Daily target */}
                  {g.goalType === "timer" && g.dailyTarget > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock size={11} className="text-gray-500" />
                      <span className="text-[11px] text-gray-500">{formatHours(g.dailyTarget)}/day</span>
                    </div>
                  )}
                  {g.goalType === "checkbox" && (
                    <div className="flex items-center gap-1">
                      <Target size={11} className="text-gray-500" />
                      <span className="text-[11px] text-gray-500">Checkbox</span>
                    </div>
                  )}
                </div>

                {/* Step progress bar */}
                {steps.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-500">Steps</span>
                      <div className="flex items-center gap-1">
                        <Check size={9} className="text-emerald-400" />
                        <span className="text-[10px] text-gray-400 tabular-nums">{doneSteps}/{steps.length}</span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full bg-white/6 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stepPct}%`,
                          background: stepPct === 100
                            ? "linear-gradient(90deg, #22c55e, #34d399)"
                            : `linear-gradient(90deg, ${categoryColor}, ${categoryColor}99)`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Active days */}
                <div className="flex gap-0.5">
                  {DAY_LABELS.map((label, idx) => {
                    const active = activeDays.includes(idx);
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "flex-1 flex items-center justify-center h-5 rounded text-[9px] font-semibold transition-all",
                          active
                            ? "text-white"
                            : "text-gray-700 bg-white/4"
                        )}
                        style={active ? {
                          background: `${categoryColor}30`,
                          color: categoryColor,
                          border: `1px solid ${categoryColor}40`,
                        } : undefined}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        title="Edit Goal"
      >
        {editingGoal && (
          <GoalForm
            initial={{
              name: editingGoal.name,
              emoji: editingGoal.emoji,
              category: editingGoal.category,
              goalType: editingGoal.goalType as "timer" | "checkbox",
              dailyTarget: editingGoal.dailyTarget,
              priority: editingGoal.priority as "must" | "should" | "want",
              activeDays: Array.isArray(editingGoal.activeDays)
                ? (editingGoal.activeDays as number[])
                : [0, 1, 2, 3, 4, 5, 6],
              description: editingGoal.description ?? "",
              motivation: editingGoal.motivation ?? "",
              steps: (editingGoal.steps ?? []).map((s) => ({
                id: s.id,
                name: s.name,
                completedAt: s.completedAt instanceof Date
                  ? s.completedAt.toISOString()
                  : s.completedAt ?? null,
              })),
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditingGoal(null)}
            submitLabel="Update Goal"
          />
        )}
      </Modal>
    </>
  );
}
