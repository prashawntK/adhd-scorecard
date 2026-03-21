"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ── Emoji picker (shared from GoalForm) ───────────────────────────────────
const EMOJI_GROUPS = [
  { icon: "🎯", label: "Goals",    emojis: ["🎯","🏆","⭐","🚀","💡","⚡","🔥","💎","🌟","✅","💪","🎖️","🥇","📈","🏅","🎪","🎰","🛡️","⚔️","🗡️"] },
  { icon: "📚", label: "Learning", emojis: ["📚","🎓","📖","🧠","💻","🔬","📝","🌐","🔭","🧪","📐","📊","🗂️","📜","🖊️","🔍","💡","🎒","🏫","📡"] },
  { icon: "💼", label: "Career",   emojis: ["💼","📊","🤝","💰","🏢","📱","🖥️","📋","🎤","📧","🔑","🗝️","📌","🖱️","⌨️","💳","🏦","📞","🖨️","📠"] },
  { icon: "🏃", label: "Health",   emojis: ["🏃","🧘","🍎","💤","🚴","🏋️","🌿","❤️","🥗","💊","🫀","🧬","🏊","⚽","🎾","🧗","🤸","🥦","🫁","🩺"] },
  { icon: "🌱", label: "Personal", emojis: ["🌱","🏠","❤️","🙏","😊","🌸","🌍","🎁","🌈","☀️","🌙","🕊️","🦋","🌺","🫶","🧸","🪴","🏡","🛋️","🧹"] },
  { icon: "🎨", label: "Creative", emojis: ["🎨","🎭","🎬","🎶","✍️","📷","🎮","🖌️","🎸","🎹","🎺","🎻","📸","🎙️","🎞️","🖼️","🎲","🪄","🎠","🎡"] },
] as const;

const ACCENT = "#8B5CF6"; // purple for ECs

