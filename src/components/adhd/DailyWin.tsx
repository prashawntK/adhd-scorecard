"use client";

import { useEffect, useRef, useState } from "react";

export function DailyWin() {
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/journal")
      .then((r) => r.json())
      .then((data) => {
        if (data?.content) setContent(data.content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleChange(value: string) {
    setContent(value);
    setSaved(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!value.trim()) return;
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  }

  if (loading) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-400">✍️ Today's win</h3>
        {saved && <span className="text-xs text-success">Saved ✓</span>}
      </div>
      <input
        type="text"
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="What's one thing you're proud of today?"
        className="w-full bg-transparent text-sm text-gray-200 placeholder:text-gray-600 border-none outline-none"
      />
    </div>
  );
}
