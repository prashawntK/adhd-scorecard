"use client";

import { useEffect, useState } from "react";

export function DailyQuote() {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quote")
      .then((r) => r.json())
      .then((data) => {
        setQuote(data.quote);
        setAuthor(data.author);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-5 animate-pulse">
        <div className="h-3 w-16 bg-white/10 rounded mb-3" />
        <div className="h-4 w-full bg-white/10 rounded mb-2" />
        <div className="h-4 w-4/5 bg-white/10 rounded mb-3" />
        <div className="h-3 w-24 bg-white/10 rounded ml-auto" />
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="relative">
      {/* Ambient glow behind card */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, var(--color-primary, #6366f1)18 0%, transparent 70%)",
          filter: "blur(12px)",
          transform: "translateY(4px) scaleX(0.9)",
        }}
      />

      <div className="glass-card p-5 relative overflow-hidden">
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
          style={{ background: "linear-gradient(180deg, var(--color-primary) 0%, #ec4899 100%)" }}
        />

        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-3 pl-3">
          Today&apos;s Edge
        </p>

        {/* Quote text */}
        <p className="text-sm leading-relaxed font-medium relative z-10 pl-3 text-gray-100">
          &ldquo;{quote}&rdquo;
        </p>

        {/* Author chip */}
        <div className="flex justify-end mt-3 pl-3">
          <span
            className="text-[11px] font-medium px-2.5 py-1 rounded-full"
            style={{
              background: "var(--color-primary, #6366f1)18",
              color: "var(--color-primary-light, #818cf8)",
              border: "1px solid var(--color-primary, #6366f1)25",
            }}
          >
            — {author}
          </span>
        </div>
      </div>
    </div>
  );
}
