"use client";

import { useState } from "react";
import { Confetti } from "@/components/ui/Confetti";
import type { Reward } from "@/types";

interface RewardShopProps {
  rewards: Reward[];
  balance: number;
  onRedeem: () => void;
}

export function RewardShop({ rewards, balance, onRedeem }: RewardShopProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRedeem(reward: Reward) {
    setLoading(reward.id);
    setError(null);
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId: reward.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to redeem");
      } else {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 200);
        onRedeem();
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <Confetti trigger={showConfetti} type="celebration" />
      {error && (
        <div className="bg-error-muted/50 border border-error/30 rounded-xl px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {rewards.map((reward) => {
          const canAfford = balance >= reward.cost;
          return (
            <div
              key={reward.id}
              className={`bg-surface-1 border rounded-xl p-4 transition-all ${
                canAfford ? "border-white/[0.08] hover:border-white/[0.15]" : "border-white/[0.04] opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{reward.emoji}</span>
                    <span className="font-medium text-gray-100">{reward.name}</span>
                  </div>
                  {reward.description && (
                    <p className="text-xs text-gray-500 mt-1">{reward.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!canAfford || loading === reward.id}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    canAfford
                      ? "bg-primary hover:bg-primary-light text-white"
                      : "bg-surface-2 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {loading === reward.id ? "…" : `⭐ ${reward.cost}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
