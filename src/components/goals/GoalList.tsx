"use client";

import { useState } from "react";
import { Pencil, Archive, RotateCcw, Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn, CATEGORY_COLORS, PRIORITY_LABELS, formatHours } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { GoalForm, type GoalFormData } from "./GoalForm";
import type { Goal } from "@/types";

interface GoalWithSteps extends Goal {
  steps?: { id: string; name: string; sortOrder: number; completedAt: Date | null }[];
}

interface GoalListProps {
  goals: Goal[];
  onRefresh: () => void;
}

export function GoalList({ goals, onRefresh }: GoalListProps) {
  const [editingGoal, setEditingGoal] = useState<GoalWithSteps | null>(null);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  function toggleExpand(goalId: string) {
    setExpandedGoals((prev) => {
      const next = new Set(prev);
      next.has(goalId) ? next.delete(goalId) : next.add(goalId);
      return next;
    });
  }

  async function handleEditClick(goal: Goal) {
    // Open modal immediately with existing data, then enrich with full data in background
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
      <div className="text-center py-12 text-gray-500">
        <p className="text-3xl mb-2">🎯</p>
        <p>No goals yet — add your first one!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {goals.map((goal) => {
          const steps = (goal as GoalWithSteps).steps ?? [];
          const doneCount = steps.filter((s) => s.completedAt !== null).length;
          const isExpanded = expandedGoals.has(goal.id);

          return (
            <div
              key={goal.id}
              className={cn(
                "glass-card px-3 py-2.5 flex flex-col gap-1.5",
                goal.isArchived && "opacity-50"
              )}
            >
              {/* Top row: emoji + name + category + actions */}
              <div className="flex items-center gap-2">
                <span className="text-lg flex-shrink-0">{goal.emoji}</span>
                <p className="font-medium text-primary text-sm flex-1 min-w-0 truncate">{goal.name}</p>
                <span className={cn("text-xs px-1.5 py-0.5 rounded-full bg-surface-2 flex-shrink-0", CATEGORY_COLORS[goal.category] ?? "text-secondary")}>
                  {goal.category}
                </span>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {!goal.isArchived ? (
                    <>
                      <button onClick={() => handleEditClick(goal)} className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-2 cursor-pointer transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleArchive(goal)} className="p-1.5 rounded-lg text-secondary hover:text-streak hover:bg-surface-2 cursor-pointer transition-colors">
                        <Archive size={13} />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleRestore(goal)} className="p-1.5 rounded-lg text-secondary hover:text-success hover:bg-surface-2 cursor-pointer transition-colors">
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Meta row: priority · target */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-secondary">{PRIORITY_LABELS[goal.priority]}</span>
                {goal.goalType === "timer" && goal.dailyTarget > 0 && (
                  <span className="text-xs text-secondary ml-auto">{formatHours(goal.dailyTarget)}/day</span>
                )}
              </div>

              {/* Steps */}
              {steps.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleExpand(goal.id)}
                    className="flex items-center gap-1 text-xs text-secondary hover:text-primary transition-colors cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    <span>{doneCount}/{steps.length} steps</span>
                  </button>
                  {isExpanded && (
                    <div className="mt-1 space-y-1 pl-1">
                      {steps.map((step) => {
                        const done = step.completedAt !== null;
                        return (
                          <div key={step.id} className="flex items-center gap-1.5">
                            <div className={cn(
                              "w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0",
                              done ? "bg-success/20 border-success/50" : "border-surface-3"
                            )}>
                              {done && <Check size={7} className="text-success" />}
                            </div>
                            <span className={cn("text-xs", done ? "line-through text-secondary/50" : "text-secondary")}>
                              {step.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
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
