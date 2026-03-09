"use client";

import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { AppSettings } from "@/types";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    setSettings(await res.json());
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  async function patchSettings(patch: Partial<AppSettings>) {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSettings(await res.json());
  }

  function handleExport() {
    window.open("/api/data/export", "_blank");
  }

  const row = "flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Settings</h1>
        <p className="text-sm text-gray-400">Customise your scorecard</p>
      </div>

      {/* Appearance */}
      <section className="card p-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Appearance</h2>
        <div className="grid grid-cols-2 gap-3 pb-2">
          {[
            { id: "detrimental-dark", name: "Detrimental Dark", color: "bg-[#0B0F19]", accent: "bg-primary" },
            { id: "lucid-light", name: "Lucid Light", color: "bg-[#F8FAFC]", accent: "bg-primary" },
            { id: "plausible-purple", name: "Plausible Purple", color: "bg-[#0D0415]", accent: "bg-[#D946EF]" },
            { id: "original-orange", name: "Original Orange", color: "bg-[#0B0F19]", accent: "bg-[#F97316]" },
            { id: "amber-noir", name: "Amber Noir", color: "bg-[#0D0A07]", accent: "bg-[#F97316]" },
            { id: "charcoal-black", name: "Charcoal Black", color: "bg-[#080808]", accent: "bg-[#94A3B8]" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as any)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                theme === t.id
                  ? "border-primary bg-primary/10 ring-1 ring-primary/50"
                  : "border-white/[0.08] hover:bg-surface-2"
              }`}
            >
              <div className={`w-8 h-8 rounded-full border border-white/20 flex items-center justify-center ${t.color}`}>
                <div className={`w-3 h-3 rounded-full ${t.accent}`} />
              </div>
              <span className="text-sm font-medium text-gray-200">{t.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Timer */}
      {settings && (
        <section className="card p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Timer</h2>
          <div className={row}>
            <span className="text-sm text-gray-200">Hyperfocus guard</span>
            <button
              onClick={() => patchSettings({ hyperfocusGuardEnabled: !settings.hyperfocusGuardEnabled })}
              className={`w-10 h-6 rounded-full transition-all ${settings.hyperfocusGuardEnabled ? "bg-primary" : "bg-surface-3"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${settings.hyperfocusGuardEnabled ? "translate-x-4" : ""}`} />
            </button>
          </div>
          <div className={row}>
            <span className="text-sm text-gray-200">Guard after (minutes)</span>
            <input
              type="number"
              min={30}
              max={480}
              value={settings.hyperfocusGuardMinutes}
              onChange={(e) => patchSettings({ hyperfocusGuardMinutes: parseInt(e.target.value) })}
              className="w-20 bg-surface-2 border border-white/[0.08] rounded-lg px-2 py-1 text-sm text-gray-100 text-right focus:outline-none focus:border-primary"
            />
          </div>
          <div className={row}>
            <span className="text-sm text-gray-200">Pomodoro work (min)</span>
            <input
              type="number"
              min={5}
              max={90}
              value={settings.defaultWorkMinutes}
              onChange={(e) => patchSettings({ defaultWorkMinutes: parseInt(e.target.value) })}
              className="w-20 bg-surface-2 border border-white/[0.08] rounded-lg px-2 py-1 text-sm text-gray-100 text-right focus:outline-none focus:border-primary"
            />
          </div>
          <div className={row}>
            <span className="text-sm text-gray-200">Pomodoro break (min)</span>
            <input
              type="number"
              min={1}
              max={30}
              value={settings.defaultBreakMinutes}
              onChange={(e) => patchSettings({ defaultBreakMinutes: parseInt(e.target.value) })}
              className="w-20 bg-surface-2 border border-white/[0.08] rounded-lg px-2 py-1 text-sm text-gray-100 text-right focus:outline-none focus:border-primary"
            />
          </div>
        </section>
      )}

      {/* Streaks */}
      {settings && (
        <section className="card p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Streaks</h2>
          <div className={row}>
            <span className="text-sm text-gray-200">Weekly freeze limit</span>
            <select
              value={settings.weeklyFreezeLimit}
              onChange={(e) => patchSettings({ weeklyFreezeLimit: parseInt(e.target.value) })}
              className="bg-surface-2 border border-white/[0.08] rounded-lg px-2 py-1 text-sm text-gray-100 focus:outline-none"
            >
              {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </section>
      )}

      {/* Data */}
      <section className="card p-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Data</h2>
        <Button variant="secondary" onClick={handleExport} className="w-full">
          <Download size={16} /> Export all data (JSON)
        </Button>
      </section>

      <p className="text-center text-xs text-gray-600 pb-4">ADHD Scorecard · Built with ❤️</p>
    </div>
  );
}
