"use client";

import { useState } from "react";
import { Plus, X, Check, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, CATEGORY_HEX } from "@/lib/utils";

const CATEGORIES = [
  { value: "Learning",  emoji: "📚", color: "#8B5CF6" },
  { value: "Career",   emoji: "💼", color: "#F59E0B" },
  { value: "Health",   emoji: "🏃", color: "#10B981" },
  { value: "Personal", emoji: "🌱", color: "#3B82F6" },
  { value: "Creative", emoji: "🎨", color: "#EC4899" },
] as const;

const PRIORITIES = [
  { value: "must",   label: "Must Do",    desc: "Non-negotiable", color: "#EF4444" },
  { value: "should", label: "Should Do",  desc: "Important",      color: "#F59E0B" },
  { value: "want",   label: "Want To Do", desc: "Nice to have",   color: "#22C55E" },
] as const;

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  steps: { id?: string; name: string; completedAt?: string | null }[];
}

// Floating label input
function FloatingInput({
  label,
  accentColor,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; accentColor?: string }) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!props.value && String(props.value).length > 0;
  const lifted = focused || hasValue;

  return (
    <div className="relative">
      <input
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
        className={cn(
          "w-full bg-white/4 rounded-xl px-3 pt-6 pb-2 text-sm text-gray-100",
          "border transition-all duration-200 outline-none",
          "placeholder-transparent",
          focused
            ? "border-transparent shadow-[0_0_0_1.5px_var(--accent)] bg-white/6"
            : "border-white/8 hover:border-white/14",
          className
        )}
        style={focused ? { "--accent": accentColor ?? "#6366F1" } as React.CSSProperties : undefined}
        placeholder={label}
      />
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[2.5px] rounded-full transition-all duration-300"
        style={{
          background: accentColor ?? "#6366F1",
          opacity: focused ? 1 : 0,
          transform: focused ? "scaleY(1)" : "scaleY(0.4)",
        }}
      />
      <label
        className={cn(
          "absolute left-3 transition-all duration-200 pointer-events-none select-none",
          lifted
            ? "top-2 text-[10px] font-semibold tracking-wide"
            : "top-1/2 -translate-y-1/2 text-sm"
        )}
        style={{ color: lifted ? (accentColor ?? "#6366F1") : "#6B7280" }}
      >
        {label}
      </label>
    </div>
  );
}

// Floating label textarea
function FloatingTextarea({
  label,
  accentColor,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; accentColor?: string }) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!props.value && String(props.value).length > 0;
  const lifted = focused || hasValue;

  return (
    <div className="relative">
      <textarea
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
        className={cn(
          "w-full bg-white/4 rounded-xl px-3 pt-6 pb-2 text-sm text-gray-100 resize-none",
          "border transition-all duration-200 outline-none",
          "placeholder-transparent",
          focused
            ? "border-transparent shadow-[0_0_0_1.5px_var(--accent)] bg-white/6"
            : "border-white/8 hover:border-white/14",
          className
        )}
        style={focused ? { "--accent": accentColor ?? "#6366F1" } as React.CSSProperties : undefined}
        placeholder={label}
      />
      <div
        className="absolute left-0 top-3 bottom-3 w-[2.5px] rounded-full transition-all duration-300"
        style={{
          background: accentColor ?? "#6366F1",
          opacity: focused ? 1 : 0,
          transform: focused ? "scaleY(1)" : "scaleY(0.4)",
        }}
      />
      <label
        className={cn(
          "absolute left-3 transition-all duration-200 pointer-events-none select-none",
          lifted ? "top-2 text-[10px] font-semibold tracking-wide" : "top-4 text-sm"
        )}
        style={{ color: lifted ? (accentColor ?? "#6366F1") : "#6B7280" }}
      >
        {label}
      </label>
    </div>
  );
}

