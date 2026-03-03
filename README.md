# ADHD Scorecard

A dopamine-aware, gamified daily productivity tracker built for ADHD brains. Track goals, earn streaks, celebrate wins.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Prisma 7** with `@prisma/adapter-pg` (PostgreSQL driver)
- **Supabase** (PostgreSQL database — free tier)
- **Tailwind CSS v4**
- **Recharts** for analytics
- **Lucide React** for icons

---

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project** and fill in the details
3. Wait for the project to finish provisioning (~1 minute)

### 2. Get Your Connection Strings

In your Supabase dashboard:

1. Go to **Project Settings → Database → Connection string**
2. Select **URI** format and copy it → this is your `DATABASE_URL`
3. Also copy the **Direct connection** URI → this is your `DIRECT_URL`

> **Important:** The pooler URL (`DATABASE_URL`) uses port 6543 and includes `?pgbouncer=true`. The direct URL (`DIRECT_URL`) uses port 5432. Both are needed.

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Use the DIRECT connection URL (port 5432) for DATABASE_URL
# Prisma 7 uses this for both queries and migrations
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# App base URL (for server-side fetch in Next.js)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

> **Note:** With Prisma 7, use the **direct** Supabase URL (port 5432, no `?pgbouncer=true`) for `DATABASE_URL`. The `@prisma/adapter-pg` handles connection pooling itself via Node.js `pg`, so you don't need pgBouncer.

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This creates all the tables in your Supabase database.

### 6. Seed Example Data

```bash
npm run db:seed
```

This populates 6 example goals and 5 rewards to get you started.

### 7. Start the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see your dashboard with the seeded goals!

---

## Features

### 📊 Daily Dashboard
- Live score (0-100) with circular progress ring
- Goal cards with timers and progress bars
- Streak flames with milestone celebrations
- Morning kickstart view and forgiveness banner

### ⏱ Timer System
- One-click timer per goal
- Manual time entry
- Persists across page refreshes (localStorage + DB)
- Focus rating on stop

### 🔥 Streak System
- Per-goal streaks + overall app streak
- Weekly freeze credits
- Milestone celebrations (3, 7, 14, 21, 30, 60, 90, 180, 365 days)

### 📈 Stats & Analytics
- Score trend chart (line chart)
- Time by category (donut chart)
- 365-day GitHub-style activity heatmap

### 🧠 ADHD-Specific Features
- **Decision Helper** — "What should I work on?" with priority scoring
- **Energy Tracker** — Log your energy level (1-5)
- **Daily Win Journal** — One-liner win capture
- **Morning View** — Today's top priorities on fresh start
- **Forgiveness Banner** — No-guilt recovery message after missed days

### 🎁 Rewards Shop
- Earn points by completing goals
- Redeem for custom rewards you define

### ⚙️ Settings
- Dark/light theme toggle
- Pomodoro timer settings
- Hyperfocus guard
- Weekly freeze limit
- Data export (JSON)

---

## Project Structure

```
src/
├── app/
│   ├── api/           # All API routes
│   ├── goals/         # Goals management page
│   ├── stats/         # Analytics page
│   ├── settings/      # Settings page
│   └── page.tsx       # Dashboard (home)
├── components/
│   ├── adhd/          # ADHD-specific components
│   ├── dashboard/     # Dashboard components
│   ├── goals/         # Goal form & list
│   ├── providers/     # React context providers
│   ├── rewards/       # Reward shop
│   ├── stats/         # Chart components
│   ├── timer/         # Timer display
│   └── ui/            # Shared UI primitives
├── lib/
│   ├── db.ts          # Prisma client singleton (uses @prisma/adapter-pg)
│   ├── scoring.ts     # Daily score algorithm
│   ├── streaks.ts     # Streak calculation logic
│   └── utils.ts       # Utilities & helpers
└── types/
    └── index.ts       # TypeScript types
```

---

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run db:seed    # Seed example data
npx prisma studio  # Open Prisma Studio (GUI for your DB)
```

---

## Deployment

For deployment (Vercel recommended):

1. Push your code to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Add environment variables (`DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_BASE_URL`)
4. Deploy — Vercel auto-runs the build

> Set `NEXT_PUBLIC_BASE_URL` to your production URL (e.g., `https://your-app.vercel.app`)
