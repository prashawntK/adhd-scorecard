"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ExtraCurricularFormProps {
  initial?: { name: string; emoji: string };
  onSubmit: (data: { name: string; emoji: string }) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ExtraCurricularForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: ExtraCurricularFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "✨");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), emoji: emoji || "✨" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="e.g. Meditation, Guitar, Reading..."
            autoFocus
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
