"use client";

import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { AppSettings } from "@/types";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
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
        <div className={row}>
          <span className="text-sm text-gray-200">Theme</span>
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 bg-surface-2 border border-white/[0.08] rounded-lg text-sm text-gray-300 hover:bg-surface-3"
          >
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </button>
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
