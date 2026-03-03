# ADHD Scorecard -- Comprehensive Design Guide

> Dark theme, gamified ADHD productivity app built with Next.js + Tailwind CSS v4.
> This guide synthesizes persuasive technology research, Material Design 3 principles,
> dark theme best practices, gamification UI patterns, and accessibility requirements
> into one actionable reference.

---

## Table of Contents

1. [Color System](#1-color-system)
2. [Persuasive Technology Design Patterns](#2-persuasive-technology-design-patterns)
3. [Material Design 3 Principles Applied](#3-material-design-3-principles-applied)
4. [Dark Theme Best Practices](#4-dark-theme-best-practices)
5. [Gamification UI Patterns](#5-gamification-ui-patterns)
6. [Accessibility](#6-accessibility)
7. [Tailwind v4 Theme Configuration](#7-tailwind-v4-theme-configuration)
8. [Component Recipes](#8-component-recipes)

---

## 1. Color System

### 1.1 Primary Accent: Warm Coral-Orange

Purple is overused in productivity apps and reads as "cool/passive." For an ADHD app
that needs to **motivate action**, a warm coral-orange accent hits the right
psychological notes: energetic, optimistic, approachable, and high-dopamine.

| Role                | Hex       | Tailwind Token        | Notes                                    |
|---------------------|-----------|-----------------------|------------------------------------------|
| **Primary**         | `#F97316` | `--color-primary`     | Orange-500. Warm, action-oriented.       |
| **Primary Light**   | `#FB923C` | `--color-primary-light` | Orange-400. Hover states, highlights.  |
| **Primary Muted**   | `#C2410C` | `--color-primary-muted` | Orange-700. Pressed/active states.     |
| **Primary Subtle**  | `#431407` | `--color-primary-subtle`| Orange-950. Tinted backgrounds.        |

**Why not pure orange?** Pure `#FF8000` orange can feel cheap. `#F97316` (Tailwind
orange-500) has enough red to feel warm and motivating without becoming aggressive.
It also passes WCAG AA contrast on dark surfaces.

### 1.2 Surface Color Hierarchy (4 Levels)

Following Material Design 3's tonal elevation model -- NOT uniform gray-900 everywhere.
Each level progressively lightens from the base, using a blue-gray undertone to feel
modern and prevent muddy warmth.

| Level           | Hex       | Tailwind Token          | Usage                                  |
|-----------------|-----------|-------------------------|----------------------------------------|
| **Base/Canvas** | `#0B0F19` | `--color-surface-base`  | Page background, app shell             |
| **Surface 1**   | `#111827` | `--color-surface-1`     | Primary cards, main content areas      |
| **Surface 2**   | `#1F2937` | `--color-surface-2`     | Elevated cards, modals, dropdowns      |
| **Surface 3**   | `#374151` | `--color-surface-3`     | Active/hover states, input backgrounds |
| **Surface 4**   | `#4B5563` | `--color-surface-4`     | Borders, dividers, disabled backgrounds|

These map roughly to gray-950 through gray-600 with a deliberate blue undertone
(Tailwind's default gray has this). The progression follows Material Design's
recommendation: higher elevation = lighter surface, no drop shadows needed.

### 1.3 Text Color Hierarchy (3 Levels)

Material Design recommends using opacity-based text on dark backgrounds rather than
distinct grays, to maintain readability without the "vibration" effect of pure white.

| Level             | Hex/Opacity         | Tailwind Class         | Contrast vs Base | Usage                        |
|-------------------|---------------------|------------------------|------------------|------------------------------|
| **Primary Text**  | `#F9FAFB` (87%)     | `text-gray-50`         | ~16:1            | Headings, important content  |
| **Secondary Text**| `#9CA3AF` (60%)     | `text-gray-400`        | ~7:1             | Body text, descriptions      |
| **Tertiary/Muted**| `#6B7280` (38%)     | `text-gray-500`        | ~4.5:1           | Labels, timestamps, captions |
| **Disabled Text** | `#4B5563` (opacity) | `text-gray-600`        | ~3:1             | Disabled states only         |

**Critical:** Primary and Secondary MUST pass WCAG AA (4.5:1) against Surface 1
(`#111827`). The values above all exceed that threshold.

### 1.4 Semantic / Gamification Colors

These colors serve dual duty: standard UI semantics AND gamification feedback. Each
has a "vivid" variant for celebrations and a "muted" variant for backgrounds/badges.

| Role           | Vivid Hex  | Muted Hex  | Vivid Token              | Muted Token                | Psychological Role                    |
|----------------|------------|------------|--------------------------|----------------------------|---------------------------------------|
| **Success**    | `#22C55E`  | `#052E16`  | `--color-success`        | `--color-success-muted`    | Task completion, XP gain, level up    |
| **Streak**     | `#F59E0B`  | `#451A03`  | `--color-streak`         | `--color-streak-muted`     | Streak fire, daily consistency        |
| **Warning**    | `#EAB308`  | `#422006`  | `--color-warning`        | `--color-warning-muted`    | Approaching deadline, streak at risk  |
| **Error**      | `#EF4444`  | `#450A0A`  | `--color-error`          | `--color-error-muted`      | Missed task, streak broken            |
| **XP/Reward**  | `#A78BFA`  | `#1E1B4B`  | `--color-xp`             | `--color-xp-muted`         | Points, leveling, achievement unlocks |
| **Info**       | `#38BDF8`  | `#0C4A6E`  | `--color-info`           | `--color-info-muted`       | Tips, onboarding, neutral feedback    |

**Color-blind safety notes:**
- Success green (`#22C55E`) and Error red (`#EF4444`) are distinguishable for
  deuteranopia/protanopia because they differ in luminance (green is brighter).
- Streak amber (`#F59E0B`) is safe for all three common forms of color blindness.
- Always pair color with an icon or text label. Never rely on color alone.

### 1.5 Card Border and Background Treatments

| Treatment               | CSS Value                                             | When to Use                          |
|--------------------------|------------------------------------------------------|--------------------------------------|
| Default card             | `bg-surface-1 border border-white/[0.06] rounded-2xl`| Standard content cards               |
| Elevated card            | `bg-surface-2 border border-white/[0.08] rounded-2xl`| Modals, popovers, active selections  |
| Accent-tinted card       | `bg-primary-subtle border border-primary/20 rounded-2xl` | Active goal, current streak      |
| Success-tinted card      | `bg-success-muted border border-success/20 rounded-2xl`  | Completed task celebration       |
| Ghost/minimal card       | `bg-transparent border border-white/[0.06] rounded-xl`   | Secondary list items             |

**Border philosophy:** Use `border-white/[0.06]` (6% white) as the default card
border on dark surfaces. This is subtle enough to define edges without creating
harsh lines. Increase to 8-10% for elevated or interactive elements.

---

## 2. Persuasive Technology Design Patterns

### 2.1 The Fogg Behavior Model (B = MAP)

BJ Fogg's model states that behavior occurs when three elements converge
simultaneously: **Motivation**, **Ability**, and a **Prompt**.

**Application to this app:**

```
High Motivation + Low Ability  --> Use FACILITATORS  (simplify the action)
Low Motivation  + High Ability --> Use SPARKS         (boost motivation)
High Both                      --> Use SIGNALS        (just remind them)
```

**For ADHD users, Ability is almost always the bottleneck.** Executive function
deficits mean the user may have high motivation but cannot initiate. Design
priority: reduce friction above all else.

#### Fogg's Six Simplicity Factors (Design Checklist)

| Factor            | Question to Ask                                    | App Design Response                              |
|-------------------|----------------------------------------------------|--------------------------------------------------|
| **Time**          | Does it take too long?                             | One-tap task completion. No multi-step flows.    |
| **Money**         | Does it cost anything?                             | Free core features. No friction to start.        |
| **Physical effort**| Does it require physical work?                    | Large touch targets (48px+). Thumb-zone layout.  |
| **Brain cycles**  | Does it require too much thinking?                 | Pre-filled defaults. Smart suggestions. No blank states. |
| **Social deviance**| Does it feel socially weird?                      | Private by default. No public shaming.           |
| **Non-routine**   | Does it break their routine?                       | Integrate with existing habits. Smart scheduling.|

### 2.2 Variable Reward Schedules

From Nir Eyal's Hook Model (built on Fogg's work): variable rewards are more
engaging than predictable ones because novelty activates the dopamine system.

**Three reward types to implement:**

| Reward Type          | Eyal's Term        | App Implementation                                |
|----------------------|--------------------|---------------------------------------------------|
| Social validation    | Rewards of the Tribe | "You're in the top 20% this week" (self-comparison) |
| Resource acquisition | Rewards of the Hunt  | Random bonus XP drops, mystery streak rewards     |
| Self-mastery         | Rewards of the Self  | "New personal best!" celebrations, level-ups      |

**Implementation pattern:**
```
Base XP per task:     Fixed (e.g., 10 XP)
Bonus multiplier:     Variable (1x-3x, weighted random)
Streak bonus:         Escalating (day 3: +10%, day 7: +25%, day 30: +50%)
Mystery rewards:      Random interval (every 5-15 completed tasks)
```

**UI pattern:** Show the base XP immediately on completion, then animate a
"bonus wheel" or particle burst for the variable component. The delay between
base and bonus creates anticipation (dopamine spike).

### 2.3 Progress Visualization That Drives Engagement

| Pattern                  | Implementation                                      | Why It Works                         |
|--------------------------|-----------------------------------------------------|--------------------------------------|
| **Ring progress**        | SVG circle with `stroke-dashoffset` animation       | Completion urge (Zeigarnik effect)   |
| **XP bar with milestones**| Linear progress with markers at 25/50/75/100%     | Visible proximity to next reward     |
| **Streak calendar**     | 7-day grid, filled days glow, current day pulses    | Pattern recognition + loss aversion  |
| **Level badge**         | Numeric level with radial progress to next level    | Clear mastery progression            |

**Critical ADHD insight:** Show progress at MICRO scale (today's tasks), not just
macro scale (monthly goals). ADHD brains need frequent, small dopamine hits.

### 2.4 Loss Aversion in Streak Design (ADHD-Safe)

Standard streak design (Duolingo-style) can be **harmful** for ADHD users.
Broken streaks trigger shame spirals and app abandonment. Design mitigations:

| Standard Pattern             | ADHD-Safe Alternative                                   |
|------------------------------|---------------------------------------------------------|
| Streak resets to 0 on miss   | "Streak freeze" bank (earn freezes via consistency)     |
| Gray/dead icon on miss       | Gentle dimming, not dramatic death imagery              |
| "Don't break your streak!"   | "You've been consistent 5 of 7 days -- great ratio!"   |
| Single streak counter        | "Best streak" + "Current streak" (preserves achievement)|
| Binary daily pass/fail       | Partial credit ("You did 2 of 5 tasks -- that counts!")|

**Recommended streak color states:**

```
Active streak (today done):    --color-streak (#F59E0B) with flame-pulse animation
Streak at risk (not done yet): --color-warning (#EAB308) with gentle pulse
Streak frozen (used a freeze): --color-info (#38BDF8) with snowflake icon
Streak broken:                 --color-surface-3 (#374151) -- muted, not red
```

### 2.5 "Hot Triggers" -- Making the Desired Action Easiest

BJ Fogg's "hot triggers" are prompts that appear when motivation and ability
are both sufficient. In app design, this means the primary CTA must be the
most visually prominent AND physically easiest to reach.

| Principle                    | Implementation                                          |
|------------------------------|---------------------------------------------------------|
| **Proximity**                | Primary action button in thumb zone (bottom of screen)  |
| **Visual weight**            | Primary CTA uses `bg-primary` with high contrast        |
| **Reduced alternatives**     | Max 1 primary + 1 secondary action per screen           |
| **Pre-loaded state**         | Task completion = single tap, not tap + confirm          |
| **Ambient triggers**         | Floating action button always visible for "quick add"   |
| **Momentum preservation**    | After completing a task, immediately show the next one   |

---

## 3. Material Design 3 Principles Applied

### 3.1 Color System: Tonal Palettes

Material 3 generates colors from 5 key color sources, each producing a 13-tone
palette (0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100).

**Our key color mapping:**

| MD3 Role        | Our Token           | Light Tone | Dark Tone  |
|-----------------|---------------------|------------|------------|
| Primary         | `--color-primary`   | Tone 40    | Tone 80    |
| On Primary      | white               | Tone 100   | Tone 20    |
| Primary Container| `--color-primary-subtle` | Tone 90 | Tone 30  |
| Surface         | `--color-surface-base` | Tone 99 | Tone 6     |
| Surface Container| `--color-surface-1` | Tone 96   | Tone 12    |

In dark theme, MD3 uses **tones 80 for primary** and **tone 6-12 for surfaces**.
Our orange primary (`#F97316`) at tone ~70-80 is correct for dark backgrounds.

### 3.2 Tonal Elevation (Not Shadow-Based)

Material 3 replaced shadow-based elevation with **tonal elevation**: elevated
surfaces become lighter by blending the primary color into the surface.

**Elevation levels for our dark theme:**

| Elevation | Overlay | Resulting Color | Usage                          |
|-----------|---------|-----------------|--------------------------------|
| Level 0   | 0%      | `#0B0F19`       | Page background                |
| Level 1   | +5%     | `#111827`       | Cards, sheets                  |
| Level 2   | +8%     | `#1F2937`       | Modals, nav rail               |
| Level 3   | +11%    | `#374151`       | Menus, active surfaces         |
| Level 4   | +14%    | `#4B5563`       | Tooltips, snackbars            |

**Implementation:** Rather than applying white overlays at runtime, we pre-compute
these as our surface-1 through surface-4 tokens. This is simpler in Tailwind and
gives us explicit control.

### 3.3 Component Sizing and Touch Targets

Material 3 mandates a minimum 48dp (48px) touch target for all interactive elements.

| Component          | Minimum Size | Recommended Size | Padding               |
|--------------------|-------------|------------------|-----------------------|
| Button (standard)  | 48px height | 48-56px height   | `px-6 py-3`          |
| Icon button        | 48x48px     | 48x48px          | `p-3` with 24px icon |
| List item          | 48px height | 56-72px height   | `px-4 py-3`          |
| Checkbox/Radio     | 48x48px     | 48x48px          | `p-3`                |
| Card (tappable)    | 48px min    | Varies           | `p-4` minimum        |
| FAB                | 56x56px     | 56x56px          | `p-4`                |
| Bottom nav item    | 48px height | 64px height      | `px-3 py-2`          |

**ADHD-specific:** Err on the side of LARGER touch targets. Fine motor control
may be impaired by medication side effects or restlessness. Use 56px height
for primary actions.

### 3.4 Typography Scale

Material 3 defines 15 styles across 5 roles. Mapped to Tailwind:

| MD3 Token        | Size/Weight         | Tailwind Class                  | Usage                     |
|------------------|---------------------|---------------------------------|---------------------------|
| Display Large    | 57px / Regular      | `text-6xl font-normal`         | Hero numbers (XP total)   |
| Display Medium   | 45px / Regular      | `text-5xl font-normal`         | Level display             |
| Display Small    | 36px / Regular      | `text-4xl font-normal`         | Section hero              |
| Headline Large   | 32px / Regular      | `text-3xl font-normal`         | Page titles               |
| Headline Medium  | 28px / Regular      | `text-2xl font-normal`         | Section headers           |
| Headline Small   | 24px / Regular      | `text-xl font-normal`          | Card titles               |
| Title Large      | 22px / Regular      | `text-xl font-normal`          | Prominent subtitles       |
| Title Medium     | 16px / Medium       | `text-base font-medium`        | Card subtitles            |
| Title Small      | 14px / Medium       | `text-sm font-medium`          | List item titles          |
| Body Large       | 16px / Regular      | `text-base font-normal`        | Primary body text         |
| Body Medium      | 14px / Regular      | `text-sm font-normal`          | Secondary body text       |
| Body Small       | 12px / Regular      | `text-xs font-normal`          | Captions                  |
| Label Large      | 14px / Medium       | `text-sm font-medium`          | Buttons, tabs             |
| Label Medium     | 12px / Medium       | `text-xs font-medium`          | Badges, chips             |
| Label Small      | 11px / Medium       | `text-[11px] font-medium`      | Overlines, micro-labels   |

**Font stack recommendation:** `Inter, system-ui, -apple-system, sans-serif`
Inter has excellent readability at small sizes and a wide weight range.

### 3.5 Shape System (Rounded Corners)

Material 3 defines a corner radius scale:

| MD3 Shape Token  | Radius | Tailwind Class   | Usage                              |
|------------------|--------|------------------|------------------------------------|
| None             | 0px    | `rounded-none`   | Full-bleed images                  |
| Extra Small      | 4px    | `rounded`        | Checkboxes, small chips            |
| Small            | 8px    | `rounded-lg`     | Buttons, input fields, small cards |
| Medium           | 12px   | `rounded-xl`     | Standard cards, dialogs            |
| Large            | 16px   | `rounded-2xl`    | Large cards, sheets                |
| Large Increased  | 20px   | `rounded-[20px]` | Bottom sheets, expanded cards      |
| Extra Large      | 28px   | `rounded-[28px]` | Prominent containers               |
| Full             | 9999px | `rounded-full`   | FABs, avatars, pills, badges       |

**App convention:** Use `rounded-2xl` (16px) as the default card radius. This
feels modern and tactile -- matching the "card-based goal layouts" pattern from
Duolingo and Habitica.

---

## 4. Dark Theme Best Practices

### 4.1 Surface Color Hierarchy

**Do NOT use a single dark gray everywhere.** Google Material Design recommends
`#121212` as the baseline dark surface. We go slightly darker (`#0B0F19`) with a
blue undertone for a richer feel, then build up:

```
                                    Lightest
                                       |
  Surface 4  #4B5563  ----  Tooltips, snackbars
  Surface 3  #374151  ----  Menus, hover states
  Surface 2  #1F2937  ----  Modals, elevated cards
  Surface 1  #111827  ----  Standard cards, panels
  Base       #0B0F19  ----  Page background
                                       |
                                    Darkest
```

**Why not pure black (#000000)?** Pure black causes "halation" on OLED screens
(white text bleeds at the edges) and reduces the ability to express elevation
through lightness. Dark gray surfaces express a wider range of depth.

### 4.2 Accent Color Usage: Vivid vs. Muted

| Context                        | Use Vivid                     | Use Muted                       |
|--------------------------------|-------------------------------|----------------------------------|
| Primary CTA button             | `bg-primary` (`#F97316`)      |                                  |
| Button hover                   | `bg-primary-light` (`#FB923C`)|                                  |
| Active navigation item         |                               | `text-primary`, no bg fill       |
| Streak indicator               | `text-streak` (`#F59E0B`)     |                                  |
| Tinted card background         |                               | `bg-primary-subtle` (`#431407`)  |
| Large surface fill             |                               | Never use vivid for large areas  |
| Badge / small indicator        | Vivid at small size is fine   |                                  |
| Error state                    | `text-error` (`#EF4444`)      | `bg-error-muted` (`#450A0A`)     |

**Rule of thumb:** Saturated/vivid colors on dark backgrounds can "vibrate"
visually. Use vivid colors only at small scale (text, icons, small buttons).
For backgrounds and large surfaces, use the muted/subtle variants.

### 4.3 Text Hierarchy in Dark Mode

Material Design specifies opacity-based text hierarchy:

| Priority     | Opacity | Hex on dark    | Notes                                        |
|--------------|---------|----------------|----------------------------------------------|
| High emphasis| 87%     | `#F9FAFB`      | NOT pure white. Slightly off-white reduces glare. |
| Medium       | 60%     | `#9CA3AF`      | Body text, descriptions                      |
| Disabled     | 38%     | `#6B7280`      | Disabled controls, placeholder text          |

**Never use `#FFFFFF` for body text on dark backgrounds.** Pure white on near-black
creates excessive contrast (21:1) which causes eye strain and visual "vibration."
Off-white (`#F9FAFB`, approximately `gray-50`) at ~16:1 is far more comfortable.

### 4.4 Card Elevation in Dark Themes

In dark themes, elevation is communicated through surface lightness, NOT shadows.
Shadows are invisible against dark backgrounds.

```
Flat card:      bg-surface-1     border-white/[0.06]    No shadow
Raised card:    bg-surface-2     border-white/[0.08]    Optional subtle shadow
Modal:          bg-surface-2     border-white/[0.10]    ring-1 ring-white/[0.05]
Popover:        bg-surface-3     border-white/[0.10]    ring-1 ring-white/[0.05]
```

**Optional "glow" for high-priority cards:**
```css
box-shadow: 0 0 24px -4px rgba(249, 115, 22, 0.15);  /* primary color glow */
```

---

## 5. Gamification UI Patterns

### 5.1 Color Psychology (Duolingo Model)

Duolingo's color system is deliberate:

| Color     | Duolingo Usage       | Our Usage                    | Hex       |
|-----------|---------------------|------------------------------|-----------|
| Green     | Correct / success   | Task completed, XP earned    | `#22C55E` |
| Orange    | Streak fire         | Active streak, daily goal    | `#F59E0B` |
| Red       | Hearts lost         | Missed task (used sparingly) | `#EF4444` |
| Blue      | Premium / info      | Info states, frozen streaks  | `#38BDF8` |
| Purple    | Bonus / special     | XP multiplier, achievements  | `#A78BFA` |
| Gray      | Broken / inactive   | Broken streak, disabled      | `#374151` |

**Key insight from Duolingo:** The bright streak icon (orange/fire) vs. the gray
broken-streak icon creates an instant visual consequence. Users report this color
shift alone increases their motivation to maintain streaks.

### 5.2 Progress Celebration Micro-Interactions

| Event              | Animation                                              | Duration  |
|--------------------|--------------------------------------------------------|-----------|
| Task completed     | Checkmark draws in (SVG path animation), brief scale pulse | 400ms |
| XP earned          | Number count-up + floating "+10 XP" text rises and fades  | 600ms |
| Streak milestone   | Fire icon scales up + particle burst, screen flash         | 800ms |
| Level up           | Full-screen overlay with radial burst, confetti            | 1200ms|
| Daily goal reached | Progress ring fills + color shift green + haptic           | 600ms |
| Bonus XP drop      | Surprise sparkle + "BONUS!" label + scale bounce           | 500ms |

**CSS animation tokens to define:**

```css
@keyframes check-draw {
  from { stroke-dashoffset: 24; }
  to   { stroke-dashoffset: 0; }
}

@keyframes xp-float {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(-32px) scale(1.2); }
}

@keyframes scale-bounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.25); }
  70%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}

@keyframes confetti-burst {
  0%   { transform: scale(0); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}
```

### 5.3 Making Score/XP Feel Rewarding

| Technique              | Implementation                                          |
|------------------------|---------------------------------------------------------|
| **Animated counter**   | Count up from old value to new (use `requestAnimationFrame`) |
| **Color flash**        | XP number briefly glows `--color-xp` on change         |
| **Relative context**   | "420 XP -- top 15% today" (social proof)                |
| **Visual weight**      | XP uses Display Large (57px) -- it should feel BIG      |
| **Persistent display** | XP always visible in header or nav, never hidden        |
| **Sound (optional)**   | Short "ding" on XP gain, pitch rises with streak length |

### 5.4 Card-Based Goal Layouts

Each goal/task card should feel tactile and interactive:

```
+-------------------------------------------------------+
|  [Category Color Bar - 3px top border]                |
|                                                        |
|  [Icon]  Goal Title                    [XP Badge: 15] |
|          "Complete 3 Pomodoro sessions"                |
|                                                        |
|  [===========================-------]  3/5 done       |
|                                                        |
|  [Streak: 4 days]        [Due: Today]  [Start ->]     |
+-------------------------------------------------------+
```

**Card anatomy:**

| Element           | Design Token                                            |
|-------------------|---------------------------------------------------------|
| Container         | `bg-surface-1 rounded-2xl border border-white/[0.06] p-4` |
| Category indicator| 3px top border in category color (see Section 1)        |
| Title             | `text-gray-50 font-medium text-base` (Title Medium)    |
| Description       | `text-gray-400 text-sm` (Body Medium)                   |
| Progress bar      | `bg-surface-3 rounded-full h-2` with fill in category color |
| XP badge          | `bg-xp-muted text-xp text-xs font-medium rounded-full px-2 py-0.5` |
| Streak indicator  | `text-streak text-sm` with flame icon                   |
| Action button     | `bg-primary text-white rounded-lg px-4 py-2`           |

**Interaction:** Cards should have a subtle `hover:bg-surface-2` transition and
`active:scale-[0.98]` press feedback to feel tactile.

---

## 6. Accessibility

### 6.1 WCAG Contrast Ratios for Dark Backgrounds

| Standard      | Ratio   | Applies To                              |
|---------------|---------|-----------------------------------------|
| WCAG AA       | 4.5:1   | Normal text (< 18px or < 14px bold)     |
| WCAG AA Large | 3:1     | Large text (>= 18px or >= 14px bold)    |
| WCAG AAA      | 7:1     | Normal text (enhanced)                  |
| WCAG AAA Large| 4.5:1   | Large text (enhanced)                   |

**Our contrast ratios verified against Surface 1 (`#111827`):**

| Color Token      | Hex       | Contrast vs `#111827` | Passes    |
|------------------|-----------|-----------------------|-----------|
| Primary text     | `#F9FAFB` | ~15.4:1               | AAA       |
| Secondary text   | `#9CA3AF` | ~6.4:1                | AA        |
| Tertiary text    | `#6B7280` | ~4.0:1                | AA Large  |
| Primary accent   | `#F97316` | ~5.7:1                | AA        |
| Success vivid    | `#22C55E` | ~6.8:1                | AA        |
| Streak vivid     | `#F59E0B` | ~7.4:1                | AA        |
| Error vivid      | `#EF4444` | ~4.6:1                | AA        |
| XP vivid         | `#A78BFA` | ~5.2:1                | AA        |
| Info vivid       | `#38BDF8` | ~8.1:1                | AA        |

All colors pass WCAG AA at minimum. Primary text exceeds AAA.

### 6.2 Color-Blind Safe Design Principles

| Rule                                   | Implementation                                    |
|----------------------------------------|---------------------------------------------------|
| Never use color alone to convey meaning| Always pair with icon, label, or pattern           |
| Red/green distinction                  | Our green (#22C55E) is much lighter than red (#EF4444) -- luminance difference helps |
| Use blue as a safe universal color     | Info blue (#38BDF8) is safe for all CVD types     |
| Test with simulators                   | Use Chrome DevTools > Rendering > Emulate vision deficiencies |
| Shape + color for states               | Completed = checkmark + green. Failed = X + red.  |

**Okabe-Ito reference colors for maximum safety:**

| Name            | Hex       | Safe for all CVD types |
|-----------------|-----------|------------------------|
| Orange          | `#E69F00` | Yes                    |
| Sky Blue        | `#56B4E9` | Yes                    |
| Bluish Green    | `#009E73` | Yes                    |
| Vermillion      | `#D55E00` | Yes                    |
| Reddish Purple  | `#CC79A7` | Yes                    |

Our palette aligns well with Okabe-Ito principles. The primary orange and info
blue are directly analogous to the safest pairs.

---

## 7. Tailwind v4 Theme Configuration

This is the complete `@theme` block and CSS custom properties for the app.
Drop this into `globals.css` to replace the existing theme configuration.

```css
@import "tailwindcss";

/* ── Tailwind v4 Theme Tokens ─────────────────────────────────────────── */
@theme {
  /* ── Primary Accent (Warm Coral-Orange) ─── */
  --color-primary:        #F97316;
  --color-primary-light:  #FB923C;
  --color-primary-muted:  #C2410C;
  --color-primary-subtle: #431407;

  /* ── Surface Hierarchy ─── */
  --color-surface-base:   #0B0F19;
  --color-surface-1:      #111827;
  --color-surface-2:      #1F2937;
  --color-surface-3:      #374151;
  --color-surface-4:      #4B5563;

  /* ── Semantic / Gamification Colors ─── */
  --color-success:        #22C55E;
  --color-success-muted:  #052E16;
  --color-streak:         #F59E0B;
  --color-streak-muted:   #451A03;
  --color-warning:        #EAB308;
  --color-warning-muted:  #422006;
  --color-error:          #EF4444;
  --color-error-muted:    #450A0A;
  --color-xp:             #A78BFA;
  --color-xp-muted:       #1E1B4B;
  --color-info:           #38BDF8;
  --color-info-muted:     #0C4A6E;

  /* ── Category Colors (existing, refined) ─── */
  --color-learning:       #8B5CF6;
  --color-career:         #F59E0B;
  --color-health:         #10B981;
  --color-personal:       #3B82F6;
  --color-creative:       #EC4899;
}

/* ── Base Variables ───────────────────────────────────────────────────── */
:root {
  --background: #0B0F19;
  --foreground: #F9FAFB;
}

/* ── Base Styles ──────────────────────────────────────────────────────── */
* { box-sizing: border-box; }

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: Inter, system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Scrollbar ────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }

/* ── Animations ───────────────────────────────────────────────────────── */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-in { animation: fade-in 0.3s ease-out forwards; }

@keyframes flame-pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.15); }
}
.flame-pulse { animation: flame-pulse 1.5s ease-in-out infinite; }

@keyframes check-draw {
  from { stroke-dashoffset: 24; }
  to   { stroke-dashoffset: 0; }
}
.check-draw { animation: check-draw 0.4s ease-out forwards; }

@keyframes xp-float {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(-32px) scale(1.2); }
}
.xp-float { animation: xp-float 0.6s ease-out forwards; }

@keyframes scale-bounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.25); }
  70%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}
.scale-bounce { animation: scale-bounce 0.5s ease-out; }

@keyframes ring-fill {
  from { stroke-dashoffset: var(--ring-circumference); }
  to   { stroke-dashoffset: var(--ring-offset); }
}
.ring-fill { animation: ring-fill 0.6s ease-out forwards; }

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(249, 115, 22, 0.08) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

/* ── Utility Classes ──────────────────────────────────────────────────── */
.card-base {
  background-color: var(--color-surface-1);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1rem; /* 16px = rounded-2xl */
}

.card-elevated {
  background-color: var(--color-surface-2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
}

.card-accent {
  background-color: var(--color-primary-subtle);
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 1rem;
}

.glow-primary {
  box-shadow: 0 0 24px -4px rgba(249, 115, 22, 0.15);
}

.glow-success {
  box-shadow: 0 0 24px -4px rgba(34, 197, 94, 0.15);
}

.glow-streak {
  box-shadow: 0 0 24px -4px rgba(245, 158, 11, 0.2);
}
```

### 7.1 Using the Tokens in Components

Once the theme is configured, use these Tailwind classes:

```jsx
{/* Surface hierarchy */}
<div className="bg-surface-base" />        {/* Page background */}
<div className="bg-surface-1" />           {/* Standard card */}
<div className="bg-surface-2" />           {/* Elevated card */}
<div className="bg-surface-3" />           {/* Hover/active state */}

{/* Text hierarchy */}
<h1 className="text-gray-50" />            {/* Primary text */}
<p className="text-gray-400" />            {/* Secondary text */}
<span className="text-gray-500" />         {/* Tertiary/muted text */}

{/* Accent usage */}
<button className="bg-primary text-white" />{/* Primary CTA */}
<span className="text-primary" />          {/* Accent text */}
<div className="bg-primary-subtle border border-primary/20" /> {/* Tinted card */}

{/* Semantic colors */}
<span className="text-success">+10 XP</span>
<div className="bg-streak-muted text-streak">5-day streak</div>
<span className="text-error">Missed!</span>

{/* Gamification */}
<span className="text-xp text-6xl font-normal">1,247</span>  {/* XP display */}
<div className="bg-xp-muted text-xp rounded-full px-2 py-0.5 text-xs font-medium">
  +15 XP
</div>
```

---

## 8. Component Recipes

### 8.1 Goal/Task Card

```jsx
<div className="card-base p-4 hover:bg-surface-2 transition-colors active:scale-[0.98] transition-transform">
  {/* Category indicator */}
  <div className="h-0.5 w-12 rounded-full bg-health mb-3" />

  <div className="flex items-start justify-between">
    <div className="flex-1">
      <h3 className="text-gray-50 font-medium text-base">Morning Run</h3>
      <p className="text-gray-400 text-sm mt-0.5">Complete a 30-minute jog</p>
    </div>
    <span className="bg-xp-muted text-xp text-xs font-medium rounded-full px-2 py-0.5">
      15 XP
    </span>
  </div>

  {/* Progress bar */}
  <div className="mt-3 h-2 bg-surface-3 rounded-full overflow-hidden">
    <div className="h-full bg-health rounded-full transition-all duration-500"
         style={{ width: '60%' }} />
  </div>

  <div className="flex items-center justify-between mt-3">
    <span className="text-streak text-sm flex items-center gap-1">
      <FireIcon className="w-4 h-4 flame-pulse" /> 4 days
    </span>
    <span className="text-gray-500 text-sm">Due today</span>
    <button className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium
                       hover:bg-primary-light active:bg-primary-muted transition-colors">
      Start
    </button>
  </div>
</div>
```

### 8.2 XP Counter with Animation

```jsx
<div className="flex items-baseline gap-1">
  <span className="text-xp text-5xl font-normal tabular-nums">
    {animatedXP}
  </span>
  <span className="text-gray-500 text-sm font-medium">XP</span>

  {/* Floating bonus indicator */}
  {showBonus && (
    <span className="xp-float text-success text-lg font-medium absolute">
      +{bonusAmount}
    </span>
  )}
</div>
```

### 8.3 Streak Display (ADHD-Safe)

```jsx
<div className="flex items-center gap-3">
  {/* Current streak */}
  <div className="flex items-center gap-1.5">
    <FireIcon className={cn(
      "w-6 h-6",
      isActive ? "text-streak flame-pulse" : "text-surface-4"
    )} />
    <div>
      <span className="text-gray-50 font-medium text-lg tabular-nums">
        {currentStreak}
      </span>
      <span className="text-gray-500 text-xs ml-1">days</span>
    </div>
  </div>

  {/* Best streak (always visible -- preserves achievement) */}
  <div className="text-gray-500 text-xs">
    Best: <span className="text-gray-400">{bestStreak}</span>
  </div>

  {/* Streak freeze indicator */}
  {hasFreezes && (
    <div className="flex items-center gap-1 text-info text-xs">
      <SnowflakeIcon className="w-3.5 h-3.5" />
      {freezeCount}
    </div>
  )}
</div>
```

### 8.4 Radial Progress Ring (SVG)

```jsx
const circumference = 2 * Math.PI * 40; // radius = 40
const offset = circumference - (progress / 100) * circumference;

<svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
  {/* Background ring */}
  <circle cx="48" cy="48" r="40"
    fill="none"
    stroke="currentColor"
    className="text-surface-3"
    strokeWidth="6"
  />
  {/* Progress ring */}
  <circle cx="48" cy="48" r="40"
    fill="none"
    stroke="currentColor"
    className="text-primary"
    strokeWidth="6"
    strokeLinecap="round"
    strokeDasharray={circumference}
    strokeDashoffset={offset}
    style={{
      '--ring-circumference': circumference,
      '--ring-offset': offset,
    }}
  />
</svg>
<span className="absolute text-gray-50 text-xl font-medium">
  {progress}%
</span>
```

---

## Quick Reference: Design Decisions Summary

| Decision                           | Choice                                   | Rationale                                        |
|------------------------------------|------------------------------------------|--------------------------------------------------|
| Primary accent                     | Warm orange `#F97316`                    | Motivating, high-energy, action-oriented         |
| Base background                    | `#0B0F19` (not pure black)               | Reduces halation, enables elevation hierarchy    |
| Card radius                        | `rounded-2xl` (16px)                     | Modern, tactile, MD3 Large shape token           |
| Card borders                       | `border-white/[0.06]`                    | Subtle definition without harshness              |
| Text hierarchy                     | gray-50 / gray-400 / gray-500           | WCAG AA compliant, comfortable contrast          |
| Elevation model                    | Tonal (lighter surfaces) not shadows     | Shadows invisible on dark; tonal is MD3 standard |
| Streak design                      | ADHD-safe: freezes, partial credit, ratio| Avoids shame spirals and abandonment             |
| Min touch target                   | 48px, prefer 56px for primary actions    | MD3 standard + ADHD motor consideration          |
| Variable rewards                   | Base XP (fixed) + bonus (variable)       | Hook Model: novelty activates dopamine system    |
| Progress display                   | Micro (daily) over macro (monthly)       | ADHD needs frequent small dopamine hits          |
| Font                               | Inter (or system-ui fallback)            | Excellent small-size legibility                  |
| Color-blind safety                 | Luminance differentiation + icon pairing | Never color alone for semantics                  |

---

## Sources and Further Reading

- [Fogg Behavior Model](https://behaviordesign.stanford.edu/resources/fogg-behavior-model) -- Stanford Behavior Design Lab
- [Fogg Behavior Model Prompts](https://www.behaviormodel.org/prompts) -- behaviormodel.org
- [Making the Fogg Behavior Model Actionable](https://ui-patterns.com/blog/making-the-fogg-behavior-model-actionable) -- UI Patterns
- [Nir Eyal: The Hooked Model](https://www.nirandfar.com/how-to-manufacture-desire/) -- NirAndFar.com
- [Material Design 3 Typography](https://m3.material.io/styles/typography/applying-type) -- m3.material.io
- [Material Design 3 Shape](https://m3.material.io/styles/shape/corner-radius-scale) -- m3.material.io
- [Material Design 3 Color Roles](https://m3.material.io/styles/color/roles) -- m3.material.io
- [Material Design 3 Elevation](https://m3.material.io/styles/elevation/applying-elevation) -- m3.material.io
- [Material Design Dark Theme](https://m2.material.io/design/color/dark-theme.html) -- m2.material.io
- [Design a Dark Theme with Material and Figma](https://codelabs.developers.google.com/codelabs/design-material-darktheme) -- Google Codelabs
- [8 Tips for Dark Theme Design](https://uxplanet.org/8-tips-for-dark-theme-design-8dfc2f8f7ab6) -- UX Planet
- [Complete Dark Mode Design Guide 2025](https://ui-deploy.com/blog/complete-dark-mode-design-guide-ui-patterns-and-implementation-best-practices-2025) -- UI Deploy
- [Duolingo Gamification Secrets](https://www.orizon.co/blog/duolingos-gamification-secrets) -- Orizon
- [Psychology Behind Duolingo's Streak System](https://medium.com/@joeydiaoerpzd123/the-psychology-behind-duolingos-streak-system-visual-perception-and-gestalt-principles-73927d3155e3) -- Medium
- [Habitica Gamification Case Study](https://trophy.so/blog/habitica-gamification-case-study) -- Trophy
- [Breaking the Chain: Why Streak Features Fail ADHD Users](https://www.helloklarity.com/post/breaking-the-chain-why-streak-features-fail-adhd-users-and-how-to-design-better-alternatives/) -- Klarity Health
- [Gamified To-Do List Apps ADHD Brains Stick With](https://affine.pro/blog/gamified-to-do-list-apps-adhd) -- AFFiNE
- [WCAG Color Contrast Accessibility Guide 2025](https://www.allaccessible.org/blog/color-contrast-accessibility-wcag-guide-2025) -- AllAccessible
- [Color Blind Friendly Palettes](https://visme.co/blog/color-blind-friendly-palette/) -- Visme
- [Okabe-Ito Palette Reference](https://conceptviz.app/blog/okabe-ito-palette-hex-codes-complete-reference) -- ConceptViz
- [Coral Color Psychology](https://www.figma.com/colors/coral/) -- Figma
- [Color Psychology in UI Design 2025](https://mockflow.com/blog/color-psychology-in-ui-design) -- MockFlow
- [Dark Mode Accessibility Best Practices](https://dubbot.com/dubblog/2023/dark-mode-a11y.html) -- DubBot
- [Apple Human Interface Guidelines: Materials](https://developer.apple.com/design/human-interface-guidelines/materials) -- Apple Developer
