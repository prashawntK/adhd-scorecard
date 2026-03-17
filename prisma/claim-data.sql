-- ─── Data Migration: Claim existing data for your account ─────────────────
--
-- Run this ONCE after you sign up for the first time.
--
-- STEPS:
--   1. Sign up at /signup or /login
--   2. Go to Supabase Dashboard → Authentication → Users
--   3. Copy your UUID (looks like: a1b2c3d4-e5f6-7890-abcd-ef1234567890)
--   4. Replace YOUR_USER_ID below with your real UUID
--   5. Run: psql "postgresql://postgres.rbodykseujixzahzepkh:...@.../postgres" -f prisma/claim-data.sql
--      (use the DIRECT_URL from your .env, not the pooler)
--
-- This assigns all rows with userId=NULL to your account.
-- Safe to re-run — only touches rows with userId IS NULL.

DO $$
DECLARE
  target_user_id TEXT := 'YOUR_USER_ID';  -- ← replace this
BEGIN
  IF target_user_id = 'YOUR_USER_ID' THEN
    RAISE EXCEPTION 'Replace YOUR_USER_ID with your real Supabase Auth UUID before running';
  END IF;

  -- Create User row (mirrors what Supabase Auth has)
  INSERT INTO "User" ("id", "email", "name", "plan", "onboardingCompleted", "updatedAt")
  VALUES (target_user_id, 'your@email.com', 'Your Name', 'pro', true, NOW())
  ON CONFLICT ("id") DO NOTHING;

  -- Assign all orphaned rows to this user
  UPDATE "Goal"                    SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "DailyLog"                SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "TimerSession"            SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "Streak"                  SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "Step"                    SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "DailyScore"              SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "Reward"                  SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "PointsLedger"            SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "JournalEntry"            SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "EnergyLog"               SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "ExtraCurricular"         SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "ExtraCurricularLog"      SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "ExtraCurricularTimeLog"  SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "Chore"                   SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "ChoreTimeLog"            SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "ChoreCompletionLog"      SET "userId" = target_user_id WHERE "userId" IS NULL;
  UPDATE "AppSettings"             SET "userId" = target_user_id WHERE "userId" IS NULL;

  RAISE NOTICE 'Done — all data claimed for user %', target_user_id;
END $$;
