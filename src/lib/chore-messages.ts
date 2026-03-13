interface MessageContext {
  daysUntilDeadline: number;
  estimatedMinutes: number;
  totalMinutesSpent: number;
  completedToday: boolean;
  choreId: string;
}

const QUICK_WIN = [
  "Would take just {est} minutes. Please? \u{1F97A}",
  "Tiny task! You could knock this out in {est} min \u{2728}",
  "Quick one \u2014 {est} minutes and done! \u{1F3AF}",
  "Just {est} minutes of your time. Easy win! \u{1F4AA}",
  "{est} min. That's shorter than a coffee break \u{2615}",
];

const PROGRESS = [
  "You've already spent {spent} min \u2014 almost there! \u{1F4AA}",
  "Great momentum! {spent} min down, keep going \u{1F680}",
  "{spent} min already invested. The finish line is close \u{2728}",
  "You've put in {spent} min so far. Your past self would be proud \u{1F31F}",
  "Progress is progress! {spent} min and counting \u{1F3AF}",
];

const GENTLE_URGENCY = [
  "No rush, but your future self will thank you \u{1F31F}",
  "A little progress goes a long way! \u{2728}",
  "Even 5 minutes helps. You've got this \u{1F49A}",
  "Small steps add up to big wins \u{1F3C6}",
  "Start small. Just open it up and see how you feel \u{1F33F}",
];

const RELAXED = [
  "Plenty of time! But a little now means less later \u{1F343}",
  "No pressure \u2014 just planting the seed for later \u{1F331}",
  "Future you is already grateful you're even thinking about it \u{1F60A}",
  "Whenever you're ready! No rush at all \u{2615}",
  "A calm start leads to a smooth finish \u{1F30A}",
];

const COMPLETED = [
  "Done! You're amazing \u{1F389}",
  "Crushed it! What a win \u{1F4AA}",
  "Look at you go! All done \u{2705}",
  "One less thing to worry about \u{1F31F}",
  "Checked off! You're on fire \u{1F525}",
];

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickFromPool(pool: string[], choreId: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const seed = simpleHash(choreId + today);
  return pool[seed % pool.length];
}

export function getPersuasiveMessage(ctx: MessageContext): string {
  if (ctx.completedToday) {
    return pickFromPool(COMPLETED, ctx.choreId);
  }

  let pool: string[];

  if (ctx.estimatedMinutes <= 15 && ctx.totalMinutesSpent === 0) {
    pool = QUICK_WIN;
  } else if (ctx.totalMinutesSpent > 0) {
    pool = PROGRESS;
  } else if (ctx.daysUntilDeadline <= 3) {
    pool = GENTLE_URGENCY;
  } else {
    pool = RELAXED;
  }

  const message = pickFromPool(pool, ctx.choreId);
  return message
    .replace("{est}", String(ctx.estimatedMinutes))
    .replace("{spent}", String(ctx.totalMinutesSpent));
}
