"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Learning", "Career", "Health", "Personal", "Creative"] as const;
const PRIORITIES = [
  { value: "must", label: "Must Do", color: "border-error text-error" },
  { value: "should", label: "Should Do", color: "border-streak text-streak" },
  { value: "want", label: "Want To Do", color: "border-success text-success" },
] as const;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface GoalFormProps {
  initial?: Partial<GoalFormData>;
  onSubmit: (data: GoalFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export interface GoalFormData {
  name: string;
  emoji: string;
  category: string;
  goalType: "timer" | "checkbox";
  dailyTarget: number;
  priority: "must" | "should" | "want";
  activeDays: number[];
  description: string;
  motivation: string;
}

export function GoalForm({ initial, onSubmit, onCancel, submitLabel = "Save Goal" }: GoalFormProps) {
  const [form, setForm] = useState<GoalFormData>({
    name: initial?.name ?? "",
    emoji: initial?.emoji ?? "🎯",
    category: initial?.category ?? "Learning",
    goalType: initial?.goalType ?? "timer",
    dailyTarget: initial?.dailyTarget ?? 1,
    priority: initial?.priority ?? "should",
    activeDays: initial?.activeDays ?? [0, 1, 2, 3, 4, 5, 6],
    description: initial?.description ?? "",
    motivation: initial?.motivation ?? "",
  });
  const [loading, setLoading] = useState(false);

  function toggleDay(d: number) {
    setForm((f) => ({
      ...f,
      activeDays: f.activeDays.includes(d)
        ? f.activeDays.filter((x) => x !== d)
        : [...f.activeDays, d].sort(),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  }

  const field = "bg-surface-2 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-gray-100 w-full focus:outline-none focus:border-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name + emoji */}
      <div className="flex gap-2">
        <input
          value={form.emoji}
          onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
          className={cn(field, "w-14 text-center text-xl")}
          maxLength={2}
        />
        <input
          required
          placeholder="Goal name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={cn(field, "flex-1")}
        />
      </div>

      {/* Category */}
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm((f) => ({ ...f, category: c }))}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                form.category === c
                  ? "border-primary bg-primary/15 text-primary-light"
                  : "border-white/[0.08] text-gray-400 hover:border-white/[0.15]"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Goal type */}
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Type</label>
        <div className="flex gap-2">
          {(["timer", "checkbox"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((f) => ({ ...f, goalType: t }))}
              className={cn(
                "flex-1 py-2 rounded-xl border text-sm font-medium transition-all",
                form.goalType === t
                  ? "border-primary bg-primary/15 text-primary-light"
                  : "border-white/[0.08] text-gray-400 hover:border-white/[0.15]"
              )}
            >
              {t === "timer" ? "⏱ Timer" : "✅ Checkbox"}
            </button>
          ))}
        </div>
      </div>

      {/* Daily target (timer only) */}
      {form.goalType === "timer" && (
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">
            Daily target (hours)
          </label>
          <input
            type="number"
            min={0.25}
            max={12}
            step={0.25}
            value={form.dailyTarget}
            onChange={(e) => setForm((f) => ({ ...f, dailyTarget: parseFloat(e.target.value) || 0 }))}
            className={field}
          />
        </div>
      )}

      {/* Priority */}
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Priority</label>
        <div className="flex gap-2">
          {PRIORITIES.map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, priority: value }))}
              className={cn(
                "flex-1 py-2 rounded-xl border text-xs font-medium transition-all",
                form.priority === value
                  ? color + " bg-white/5"
                  : "border-white/[0.08] text-gray-400 hover:border-white/[0.15]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Active days */}
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Active days</label>
        <div className="flex gap-1.5">
          {DAYS.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(i)}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all",
                form.activeDays.includes(i)
                  ? "bg-primary text-white"
                  : "bg-surface-2 text-gray-500 hover:bg-surface-3"
              )}
            >
              {d[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <textarea
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        className={cn(field, "resize-none h-20")}
      />

      {/* Motivation */}
      <textarea
        placeholder="Why does this matter to you? (optional)"
        value={form.motivation}
        onChange={(e) => setForm((f) => ({ ...f, motivation: e.target.value }))}
        className={cn(field, "resize-none h-16")}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
