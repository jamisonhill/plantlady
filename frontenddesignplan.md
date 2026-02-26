# PlantLady App — Frontend UI Plan

## Overview

A dual-purpose plant app combining:
1. **My Plants** — Individual houseplant care, watering reminders, health tracking (new)
2. **My Garden** — Seasonal seed/batch tracking (existing, redesigned)

Every plant in the collection gets a **4-digit plant number** (e.g. `#0042`). Auto-generated on creation, visible on the plant card and detail page, and editable in the plant profile. Used for physical labeling of plants.

Multi-user, social-optional, dark-mode-first, warm & cozy aesthetic. Built for iPhone Safari now, with native iOS in mind for the future.

**Stack**: React 18 + TypeScript + Vite + Tailwind CSS (existing — keep and extend)
**Backend**: Existing FastAPI + PostgreSQL (keep and extend with new endpoints)

---

## Design System

### Color Palette

#### Dark Mode (Primary — design this first)

| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#1A140E` | Page background |
| `--color-surface` | `#2C1F14` | Cards, panels |
| `--color-surface-2` | `#3D2B1A` | Elevated cards, drawers |
| `--color-surface-3` | `#4E3722` | Inputs, modals |
| `--color-primary` | `#C4613A` | Terracotta — primary actions |
| `--color-primary-light` | `#E07A52` | Hover, highlights |
| `--color-secondary` | `#7A9E7E` | Sage — garden section accent |
| `--color-secondary-light` | `#9BBBAA` | Lighter sage |
| `--color-accent` | `#D4A85C` | Warm gold / wheat |
| `--color-text` | `#F5EED8` | Warm cream — primary text |
| `--color-text-2` | `#C4B49A` | Secondary / muted cream |
| `--color-text-muted` | `#8A7B6B` | Placeholders, disabled |
| `--color-success` | `#7BC47A` | Healthy plants |
| `--color-error` | `#E05555` | Overdue, issues |
| `--color-warning` | `#D4A85C` | Due today (same as accent) |
| `--color-border` | `rgba(255,255,255,0.08)` | Subtle borders |
| `--color-border-strong` | `rgba(255,255,255,0.15)` | Emphasized borders |

#### Light Mode

| Token | Value |
|-------|-------|
| `--color-bg` | `#FAF6F0` |
| `--color-surface` | `#FFFFFF` |
| `--color-surface-2` | `#F5EDE0` |
| `--color-primary` | `#B8522E` |
| `--color-secondary` | `#5C7F60` |
| `--color-accent` | `#B8963A` |
| `--color-text` | `#2A1A10` |
| `--color-text-2` | `#6B4E35` |
| `--color-text-muted` | `#A08060` |

### Typography

**Display font**: Cormorant Garamond — elegant, botanical, distinctive serif for headings and branding
**Body font**: DM Sans — modern, readable, warm sans-serif for all UI text

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap');

--font-display: 'Cormorant Garamond', Georgia, serif;
--font-body:    'DM Sans', system-ui, sans-serif;

/* Type scale */
--text-xs:   0.75rem;    /* 12px — timestamps, labels */
--text-sm:   0.875rem;   /* 14px — captions, metadata */
--text-base: 1rem;       /* 16px — body text */
--text-lg:   1.125rem;   /* 18px — section headings */
--text-xl:   1.375rem;   /* 22px — page headings */
--text-2xl:  1.875rem;   /* 30px — hero headings */
--text-3xl:  2.5rem;     /* 40px — brand/logo */
```

### Spacing & Radii

```css
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;
--space-4: 16px;  --space-5: 20px;  --space-6: 24px;
--space-8: 32px;  --space-10: 40px;

