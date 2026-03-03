"use client";

import { useEffect, useState } from "react";
import { getMilestoneMessage } from "@/lib/streaks";
import { Confetti } from "@/components/ui/Confetti";

interface MilestoneCelebrationProps {
  milestone: number | null;
  goalName?: string;
  onDismiss: () => void;
}

export function MilestoneCelebration({ milestone, goalName, onDismiss }: MilestoneCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (milestone) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [milestone, onDismiss]);

  if (!milestone || !visible) return null;

  const message = getMilestoneMessage(milestone, goalName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Confetti trigger={true} type="milestone" />
      <div
        className="bg-gradient-to-br from-primary-muted to-streak-muted border border-primary/40 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl fade-in"
        onClick={() => { setVisible(false); onDismiss(); }}
      >
        <div className="text-6xl mb-4">
          {milestone >= 365 ? "🏅" : milestone >= 90 ? "💎" : milestone >= 30 ? "🏆" : "🔥"}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{milestone} Day Streak!</h2>
        <p className="text-primary-light/80 text-sm leading-relaxed">{message}</p>
        <p className="text-primary/60 text-xs mt-4">Tap to dismiss</p>
      </div>
    </div>
  );
}
