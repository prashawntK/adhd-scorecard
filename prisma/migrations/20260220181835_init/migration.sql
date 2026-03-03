-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🎯',
    "category" TEXT NOT NULL,
    "description" TEXT,
    "motivation" TEXT,
    "goalType" TEXT NOT NULL DEFAULT 'timer',
    "dailyTarget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priority" TEXT NOT NULL DEFAULT 'should',
    "activeDays" JSONB NOT NULL DEFAULT '[1,2,3,4,5,6,0]',
    "pomodoroSettings" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetAtTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "focusRating" DOUBLE PRECISION,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimerSession" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sessionType" TEXT NOT NULL DEFAULT 'focus',
    "focusRating" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Streak" (
    "id" TEXT NOT NULL,
    "goalId" TEXT,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TEXT,
    "freezesUsedThisWeek" INTEGER NOT NULL DEFAULT 0,
    "lastFreezeDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Streak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyScore" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "goalsCompleted" INTEGER NOT NULL DEFAULT 0,
    "goalsTotal" INTEGER NOT NULL DEFAULT 0,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "streakBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🎁',
    "description" TEXT,
    "cost" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'treat',
    "timesRedeemed" INTEGER NOT NULL DEFAULT 0,
    "lastRedeemed" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointsLedger" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "detail" TEXT,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mood" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyLog" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnergyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "weeklyFreezeLimit" INTEGER NOT NULL DEFAULT 2,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "soundVolume" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "defaultWorkMinutes" INTEGER NOT NULL DEFAULT 25,
    "defaultBreakMinutes" INTEGER NOT NULL DEFAULT 5,
    "hyperfocusGuardMinutes" INTEGER NOT NULL DEFAULT 120,
    "hyperfocusGuardEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pointsPerGoalComplete" INTEGER NOT NULL DEFAULT 10,
    "pointsPerStreakDay" INTEGER NOT NULL DEFAULT 5,
    "pointsBonusPerfectDay" INTEGER NOT NULL DEFAULT 25,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Goal_isArchived_idx" ON "Goal"("isArchived");

-- CreateIndex
CREATE INDEX "Goal_category_idx" ON "Goal"("category");

-- CreateIndex
CREATE INDEX "DailyLog_date_idx" ON "DailyLog"("date");

-- CreateIndex
CREATE INDEX "DailyLog_goalId_idx" ON "DailyLog"("goalId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_goalId_date_key" ON "DailyLog"("goalId", "date");

-- CreateIndex
CREATE INDEX "TimerSession_goalId_date_idx" ON "TimerSession"("goalId", "date");

-- CreateIndex
CREATE INDEX "TimerSession_isActive_idx" ON "TimerSession"("isActive");

-- CreateIndex
CREATE INDEX "TimerSession_date_idx" ON "TimerSession"("date");

-- CreateIndex
CREATE INDEX "Streak_goalId_idx" ON "Streak"("goalId");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_goalId_key" ON "Streak"("goalId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyScore_date_key" ON "DailyScore"("date");

-- CreateIndex
CREATE INDEX "DailyScore_date_idx" ON "DailyScore"("date");

-- CreateIndex
CREATE INDEX "PointsLedger_date_idx" ON "PointsLedger"("date");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_date_key" ON "JournalEntry"("date");

-- CreateIndex
CREATE INDEX "JournalEntry_date_idx" ON "JournalEntry"("date");

-- CreateIndex
CREATE INDEX "EnergyLog_date_idx" ON "EnergyLog"("date");

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimerSession" ADD CONSTRAINT "TimerSession_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Streak" ADD CONSTRAINT "Streak_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