--radius-sm:   8px;
--radius-md:   12px;
--radius-lg:   16px;
--radius-xl:   20px;
--radius-full: 9999px;
```

### Backgrounds

**App background** (dark warm vignette):
```css
body {
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,97,58,0.08) 0%, transparent 70%),
    linear-gradient(180deg, #1A140E 0%, #150F0A 100%);
}
```

**Card surfaces**:
```css
.card {
  background: linear-gradient(135deg, #2C1F14 0%, #261A10 100%);
  border: 1px solid rgba(255,255,255,0.07);
}
```

**My Plants section accent** (sage tint):
```css
.section-plants {
  background: radial-gradient(ellipse at top right, rgba(122,158,126,0.12) 0%, transparent 50%);
}
```

**My Garden section accent** (terracotta tint):
```css
.section-garden {
  background: radial-gradient(ellipse at top right, rgba(196,97,58,0.12) 0%, transparent 50%);
}
```

---

## Navigation Architecture

### 4-Tab Bottom Bar

```
[ Today ]  [ Collection ]  [ Discover ]  [ Profile ]
```

| Tab | Icon | Purpose |
|-----|------|---------|
| **Today** | 🏠 | Dashboard: care due, upcoming, friend activity |
| **Collection** | 🌿 | Toggle between My Plants and My Garden |
| **Discover** | 🔍 | Plant catalog + plant identification |
| **Profile** | 👤 | Account, friends, sharing, settings |

**Bottom bar specs**:
- Total height: 83px (49px bar + 34px safe area padding)
- Active tab: terracotta icon + label + 2px terracotta underline indicator
- Inactive tab: `--color-text-muted` icon + label
- Badge on Today tab (red dot) when any plant is overdue

**Collection toggle** — segmented control at top of Collection screen:
```
  [  My Plants  |  My Garden  ]
```
- Animated pill slides between options
- My Plants → sage glow on pill
- My Garden → terracotta glow on pill

---

## Screen Specifications

---

### 1. Auth Screens

**Onboarding / Login**:
- Full dark background with subtle warm gradient vignette
- Cormorant Garamond logo "PlantLady" at top with botanical icon
- PIN login (6-digit numeric pad on screen — existing PIN flow, redesigned)
- "New here? Sign up" link → signup screen

**Signup**:
- Step 1: Name + username
- Step 2: PIN (4–6 digit) with confirm
- Step 3: Profile photo (optional, skip link)
- "Join with invite code" option (for future friend invites)

---

### 2. Today (Home Dashboard)

**Header**:
```
Good morning, Jamison   [Avatar circle]
🔥 12-day streak
```

**Section: Care Due Today**

Vertically stacked care-task rows:
```
┌─────────────────────────────────────────────────┐
│ 💧  Monstera Deliciosa              [Done ✓]   │
│     Last watered 8 days ago                     │
├─────────────────────────────────────────────────┤
│ 💧  Pothos 'Golden'                 [Done ✓]   │
│     Overdue 2 days — needs water now!  🔴      │
└─────────────────────────────────────────────────┘
```
- Overdue rows: error-red left-border accent + pulsing glow
- [Done ✓] pill button: one tap → logs care, updates schedule, animates away
- Tap plant name row → Plant Detail

**Section: Upcoming (next 7 days)**
- Horizontal scrollable day chips: `Mon 3  Tue 4  Wed 5 •  Thu 6`
- Dot indicates care task on that day
- Tap day chip → see what's due

**Section: My Garden This Season**
- 3 most recent batch events (compact card)
- "See all →" link to Collection tab

**Section: Friend Activity** (if connections exist)
```
  Amy watered her Snake Plant · 2h ago
  Amy logged a new batch: Purple Basil · Yesterday
```
- Non-intrusive, bottom of scroll

---

### 3. Collection — My Plants Tab

**Header**:
- "My Plants" in Cormorant Garamond 2xl, sage-tinted background
- Plant count chip: `14 plants`

**Layout**: 2-column grid

**Plant Card**:
```
┌────────────────────┐
│  [Photo or    #0042│
│   plant emoji      │
│   botanical bg]    │
│                    │
│  Monstera          │
│  Deliciosa         │
│                    │
│  💧 Due today  🔴 │
└────────────────────┘
```
- Photo fills card top (60% of card height)
- Plant number `#0042` top-right corner, `--color-text-muted` small text
- Name in DM Sans 500
- Care badge bottom-left: color-coded by urgency
- Tap → Plant Detail

**FAB**: Terracotta circle `+` bottom-right, 56px

**Empty State**:
```
    🌿 (botanical illustration)
    Your collection is empty.
    Add your first plant to get started.

    [+ Add a Plant]  ← terracotta button
```

---

### 4. Plant Detail — My Plants

**Hero** (full-width, ~40% of screen):
- Plant photo (or warm botanical texture placeholder)
- Gradient scrim: transparent → dark bottom
- Plant number `#0042` in small text (top-left corner of scrim)
- Plant name in Cormorant Garamond 2xl over gradient (centered)
- ← Back   Edit →

**Info chips row**:
```
  #0042              📍 Living Room   📅 Added Jan 2025
```
- Plant number clickable: opens edit number modal (tap to change number)

**Care Status Card**:
```
┌─────────────────────────────────────────────┐
│ Next Care                                   │
│                                             │
│  💧 Watering      Overdue 2d  [Done →]    │
│  🌱 Fertilizing   In 12 days              │
│  🪴 Repotting     In 45 days              │
└─────────────────────────────────────────────┘
```
- [Done →] logs care instantly + calculates next due date

**Tabs**: Care Log | Growth | Health

**Care Log tab**:
- Chronological timeline (newest first)
- Row: `💧 Watered · Mar 3, 2026 · "Soil was quite dry"`

**Growth tab**:
- Masonry-style photo grid
- Tap → full-screen lightbox with date overlay
- "Add Photo" button top-right

**Health tab**:
- Current status chip: `🟢 Healthy` / `🟡 Watch` / `🔴 Struggling`
- Health log entries: date + symptom + treatment + optional photo
- "Log Issue" button → health entry form

---

### 5. Add Plant Flow (My Plants)

Step indicator at top (3 steps).

**Step 1 — Name & Location**:
- "Plant name" text field (autocomplete from plant catalog API)
  - Selecting from catalog auto-fills scientific name
- "Where does it live?" location picker: chips for Living Room / Bedroom / Office / Bathroom / Balcony / Other
- Next →

**Step 2 — Care Schedule**:
- Watering: slider `Every [7] days`
- Fertilizing: toggle + slider `Every [4] weeks`
- Repotting reminder: toggle + `Remind me in [6] months`
- Back | Next →

**Step 3 — Photo (optional)**:
- Camera button (primary)
- Choose from Library (secondary)
- Skip link

**Confirm screen**:
- Plant number displayed prominently: `Plant #0042` (auto-generated, tap to edit before saving)
- Card preview of new plant with all chosen details
- "Add to My Plants" → terracotta filled button
- Confetti or pop-in success animation on confirmation
- After confirmation, plant number is locked but can be edited later on plant detail page

---

### 6. Collection — My Garden Tab

**Header**:
- "My Garden" in Cormorant Garamond 2xl, terracotta-tinted background
- Season selector pill: `2026 Season ▾` (tap → season picker modal)

**Batch List** (redesigned):
```
┌──────────────────────────────────────────┐
│  🌱  Black Krim Tomatoes                 │
│      Started Feb 14 · 6 seeds            │
│      Stage: 🌿 Germinated               │
│                          [Log Event →]  │
└──────────────────────────────────────────┘
```
- Batch card: warm dark surface with terracotta left accent bar
- Stage indicator with appropriate stage emoji
- [Log Event →] → existing LogEventPage (redesigned)

**FAB**: Terracotta `+` → Add batch (existing AddPlantPage, redesigned)

**Batch Detail screen** (new):
- Variety info header
- Batch metadata (seed count, source, location, dates)
- Event timeline (chronological, icons per event type)
- Photos gallery section
- Cost summary chip (if costs logged)

---

### 7. Discover

**Header**: Search bar always visible at top

**Tabs**: Browse | Identify

**Browse tab**:

Filter chips row:
```
[All]  [Easy care]  [Low light]  [Air purifying]  [Beginner]
```

2-column plant card grid:
```
┌────────────────────┐
│   [Plant Photo]    │
│                    │
│   Pothos           │
│   ● Easy care      │
└────────────────────┘
```

Tap → Plant Info screen:
- Hero photo
- Common + scientific name
- Care requirements table (light, water, humidity, soil)
- "Add to My Plants" CTA button → pre-fills Add Plant flow

**Identify tab**:
- Camera viewfinder with guide frame
- Instructional text: "Center the plant in the frame"
- [Take Photo] large button, bottom center
- [Choose from Library] secondary button
- Result screen:
  - Identified plant name + confidence %
  - Matching catalog entry
  - "Add to My Plants" button

---

### 8. Profile

**Header**:
- Avatar (photo or initials circle)
- Display name + @username
- Stats row: `🌿 14 Plants   🔥 12-day streak   💧 47 tasks done`

**Section: Friends & Sharing**:
- Friend list with avatars + shared/private indicator
- "Add Friend" by @username search
- Per-friend sharing toggle: "Share my activity → [toggle]"
- Privacy: opt-in only — you control what each friend sees

**Section: Plant Privacy** (quick-access):
- "Manage which plants are shared" → list of plants with per-plant privacy chip

**Section: Care Reminders**:
- In-app reminders: on/off toggle
- Reminder time preference (morning / midday / evening)
- (Push notification opt-in — placeholder for future native app)

**Section: Account**:
- Edit profile (name, username, photo)
- Change PIN
- Theme: [Dark | Light | System]
- Sign out

---

## Key UI Components

### Care Urgency Badge

| State | Display | Color |
|-------|---------|-------|
| Overdue | `💧 Overdue 2d` | `--color-error` with pulsing border glow |
| Due today | `💧 Due today` | `--color-warning` |
| Upcoming | `📅 In 3 days` | `--color-text-muted` |
| Healthy | `✓ Good` | `--color-success` |

### Quick-Log [Done] Button

- Pill shape, `--color-surface-3` background, `--color-text-2` text
- Tap: checkmark animation, pill fades out, row strikes through, then row slides up and disappears (400ms total)
- One-tap care logging — no confirmation needed

### Bottom Tab Bar

```css
.tab-bar {
  position: fixed;
  bottom: 0;
  height: 83px;                  /* 49px bar + 34px safe area */
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  backdrop-filter: blur(20px);   /* frosted glass on scroll */
}
```

### Collection Toggle (Segmented Control)

- Container: `--color-surface-3` background, `--radius-full` pill
- Active pill: slides with CSS transition (250ms ease-in-out)
- My Plants active → sage tinted pill
- My Garden active → terracotta tinted pill

---

## Animations & Motion

| Interaction | Animation | Duration | Easing |
|-------------|-----------|----------|--------|
| Card hover lift | translateY(-2px) + shadow | 200ms | ease-out |
| Tab switch | Cross-fade pages | 250ms | ease |
| Care task Done | Checkmark pop-in, row slide-up | 400ms | cubic-bezier bounce |
| Overdue pulse | Border glow keyframes | 2s infinite | ease-in-out |
| Page forward | Slide from right | 300ms | ease |
| Page back | Slide out left | 300ms | ease |
| Skeleton loader | Shimmer shimmer across warm-brown surface | — | linear infinite |
| Photo fade-in | opacity 0 → 1 | 300ms | ease |
| FAB appear | scale 0 → 1 | 200ms | cubic-bezier spring |
| Segment toggle pill | translateX slide | 250ms | ease-in-out |

All animations respect `@media (prefers-reduced-motion: reduce)` — instant/no animation.

---

## Backend Extensions Required

These additions sit on top of the existing 40+ working endpoints.

### New Tables

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| `individual_plants` | user_id, name, variety_id(opt), location, acquired_date, photo_filename | Owned houseplants |
| `care_schedules` | plant_id, care_type, frequency_days, last_done_at, next_due_at | Per-plant care cadence |
| `care_events` | plant_id, user_id, care_type, notes, done_at | Care history log |
| `health_logs` | plant_id, user_id, status, symptoms, treatment, photo, logged_at | Health tracking |
| `growth_photos` | plant_id, user_id, filename, notes, taken_at | Photo journal |
| `user_connections` | user_id, connected_user_id, status, sharing_enabled | Friend relationships |

### New Endpoint Groups

- `GET/POST /individual-plants` — houseplant CRUD
- `GET/POST /care-schedules` — schedule management
- `POST /care-events` — log a care action
- `GET /care-dashboard` — today's tasks across all plants
- `GET/POST /health-logs` — health tracking
- `GET/POST /growth-photos` — photo journal
- `POST/GET /connections` — friend requests and list
- `GET /activity-feed` — shared friend activity

---

## Frontend File Strategy

### Archive (keep in git, move to `app/src/_archive/`)
- `PinLoginPage.tsx` → replace with new auth flow
- `UserSelectPage.tsx` → replace with new auth flow
- `HomePage.tsx` → replace with Today dashboard
- `PlantCard.tsx` → replace with new Plant Card component

### Keep & Extend
- `AuthContext.tsx` — extend with new user model fields
- `types.ts` — extend with new types
- `api/client` — extend, don't replace
- `LogEventPage.tsx`, `AddPlantPage.tsx`, `EventTypeGrid.tsx`, `VarietyPicker.tsx` — redesign

### New Files to Create

```
app/src/
├── design-system/
│   ├── tokens.css          ← all CSS variables (colors, type, spacing)
│   └── animations.css      ← keyframes and transition utilities
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── SegmentedControl.tsx
│   │   ├── BottomTabBar.tsx
│   │   ├── Skeleton.tsx
│   │   └── EmptyState.tsx
│   ├── plants/
│   │   ├── PlantCard.tsx        (new)
│   │   ├── CareTaskRow.tsx
│   │   ├── CareStatusCard.tsx
│   │   └── HealthBadge.tsx
│   └── garden/
│       ├── BatchCard.tsx        (new design)
│       └── EventTimeline.tsx
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── today/
│   │   └── TodayPage.tsx
│   ├── collection/
│   │   ├── CollectionPage.tsx   (toggle shell)
│   │   ├── MyPlantsTab.tsx
│   │   └── MyGardenTab.tsx
│   ├── plants/
│   │   ├── PlantDetailPage.tsx
│   │   └── AddPlantPage.tsx     (new flow)
│   ├── garden/
│   │   ├── BatchDetailPage.tsx  (new)
│   │   └── LogEventPage.tsx     (redesigned)
│   ├── discover/
│   │   └── DiscoverPage.tsx
│   └── profile/
│       └── ProfilePage.tsx
```

---

## Implementation Phases

| Phase | Scope | Delivers |
|-------|-------|---------|
| **1** | Design system tokens + base components | CSS variables, typography, Button, Card, Badge |
| **2** | Navigation shell | Bottom tab bar, routing, auth screens |
| **3** | Today dashboard | Care due list, quick-log, upcoming strip |
| **4** | My Plants | List, detail, add flow, care logging |
| **5** | My Garden redesign | Batch list + detail in new design system |
| **6** | Discover | Plant catalog browse + identify flow |
| **7** | Profile + Social | Friends, sharing, settings |

---

*Design principles applied from `~/.claude/design-skills/` — warm & cozy dark mode, Cormorant Garamond + DM Sans, terracotta + sage + cream palette, layered background gradients, purposeful 200–400ms animations.*
