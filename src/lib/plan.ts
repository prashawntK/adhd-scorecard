export type Plan = "free" | "pro";

export function isPro(plan: string): boolean {
  return plan === "pro";
}

export const PLAN_LIMITS = {
  free: {
    maxGoals: 3,
    statsHistoryDays: 7,
    exportEnabled: false,
    allThemes: false,
  },
  pro: {
    maxGoals: Infinity,
    statsHistoryDays: Infinity,
    exportEnabled: true,
    allThemes: true,
  },
} as const;

export const PRICES = {
  monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
  annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? "",
} as const;
