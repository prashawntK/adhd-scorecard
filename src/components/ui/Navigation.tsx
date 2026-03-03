"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, Target, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimer } from "@/components/providers/TimerProvider";

const NAV_ITEMS = [
  { href: "/", label: "Today", icon: Home },
  { href: "/stats", label: "Stats", icon: BarChart2 },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const { timerState, displayTime } = useTimer();

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-surface-base/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            ADHD Scorecard
          </span>

          {timerState.isRunning && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/15 border border-success/30 text-success text-sm font-mono">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              {displayTime}
            </div>
          )}
        </div>
      </header>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-base/90 backdrop-blur-md border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-around">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                  active
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
