# PrepForge

> **From first problem to first offer.**

PrepForge is a full-stack placement preparation platform built for competitive programmers and software engineering aspirants. It aggregates your coding activity across platforms like Codeforces and LeetCode into a single unified dashboard — giving you real-time insights into your preparation progress, contest history, problem-solving patterns, and performance trends.

**Live:** [your-vercel-url-here]

---

## Table of Contents

- [Overview](#overview)
- [Live Features](#live-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Platform Integrations](#platform-integrations)
- [Architecture Decisions](#architecture-decisions)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Development Workflow](#development-workflow)
- [Phase History](#phase-history)
- [Roadmap](#roadmap)

---

## Overview

PrepForge solves a real problem for placement-season students: **your coding activity is scattered across multiple platforms and there is no single place to understand where you stand.**

You solve LeetCode problems, participate in Codeforces contests, and practice company-specific interview questions — but none of these platforms talk to each other. PrepForge pulls everything together into one dashboard, with a gamified XP layer on top to make consistent prep feel rewarding.

### Core Philosophy

- **Database as source of truth** — external APIs are called only when data is stale. The dashboard always reads from the database for fast, reliable loads.
- **Compute, don't duplicate** — derived values like XP are calculated live from existing synced data rather than stored separately, so they can never drift out of sync with the underlying stats.
- **Platform-first architecture** — each platform (Codeforces, LeetCode, AtCoder, HackerRank) has its own isolated service layer, API route, sync service, and dashboard. Adding a new platform follows the exact same pattern.
- **Right-sized infrastructure** — synchronous, on-demand syncing with database-backed staleness checks was chosen deliberately over a job-queue architecture, since the actual workload (single-user, on-demand fetches) doesn't justify the operational overhead of a queue and a separate worker process.
- **Production-ready from day one** — authentication, protected routes, persistent storage, error handling, and loading states are implemented at every level.

---

## Live Features

### Authentication
- Sign up and sign in via Clerk
- Google OAuth supported out of the box
- All dashboard routes are protected
- Middleware-level route protection

### Profile & Handle Management
- Save handles for Codeforces, LeetCode, AtCoder, HackerRank
- Handles stored in a dedicated `Handles` table linked to the user
- Update handles at any time from the Profile page
- XP breakdown displayed on profile (see [XP System](#xp-system) below)

### Unified Dashboard (`/dashboard`)
- Welcome header with greeting, avatar, motivational message, and total XP badge
- Overview cards: Codeforces Rating, LeetCode Solved, Total Contests, Prep Score
- Platform snapshot cards for Codeforces and LeetCode
- Codeforces rating trend line chart
- LeetCode difficulty breakdown donut chart
- Recent activity feed (merged across platforms)
- Rule-based PrepForge Insights
- Connected Platforms status (with Coming Soon for AtCoder and HackerRank)
- Interview Preparation section: questions solved, companies started, topics completed, overall readiness score
- Quick Actions for navigation and sync

### Codeforces Dashboard (`/contest/codeforces`)
- Live profile summary: rating, max rating, rank, max rank, contribution, avatar
- Contest statistics: total contests, best rank, worst rank, average delta rating
- Rating progression line chart with rank boundary reference lines
- Recent contests table (last 10) with clickable contest links
- Auto-sync on load with 1-hour freshness cache
- Manual refresh button

### LeetCode Dashboard (`/contest/leetcode`)
- Live profile summary: username, total solved, ranking, acceptance rate
- Difficulty breakdown cards: Easy, Medium, Hard
- Solved breakdown donut chart (Recharts)
- Overall progress bars per difficulty tier
- Auto-sync on load with 1-hour freshness cache
- Manual refresh button
- LeetCode orange theme — visually distinct from Codeforces

### Contest Calendar (`/contest/calendar`)
- Month-grid calendar view of upcoming contests across Codeforces and LeetCode
- Pulls Codeforces contests via the official `contest.list` API
- Pulls LeetCode's next Weekly + Biweekly contests via their GraphQL endpoint
- Days with contests are visually highlighted; each contest renders as an inline pill inside its day cell
- One-click "Add to Google Calendar" per contest — generates a prefilled Google Calendar event link, no OAuth required
- Standalone nav link in the navbar, alongside the platform-specific Contests dropdown
- Data is public and identical for every user, so it's cached in-memory server-side (3-hour TTL) rather than per-user in the database

### Companies & Subjects (`/companies`, `/subjects`)
- 20+ companies with curated interview questions, difficulty breakdown, and per-user progress tracking
- 5 core CS subjects (DBMS, OS, CN, OOPS, LLD) with 33+ revision topics
- Question and topic status tracking: Not Started / In Progress / Solved / Completed
- Company and subject-level completion percentages

### XP System
- XP is **computed live**, not stored — calculated fresh from already-synced data every time it's requested, so it can never drift out of sync with the underlying stats
- Formula: LeetCode Easy (5 XP) / Medium (10 XP) / Hard (20 XP), Codeforces contests (50 XP each), company questions solved (15 XP each), revision topics completed (10 XP each)
- Displayed as a full breakdown on the Profile page, and as a summary badge on the main Dashboard header — both pull from the same `calculateUserXP()` function, so they can never disagree
- Level tiers (Beginner → Interview Slayer) are designed but not yet implemented in the UI

### Persistence Layer
- Codeforces contest history stored in `ContestHistory` table
- Codeforces stats stored in `ContestStats` table
- LeetCode stats stored in `LeetcodeStats` table
- Duplicate prevention via unique constraints
- Freshness strategy: data older than 1 hour triggers a re-sync
- Contest calendar data is intentionally **not** persisted to Postgres — it's identical for every user, so it lives in an in-memory cache instead

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui + Radix UI |
| Authentication | Clerk |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma 6 |
| Charts | Recharts |
| Icons | lucide-react |
| Fonts | Geist Sans + Geist Mono |
| Deployment | Vercel |

---

## Project Structure

```
prepforge/
├── app/
│   ├── api/
│   │   ├── profile/
│   │   │   ├── handles/
│   │   │   │   └── route.ts          # GET + POST handles
│   │   │   └── xp/
│   │   │       └── route.ts          # GET XP breakdown for logged-in user
│   │   ├── codeforces/
│   │   │   ├── [handle]/
│   │   │   │   └── route.ts          # GET live CF data
│   │   │   └── sync/
│   │   │       └── route.ts          # POST sync CF to DB
│   │   ├── leetcode/
│   │   │   ├── [handle]/
│   │   │   │   └── route.ts          # GET live LC data
│   │   │   └── sync/
│   │   │       └── route.ts          # POST sync LC to DB
│   │   ├── contests/
│   │   │   └── route.ts              # GET upcoming contests (CF + LC), in-memory cached
│   │   ├── companies/
│   │   │   ├── route.ts              # GET all companies with progress
│   │   │   └── [companyId]/route.ts  # GET single company with questions
│   │   ├── questions/[questionId]/progress/route.ts
│   │   ├── subjects/
│   │   │   ├── route.ts
│   │   │   └── [subject]/route.ts
│   │   ├── topics/[topicId]/progress/route.ts
│   │   └── dashboard/
│   │       ├── route.ts              # GET aggregated dashboard data (incl. XP)
│   │       └── interview-stats/route.ts
│   ├── contest/
│   │   ├── codeforces/page.tsx       # Codeforces dashboard UI
│   │   ├── leetcode/page.tsx         # LeetCode dashboard UI
│   │   └── calendar/page.tsx         # Contest calendar UI
│   ├── companies/
│   │   ├── page.tsx
│   │   └── [companyId]/page.tsx
│   ├── subjects/
│   │   ├── page.tsx
│   │   └── [subject]/page.tsx
│   ├── dashboard/
│   │   └── page.tsx                  # Unified dashboard UI
│   ├── profile/
│   │   └── page.tsx                  # Profile, handle management, XP display
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   ├── page.tsx                      # Landing page
│   ├── layout.tsx                    # Root layout with ClerkProvider
│   └── globals.css                   # Global styles
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── utils.ts                      # Shared utilities
│   ├── google-calendar.ts            # Builds "Add to Google Calendar" links
│   └── services/
│       ├── codeforces.ts             # CF API fetchers + helpers
│       ├── codeforces-sync.ts        # CF sync service
│       ├── leetcode.ts               # LC GraphQL fetcher
│       ├── leetcode-sync.ts          # LC sync service
│       ├── contests.ts               # Upcoming contest fetcher (CF + LC)
│       └── xp.ts                     # Live XP calculation
├── components/
│   ├── Navbar.tsx                    # Global nav, Contests dropdown, Calendar link
│   ├── contests/
│   │   └── ContestCalendar.tsx       # Month-grid calendar component
│   └── companies/
│       └── CompanyCard.tsx
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── seed.ts                       # Seeds companies, questions, subjects, topics
│   └── migrations/                   # Migration history
├── public/
│   └── hero-illustration.svg         # Landing page illustration
├── middleware.ts                     # Clerk route protection
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  name      String?
  email     String   @unique
  image     String?
  createdAt DateTime @default(now())

  handles                 Handles?
  contestHistory          ContestHistory[]
  contestStats            ContestStats[]
  leetcodeStats           LeetcodeStats?
  xp                      XP[]                        // unused — see note below
  badges                  UserBadge[]                 // unused — badges not yet built
  questionProgress        QuestionProgress[]
  topicProgress           TopicProgress[]
  subjectQuestionProgress SubjectQuestionProgress[]
}

model Handles {
  id         String  @id @default(cuid())
  userId     String  @unique
  codeforces String?
  leetcode   String?
  atcoder    String?
  hackerrank String?

  user User @relation(fields: [userId], references: [id])
}

model ContestHistory {
  id          String   @id @default(cuid())
  userId      String
  platform    String
  contestId   String
  contestName String
  rating      Int
  rank        Int
  date        DateTime

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, contestId, platform])
}

model ContestStats {
  id            String    @id @default(cuid())
  userId        String
  platform      String
  currentRating Int
  maxRating     Int
  contestCount  Int
  lastSyncedAt  DateTime?

  user User @relation(fields: [userId], references: [id])
}

model LeetcodeStats {
  id          String   @id @default(cuid())
  userId      String   @unique
  easy        Int      @default(0)
  medium      Int      @default(0)
  hard        Int      @default(0)
  totalSolved Int      @default(0)
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}

model QuestionProgress {
  userId     String
  questionId String
  status     String @default("NOT_STARTED") // NOT_STARTED | IN_PROGRESS | SOLVED

  user     User     @relation(fields: [userId], references: [id])
  question Question @relation(fields: [questionId], references: [id])

  @@id([userId, questionId])
}

model TopicProgress {
  userId  String
  topicId String
  status  String @default("NOT_STARTED") // NOT_STARTED | IN_PROGRESS | COMPLETED

  user  User          @relation(fields: [userId], references: [id])
  topic RevisionTopic @relation(fields: [topicId], references: [id])

  @@id([userId, topicId])
}

// Company / question / subject models — implemented (Phase 7)
model Question { ... }
model Company { ... }
model CompanyQuestion { ... }
model RevisionTopic { ... }
model SubjectQuestion { ... }
model SubjectQuestionProgress { ... }

// Schema exists, not yet used by the application layer
model XP { ... }          // event-based XP logging — superseded by live computation in lib/services/xp.ts
model Badge { ... }
model UserBadge { ... }
```

### Key Schema Decisions

**`@@unique([userId, contestId, platform])` on `ContestHistory`**
Prevents duplicate contest entries when syncing. Prisma's `upsert` uses this constraint to update existing records instead of inserting duplicates.

**`lastSyncedAt` on `ContestStats`**
Tracks when Codeforces data was last fetched. The sync service checks this field — if less than 1 hour ago, it skips the API call entirely and returns cached data.

**`updatedAt @updatedAt` on `LeetcodeStats`**
Prisma automatically updates this field on every write. The LeetCode sync service uses it as the freshness timestamp, equivalent to `lastSyncedAt` on Codeforces.

**Why the `XP` model exists but isn't used**
The schema includes an `XP` table designed for event-based logging (one row per XP-earning action, with a `points` and `reason` field). The application currently uses a different, simpler approach instead: XP is computed live, on request, directly from `LeetcodeStats`, `ContestStats`, `QuestionProgress`, and `TopicProgress` — see [XP System](#xp-system). The `XP` table remains in the schema as a natural next step if per-event XP history (e.g. "you earned 50 XP on July 12th") is ever needed.

---

## API Reference

### Handles

```
GET  /api/profile/handles
```
Returns the current user's saved handles.

```
POST /api/profile/handles
Body: { codeforces, leetcode, atcoder, hackerrank }
```
Creates or updates the user's handles.

---

### XP

```
GET /api/profile/xp
```
Returns the authenticated user's XP breakdown, computed live.

```json
{
  "leetcode": 1415,
  "codeforces": 1450,
  "companyQuestions": 45,
  "revisionTopics": 10,
  "total": 2920
}
```

---

### Codeforces

```
GET  /api/codeforces/[handle]
POST /api/codeforces/sync
```
Fetches live data / syncs the authenticated user's Codeforces data to the database. Sync respects a 1-hour freshness window.

---

### LeetCode

```
GET  /api/leetcode/[handle]
POST /api/leetcode/sync
```
Fetches live data / syncs the authenticated user's LeetCode stats to the database.

---

### Contest Calendar

```
GET /api/contests
```
Returns upcoming contests across Codeforces and LeetCode, sorted by start time. Publicly cached in-memory for 3 hours (no auth required, no per-user data).

```json
{
  "contests": [
    {
      "id": "cf-2245",
      "platform": "codeforces",
      "name": "Codeforces Round 1110 (Div. 1 + Div. 2)",
      "startTime": 1784212500,
      "durationSeconds": 9000,
      "url": "https://codeforces.com/contests/2245"
    }
  ],
  "cached": true
}
```

---

### Companies, Subjects & Progress

```
GET   /api/companies
GET   /api/companies/[companyId]
PATCH /api/questions/[questionId]/progress    Body: { status }
GET   /api/subjects
GET   /api/subjects/[subject]
PATCH /api/topics/[topicId]/progress          Body: { status }
GET   /api/dashboard/interview-stats
```

---

### Dashboard

```
GET /api/dashboard
```
Returns all aggregated data for the unified dashboard, including the live XP breakdown. Reads exclusively from the database (plus one live XP calculation) — never calls external platform APIs directly.

---

## Platform Integrations

### Codeforces

**Data source:** `https://codeforces.com/api`

**Endpoints used:**
- `user.info?handles={handle}` — profile, rating, rank, contribution
- `user.rating?handle={handle}` — full contest rating history
- `contest.list?gym=false` — all contests, filtered client-side to upcoming (`phase === "BEFORE"`) for the calendar

**Service functions (`lib/services/codeforces.ts`):** `getUserInfo`, `getContestHistory`, `computeContestStats`, `getRecentContests`, `buildRatingGraph`, `rankColor`

**Sync service (`lib/services/codeforces-sync.ts`):** checks `lastSyncedAt`, re-fetches if stale, upserts `ContestStats` and `ContestHistory`.

---

### LeetCode

**Data source:** `https://leetcode.com/graphql`

**Queries used:**
- `matchedUser` — profile, solved counts by difficulty, submission stats
- `topTwoContests` — the next Weekly + Biweekly contest (used for the contest calendar; LeetCode never has more than these two queued)

**Headers required:** `Content-Type: application/json`, `Referer: https://leetcode.com`

**Sync service (`lib/services/leetcode-sync.ts`):** checks `updatedAt`, re-fetches if stale, single upsert on `LeetcodeStats`.

---

## Architecture Decisions

### Why synchronous sync instead of a job queue?

Each sync operation is a single user clicking a button, triggering 1–2 lightweight API calls that complete in well under a second. A job queue (e.g. BullMQ) solves problems around high-concurrency workloads and long-running tasks — neither applies here. Adding one would mean a second always-running worker process, a new external dependency (Redis), and a deployment target beyond Vercel's serverless model, for a workload that doesn't need any of that. The database-backed staleness check (`lastSyncedAt` / `updatedAt`) achieves the same practical goal — avoid hammering third-party APIs — with far less operational surface area.

### Why is XP computed live instead of stored?

Storing XP as an accumulating number risks drift: double-counting if a sync runs twice, staleness if point values change, or divergence if the underlying stats update without XP being recalculated. Computing it on request from already-trusted, already-synced data (`LeetcodeStats`, `ContestStats`, `QuestionProgress`, `TopicProgress`) guarantees it's always correct by construction, at the cost of a few extra fast database queries per request.

### Why does the contest calendar use an in-memory cache instead of Redis or the database?

Contest schedules are identical for every user — there's no per-user state to persist, so a Postgres table would be pure overhead. Redis isn't set up elsewhere in this project (no shared client exists), so a simple in-memory cache with a 3-hour TTL was used instead. Trade-off: the cache resets when the server process restarts, or is duplicated per serverless instance — acceptable for public, slow-changing data where a few extra harmless API calls after a cold start cost nothing.

### Why a separate sync endpoint instead of syncing on every dashboard load?

Calling external APIs on every page load would be slow, unreliable during third-party downtime, and risk rate-limiting. The sync service checks freshness first and returns immediately from the database if data is recent.

### Why does the dashboard API never call external APIs directly?

The dashboard is the most-visited page. Making it dependent on Codeforces/LeetCode API availability would make the most important page the most fragile. Users trigger sync manually when they want fresh data.

### Why Clerk over NextAuth?

Pre-built sign-in/sign-up UI, profile data out of the box, a simple `auth()` server helper, and clean App Router middleware integration.

### Why Neon PostgreSQL?

Serverless, native Prisma support, generous free tier, branch-based workflows, compatible with Vercel deployment.

### Prisma singleton pattern

```typescript
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Prevents Next.js hot reload from exhausting the database connection pool by creating a new `PrismaClient` on every file change.

---

## Environment Variables

```env
# Database — use the pooled connection string in production (Vercel)
DATABASE_URL="postgresql://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Public
NEXT_PUBLIC_APP_NAME=PrepForge
NEXT_PUBLIC_THEME=dark
```

`afterSignOutUrl` is configured once on `<ClerkProvider>` in `app/layout.tsx` rather than per-component, per Clerk's Core 2 convention.

---

## Getting Started

```bash
git clone https://github.com/your-username/prepforge.git
cd prepforge
npm install

cp .env.example .env.local
# Fill in DATABASE_URL and Clerk keys

npx prisma migrate dev
npm run dev
```

Open `http://localhost:3000`.

### First Run Flow

1. Visit `http://localhost:3000` → Get Started
2. Sign up → redirected to `/profile`
3. Add Codeforces / LeetCode handles → Save
4. Visit `/dashboard` — data syncs automatically, XP appears in the header
5. Explore `/contest/calendar`, `/companies`, `/subjects`

---

## Deployment

Deployed on **Vercel**, connected directly to the GitHub repository.

- **Root Directory:** `prepforge` (the actual Next.js app lives in a subfolder of the repo)
- **Framework Preset:** Next.js (auto-detected)
- **Build/Output/Install commands:** left on Vercel's Next.js defaults
- **Environment Variables:** all values from `.env.local` added in Vercel's project settings — `DATABASE_URL` uses Neon's **pooled** connection string, since serverless functions open many short-lived connections
- **Clerk:** production URL added to Clerk's allowed origins/domains after the first deploy, otherwise sign-in fails silently on production despite working locally

---

## Development Workflow

```bash
# Dev server
npm run dev

# Database
npx prisma migrate dev --name description_of_change
npx prisma migrate reset      # wipes all data
npx prisma studio             # visual DB browser
npx prisma generate

# Type-check before every commit
npx tsc --noEmit
```

---

## Phase History

### Phase 1 — Project Setup
Next.js 15, TypeScript, App Router, Tailwind, shadcn/ui, project structure.

### Phase 2 — Authentication
Clerk integration, sign-up/sign-in, middleware-level route protection.

### Phase 3 — Database & Onboarding
Neon + Prisma, full schema, profile page, handle management.

### Phase 4A — Codeforces Live Dashboard
Service layer, live API route, `/contest/codeforces` dashboard, charts, tables.

### Phase 4B — Codeforces Persistence
`lastSyncedAt`, sync service, sync API route, auto-sync + refresh button.

### Phase 5 — LeetCode Integration
GraphQL service layer, sync service, `/contest/leetcode` dashboard, orange theme.

### Phase 6 — Unified Dashboard
`/api/dashboard` aggregation, 7-section unified dashboard, insights engine.

### Phase 6.5 — Dashboard Polish
Name bug fix, empty states, Connected Platforms section, responsive pass.

### Phase 7 — Companies, Subjects & Interview Prep
Company/question/subject schema, seed data (20 companies, 80+ questions, 5 subjects, 33+ topics), progress tracking APIs, `/companies` and `/subjects` pages, global navbar, interview readiness stats.

### Phase 8 — Contest Calendar
Codeforces `contest.list` + LeetCode `topTwoContests` integration, month-grid calendar UI, in-memory caching, "Add to Google Calendar" link generation, standalone navbar entry.

### Phase 9 (partial) — XP System
Live XP calculation service across all synced/tracked data sources, displayed on Profile and Dashboard. Level tiers designed, not yet implemented. Badges not yet implemented.

### Landing Page Redesign
New hero copy, illustration, and color palette brought in line with the rest of the app; removed placeholder statistics in favor of real, seeded numbers (20+ companies, 106+ questions, 5 core subjects).

### Clerk Core 2 Migration Fix
Updated `afterSignOutUrl` usage to match Clerk's Core 2 API — moved from individual `<UserButton>` instances to a single `<ClerkProvider afterSignOutUrl="/">` declaration.

---

## Roadmap

| Feature | Status |
|---|---|
| Contest Calendar | ✅ Done (Phase 8) |
| XP System (calculation + display) | ✅ Done (Phase 9, partial) |
| XP Levels (tiers with visuals) | Planned next |
| Badges | Planned |
| AtCoder Integration | Planned |
| HackerRank Integration | Planned |
| Streak System | Planned |
| Leaderboard | Planned |

### Schema Ready, Not Yet Implemented
- `XP` (event-based logging — current implementation computes live instead)
- `Badge` + `UserBadge`

---

## Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| PrepForge Purple | `#8B5CF6` | Brand color, unified dashboard, landing page |
| Codeforces Green | `#a8ff78` | All Codeforces-related UI |
| LeetCode Orange | `#FFA116` | All LeetCode-related UI |
| Easy Teal | `#00C4B4` | LeetCode Easy difficulty |
| Medium Yellow | `#FFC01E` | LeetCode Medium difficulty |
| Hard Red | `#FF375F` | LeetCode Hard difficulty |
| Background | `#0a0a18` | App-wide background, including landing page |
| Card | `#12121f` | Card backgrounds |
| Muted | `#6b6b85` | Labels, secondary text |

### Design Principles

- **Platform identity** — each platform has its own accent color used consistently across its dashboard, buttons, charts, and indicators
- **Dark-first** — all UI, including the landing page, is designed for dark mode only
- **Loading states everywhere** — every data-fetching page has skeleton loaders
- **Error states everywhere** — every page handles failures gracefully with actionable error messages
- **No layout shift** — skeleton dimensions match the actual content dimensions

---

## Contributing

This is a personal placement preparation project. If you are building something similar, feel free to use this as a reference architecture.

---

## Author

**Aanya Sharma**
Third-year Computer Science student, BITS Pilani Goa Campus
