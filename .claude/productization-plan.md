# Productization Plan — ADHD Scorecard

## Context

The app is a fully-featured, **single-user** ADHD productivity tracker. To sell it as a product, the biggest gaps are: no auth, no multi-tenancy, no payment system, no landing page, and no legal pages. Below is a prioritized roadmap organized into launch phases.

---

## Sprint 1 — Auth + Multi-tenancy + Security (2-3 weeks)

### Task 1: User Model + Schema Migration `[branch: feat/user-model]`
- Add `User` model to Prisma schema
- Add `userId` field to ALL existing models (Goal, DailyLog, TimerSession, Streak, Step, DailyScore, Reward, PointsLedger, JournalEntry, EnergyLog, ExtraCurricular, ExtraCurricularTimeLog, Chore, ChoreTimeLog, ChoreCompletionLog, AppSettings)
- Add indexes on userId for all tables
- Write migration script to assign existing data to a seed user
- Run `npx prisma db push`

### Task 2: Supabase Auth Setup `[branch: feat/supabase-auth]`
- Install `@supabase/ssr` + `@supabase/supabase-js`
- Create Supabase client utilities (browser + server)
- Configure Supabase Auth providers (email/password + Google OAuth)
- Set up auth environment variables
- Create auth callback route handler

### Task 3: Auth UI — Login, Signup, Reset `[branch: feat/auth-ui]`
- Create `/login` page (email + password + Google button)
- Create `/signup` page
- Create `/forgot-password` and `/reset-password` pages
- Auth layout (centered card, no bottom nav)
- Form validation + error handling

### Task 4: Protected Routes + Middleware `[branch: feat/auth-middleware]`
- Create Next.js middleware (`src/middleware.ts`)
- Redirect unauthenticated users to `/login`
- Allow public routes: `/login`, `/signup`, `/forgot-password`, `/reset-password`
- Add auth provider to app layout
- Extract `userId` in `withApiHandler` from Supabase session

### Task 5: User Data Isolation `[branch: feat/user-isolation]`
- Update ALL API routes to scope queries by `userId`
- Update `src/lib/dashboard.ts` — add userId to all 7 parallel queries
- Update `src/app/api/data/export/route.ts` — scope export by user
- Add Supabase RLS policies as safety net
- Test: create 2 users, verify data isolation

### Task 6: Security Hardening `[branch: feat/security]`
- Rate limiting on auth endpoints (upstash/ratelimit)
- Input validation on all POST endpoints (zod schemas)
- CSRF protection headers
- Environment variable audit
- Remove any leaked credentials

---

## Sprint 2 — Landing Page + Legal (1-2 weeks)

### Task 7: Landing Page `[branch: feat/landing-page]`
- Move dashboard from `/` to `/dashboard`
- Public marketing page at `/`
- Hero, features, screenshots, CTA
- SEO meta tags + Open Graph

### Task 8: Legal Pages `[branch: feat/legal]`
- Terms of Service (`/terms`)
- Privacy Policy (`/privacy`)
- Cookie consent banner
- "Delete my account" in settings (GDPR)

### Task 9: Profile & Account `[branch: feat/profile]`
- Profile page in settings
- Change name, avatar
- Change password
- Logout button
- Account deletion

---

## Sprint 3 — Payments (1-2 weeks)

### Task 10: Stripe Integration `[branch: feat/payments]`
- Stripe SDK setup
- Pricing tiers: Free / Pro ($6/mo) / Lifetime ($79)
- Checkout flow
- Webhook handler for subscription events
- `plan` + `stripeCustomerId` on User model

### Task 11: Feature Gating `[branch: feat/feature-gating]`
- Free tier limits: 3 goals, 1 theme, 7-day stats
- Pro: unlimited everything
- Paywall UI components
- Upgrade prompts

---

## Sprint 4 — Onboarding + Polish (1 week)

### Task 12: Onboarding `[branch: feat/onboarding]`
- First-login wizard
- Goal templates (ADHD Morning Routine, Study, Exercise, etc.)
- Interactive feature tour
- Sample data option

### Task 13: Data Import `[branch: feat/data-import]`
- Import from JSON export format
- Upload → validate → preview → confirm

---

## Sprint 5 — Notifications + Monitoring (1 week)

### Task 14: Notifications `[branch: feat/notifications]`
- Daily reminders, streak risk alerts
- Weekly email digest
- Notification preferences in settings

### Task 15: Monitoring + Analytics `[branch: feat/monitoring]`
- Sentry error tracking
- PostHog product analytics
- Health check endpoint

---

## Phase 3 — Competitive Features (ongoing)

### Task 16: Weekly/Monthly Reviews `[branch: feat/reviews]`
### Task 17: Habit Templates Library `[branch: feat/templates]`
### Task 18: AI Insights `[branch: feat/ai-insights]`
### Task 19: Calendar Integration `[branch: feat/calendar]`
### Task 20: Recurring Chores `[branch: feat/recurring-chores]`
### Task 21: Social & Accountability `[branch: feat/social]`

---

## Phase 4 — Growth (future)

### Task 22: Native Mobile App
### Task 23: Referral Program
### Task 24: API & Integrations
### Task 25: Community Features

---

## Business Model

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 3 goals, basic timer, 1 theme, 7-day stats |
| **Pro** | $6/mo or $49/yr | Unlimited everything, all themes, export, AI insights, notifications |
| **Lifetime** | $79 one-time | All Pro features forever |

> **Why Lifetime matters for ADHD**: Subscription management is executive function overhead. A one-time purchase removes that friction. Many ADHD users specifically seek lifetime deals.