function EmojiPicker({ onSelect, anchorRect }: { onSelect: (e: string) => void; anchorRect: DOMRect | null }) {
  const [activeGroup, setActiveGroup] = useState(0);
  const [search, setSearch] = useState("");
  if (!anchorRect) return null;

  const allEmojis = EMOJI_GROUPS.flatMap((g) => g.emojis);
  const displayed = search.trim()
    ? allEmojis.filter((e) => e.includes(search))
    : EMOJI_GROUPS[activeGroup].emojis;

  return (
    <div
      className="fixed z-[9999] rounded-2xl shadow-2xl overflow-hidden"
      style={{
        width: 300,
        top: anchorRect.bottom + 8,
        left: anchorRect.left,
        background: "rgba(15, 20, 35, 0.97)",
        border: `1px solid ${ACCENT}35`,
        boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${ACCENT}20`,
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="p-2.5 pb-0">
        <input
          type="text"
          placeholder="Search emoji..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl px-3 py-2 text-sm text-gray-200 outline-none placeholder-gray-600"
          style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${ACCENT}30` }}
          onFocus={(e) => { e.currentTarget.style.borderColor = `${ACCENT}80`; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = `${ACCENT}30`; }}
        />
      </div>
      {!search && (
        <div className="flex items-center gap-0.5 px-2.5 pt-2.5">
          {EMOJI_GROUPS.map((g, i) => (
            <button key={g.label} type="button" onClick={() => setActiveGroup(i)} title={g.label}
              className="flex-1 h-9 rounded-xl text-lg flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95"
              style={activeGroup === i
                ? { background: `${ACCENT}28`, boxShadow: `0 0 10px ${ACCENT}30` }
                : { background: "transparent", filter: "grayscale(0.4) opacity(0.55)" }}
            >{g.icon}</button>
          ))}
        </div>
      )}
      <div className="mx-3 mt-2.5 h-px" style={{ background: `${ACCENT}20` }} />
      <div className="p-2 grid grid-cols-6 gap-0.5 max-h-44 overflow-y-auto">
        {displayed.map((emoji) => (
          <button key={emoji} type="button" onClick={() => onSelect(emoji)}
            className="h-10 w-full rounded-xl text-xl flex items-center justify-center transition-all duration-100 hover:scale-125 active:scale-95"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${ACCENT}22`; e.currentTarget.style.boxShadow = `0 4px 12px ${ACCENT}30`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.boxShadow = "none"; }}
          >{emoji}</button>
        ))}
        {displayed.length === 0 && <div className="col-span-6 text-center py-4 text-gray-600 text-xs">No results</div>}
      </div>
      {!search && <div className="px-3 pb-2 pt-0.5 text-[10px] text-gray-600 font-medium">{EMOJI_GROUPS[activeGroup].label}</div>}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────
function Section({ icon: Icon, title, step, children }: {
  icon: React.ElementType; title: string; step: number; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.18] overflow-hidden" style={{ background: "rgba(255,255,255,0.11)" }}>
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.12]" style={{ background: "rgba(255,255,255,0.10)" }}>
        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0 tabular-nums">{step}</span>
        <Icon size={13} className="text-gray-500 flex-shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SectionInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-sm text-gray-100",
        "outline-none transition-all duration-200 placeholder-gray-600 hover:border-white/14 focus:border-transparent",
        className
      )}
      onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 1.5px ${ACCENT}`; props.onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.boxShadow = "none"; props.onBlur?.(e); }}
    />
  );
}

// ── Time presets ──────────────────────────────────────────────────────────
const TIME_PRESETS = [5, 10, 15, 20, 30, 45, 60];

// ── Public types ──────────────────────────────────────────────────────────
export interface ExtraCurricularFormData {
  name: string;
  emoji: string;
  targetMinutes: number | null;
}

interface ExtraCurricularFormProps {
  initial?: Partial<ExtraCurricularFormData>;
  onSubmit: (data: ExtraCurricularFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

// ── Main form ─────────────────────────────────────────────────────────────
export function ExtraCurricularForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: ExtraCurricularFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "✨");
  const [minutes, setMinutes] = useState<string>(
    initial?.targetMinutes != null ? String(initial.targetMinutes) : ""
  );
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const emojiRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showEmojiPicker) return;
    function onDown(e: MouseEvent) {
      if (!(e.target as Element).closest("[data-emoji-picker]") && !(e.target as Element).closest("[data-emoji-btn]"))
        setShowEmojiPicker(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showEmojiPicker]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const parsed = parseInt(minutes, 10);
      await onSubmit({
        name: name.trim(),
        emoji: emoji || "✨",
        targetMinutes: !isNaN(parsed) && parsed > 0 ? parsed : null,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">

        {/* ── 1. Identity ── */}
        <Section icon={Sparkles} title="Identity" step={1}>
          <div className="flex gap-3 items-start">
            {/* Emoji button */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Emoji</span>
              <button
                ref={emojiRef}
                data-emoji-btn
                type="button"
                onClick={() => {
                  const rect = emojiRef.current?.getBoundingClientRect() ?? null;
                  setAnchorRect(rect);
                  setShowEmojiPicker((v) => !v);
                }}
                className="w-14 h-10 rounded-xl text-2xl flex items-center justify-center transition-all duration-200 border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95"
                style={showEmojiPicker ? { background: `${ACCENT}22`, borderColor: `${ACCENT}60`, boxShadow: `0 0 12px ${ACCENT}30` } : { background: "rgba(255,255,255,0.06)" }}
              >
                {emoji}
              </button>
            </div>
            {/* Name */}
            <div className="flex-1">
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1.5">Name</label>
              <SectionInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Meditation, Guitar, Reading..."
                autoFocus
              />
            </div>
          </div>
        </Section>

        {/* ── 2. Schedule ── */}
        <Section icon={Clock} title="Schedule" step={2}>
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">
              Session target <span className="text-gray-600 normal-case">(optional)</span>
            </label>
            {/* Presets */}
            <div className="flex gap-1.5 flex-wrap mb-3">
              {TIME_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setMinutes(String(p))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border"
                  style={
                    minutes === String(p)
                      ? { background: `${ACCENT}22`, borderColor: `${ACCENT}70`, color: ACCENT, boxShadow: `0 0 8px ${ACCENT}25` }
                      : { background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "#9CA3AF" }
                  }
                  onMouseEnter={(e) => { if (minutes !== String(p)) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#E5E7EB"; }}}
                  onMouseLeave={(e) => { if (minutes !== String(p)) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#9CA3AF"; }}}
                >
                  {p}m
                </button>
              ))}
            </div>
            {/* Custom input */}
            <div className="flex items-center gap-2">
              <SectionInput
                type="number"
                min={1}
                max={300}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="—"
                className="w-20 text-center"
              />
              <span className="text-xs text-gray-500">minutes custom</span>
              {minutes && (
                <button type="button" onClick={() => setMinutes("")} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Clear</button>
              )}
            </div>
          </div>
        </Section>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={!name.trim() || loading}>
            {loading ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>

      {/* Emoji picker portal */}
      {showEmojiPicker && (
        <div data-emoji-picker>
          <EmojiPicker
            anchorRect={anchorRect}
            onSelect={(e) => { setEmoji(e); setShowEmojiPicker(false); }}
          />
        </div>
      )}
    </>
  );
}
