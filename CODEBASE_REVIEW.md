# Table Wars! — Comprehensive Codebase Review

**Review Date:** May 9, 2026  
**Application:** Table Wars! Competition Manager  
**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand, Framer Motion, Supabase  
**Scope:** Full source code analysis, architecture review, documentation audit  

---

## Fixes Applied in This Session

The following issues identified in the review have been fixed:

| # | Issue | Status | Files Changed |
|---|-------|--------|---------------|
| 1 | Supabase schema missing 13+ columns | ✅ Fixed | `SUPABASE_SCHEMA.sql` — added all missing columns + RLS policies |
| 2 | Stale closures in GlobalListeners (getState instead of hooks) | ✅ Fixed | `GlobalListeners.tsx` — replaced `getState()` with hook selectors |
| 3 | Duplicate toggleTimer in HostPanel | ✅ Fixed | `HostPanel.tsx` — removed local function, uses store method |
| 4 | Debug console.log in SetupView | ✅ Fixed | `SetupView.tsx` — removed 3 debug statements |
| 5 | Missing /results route | ✅ Fixed | Created `src/app/results/page.tsx` |
| 6 | Math.random() ID collision risk | ✅ Fixed | `RoundControls.tsx` — replaced with `crypto.randomUUID()` |
| 7 | Hardcoded round 4 in taste scoring | ✅ Fixed | `useGameStore.ts` + `RoundControls.tsx` — now uses `currentRound` |
| 8 | Incomplete Realtime subscription (4/20 fields) | ✅ Fixed | `useGameStore.ts` — now syncs all state fields |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture & Design](#2-architecture--design)
3. [Strengths](#3-strengths)
4. [Critical Issues](#4-critical-issues)
5. [Medium-Priority Issues](#5-medium-priority-issues)
6. [Low-Priority Issues](#6-low-priority-issues)
7. [Security Audit](#7-security-audit)
8. [Documentation Quality](#8-documentation-quality)
9. [Recommendations](#9-recommendations)
10. [Final Verdict](#10-final-verdict)

---

## 1. Executive Summary

Table Wars! is a sophisticated, competition-grade web application for managing a 5-round dinner table event at a boarding house. The codebase is **well-structured, professionally documented, and functionally complete** for its intended purpose. The application demonstrates strong React patterns, clean separation of concerns, and ambitious use of modern web APIs (Web Audio, Framer Motion, Supabase Realtime).

**Overall Codebase Health: ⭐⭐⭐⭐☆ (4/5 — Good)**

| Category | Rating | Notes |
|----------|--------|-------|
| Architecture | A- | Clean Zustand + Next.js pattern, minor issues |
| Type Safety | B | Mostly typed, some `any` and type assertions |
| Performance | B+ | Client-side heavy, no memoization optimizations |
| Security | C | Hardcoded credentials, no RLS, no auth |
| Documentation | A | Excellent design docs, detailed reports |
| Test Coverage | N/A | No tests found |
| Accessibility | D | No ARIA, no keyboard nav, color-only indicators |

---

## 2. Architecture & Design

### State Architecture: Zustand + Supabase (Hybrid)

```
┌──────────────────────────────────────────────────┐
│                   useGameStore                     │
│  ┌──────────────┐  ┌──────────────┐               │
│  │  Local State  │  │  Supabase     │               │
│  │  (Zustand)    │◄─┤  Persistence │               │
│  │  - currentView│  │  - game_state │               │
│  │  - teams      │  │  - teams      │               │
│  │  - timer      │  │               │               │
│  │  - quiz/duel  │  └──────────────┘               │
│  └──────┬───────┘        │                          │
│         │                │ (Realtime Subscriptions) │
│         └────────────────┘                          │
└──────────────────────────────────────────────────┘
```

**Strengths:**
- Centralized single source of truth via Zustand
- Optimistic updates with async Supabase fallback sync
- Realtime subscriptions for multi-tab/device sync
- All store methods are async-ready for persistence

### View Architecture

```
page.tsx (Router)
  ├── LandingScreen (pre-start gate)
  ├── SetupView (team configuration)
  ├── HostPanel (operator console)
  │   ├── QuizControls | PlacementControls | TasteTestControls | FinaleControls
  │   └── Standings Sidebar
  ├── LiveScoreboard (projector display)
  ├── TeamView (mobile buzz-in)
  └── ResultsView (final standings)
```

### Routing Strategy
- **Main page** (`/`): Single-page app with conditional rendering based on `currentView` state
- **Sub-pages** (`/host`, `/scoreboard`, `/team`, `/certificates`): Wrapper pages for dedicated displays
- **Missing pages**: `/admin` and `/results` directories exist but have no `page.tsx` files

### Data Flow
- All views read from the same Zustand store
- Supabase acts as a sync layer for persistence and multi-device state
- Realtime subscriptions (`postgres_changes`) automatically update state from DB

---

## 3. Strengths

### 3.1 Exceptional Documentation
- **6 standalone markdown/doc files** covering design philosophy, analysis, issues, mock testing, and UI overhaul plans
- **682-line design document** (`Table_Wars_Design_Intricate_Details.md`) with detailed rationale for color theory, animation physics, typography, and sound design
- The design doc's level of detail is exceptional—it documents why every CSS value, frequency, and spring constant was chosen

### 3.2 Professional-Grade Audio System
```typescript
// sounds.ts — Procedural audio via Web Audio API
// No audio files needed. All sounds generated from oscillators.
// Musical intervals used for emotional impact:
//   - Major triad (C5-E5-G5) for correct answers
//   - Descending sawtooth for wrong answers
//   - Arpeggio with octave leap for celebrations
```
- Zero-latency sound generation
- Musical theory applied to sound design (intervals, chord progressions)
- Proper gain envelope shaping with exponential decay

### 3.3 Sophisticated Animation System
- Framer Motion with spring physics provides professional transitions
- Staggered animations for list entries (50-80ms delays)
- Layout animations for rank changes (teams physically slide up/down)
- Proper cleanup in all `useEffect` hooks

### 3.4 Dual-Screen Architecture
- Inspired by professional presentation software (Presenter by WorshipTools)
- Host Panel (operator) + Scoreboard (audience) paradigm
- Confidence monitor in sidebar shows real-time preview of audience display
- Keyboard shortcuts for hands-free operation

### 3.5 Clean Component Organization
```
components/
├── ui/          # shadcn/ui components (13 files)
├── views/       # Full-page view components (6 files)
├── GlobalListeners.tsx  # Keyboard shortcuts + timer logic
└── RoundControls.tsx    # Round-specific control panels
```

---

## 4. Critical Issues

### 4.1 Supabase Schema Mismatch ⚠️

The `game_state` table schema (`SUPABASE_SCHEMA.sql`) is missing columns that the TypeScript store reads/writes:

**Missing columns in SQL schema but used in code:**
| Column Used in Code | Store Method | File |
|---------------------|------------|------|
| `quiz_index` | `nextQuestion`, `prevQuestion` | useGameStore.ts:239 |
| `quiz_revealed` | `revealContent`, `nextQuestion`, `prevQuestion` | useGameStore.ts:229 |
| `quiz_questions` | `setQuizQuestions` | useGameStore.ts:340 |
| `taste_index` | `nextTasteItem`, `prevTasteItem` | useGameStore.ts:267 |
| `taste_items` | `setTasteItems`, `addTasteItem`, etc. | useGameStore.ts:320 |
| `buzzed_team_id` | `buzzIn`, `clearBuzz` | useGameStore.ts:347 |
| `announcement_text` | `setAnnouncement` | useGameStore.ts:168 |
| `intro_team_id` | `setIntroTeam` | useGameStore.ts:183 |
| `is_suddenDeath` | `setSuddenDeath` | useGameStore.ts:199 |
| `duel_challenger` | `startDuel` | useGameStore.ts:285 |
| `duel_challenged` | `startDuel` | useGameStore.ts:285 |
| `duel_winner` | `endDuel` | useGameStore.ts:291 |
| `duel_active` | `startDuel`, `endDuel` | useGameStore.ts:285 |

**Additionally**, the `teams` table schema is missing columns used in the store:
| Column Used in Code | Store | File |
|---------------------|-------|------|
| `rank` | Team type | useGameStore.ts:13 |
| `rankTrend` | Team type | useGameStore.ts:14 |
| `memberCount` | Team type | useGameStore.ts:16 |
| `tasteItemScores` / `taste_item_scores` | `setTasteScore` | useGameStore.ts:311 |

**Impact**: Supabase sync will fail silently on these fields. `console.warn` catches errors but the app continues with stale local state, creating an inconsistent experience across devices.

### 4.2 Supabase Credentials in .env.local 🔑

```env
# .env.local (committed to VCS)
NEXT_PUBLIC_SUPABASE_URL=https://pqepmfauvgfhmpvdqesz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- The `.env*` pattern is listed in `.gitignore`, but the file still exists in the project directory
- If this is committed, the anon key is exposed (though it's designed to be public—the real risk is the DB being open without RLS)
- **No Row Level Security policies** are defined in the schema, meaning the anon key grants full access to all tables

### 4.3 React Anti-Patterns

#### 4.3.1 Component Defined Inside Render
```typescript
// certificates/page.tsx — Certificate defined inside the file scope
// but exported as a named export alongside default page export.
// This causes re-creation on every render.
export const Certificate = ({ ... }) => ( ... );
```

#### 4.3.2 Stale Closure in Keyboard Handler
```typescript
// GlobalListeners.tsx:23-24 — Extracting actions via getState()
// instead of hook selector, creating potential stale closure
const toggleTimer = useGameStore.getState().toggleTimer;
const startTimer = useGameStore.getState().startTimer;
```

#### 4.3.3 Direct Store Mutation
```typescript
// HostPanel.tsx:52 — Bypassing store method, directly setting state
useGameStore.setState((prev) => ({
  timer: { ...prev.timer, isActive: !prev.timer.isActive }
}));
```
The store has `toggleTimer()` at line 338, but `HostPanel` duplicates it.

### 4.4 Missing Pages / Incomplete Routes

| Route | Directory Exists | page.tsx | Issue |
|-------|-----------------|----------|-------|
| `/admin` | ✅ | ❌ | Empty directory |
| `/results` | ✅ | ❌ | Empty directory |

The `ResultsView` component exists at `src/components/views/ResultsView.tsx` but has no dedicated page route.

---

## 5. Medium-Priority Issues

### 5.1 Type Safety Gaps

**Random string as ID instead of UUID:**
```typescript
// RoundControls.tsx:45
const newQ = {
  id: Math.random().toString(),  // Collision-prone
  text: 'New Question',
  // ...
};

// TasteTestControls.tsx:314 (same pattern)
```

**Type assertion instead of validation:**
```typescript
// useGameStore.ts:124
if (teams) set({ teams: teams as Team[] });
// Should validate the shape at runtime
```

**Unused imports across files:**
- `RoundControls.tsx`: imports `motion` (line 14), `clsx` (line 11) - used but `motion` is unused
- `LiveScoreboard.tsx`: imports `Badge` (line 6) but doesn't use it
- Multiple page wrappers import `useEffect`, `useState` but don't use them

### 5.2 Supabase Realtime Subscription Coverage

```typescript
// useGameStore.ts:387-391 — Only updates 4 fields from game_state
useGameStore.setState({
  currentView: newState.current_view,
  projectorMode: newState.projector_mode,
  currentRound: newState.current_round,
  announcementText: newState.announcement_text,
});
// Missing: timer, quiz, tasteTest, duel, isSuddenDeath, introTeamId
```

When a game_state update comes from Supabase (e.g., from another tab), only 4 of ~20 state fields are synced back to the store.

### 5.3 No Error Handling Beyond Console Warnings

Every Supabase call uses this pattern:
```typescript
try {
  await supabase.from('game_state').update({ ... }).eq('id', 1);
} catch (error) {
  console.warn('Failed to persist ...:', error);
}
```

No user-facing error feedback, no retry logic, no offline queue.

### 5.4 Error/Empty States

- **No React Error Boundaries** anywhere in the app
- `RoundControls.tsx` renders `return <div>No questions loaded.</div>` as its only fallback
- `TasteTestControls.tsx` renders `return <div>No items loaded.</div>` as its only fallback
- No loading spinners or skeleton states for async operations
- No offline detection UI

### 5.5 Frame Shift on Score Entry

The scoreboard timer display uses `tabular-nums` but score numbers on team cards in the host sidebar do not. This can cause layout shift during competition when scores change frequently.

### 5.6 Round 4 Scoring Logic

```typescript
// useGameStore.ts:305 — Hardcoded round index
const newRoundScores = {
  ...team.roundScores,
  4: (team.roundScores[4] || 0) - oldScoreForThisItem + points
};
```
The taste test round index (4) is hardcoded rather than derived from `currentRound`. If rounds are reordered, this breaks.

---

## 6. Low-Priority Issues

### 6.1 Minor Code Quality

- `sounds.ts` line 6: Uses both `window.AudioContext` and `webkitAudioContext` — `webkitAudioContext` is deprecated in modern browsers
- `HostPanel.tsx` imports `clsx`, `motion`, `AnimatePresence` but only uses `motion` and `clsx`
- `page.tsx` line 16: `if (typeof window === 'undefined') return null;` — this guard prevents SSR but Next.js 16 handles this differently now
- `CertificatesPage` (certificates/page.tsx) directly imports `useGameStore` but the `Certificate` component uses `name.toUpperCase()` without null/undefined guard
- RoundChangeDropdown in `HostPanel.tsx` uses native `<select>` elements styled with Tailwind instead of a shadcn/ui `Select` component
- `SetupView.tsx` line 23: `console.log('SetupView rendered, teams length:', teams.length)` — debug log left in production code

### 6.2 Accessibility (A11y) Gaps

- **No ARIA labels** on interactive elements (buzz buttons, keyboard triggers)
- **Color-only state indicators** — team status, buzzed-in state, timer urgency all rely on color alone
- **No `role` attributes** on custom interactive elements
- **No `aria-live` regions** for dynamic content (score changes, timer updates)
- **No focus management** when views switch
- **No skip-to-content** navigation
- **No reduced-motion support** for animation-heavy UI
- The design doc acknowledges the `tabular-nums` importance but doesn't mention `prefers-reduced-motion` media query

### 6.3 No Test Coverage

- No unit tests (Jest/Vitest)
- No component tests (Testing Library)
- No E2E tests (Playwright/Cypress)
- The mock competition report describes manual testing only

### 6.4 Build Configuration

- `next.config.ts` is empty — no image optimization, no redirects, no headers configured
- `components.json` has `"rsc": true` but the entire app uses `'use client'` directives, making RSC configuration redundant
- `eslint.config.mjs` uses next/core-web-vitals and typescript configs but no accessibility rules (jsx-a11y)

---

## 7. Security Audit

| Issue | Severity | Details |
|-------|----------|---------|
| No RLS Policies | **HIGH** | Supabase anon key provides full table access |
| Hardcoded Secrets | **MEDIUM** | .env.local contains a real Supabase URL and anon key |
| No Auth | **LOW** | App doesn't need auth for its use case, but RLS still needed |
| No Input Sanitization | **LOW** | Team names and announcements rendered as JSX (React protects against XSS) |
| No CSP Headers | **LOW** | No Content-Security-Policy configured in next.config |
| `noopener`/`noreferrer` | **NONE** | No external links found |

---

## 8. Documentation Quality

The documentation suite is exceptional. Here's a summary:

| Document | Length | Quality | Purpose |
|----------|--------|---------|---------|
| `Table_Wars_Design_Intricate_Details.md` | 682 lines | ⭐⭐⭐⭐⭐ | Design rationale, micro-interactions |
| `Table_Wars_Comprehensive_Site_Description.docx` | 496 lines | ⭐⭐⭐⭐⭐ | Full feature documentation |
| `Table_Wars_Analysis_Report.md` | 222 lines | ⭐⭐⭐⭐ | Critical analysis w/ recommendations |
| `Table_Wars_Project_Documentation.md` | (not examined) | ⭐⭐⭐⭐ | Project overview |
| `ISSUE_REPORT.md` | 23 lines | ⭐⭐⭐⭐ | Linting + anti-pattern issues |
| `FUNCTIONAL_ASSESSMENT.md` | 24 lines | ⭐⭐⭐⭐ | Functional verification |
| `MOCK_COMPETITION_REPORT.md` | 26 lines | ⭐⭐⭐⭐ | Mock test results |
| `UI_UX_OVERHAUL_PLAN.md` | 51 lines | ⭐⭐⭐⭐ | UX improvement roadmap |

**Gaps:**
- No onboarding guide for new developers
- No API documentation for the Zustand store
- No deployment guide
- No setup instructions beyond `npm install && npm run dev`
- The `CLAUDE.md` and `AGENTS.md` files are very thin (1-5 lines)

---

## 9. Recommendations

### Immediate (Before Production Use)

1. **Fix Supabase Schema Mismatch**
   - Add all missing columns to `SUPABASE_SCHEMA.sql`
   - Run migration on the Supabase database
   - Add RLS policies for all tables

2. **Add Error Boundaries**
   - Wrap the main app in at least one error boundary
   - Add user-facing error messages for Supabase failures
   - Add offline detection and graceful degradation

3. **Remove Debug Statements**
   - Remove `console.log('SetupView rendered...')` from `SetupView.tsx`
   - Remove `console.warn` — replace with user-facing feedback

### Short-Term (Next 2 Weeks)

4. **Add RLS Policies**
   ```sql
   -- At minimum:
   ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "anon_read" ON game_state FOR SELECT USING (true);
   CREATE POLICY "anon_write" ON game_state FOR INSERT WITH CHECK (true);
   ```

5. **Complete Missing Routes**
   - Add `page.tsx` to `/results` directory (wrap `ResultsView`)
   - Either remove or populate `/admin` directory

6. **Fix Stale Closure in GlobalListeners**
   - Use hook selectors consistently instead of `getState()`
   - Remove duplicate `toggleTimer` logic in `HostPanel.tsx`

7. **Add Accessibility Basics**
   - Add `aria-label` to buzz buttons, keyboard shortcut hints
   - Add `role="timer"` to timer displays
   - Add `aria-live="polite"` to score displays
   - Add `prefers-reduced-motion` support via Framer Motion's `useReducedMotion`

### Medium-Term (Post-Event)

8. **Add Test Coverage**
   - Unit tests for `useGameStore` (Zustand stores are easy to test)
   - Component tests for `RoundControls`, `LiveScoreboard`
   - Integration test for the full competition flow

9. **Add Undo/Redo Support**
   - Use Zustand's `temporal` middleware or custom history tracking
   - Especially critical for score changes during live events

10. **Performance Optimization**
    - Add `React.memo` to scoreboard leaderboard rows
    - Add `useMemo` for sorted teams array
    - Consider virtualization for large team lists

11. **State Persistence Enhancement**
    - Add localStorage backup for crash recovery
    - Add IndexedDB for larger state (quiz questions)
    - Add restore flow: "We detected you had a competition in progress..."

---

## 10. Final Verdict

**Table Wars! is a production-quality application for its intended use case.** The codebase shows strong architectural thinking, excellent documentation, and genuine craftsmanship in areas like animation, audio, and UX design.

The critical issues are manageable and focused primarily on:
1. **Database schema alignment** — the Supabase schema needs updating to match the code
2. **Security hardening** — adding RLS policies
3. **Error resilience** — adding error boundaries and user feedback

The application is ready for a live event *with the caveat* that the Supabase integration is partially broken due to schema mismatches. If Supabase sync is not critical to the event flow (i.e., single-device operation), the app will function correctly using only Zustand's in-memory state. For multi-device operation, the schema must be updated first.

**Score Summary:**
- Code Quality: B+ (clean patterns, some anti-patterns)
- Architecture: A- (well-structured, minor coupling issues)
- Documentation: A (exceptionally detailed)
- Security: C (no RLS, hardcoded credentials)
- Testing: F (no tests)
- Accessibility: D (no a11y features)
- Technical Design: A- (professional-grade features)