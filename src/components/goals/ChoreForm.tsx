"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export interface ChoreFormData {
  name: string;
  emoji: string;
  deadline: string; // ISO date string from date picker
  estimatedMinutes: number;
  description: string;
}

interface ChoreFormProps {
  initial?: Partial<ChoreFormData>;
  onSubmit: (data: ChoreFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const TIME_PRESETS = [5, 10, 15, 20, 30, 45, 60, 90, 120];

export function ChoreForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: ChoreFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "\u{1F9F9}");
  const [deadline, setDeadline] = useState(
    initial?.deadline
      ? initial.deadline.slice(0, 10) // extract YYYY-MM-DD
      : ""
  );
  const [minutes, setMinutes] = useState<string>(
    initial?.estimatedMinutes ? String(initial.estimatedMinutes) : "30"
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !deadline) return;
    setLoading(true);
    try {
      const parsed = parseInt(minutes, 10);
      await onSubmit({
        name: name.trim(),
        emoji: emoji || "\u{1F9F9}",
        deadline: new Date(deadline + "T23:59:59").toISOString(),
        estimatedMinutes: !isNaN(parsed) && parsed > 0 ? parsed : 30,
        description: description.trim(),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Emoji + Name */}
      <div className="flex gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Emoji</label>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="w-14 text-center bg-surface-1 border border-white/10 rounded-lg px-2 py-2 text-lg focus:outline-none focus:border-primary"
            maxLength={2}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-1 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-primary"
            placeholder="e.g. Clean the garage, Fix the lamp..."
            autoFocus
          />
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Deadline
        </label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full bg-surface-1 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-primary [color-scheme:dark]"
        />
      </div>

      {/* Estimated time */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">
          Estimated time
        </label>
        <div className="flex gap-2 flex-wrap mb-2">
          {TIME_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setMinutes(String(p))}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                minutes === String(p)
                  ? "bg-primary/20 border-primary text-primary"
                  : "border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20"
              }`}
            >
              {p >= 60 ? `${p / 60}h` : `${p}m`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={600}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-16 bg-surface-1 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-gray-100 text-center focus:outline-none focus:border-primary"
            placeholder="\u2014"
          />
          <span className="text-xs text-gray-500">minutes</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Description <span className="text-gray-600">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full bg-surface-1 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-primary resize-none"
          placeholder="Any details or notes about this chore..."
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || !deadline || loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