export function GoalForm({ initial, onSubmit, onCancel, submitLabel = "Save Goal" }: GoalFormProps) {
  const [form, setForm] = useState<GoalFormData>({
    name:        initial?.name        ?? "",
    emoji:       initial?.emoji       ?? "🎯",
    category:    initial?.category    ?? "Learning",
    goalType:    initial?.goalType    ?? "timer",
    dailyTarget: initial?.dailyTarget ?? 1,
    priority:    initial?.priority    ?? "should",
    activeDays:  initial?.activeDays  ?? [0, 1, 2, 3, 4, 5, 6],
    description: initial?.description ?? "",
    motivation:  initial?.motivation  ?? "",
    steps:       initial?.steps       ?? [],
  });
  const [loading, setLoading] = useState(false);

  const accentColor = CATEGORY_HEX[form.category] ?? "#6366F1";

  function addStep() {
    setForm((f) => ({ ...f, steps: [...f.steps, { name: "" }] }));
  }
  function removeStep(i: number) {
    setForm((f) => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));
  }
  function updateStep(i: number, name: string) {
    setForm((f) => ({ ...f, steps: f.steps.map((s, idx) => (idx === i ? { ...s, name } : s)) }));
  }
  function moveStep(i: number, dir: "up" | "down") {
    setForm((f) => {
      const steps = [...f.steps];
      const t = dir === "up" ? i - 1 : i + 1;
      if (t < 0 || t >= steps.length) return f;
      [steps[i], steps[t]] = [steps[t], steps[i]];
      return { ...f, steps };
    });
  }
  function toggleDay(d: number) {
    setForm((f) => ({
      ...f,
      activeDays: f.activeDays.includes(d)
        ? f.activeDays.filter((x) => x !== d)
        : [...f.activeDays, d].sort(),
    }));
  }
  function stepTarget(delta: number) {
    setForm((f) => ({
      ...f,
      dailyTarget: Math.min(12, Math.max(0.25, Math.round((f.dailyTarget + delta) * 4) / 4)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Identity ───────────────────────────────────────────── */}
      <div className="flex gap-2 items-start">
        {/* Emoji — small floating input */}
        <div className="relative flex-shrink-0">
          <input
            value={form.emoji}
            onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
            maxLength={2}
            className={cn(
              "w-14 h-14 rounded-xl text-center text-2xl outline-none transition-all duration-200",
              "bg-white/4 border border-white/8 hover:border-white/14",
              "focus:border-transparent focus:bg-white/6"
            )}
            style={{ boxShadow: `0 0 0 0px ${accentColor}` }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 1.5px ${accentColor}`; }}
            onBlur={(e)  => { e.currentTarget.style.boxShadow = `0 0 0 0px ${accentColor}`; }}
          />
        </div>
        <div className="flex-1">
          <FloatingInput
            label="Goal name"
            required
            accentColor={accentColor}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
      </div>

      {/* ── Category ───────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Category</p>
        <div className="flex gap-2">
          {CATEGORIES.map(({ value, emoji, color }) => {
            const active = form.category === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: value }))}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all duration-200 text-xs font-medium"
                style={active ? {
                  background: `${color}1a`,
                  borderColor: `${color}60`,
                  color,
                  boxShadow: `0 0 12px ${color}20`,
                } : {
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.08)",
                  color: "#6B7280",
                }}
              >
                <span className="text-base">{emoji}</span>
                <span className="text-[10px]">{value}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Goal type ──────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Type</p>
        <div className="flex gap-2">
          {(["timer", "checkbox"] as const).map((t) => {
            const active = form.goalType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, goalType: t }))}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200"
                style={active ? {
                  background: `${accentColor}18`,
                  borderColor: `${accentColor}50`,
                  color: accentColor,
                  boxShadow: `0 0 10px ${accentColor}18`,
                } : {
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.08)",
                  color: "#6B7280",
                }}
              >
                {t === "timer" ? "⏱ Timer" : "✅ Checkbox"}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Daily target (timer only) ───────────────────────────── */}
      {form.goalType === "timer" && (
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Daily target</p>
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-200"
            style={{ background: `${accentColor}0d`, borderColor: `${accentColor}30` }}
          >
            <button
              type="button"
              onClick={() => stepTarget(-0.25)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ background: `${accentColor}25`, color: accentColor }}
            >
              <Minus size={13} />
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold tabular-nums" style={{ color: accentColor }}>
                {form.dailyTarget % 1 === 0 ? form.dailyTarget : form.dailyTarget.toFixed(2).replace(/\.?0+$/, "")}
              </span>
              <span className="text-sm text-gray-500 ml-1.5">hrs / day</span>
            </div>
            <button
              type="button"
              onClick={() => stepTarget(0.25)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ background: `${accentColor}25`, color: accentColor }}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── Priority ───────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Priority</p>
        <div className="flex gap-2">
          {PRIORITIES.map(({ value, label, desc, color }) => {
            const active = form.priority === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, priority: value }))}
                className="flex-1 py-2.5 px-2 rounded-xl border text-center transition-all duration-200"
                style={active ? {
                  background: `${color}18`,
                  borderColor: `${color}50`,
                  boxShadow: `0 0 10px ${color}18`,
                } : {
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <p className="text-xs font-semibold" style={{ color: active ? color : "#6B7280" }}>{label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: active ? `${color}99` : "#4B5563" }}>{desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active days ────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Active days</p>
        <div className="flex gap-1.5">
          {DAYS.map((d, i) => {
            const active = form.activeDays.includes(i);
            return (
              <button
                key={DAY_FULL[i]}
                type="button"
                onClick={() => toggleDay(i)}
                title={DAY_FULL[i]}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                style={active ? {
                  background: `${accentColor}25`,
                  color: accentColor,
                  border: `1px solid ${accentColor}50`,
                } : {
                  background: "rgba(255,255,255,0.04)",
                  color: "#4B5563",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Description ────────────────────────────────────────── */}
      <FloatingTextarea
        label="Description (optional)"
        accentColor={accentColor}
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        className="h-20"
      />

      {/* ── Motivation ─────────────────────────────────────────── */}
      <FloatingTextarea
        label="Why does this matter to you? (optional)"
        accentColor={accentColor}
        value={form.motivation}
        onChange={(e) => setForm((f) => ({ ...f, motivation: e.target.value }))}
        className="h-16"
      />

      {/* ── Steps ──────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
          Steps <span className="normal-case font-normal text-gray-600">— break into sub-tasks</span>
        </p>
        <div className="space-y-2">
          {form.steps.map((step, i) => {
            const done = !!step.completedAt;
            return (
              <div key={i} className="flex gap-2 items-center">
                <div className="flex flex-col flex-shrink-0">
                  <button type="button" onClick={() => moveStep(i, "up")} disabled={i === 0}
                    className="p-0.5 text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors">
                    <ChevronUp size={12} />
                  </button>
                  <button type="button" onClick={() => moveStep(i, "down")} disabled={i === form.steps.length - 1}
                    className="p-0.5 text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors">
                    <ChevronDown size={12} />
                  </button>
                </div>
                {done ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center flex-shrink-0">
                    <Check size={10} className="text-emerald-400" />
                  </div>
                ) : (
                  <span className="text-xs text-gray-600 w-5 flex-shrink-0 text-center font-mono">{i + 1}.</span>
                )}
                <div className="flex-1 relative">
                  <input
                    value={step.name}
                    onChange={(e) => updateStep(i, e.target.value)}
                    placeholder={`Step ${i + 1}`}
                    className={cn(
                      "w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-sm text-gray-100",
                      "outline-none transition-all duration-200 hover:border-white/14",
                      "focus:border-transparent focus:bg-white/6",
                      done && "line-through text-gray-500 opacity-60"
                    )}
                    onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 1.5px ${accentColor}`; }}
                    onBlur={(e)  => { e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <button type="button" onClick={() => removeStep(i)}
                  className="p-1 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="mt-2.5 text-xs flex items-center gap-1 transition-colors font-medium"
          style={{ color: accentColor }}
        >
          <Plus size={12} /> Add step
        </button>
      </div>

      {/* ── Actions ────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-1">
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
