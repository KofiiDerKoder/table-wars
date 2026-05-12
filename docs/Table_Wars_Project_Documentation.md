# Table Wars Competition — Full Project Documentation

> **Boarding House Dinner Table Competition Manager**
> A Next.js 16 web application for running a 5-round inter-table competition with real-time scoring, presentation mode, buzzer system, and animated results.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Deliverables](#2-project-deliverables)
3. [Development History & Steps](#3-development-history--steps)
4. [Application Architecture](#4-application-architecture)
5. [Five Views — Detailed](#5-five-views--detailed)
6. [The Five Competition Rounds](#6-the-five-competition-rounds)
7. [State Management](#7-state-management)
8. [Sound System](#8-sound-system)
9. [Presentation Mode](#9-presentation-mode)
10. [Content & Data](#10-content--data)
11. [Customization Features](#11-customization-features)
12. [UI & Animation System](#12-ui--animation-system)
13. [Technical Stack](#13-technical-stack)
14. [File Structure](#14-file-structure)
15. [Component Reference](#15-component-reference)
16. [Known Bugs & Fixes](#16-known-bugs--fixes)
17. [Configuration Files](#17-configuration-files)
18. [Future Enhancements](#18-future-enhancements)

---

## 1. Project Overview

**Table Wars** is a boarding house dinner table competition where teams (dinner tables) compete across 5 rounds of challenges. The winning table earns the coveted prize of **first position at mealtimes for a week**. The system includes a web application to manage, host, and present the competition with full real-time scoring, animated leaderboards, buzzer mechanics, timer systems, and presentation software features inspired by tools like Presenter by WorshipTools.

### Key Goals
- Create a fun, competitive atmosphere between dining tables at a boarding house
- Provide a digital tool for the game master/host to run the competition smoothly
- Offer a projector-ready live scoreboard for audience engagement
- Allow team captains to interact via mobile devices (buzz in, see scores)
- Support customizable content (taste test items, quiz questions)
- Include presentation mode features (black screen, logo, announcements, keyboard shortcuts)

---

## 2. Project Deliverables

| # | Deliverable | File | Format | Description |
|---|-------------|------|--------|-------------|
| 1 | Week 4 Program Outline | `Week4_Table_Wars_Program_Outline.pdf` | PDF | 12-page detailed program outline covering all 5 rounds, rules, scoring, timing, materials, and logistics |
| 2 | Table Wars Web App | Next.js project at `/home/z/my-project/` | Web App | Full interactive competition manager with 5 views |
| 3 | Comprehensive Site Description | `Table_Wars_Comprehensive_Site_Description.docx` | DOCX | 12-page document with 10 chapters covering architecture, views, rounds, presentation mode, sound system, data, and user flows |
| 4 | Award Certificates (Champion) | `Certificate_Champion.png` | PNG | Printable champion certificate |
| 5 | Award Certificates (Runner-Up) | `Certificate_Runner_Up.png` | PNG | Printable runner-up certificate |
| 6 | Award Certificates (Sportsmanship) | `Certificate_Sportsmanship.png` | PNG | Printable sportsmanship award certificate |
| 7 | Honorary Certificates (Active Involvement) | `Certificate_Active_Involvement.png` | PNG | Printable honorary certificate for active involvement |
| 8 | All Certificates Bundle | `Table_Wars_Certificates.docx` | DOCX | All certificate templates in a single Word document |
| 9 | This Documentation | `Table_Wars_Project_Documentation.md` | Markdown | Comprehensive project documentation (this file) |

All files are stored in `/home/z/my-project/download/`.

---

## 3. Development History & Steps

### Phase 1: Program Outline Creation
- User requested a program outline for Week 4 activities at a boarding house
- Identified the concept: a dinner table competition where tables compete and the winner gets first position in the food line
- Designed a 5-round competition format:
  1. Table Trivia — buzzer-based quiz
  2. Food Relay — physical relay race
  3. Table Building — creative construction challenge
  4. Blind Taste Test — identify mystery foods
  5. Grand Finale — double-point quiz with duel mechanic
- Generated a comprehensive 12-page PDF program outline

### Phase 2: Web Application Development
- User requested a web app/software to support running the competition
- Chose Next.js 16 with React 19, Tailwind CSS 4, shadcn/ui components
- Designed a 5-view architecture: Setup, Host Panel, Live Scoreboard, Team View, Results
- Built the complete application with:
  - Zustand state management for all game state
  - Framer Motion animations throughout
  - Web Audio API for buzzer, correct/wrong, timer, and celebration sounds
  - Timer system with presets (30s, 60s, 90s, 120s)
  - Buzzer system with lockout (first team to buzz wins the chance)
  - Score tracking per round with bonus points
  - Progressive results reveal with confetti
  - Sportsmanship voting system

### Phase 3: Enhancement — Blind Taste Test Customization
- User requested that the game master can customize the items used in the blind taste test (Round 4)
- Implemented full CRUD for taste test items:
  - Add, edit, delete, reorder items
  - Reset to defaults button
  - Available both in Setup view and during the game via a dialog in Host Panel
  - Items stored in Zustand store with `tasteItemsCustomized` flag
- Fixed a critical taste score accumulation bug where changing a score would add instead of replace

### Phase 4: Enhancement — Presentation Mode
- User requested incorporation of presentation software elements, inspired by Presenter by WorshipTools
- Implemented:
  - **Projector modes**: Scoreboard (normal), Black Screen, Logo Screen, Announcement
  - **Confidence Monitor**: Sidebar preview showing what's on the projector
  - **Round splash screens**: Dramatic fade-in/scale-up animation when a new round starts (3-second duration)
  - **Fullscreen toggle**: Fullscreen API for projector display
  - **Keyboard shortcuts**: Space (reveal), Right Arrow (next), T (timer), B (black), L (logo), 1-8 (buzz team), S (scoreboard), H (host), Esc (clear buzz)
  - **Announcement overlay**: Custom text banner at top of scoreboard
  - Used refs pattern for keyboard shortcuts to avoid React Compiler stale closure issues

### Phase 5: Site Description Document
- User requested a comprehensive description of the site
- Generated a DOCX document with:
  - Cover page with "R1" style recipe layout
  - Table of contents with 40 heading bookmarks
  - 10 detailed chapters covering all aspects
  - Deep Cyan tech color palette
  - Headers and footers

### Phase 6: Question Bank Management
- User requested the ability for game masters to change questions or use question banks
- The system already loads different question sets per round (round1Questions, round5Questions)
- Host Panel includes quick question jump buttons for navigating the question bank
- The architecture supports adding more question banks

### Phase 7: Certificate Creation
- User requested certificates for awards and honorary certificates for active involvement
- Created 4 types of certificates as PNG images:
  - Champion (gold/amber theme)
  - Runner-Up (silver/slate theme)
  - Sportsmanship Award (pink/rose theme)
  - Active Involvement (purple theme)
- Also bundled all certificates in a DOCX file

---

## 4. Application Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Next.js 16 App                        │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Setup    │  │   Host   │  │  Score   │  │  Team   │ │
│  │  View    │──│  Panel   │──│  board   │  │  View   │ │
│  │          │  │          │  │  View    │  │         │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│        │              │              │             │      │
│        └──────────────┴──────────────┴─────────────┘      │
│                          │                                 │
│                    ┌─────┴─────┐                           │
│                    │  Zustand  │                           │
│                    │   Store   │                           │
│                    └───────────┘                           │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │  Timer   │  │   Sound  │  │ Quiz Data│                │
│  │ System   │  │  System  │  │  & Items │                │
│  └──────────┘  └──────────┘  └──────────┘                │
│                                                           │
│  ┌──────────────────────────────────────────┐             │
│  │          Results View (Final)             │             │
│  │  Champion reveal · Awards · Voting        │             │
│  └──────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────┘
```

### Data Flow

```
Setup View ──sets teams──▶ Zustand Store ◀──reads── All Views
                                    │
Host Panel ──updates scores───────▶│
                                    │
Scoreboard ──reads state──────────▶│
                                    │
Team View ──buzzes in─────────────▶│
                                    │
Results ──reads final rankings────▶│
```

### Key Design Decisions

1. **Client-side only**: The app runs entirely in the browser. No server-side state persistence needed since it's used live during a single event.
2. **Zustand over Context**: Chosen for simplicity, performance (selector-based re-renders), and ease of debugging.
3. **Single-page architecture**: All 5 views share the same Zustand store, enabling instant state synchronization.
4. **Web Audio API**: Sound effects generated procedurally (oscillator-based) to avoid loading external audio files.
5. **Framer Motion**: All animations use Framer Motion for consistent, spring-based physics animations.
6. **shadcn/ui**: Pre-built accessible components customized with Tailwind for a polished look.

---

## 5. Five Views — Detailed

### 5.1 Setup View (`SetupView.tsx`)

The landing page where the host configures the competition before starting.

**Features:**
- Animated hero banner with "TABLE WARS" title, floating geometric shapes, and competition tagline
- Team count selector (3–8 teams) with increment/decrement buttons
- Per-team configuration:
  - Team name (text input)
  - Team color (8 preset colors: Red, Amber, Emerald, Blue, Purple, Pink, Cyan, Orange)
  - Number of members (1–20)
- **Customize Taste Test Items** section (collapsible):
  - Shows all taste test items with inline editing
  - Reorder items (move up/down)
  - Delete items
  - Add new items (name, hint, category)
  - Reset to defaults
  - "Customized" badge when items have been modified
- **Competition Rules & Round Overview** section (collapsible):
  - Lists all 5 rounds with names and descriptions
  - Prize and sportsmanship award info
- **Start Competition** button (disabled until all teams have names)

**Visual Design:**
- Purple-to-amber gradient background
- Purple gradient hero with floating geometric shapes
- White card with purple border
- Color-coded team cards

### 5.2 Host Panel (`HostPanel.tsx`)

The game master's control center. This is the most complex view.

**Layout:**
- Top bar: Title, round indicator, timer controls, scoreboard button
- Progress bar: Round 1–5 progress with color-coded indicators
- Left sidebar (w-64):
  - Team standings (sorted by score, animated layout)
  - Confidence monitor (mini preview of projector output)
  - Projector controls (Scoreboard, Black, Logo, Announcement)
  - Announcement text input (when in announcement mode)
  - Keyboard shortcuts panel (collapsible)
- Main content area: Round-specific controls

**Round-Specific Content:**

- **Round 1 (Table Trivia):**
  - Question card with reveal/next buttons
  - Quick question jump grid (Q1–Q20)
  - Buzz-in control panel: Click team to buzz, then mark Correct (+5) / Wrong / Steal (+3)
  - Question navigation with progress tracking

- **Round 2 (Food Relay):**
  - Placement dropdowns for each team (1st–8th)
  - Penalty tracker per team (-3 per dropped item, adjustable)
  - Lock Round 2 Scores button

- **Round 3 (Table Building):**
  - Placement dropdowns for each team
  - Creativity bonus toggle (+5 per team)
  - Lock Round 3 Scores button

- **Round 4 (Blind Taste Test):**
  - Current taste item indicator
  - Reveal hint / Next item navigation
  - Per-team scoring: Correct (+4), Partial (+2), Wrong (+0)
  - "Edit Items" dialog for in-game customization
  - Lock Round 4 Scores button

- **Round 5 (Grand Finale):**
  - Double-point quiz questions (+10 per correct)
  - Duel mode: Select challenger and challenged teams
  - Duel winner awarding
  - Lock Round 5 Scores button (triggers Results view)

### 5.3 Scoreboard View (`ScoreboardView.tsx`)

The audience-facing display, designed for a projector or large screen.

**Features:**
- Dark theme (slate-900/800/900 gradient) for projection visibility
- Animated "TABLE WARS" header with pulsing opacity
- Live content display:
  - Quiz questions when revealed (Round 1 & 5)
  - Taste test hint cards when revealed (Round 4)
- Timer display (color-coded: normal, urgent ≤10s, critical ≤5s)
- Buzzed-in team indicator
- Animated leaderboard with:
  - Score bars (width proportional to max score)
  - Crown emoji for first place
  - Round score badges per team
  - Spring-based layout animations for rank changes
  - First place gets golden ring and pulsing scale animation
- **Round splash screens**: When a new round starts, a dramatic fade-in/scale-up overlay shows "Round X: [Name]" for 3 seconds
- **Projector modes**:
  - Scoreboard (normal): Full leaderboard with live data
  - Black Screen: Pure black with only fullscreen button
  - Logo Screen: Dramatic "TABLE WARS" title on dark gradient with spring animation
  - Announcement: Amber gradient banner at top with custom text
- **Fullscreen toggle**: Uses Fullscreen API
- **Celebration particles**: 30 colored dots rain down when a round completes
- **Bottom bar**: Round name, projector mode buttons, fullscreen, back to host

### 5.4 Team View (`TeamView.tsx`)

The mobile-optimized view for team captains.

**Features:**
- Team picker screen (if no team selected):
  - Grid of team cards with color, name, member count
  - Back to host button
- Team dashboard (once team selected):
  - Colored gradient header with team name, rank, member count
  - Total score card (large animated number)
  - Round breakdown (R1–R5 with current round highlighted as "LIVE")
  - Live status card (current round, question/taste item status)
  - **Buzz-in button** (for quiz rounds):
    - Large, team-colored button with "BUZZ IN!" text
    - Pulsing ring animation when available
    - "BUZZED!" state when the team has buzzed in
    - Calls `playBuzzerSound()` on press
  - Current question display (with options, for quiz rounds)
  - Taste test answer area (hint and category, for Round 4)
  - Navigation: Scoreboard button, Host Panel button

### 5.5 Results View (`ResultsView.tsx`)

The final celebration screen shown after all rounds are complete.

**Features:**
- Dark purple gradient background
- **Confetti effect**: 100 colorful falling pieces for 8 seconds
- **Champion reveal**: Spring-animated trophy icon, "CHAMPION" heading, team name in team-colored card with glow
- Prize description: "First position at mealtimes for a week!"
- **Final standings**: Progressive reveal (one team every 800ms) with spring animations
  - Gold/silver/bronze backgrounds for top 3
  - Crown, silver medal, bronze medal emojis
  - Round score badges
  - Animated score numbers
- **Awards section** (3 cards):
  - Most Creative (Star icon, amber) — from Round 3 creativity bonus
  - Sportsmanship (Heart icon, pink) — from peer voting
  - MVP (Swords icon, emerald) — highest single-round score
- **Sportsmanship voting**: Teams that haven't voted can select another team
- **Share Results**: Copies text summary to clipboard
- **Reset Competition**: Returns to initial state

---

## 6. The Five Competition Rounds

### Round 1: Table Trivia
- **Type**: Buzzer-based quiz
- **Questions**: 20 pre-loaded trivia questions across categories (Science, Geography, Art, Math, History, Food, Literature, Sports, Pop Culture, Nature, Technology)
- **Scoring**:
  - Correct answer: +5 points
  - Steal (another team answers after wrong): +3 points
  - Wrong answer: 0 points
- **Mechanics**:
  - Host reveals question
  - Teams buzz in (first team locks out others)
  - Host marks correct/wrong
  - If wrong, other teams can "steal"

### Round 2: Food Relay
- **Type**: Physical relay race
- **Scoring**:
  - 1st place: 25 pts, 2nd: 20, 3rd: 15, 4th: 10, 5th: 5, 6th: 3, 7th: 2, 8th: 1
  - Penalty: -3 points per dropped item
  - Final score = max(0, placement points - penalties)
- **Mechanics**:
  - Host assigns placement positions
  - Host tracks penalties per team
  - Round locked when all placements set

### Round 3: Table Building
- **Type**: Creative construction challenge
- **Scoring**:
  - Same placement scale as Round 2
  - Creativity bonus: +5 points (toggle per team)
- **Mechanics**:
  - Host assigns placements
  - Host awards creativity bonuses
  - Round locked when all placements set

### Round 4: Blind Taste Test
- **Type**: Sensory identification challenge
- **Items**: 10 default items (Soy Sauce, Honey, Lemon Juice, Olive Oil, Peanut Butter, Coconut Milk, Maple Syrup, Balsamic Vinegar, Marmite, Cream Cheese) — all customizable
- **Scoring**:
  - Correct identification: +4 points
  - Partial identification: +2 points
  - Wrong: +0 points
- **Mechanics**:
  - Host reveals hint for current item
  - Each team is scored per item
  - Items are customizable before and during the game
  - Score tracking prevents double-counting (subtracts old score before adding new)

### Round 5: Grand Finale
- **Type**: Double-point quiz with duel mechanic
- **Questions**: 15 harder trivia questions
- **Scoring**:
  - Correct answer: +10 points (double!)
  - Duel winner: +10 points
- **Duel Mechanic**:
  - Host selects challenger and challenged teams
  - Duel winner gets bonus points
  - Adds drama and head-to-head excitement

---

## 7. State Management

### Store: `useGameStore` (Zustand)

**File**: `src/lib/store.ts`

#### Interfaces

```typescript
interface Team {
  id: string
  name: string
  color: string
  members: number
  scores: RoundScore[]
  totalScore: number
}

interface RoundScore {
  round: number
  points: number
  details: string
  bonusPoints: number
}

interface QuizQuestion {
  id: string
  question: string
  answer: string
  category: string
  options?: string[]
}

interface TasteTestItem {
  id: string
  item: string
  hint: string
  category: string
}

type ViewType = 'setup' | 'host' | 'scoreboard' | 'team' | 'results'
type ProjectorMode = 'scoreboard' | 'black' | 'logo' | 'announcement'
```

#### State Shape

| Category | Fields | Description |
|----------|--------|-------------|
| Core | `teams`, `currentView`, `currentRound`, `roundInProgress` | Core game state |
| Timer | `timerSeconds`, `timerRunning`, `timerDuration` | Countdown timer |
| Quiz | `currentQuestionIndex`, `questions`, `buzzedInTeam`, `questionRevealed` | Question/quiz state |
| Duel | `duelChallenger`, `duelChallenged` | Grand Finale duel |
| Taste Test | `currentTasteItem`, `tasteItemRevealed`, `tasteTestItems`, `tasteScores`, `tasteItemScores`, `tasteItemsCustomized` | Blind taste test |
| Sportsmanship | `sportsmanshipVotes` | Peer voting |
| Selection | `selectedTeamId` | Team View team selection |
| Round Locks | `round1Locked`–`round5Locked` | Per-round lock flags |
| Round 2 | `round2Placements`, `round2Penalties` | Food Relay data |
| Round 3 | `round3Placements`, `round3Creativity` | Table Building data |
| Round 5 | `round5Scores` | Grand Finale scores |
| Presentation | `projectorMode`, `announcementText`, `scoreboardSplash` | Presentation mode |

#### Actions (56 total)

| Category | Actions |
|----------|---------|
| Navigation | `setView` |
| Team Management | `addTeam`, `removeTeam`, `updateTeam`, `setTeams` |
| Competition Flow | `startCompetition`, `endRound`, `startNextRound`, `resetCompetition` |
| Scoring | `addScore`, `computeRankings` |
| Buzzer | `setBuzzedIn`, `clearBuzz` |
| Questions | `revealQuestion`, `nextQuestion`, `setCurrentQuestionIndex` |
| Timer | `startTimer`, `stopTimer`, `resetTimer`, `tickTimer`, `setTimerDuration` |
| Selection | `setSelectedTeamId` |
| Sportsmanship | `voteSportsmanship` |
| Round 2 | `setRound2Placement`, `setRound2Penalty`, `lockRound2` |
| Round 3 | `setRound3Placement`, `setRound3Creativity`, `lockRound3` |
| Taste Test | `setTasteItemRevealed`, `setCurrentTasteItem`, `setTasteScore`, `lockRound4` |
| Taste Customization | `setTasteTestItems`, `addTasteTestItem`, `removeTasteTestItem`, `updateTasteTestItem`, `setTasteItemsCustomized`, `reorderTasteTestItems` |
| Duel | `setDuelChallenger`, `setDuelChallenged`, `setRound5Score`, `lockRound5` |
| Round 1 | `lockRound1` |
| Presentation | `setProjectorMode`, `setAnnouncementText`, `setScoreboardSplash` |

#### Team Colors

```typescript
const TEAM_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
]
```

#### Placement Points Scale

| Placement | Points |
|-----------|--------|
| 1st | 25 |
| 2nd | 20 |
| 3rd | 15 |
| 4th | 10 |
| 5th | 5 |
| 6th | 3 |
| 7th | 2 |
| 8th | 1 |

---

## 8. Sound System

**File**: `src/lib/sounds.ts`

All sounds are generated procedurally using the Web Audio API (oscillator-based). No external audio files are needed.

| Sound | Function | Oscillator Type | Frequencies | Duration | Purpose |
|-------|----------|----------------|-------------|----------|---------|
| Buzzer | `playBuzzerSound()` | Square | 440→554→659 Hz | 0.4s | Team buzz-in feedback |
| Correct | `playCorrectSound()` | Sine | 523→659→784 Hz | 0.5s | Correct answer confirmation |
| Wrong | `playWrongSound()` | Sawtooth | 300→200 Hz | 0.3s | Wrong answer feedback |
| Timer Alert | `playTimerAlertSound()` | Sine | 880 Hz | 0.15s | Timer countdown warning (≤5s) |
| Celebration | `playCelebrationSound()` | Sine | 523→659→784→1047 Hz | 4×0.4s | Champion/results reveal |
| Tick | `playTickSound()` | Sine | 600 Hz | 0.05s | Timer tick (≤10s) |

**Helper function**: `formatTime(seconds)` — converts seconds to `MM:SS` format.

**Audio Context**: Singleton pattern with lazy initialization and webkit fallback.

---

## 9. Presentation Mode

Inspired by Presenter by WorshipTools, the presentation mode transforms the Scoreboard View into a professional presentation output.

### Projector Modes

| Mode | Visual | Use Case |
|------|--------|----------|
| Scoreboard | Full leaderboard with live data | During competition |
| Black | Pure black screen | Between rounds, attention focus |
| Logo | "TABLE WARS" title on dark gradient with spring animation | Pre-event, transitions |
| Announcement | Amber gradient banner at top with custom text | Important messages |

### Confidence Monitor

Located in the Host Panel sidebar, it shows a mini preview of what the projector is displaying:
- Current round name and number
- Current question/item text (or "Hidden" indicator)
- Timer status (running/paused with seconds)
- Mode-specific previews (black, logo, announcement)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Reveal question/taste item |
| → (Right Arrow) | Next question/taste item |
| T | Toggle timer start/pause |
| B | Toggle black screen |
| L | Switch to logo screen |
| 1–8 | Buzz in team by number |
| S | Switch to Scoreboard view |
| H | Switch to Host view |
| Escape | Clear buzz |

**Implementation note**: Keyboard shortcuts use a `useRef` pattern to store current state values, avoiding stale closures that would otherwise occur with React Compiler's automatic optimization.

### Round Splash Screens

When a new round begins (detected by `currentRound` change), the Scoreboard View displays a dramatic overlay:
- Full-screen dark gradient background
- "Round X: [Name]" text in large font
- Spring animation: scale from 0.8→1, fade in
- Auto-clears after 3 seconds
- First-place team gets pulsing crown animation

---

## 10. Content & Data

**File**: `src/lib/quiz-data.ts`

### Round 1 Questions (20 questions)

Categories: Science (5), Geography (5), Art (1), Math (1), History (1), Food (2), Literature (1), Sports (1), Pop Culture (1), Nature (1), Technology (1)

Sample questions:
- "What is the chemical symbol for gold?" → Au
- "Which planet is known as the Red Planet?" → Mars
- "What is the capital of Australia?" → Canberra
- "Who painted the Mona Lisa?" → Leonardo da Vinci
- "Which country invented pizza?" → Italy

### Round 5 Questions (15 questions)

Harder trivia across categories: Nature, Technology, Science, Music, Geography, History, Art, Literature

Sample questions:
- "What is the only mammal capable of sustained flight?" → Bat
- "In what year was the first iPhone released?" → 2007
- "What is the tallest mountain in the solar system?" → Olympus Mons

### Taste Test Items (10 defaults)

| # | Item | Hint | Category |
|---|------|------|----------|
| 1 | Soy Sauce | A dark, salty liquid used in Asian cuisine | Condiment |
| 2 | Honey | A golden sweet substance made by bees | Sweetener |
| 3 | Lemon Juice | A tangy citrus liquid | Citrus |
| 4 | Olive Oil | A smooth, rich liquid from pressed olives | Cooking Oil |
| 5 | Peanut Butter | A thick, nutty spread | Spread |
| 6 | Coconut Milk | A creamy white liquid from a tropical fruit | Dairy Alternative |
| 7 | Maple Syrup | A sweet amber liquid from tree sap | Sweetener |
| 8 | Balsamic Vinegar | A dark, sweet-and-sour Italian condiment | Condiment |
| 9 | Marmite | A sticky, dark spread with a strong savory flavor | Spread |
| 10 | Cream Cheese | A soft, mild, white spreadable cheese | Dairy |

### Round Metadata

```typescript
const roundNames: Record<number, string> = {
  1: 'Table Trivia',
  2: 'Food Relay',
  3: 'Table Building',
  4: 'Blind Taste Test',
  5: 'Grand Finale',
}

const roundDescriptions: Record<number, string> = {
  1: '20 trivia questions — buzz in to answer! +5 for correct, +3 for a steal.',
  2: 'Relay race — first place gets 25 points, scaling down. -3 per dropped item.',
  3: 'Build the tallest table! Creativity bonus of +5 points available.',
  4: 'Can you identify the mystery food? +4 correct, +2 partial.',
  5: 'Double-point finale! +10 per correct answer. Duel mechanic in play!',
}
```

---

## 11. Customization Features

### Taste Test Item Customization

Available in two places:
1. **Setup View**: Collapsible section before competition starts
2. **Host Panel**: "Edit Items" dialog during Round 4

**Operations:**
- Add new item (name, hint, category)
- Edit existing item (inline editing)
- Delete item
- Reorder items (move up/down)
- Reset to defaults
- "Customized" badge shown when items have been modified

**Implementation:**
- Store tracks `tasteItemsCustomized` boolean
- If store items are empty, defaults are loaded dynamically from `quiz-data.ts`
- All CRUD operations mark items as customized
- The `activeTasteItems` pattern (store items or fallback to defaults) is used consistently across HostPanel, ScoreboardView, and TeamView

### Question Bank Management

- Round 1 and Round 5 have separate question banks (20 and 15 questions respectively)
- Host can jump to any question using the quick-jump grid
- The architecture supports adding more question banks or swapping them entirely
- Questions include category, answer, and optional multiple-choice options

---

## 12. UI & Animation System

### CSS Animations (globals.css)

| Animation | CSS Class | Description |
|-----------|-----------|-------------|
| Score Pulse | `.score-pulse` | Scale 1→1.15→1 over 0.4s |
| Timer Pulse | `.timer-pulse` | Opacity 1→0.5→1 over 1s (infinite) |
| Gradient Shift | `.animate-gradient` | Background position animation over 6s (infinite) |
| Float | `.animate-float` | translateY 0→-10px→0 over 3s (infinite) |

### CSS Utility Classes

| Class | Purpose |
|-------|---------|
| `.glow-purple` | Purple glow box shadow |
| `.glow-amber` | Amber glow box shadow |
| `.custom-scrollbar` | Thin, styled scrollbar |

### Framer Motion Animations

| Component | Animation Type | Details |
|-----------|---------------|---------|
| View transitions | Fade | 0.3s opacity transition between views |
| Team cards (setup) | Slide up | Staggered by index × 0.05s |
| Hero title | Gentle pulse | Scale 1→1.02→1 over 3s (infinite) |
| Leaderboard entries | Spring layout | Stiffness 200, damping 25, staggered |
| Score numbers | Spring scale | 1.5→1 with color transition from amber |
| First place crown | Pulse | Scale 1→1.05→1 over 2s (infinite) |
| Score bars | Width animation | 0→calculated % over 1s |
| Question reveal | Scale + fade | 0.9→1 over 0.4s |
| Option cards | Slide from sides | Alternating left/right with stagger |
| Buzz button | Pulse ring | Scale 1→1.1→1 with opacity fade |
| Champion reveal | Spring | Stiffness 200, damping 15 |
| Round splash | Spring + fade | Scale 0.8→1, opacity 0→1 |
| Celebration particles | Gravity fall | y: 0→screenHeight, x drift, rotation 720° |
| Confetti pieces | Physics simulation | Gravity, drift, rotation (100 pieces) |
| Results reveal | Progressive | One team every 800ms |

### Dark/Light Theme

The app supports both themes via CSS custom properties defined in `globals.css`:
- Light mode: Clean white backgrounds with purple/amber accents
- Dark mode: Slate-900 backgrounds for projector/scoreboard use
- Scoreboard is always dark-themed regardless of system preference

---

## 13. Technical Stack

### Core Framework
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.1.1 | React framework |
| React | 19.0.0 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |

### Key Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| Zustand | 5.0.6 | State management |
| Framer Motion | 12.23.2 | Animations |
| Radix UI | Various | Accessible UI primitives |
| shadcn/ui | Latest | Pre-built UI components |
| Lucide React | 0.525.0 | Icon library |
| Web Audio API | Native | Sound effects |

### Build & Dev Tools
| Tool | Purpose |
|------|---------|
| Bun | Package manager & runtime |
| ESLint | Linting |
| Prisma | ORM (available but not actively used for this app) |

### Fonts
| Font | Variable | Usage |
|------|----------|-------|
| Geist Sans | `--font-geist-sans` | Primary body font |
| Geist Mono | `--font-geist-mono` | Monospace (timer, codes) |

---

## 14. File Structure

```
/home/z/my-project/
├── package.json                    # Dependencies and scripts
├── next.config.ts                  # Next.js config (standalone output)
├── tailwind.config.ts              # Tailwind CSS config
├── postcss.config.mjs              # PostCSS config
├── tsconfig.json                   # TypeScript config
├── eslint.config.mjs               # ESLint config
├── components.json                 # shadcn/ui config
├── Caddyfile                       # Caddy server config
├── prisma/
│   └── schema.prisma               # Prisma schema (User/Post models)
├── db/
│   └── custom.db                   # SQLite database
├── public/
│   ├── robots.txt
│   └── logo.svg
├── examples/
│   └── websocket/
│       ├── server.ts               # WebSocket server example
│       └── frontend.tsx            # WebSocket frontend example
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (Geist fonts, metadata)
│   │   ├── page.tsx                # Main page (view router)
│   │   ├── globals.css             # Global styles + theme variables
│   │   └── api/
│   │       └── route.ts            # API route handler
│   ├── lib/
│   │   ├── store.ts                # Zustand store (all game state + actions)
│   │   ├── quiz-data.ts            # Question banks, taste test items, round metadata
│   │   ├── sounds.ts               # Web Audio API sound effects
│   │   ├── utils.ts                # Utility functions (cn, etc.)
│   │   └── db.ts                   # Database client
│   ├── hooks/
│   │   ├── use-mobile.ts           # Mobile detection hook
│   │   └── use-toast.ts            # Toast notification hook
│   └── components/
│       ├── table-wars/             # *** Main application components ***
│       │   ├── SetupView.tsx        # Competition setup & team config
│       │   ├── HostPanel.tsx        # Game master control panel
│       │   ├── ScoreboardView.tsx   # Projector scoreboard display
│       │   ├── TeamView.tsx         # Team captain mobile view
│       │   ├── ResultsView.tsx      # Final results & awards
│       │   ├── Timer.tsx            # Timer display & controls
│       │   ├── BuzzButton.tsx       # Animated buzz-in button
│       │   ├── QuestionCard.tsx     # Quiz question display card
│       │   ├── ConfettiEffect.tsx   # Confetti particle system
│       │   ├── Leaderboard.tsx      # Reusable leaderboard component
│       │   └── TeamCard.tsx         # Reusable team card component
│       └── ui/                      # shadcn/ui components (40+ files)
│           ├── accordion.tsx
│           ├── alert.tsx
│           ├── avatar.tsx
│           ├── badge.tsx
│           ├── button.tsx
│           ├── card.tsx
│           ├── dialog.tsx
│           ├── input.tsx
│           ├── label.tsx
│           ├── progress.tsx
│           ├── select.tsx
│           ├── separator.tsx
│           ├── switch.tsx
│           ├── tabs.tsx
│           └── ... (30+ more)
├── download/                        # *** Generated deliverables ***
│   ├── Week4_Table_Wars_Program_Outline.pdf
│   ├── Table_Wars_Comprehensive_Site_Description.docx
│   ├── Table_Wars_Certificates.docx
│   ├── Certificate_Champion.png
│   ├── Certificate_Runner_Up.png
│   ├── Certificate_Sportsmanship.png
│   ├── Certificate_Active_Involvement.png
│   └── README.md
├── upload/
│   └── BOARDING HOUSE ENTERTAINMENT SCHEDULE-1.pdf  # Original source document
└── worklog.md                       # Development work log
```

---

## 15. Component Reference

### Table Wars Components

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| `SetupView` | `SetupView.tsx` | ~535 | Competition setup, team config, taste test customization, rules overview |
| `HostPanel` | `HostPanel.tsx` | ~900+ | Game master control: question reveal, buzz-in, scoring, round management, presentation controls, keyboard shortcuts |
| `ScoreboardView` | `ScoreboardView.tsx` | ~470 | Projector display: animated leaderboard, live content, timer, projector modes, splash screens |
| `TeamView` | `TeamView.tsx` | ~286 | Team captain view: score, rank, live status, buzz button, question display |
| `ResultsView` | `ResultsView.tsx` | ~369 | Final results: champion reveal, standings, awards, sportsmanship voting |
| `Timer` / `TimerControls` | `Timer.tsx` | ~119 | Countdown timer display with start/pause/reset and preset durations |
| `BuzzButton` | `BuzzButton.tsx` | ~72 | Large animated buzz-in button with press animation and ring pulse |
| `QuestionCard` | `QuestionCard.tsx` | ~93 | Quiz question card with reveal animation, options grid, answer display |
| `ConfettiEffect` | `ConfettiEffect.tsx` | ~87 | Particle-based confetti system (100 pieces with physics) |
| `Leaderboard` | `Leaderboard.tsx` | ~66 | Reusable animated leaderboard (dark/light mode, compact option) |
| `TeamCard` | `TeamCard.tsx` | ~64 | Reusable team card with rank, score, and highlight options |

### shadcn/ui Components Used

The project includes 40+ shadcn/ui components. The most actively used are:
- `Card` — All views for content sections
- `Button` — All interactions
- `Badge` — Round indicators, categories, status labels
- `Input` — Team names, taste test editing, announcements
- `Label` — Form labels
- `Progress` — Round progress bar
- `Dialog` — Taste test editing dialog
- `Select` — Placement dropdowns
- `Separator` — Visual dividers

---

## 16. Known Bugs & Fixes

### Bug 1: Taste Score Accumulation
**Problem**: In Round 4 (Blind Taste Test), clicking a score button would call `addScore` every time without checking if the team was already scored for that item. This caused scores to accumulate instead of being replaced.

**Fix**: Added `tasteItemScores` tracking (a nested `Record<string, Record<number, number>>`) that stores the previous score per team per item. When a new score is assigned:
1. Subtract the old score from the team's total
2. Add the new score
3. Update the tracking record

**Files changed**: `store.ts`, `HostPanel.tsx`

### Bug 2: `setCurrentTasteItem` Clearing Tracking Data
**Problem**: When switching taste test items, `setCurrentTasteItem` was clearing `tasteItemScores` along with `tasteScores`, which meant score tracking was lost between items.

**Fix**: `setCurrentTasteItem` now only clears the visual `tasteScores` (for UI state) while preserving `tasteItemScores` (for accurate score tracking across items).

**File changed**: `store.ts`

### Bug 3: React Compiler Stale Closures with Keyboard Shortcuts
**Problem**: Keyboard shortcuts in HostPanel were using state values directly in the event handler, which could become stale due to React Compiler's automatic memoization.

**Fix**: Implemented a `useRef` pattern where current state values are stored in a ref that is updated on every render. The keyboard handler reads from `stateRef.current` instead of closures.

**File changed**: `HostPanel.tsx`

---

## 17. Configuration Files

### next.config.ts
```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
}
```
- `standalone` output for optimized deployment
- `ignoreBuildErrors` for faster development builds
- `reactStrictMode: false` to avoid double-renders during development

### tailwind.config.ts
- Dark mode: `class` strategy
- Content paths: pages, components, app directories
- Extended theme with CSS variable-based colors (card, popover, primary, secondary, muted, accent, destructive, etc.)
- Custom border radius using CSS variable `--radius`
- `tailwindcss-animate` plugin for animation utilities

### globals.css
- Imports: Tailwind CSS 4, tw-animate-css
- Custom variant for dark mode
- Theme inline with 30+ CSS custom properties (oklch color space)
- Light and dark theme definitions
- Custom scrollbar, glow effects, keyframe animations

---

## 18. Future Enhancements

Potential improvements for future versions:

1. **Multi-device sync**: WebSocket-based synchronization so multiple devices can connect to the same game session (currently all views share one Zustand store on one device)

2. **Question bank management UI**: A dedicated interface for creating, editing, and switching between question banks (currently questions are in `quiz-data.ts`)

3. **Image/video support**: Allow questions to include images or video clips (e.g., "What movie is this scene from?")

4. **Custom round types**: Let hosts create custom rounds beyond the 5 pre-defined ones

5. **Persistent storage**: Save game state to localStorage or a database so the competition can be resumed after a page refresh

6. **Audience participation**: QR code scanning for audience voting or real-time reactions

7. **Export results**: Generate PDF/DOCX reports of final standings and awards

8. **Sound customization**: Allow hosts to upload custom sound effects for buzzer, correct, wrong, etc.

9. **Branding**: Customizable team logos, competition name, school/organization branding

10. **Accessibility**: Screen reader support, high-contrast mode, reduced motion option

11. **Mobile-optimized host panel**: A simplified touch-friendly version of the host panel for tablet use

12. **Replay/undo**: Ability to undo the last scoring action in case of mistakes

13. **Tiebreaker logic**: Automatic tiebreaker rounds or scoring when teams have equal final scores

14. **Statistics dashboard**: Post-competition analytics (average scores per round, buzzer response times, etc.)

---

*Documentation generated on 2026-05-09. All information reflects the current state of the Table Wars Competition project.*
