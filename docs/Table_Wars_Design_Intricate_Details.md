riedn# Table Wars — Design & Stylistic Choices: The Intricate Details

> A deep-dive into every micro-decision, subtle interaction, and tiny feature that makes the Table Wars Competition Manager feel polished and alive.

---

## Table of Contents

1. [Color Theory & Palette Architecture](#1-color-theory--palette-architecture)
2. [Typography Decisions](#2-typography-decisions)
3. [Animation Physics & Spring Tuning](#3-animation-physics--spring-tuning)
4. [Sound Design: The Acoustic Palette](#4-sound-design-the-acoustic-palette)
5. [Spatial Design & Layout Micro-Decisions](#5-spatial-design--layout-micro-decisions)
6. [Micro-Interactions & Tactile Feedback](#6-micro-interactions--tactile-feedback)
7. [Attention Management & Visual Hierarchy](#7-attention-management--visual-hierarchy)
8. [State Visualization & Progressive Disclosure](#8-state-visualization--progressive-disclosure)
9. [Scoreboard: Projection-Grade Design](#9-scoreboard-projection-grade-design)
10. [The Buzz System: Drama Through Constraint](#10-the-buzz-system-drama-through-constraint)
11. [Timer: Escalating Urgency](#11-the-timer-escalating-urgency)
12. [Confetti & Celebration: Reward Moments](#12-confetti--celebration-reward-moments)
13. [Results: The Reveal Sequence](#13-results-the-reveal-sequence)
14. [Presentation Mode: Confidence & Control](#14-presentation-mode-confidence--control)
15. [Defensive UX: Error Prevention Over Error Handling](#15-defensive-ux-error-prevention-over-error-handling)
16. [Emoji as Visual Shorthand](#16-emoji-as-visual-shorthand)
17. [The Invisible Details](#17-the-invisible-details)

---

## 1. Color Theory & Palette Architecture

### The Purple-Amber Duality

The entire app is built on a **two-pole color system**: purple for competition/structure, amber for action/excitement. This isn't accidental — it creates a clear cognitive split:

| Pole | Hex Range | Used For | Psychological Effect |
|------|-----------|----------|---------------------|
| **Purple** | `purple-600` → `purple-900` | Branding, navigation, structure, progress | Authority, competition, "this is the game" |
| **Amber** | `amber-400` → `amber-500` | Buzz-ins, taste tests, announcements, highlights | Energy, urgency, attention, "act now" |

Every time you see amber, something **requires your attention**. Every time you see purple, you're being **oriented** within the structure of the competition.

### The 8 Team Colors: Maximum Differentiation

```typescript
const TEAM_COLORS = [
  '#EF4444', // Red       — warm, aggressive
  '#F59E0B', // Amber     — warm, energetic
  '#10B981', // Emerald   — cool, calm
  '#3B82F6', // Blue      — cool, trustworthy
  '#8B5CF6', // Purple    — cool, creative
  '#EC4899', // Pink      — warm, playful
  '#06B6D4', // Cyan      — cool, fresh
  '#F97316', // Orange    — warm, fiery
]
```

These 8 colors are chosen specifically because they are **maximally perceptually distant** from each other. No two colors are adjacent on the color wheel, which means even on a washed-out projector or a cheap phone screen, teams are instantly distinguishable. The sequence alternates warm-cool-warm-cool so that adjacent teams in the list never feel visually similar.

### Color + Opacity as State

The app uses color at different opacities to encode state, not just identity:

| Pattern | Meaning | Example |
|---------|---------|---------|
| `team.color + '20'` | "This team's presence, but inactive" | Buzz buttons before being pressed: 12% opacity fill |
| `team.color + '60'` | "This team's border, subtle" | Team card borders in setup: 37% opacity |
| `team.color + '08'` | "This team's atmosphere, barely there" | Team view background: 3% opacity wash |
| `team.color` (full) | "This team is ACTIVE" | Buzzed-in button: full saturation fill |
| `team.color + '40'` | "Glow associated with this team" | Shadow and ring effects |

This means the eye doesn't need labels — opacity alone tells you whether a team element is active, passive, or ambient.

### oklch Color Space

The CSS custom properties use `oklch()` instead of `hsl()` or `rgb()`. This is a deliberate choice: oklch provides **perceptually uniform** color space, meaning a change in lightness feels equally dramatic across all hues. This matters for the dark mode where colors need to feel "the same" but at different brightness levels.

---

## 2. Typography Decisions

### The Weight Spectrum

The app uses an extreme weight range — from `text-xs font-medium` (labels) to `text-9xl font-black` (hero title). This isn't by accident; it creates a **typographic hierarchy so strong** that you can understand the page structure without seeing any layout:

| Element | Size | Weight | Purpose |
|---------|------|--------|---------|
| Hero "TABLE WARS" | `text-7xl` → `text-9xl` | `font-black` | Pure dominance — you cannot look away |
| Round headers | `text-3xl` | `font-black` | Section anchoring |
| Team names | `text-sm` → `text-base` | `font-bold` | Identifiable but not competing with scores |
| Scores | `text-3xl` → `text-7xl` | `font-black` | The most important data, largest on screen |
| Labels | `text-xs` → `text-sm` | `font-semibold` | Metadata, secondary information |
| Keyboard shortcuts | `text-xs` | `font-mono` | Technical context, "this is a key binding" |

### `tabular-nums` on Scores

Every score display uses `tabular-nums` (fixed-width digits). This means when a score changes from `9` to `10`, the layout doesn't shift. The digits occupy the same horizontal space regardless of value, which prevents the jarring reflow that would happen with proportional numerals. On the scoreboard, where scores change frequently, this is the difference between a stable display and a jittery one.

### `tracking-tighter` on the Title

The hero "TABLE WARS" uses `tracking-tighter` (negative letter-spacing). At display sizes, standard letter-spacing creates awkward gaps between characters. Tighter tracking at large sizes creates a **blocky, aggressive** feel that reinforces the competitive nature of the event. The same technique is used on professional sports branding.

### `uppercase` on Section Labels

Section headers like "STANDINGS" and "PROJECTOR PREVIEW" use `text-sm font-black uppercase`. Uppercase at small sizes with heavy weight creates a **label** feel — these are navigational markers, not content. It's the same principle used in architectural wayfinding signage.

---

## 3. Animation Physics & Spring Tuning

Every animation in the app uses **spring physics**, not linear easing. Springs feel organic because they mimic how real objects move — they overshoot slightly, then settle. But different contexts need different spring characteristics:

### The Spring Constant Matrix

| Context | Stiffness | Damping | Feel | Why |
|---------|-----------|---------|------|-----|
| Leaderboard rank change | 200 | 25 | Snappy, assertive | Rank changes are dramatic — the spring should feel like the team "jumped" into position |
| Score number update | 300 | 15 | Bouncy, celebratory | The low damping creates overshoot — the number "pops" bigger than its final size, then settles, creating a micro-celebration |
| Score number (color) | 300 | 20 | Quick but controlled | The color transitions from amber (#F59E0B) to white/team-color, reinforcing that the score just changed |
| Champion reveal | 200 | 15 | Dramatic, theatrical | Low damping = big overshoot = the champion card feels like it's bursting onto screen |
| Round splash | 150 | 15 | Grand, sweeping | Lower stiffness = slower acceleration = feels like a curtain being pulled |
| Splash text (inner) | 100 | — | Gentle float | Even slower, creating a secondary "settling" wave within the splash |
| Buzz button | (CSS) | — | Quick press | `duration: 0.1` — near-instant, because a buzz is a reflex action |
| Option cards | — | — | Staggered entrance | Each option slides from alternating sides (left for odd, right for even) with 50ms stagger, creating a "fan" effect |
| View transitions | — | — | Simple fade | 300ms opacity — no movement, because switching views should feel like changing channels, not traveling |

### Stagger as Rhythm

Animations are rarely applied to a single element. When multiple items animate (teams in a list, options in a question, confetti pieces), they use **stagger delays** to create rhythm:

- **Setup team cards**: `delay: i * 0.05` — 50ms between each card. Fast enough to feel like one gesture, slow enough to perceive the cascade.
- **Leaderboard entries**: `delay: index * 0.08` — 80ms between teams. Slightly slower because there are fewer items but they're larger, so the eye needs more time to track each one.
- **Question options**: `delay: 0.1 + i * 0.05` — 50ms between options, but with a 100ms initial delay so the question text settles first before options start appearing.
- **Results reveal**: `800ms` interval between each team — slow enough to build suspense, fast enough to not feel tedious.

### The "Settling" Pattern

Several animations follow a **burst → settle** pattern:

1. Score updates: `initial: { scale: 1.5 }` → `animate: { scale: 1 }` — the number briefly gets 50% larger, then shrinks to normal
2. Champion card: `initial: { scale: 0.8 }` → `animate: { scale: 1 }` — grows from 80% to 100%
3. Buzz button pressed: `animate: { scale: 0.95 }` — briefly shrinks 5%, creating a "depression" feel

The asymmetry matters: scores **burst outward** (they gained something), buttons **compress inward** (you pushed them).

### Infinite Loops: Living Elements

Some elements never stop animating — they **breathe**:

| Element | Animation | Period | Purpose |
|---------|-----------|--------|---------|
| Hero title | `scale: [1, 1.02, 1]` | 3s | Makes the title feel alive, like it's breathing |
| Scoreboard header | `opacity: [0.8, 1, 0.8]` | 3s | Subtle glow pulse — "I'm on, pay attention" |
| First place on scoreboard | `scale: [1, 1.05, 1]` | 2s | Crown pulse — "I'm winning" |
| Locked-in buzz button | `scale: [1, 1.05, 1]`, `opacity: [1, 0.8, 1]` | 0.5s | Urgent pulse — "I'm locked in, decide!" |
| Buzz button ring | `scale: [1, 1.1, 1]`, `opacity: [0.5, 0, 0.5]` | 2s | Radar ping — "I'm available, press me" |
| Logo screen title | `scale: [1, 1.02, 1]` | 3s | Same breathing as setup hero — brand consistency |
| Announcement text | `scale: [1, 1.02, 1]` | 2s | Slightly faster — messages feel more urgent |
| Floating geometric shapes | Static with CSS rotation | — | They don't animate, but their varied rotations (12°, -6°, 45°, -12°) create visual asymmetry |

---

## 4. Sound Design: The Acoustic Palette

### Why Procedural Audio?

Every sound is generated from oscillators — no audio files are loaded. This means:
- **Zero latency on first play** (no file download/decode)
- **Zero storage overhead**
- **Consistent across all browsers** (Web Audio API is well-supported)
- **Infinitely customizable** (change a frequency number = change the sound)

### Frequency Choices: The Musical Theory

The sounds aren't random frequencies — they follow **musical intervals**:

| Sound | Frequencies | Musical Interval | Emotional Association |
|-------|-------------|-----------------|----------------------|
| Buzzer | 440 → 554 → 659 Hz | Major 3rd + Minor 3rd (A4 → C#5 → E5) | Rising triad = "alert, attention" |
| Correct | 523 → 659 → 784 Hz | Major 3rd + Minor 3rd (C5 → E5 → G5) | Major triad = "success, resolution" |
| Wrong | 300 → 200 Hz | Descending tritone-ish | Falling = "failure, deflation" |
| Celebration | 523 → 659 → 784 → 1047 Hz | C5 → E5 → G5 → C6 | Octave leap at end = "triumph!" |
| Timer tick | 600 Hz | Single pitch | Neutral, metronomic |
| Timer alert | 880 Hz | A5 — high register | "Wake up!" — high frequencies are more alarming |

### Oscillator Type as Emotional Shorthand

| Type | Sound Character | Used For | Why |
|------|----------------|----------|-----|
| `square` | Harsh, buzzy, digital | Buzzer | Square waves are the most "alerting" waveform — they cut through noise |
| `sine` | Pure, smooth, clean | Correct, Celebration, Timer | Sine waves feel "correct" and "resolved" — no harsh overtones |
| `sawtooth` | Raspy, gritty | Wrong answer | Sawtooth waves are the most dissonant — they literally sound "wrong" |

### Envelope Shaping: The Gain Curves

Every sound uses `exponentialRampToValueAtTime` for volume decay. This creates a **natural decay** — the sound is loudest at the moment of action, then quickly fades. The specific timing:

- Buzzer: 0.4s total (fast — buzz should be a stab, not a drone)
- Correct: 0.5s total (slightly longer — you want to savor being right)
- Wrong: 0.3s total (short — don't dwell on failure)
- Tick: 0.05s total (micro — just a blip)
- Alert: 0.15s total (short — warning, not alarm)
- Celebration notes: 0.4s each, staggered by 0.15s (cascading — each note starts before the previous ends, creating an arpeggio)

### Volume Levels as Hierarchy

| Sound | Peak Gain | Why This Level |
|-------|-----------|----------------|
| Buzzer | 0.3 | Needs to be heard clearly when a team buzzes |
| Correct | 0.3 | Same level as buzzer — it's the "answer" to the buzz |
| Wrong | 0.2 | Quieter — wrong answers shouldn't feel as impactful as right ones |
| Tick | 0.08 | Barely audible — it's ambient, not foreground |
| Alert | 0.2 | Noticeable but not startling |
| Celebration | 0.2 | Per note — but 4 notes in succession creates cumulative impact |

---

## 5. Spatial Design & Layout Micro-Decisions

### The 264px Sidebar

The host panel sidebar is exactly `w-64` (256px). This width was chosen because:
- It's wide enough to show team names without truncation (most names are under 20 characters)
- It's narrow enough that the main content area still has room for the question card + buzz controls
- It matches a standard "drawer" width that users recognize from email clients and IDEs
- The confidence monitor fits within it at a legible size

### `min-w-0` on Text Containers

Every container that holds a team name has `min-w-0` applied. Without this, CSS flexbox won't truncate text — the container expands to fit the content instead of allowing `truncate` (text-overflow: ellipsis) to work. This is a **CSS gotcha** that most developers miss, and it would cause long team names to break layouts.

### `shrink-0` on Color Dots and Rank Badges

The small color dots (16×16px `h-4 w-4`) and rank badges (28×28px `h-7 w-7`) all have `shrink-0`. This prevents them from being compressed when the container is squeezed, which would make them invisible. The identity elements (color, rank) must **never** be sacrificed for space.

### The Scoreboard's `max-w-4xl` Center Constraint

The scoreboard leaderboard is constrained to `max-w-4xl` (896px) and centered, even on ultrawide projectors. This is because:
- On a 16:9 projector at 1920px, full-width bars would be too far apart to compare scores at a glance
- The eye can track rankings more efficiently when they're in a compact column
- The centered layout leaves breathing room on both sides, making it feel like a broadcast rather than a spreadsheet

### `overflow-hidden` on Scoreboard Container

The scoreboard uses `overflow-hidden` on its root container. This prevents confetti particles and celebration effects from causing scrollbars, which would ruin the "presentation" feel.

---

## 6. Micro-Interactions & Tactile Feedback

### The Buzz Button: A Case Study in Feel

The buzz button is the most tactile element in the app. Every detail encodes "press me":

1. **The pulse ring**: A secondary border that expands from `scale(1)` to `scale(1.1)` and fades from `opacity(0.5)` to `opacity(0)`, then repeats. This creates a "radar ping" effect — the button is actively signaling availability.

2. **The press response**: `onPointerDown` sets `isPressed`, `onPointerUp`/`onPointerLeave` clears it. The button visually compresses to `scale(0.95)` when pressed — a 5% shrink, just enough to feel like the button is being physically depressed.

3. **The locked state**: When a team buzzes in, the button text changes from "🖐 BUZZ IN!" to "🔒 BUZZED!", the background goes from 12% opacity team color to full opacity, the text goes from team-color to white, and the pulse ring stops. The entire personality of the button changes from "available" to "claimed."

4. **The glow**: When buzzed in, `boxShadow: 0 0 40px ${teamColor}80` creates a 40px glow at 50% opacity around the button. On a dark room projector, this makes the buzzed team's button literally glow in the dark.

### Hover → Scale Pattern

Interactive elements use `whileHover={{ scale: 1.02 }}` and `whileTap={{ scale: 0.98 }}`. The 2% grow / 2% shrink is imperceptible consciously but creates a **subtle magnetic feel** — elements that respond to your cursor feel "alive." The 0.98 tap scale is smaller than the 1.02 hover to avoid the common mistake of hover and tap scales canceling out.

### Conditional Scale on Start Button

The "START COMPETITION!" button only scales on hover if `allTeamsHaveNames` is true:

```tsx
whileHover={{ scale: allTeamsHaveNames ? 1.02 : 1 }}
whileTap={{ scale: allTeamsHaveNames ? 0.98 : 1 }}
```

A disabled button that responds to hover feels broken — it's promising interactivity it can't deliver. By freezing the scale when the button is disabled, the button feels **resolute** rather than teasing.

### Transition-All on Buzz Buttons

The buzz buttons use `transition-all` (not `transition-colors` or `transition-opacity`). This means when a team buzzes in, **every property animates simultaneously** — the background color, the text color, the scale, the ring, and the shadow all transition together. The result is a single fluid transformation rather than a sequence of disconnected property changes.

---

## 7. Attention Management & Visual Hierarchy

### Three-Zone Attention Model

The host panel follows a **three-zone attention model**:

1. **Left sidebar** (peripheral): Team standings and projector controls — always visible, rarely the focus
2. **Top bar** (orienting): Round indicator, timer, navigation — tells you where you are
3. **Main content** (focal): Current round's controls — where your eyes and hands should be

The sidebar uses `bg-white` while the main content uses `bg-slate-50`. This 2-shade difference is enough to visually separate the zones without creating harsh boundaries.

### The Progress Bar as Wayfinding

The round progress bar uses a simple but effective three-state color system:

- **Current round**: `font-bold text-purple-600` — "you are here"
- **Completed rounds**: `text-emerald-500` — "done, successful"
- **Future rounds**: `text-slate-400` — "not yet, grayed out"

This same pattern is used in the question jump grid:
- Current question: `bg-purple-600 text-white` (filled, active)
- Previous questions: `bg-emerald-100 text-emerald-700` (light green, completed)
- Future questions: `bg-slate-100 text-slate-500` (gray, pending)

The color logic is consistent: purple = current, green = done, gray = future. Once you learn it in one context, it applies everywhere.

### Ring as Focus Indicator

When a team buzzes in, two things get a ring:
1. The buzz button itself: `ring-2 ring-amber-400` — amber ring on the button
2. The sidebar standings entry: `ring-2 ring-amber-400 bg-amber-50` — amber ring + amber background

This means no matter where the host is looking (the buzz panel or the sidebar), they'll see which team buzzed in. The ring color is amber (not the team's color) because it needs to be visible against any team color background.

---

## 8. State Visualization & Progressive Disclosure

### Round Locks: From Mutable to Immutable

Each round has a visual transformation when locked:

| Before Lock | After Lock |
|-------------|-----------|
| Active placement dropdowns | Disabled dropdowns (grayed out) |
| Penalty adjustment buttons | Disabled buttons |
| "Lock Round X Scores" button (green) | "✓ Round Locked" badge (green background) |
| Creativity toggle (clickable) | Creativity toggle (frozen) |

The transition from interactive controls to a static badge is deliberate — it communicates **finality**. The lock button disappears because you can't unlock (a deliberate design choice — no undo on round finality prevents score manipulation debates).

### The "Customized" Badge

When taste test items are modified, a small amber badge appears next to the section header. This is **ambient accountability** — the host can see at a glance that defaults have been changed, which matters if someone asks "wait, did we change the items?" during the competition.

### The Confidence Monitor: What You See Is What They See

The confidence monitor in the sidebar replicates the projector's current state at thumbnail scale. It uses `bg-slate-900` (the same dark background as the scoreboard) with `text-xs` to create a miniature preview. The four states each have distinct visual signatures:
- Scoreboard mode: Purple text, white structure
- Black mode: Near-black with subtle gray text
- Logo mode: Purple "TABLE WARS" text
- Announcement mode: Amber text

The host never has to look at the projector to know what's on it — the confidence monitor is a trusted proxy.

---

## 9. Scoreboard: Projection-Grade Design

### Dark Theme from First Principles

The scoreboard uses `bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900` — a subtle vertical gradient that prevents the solid-color "flat screen" look. On a projector, pure black (#000) can look like the projector is off, while slate-900 is clearly "intentionally dark." The gradient adds enough visual variation that the screen looks "designed" rather than "blank."

### The Text Shadow Technique

The "TABLE WARS" title on the scoreboard uses inline `textShadow`:

```tsx
style={{ textShadow: '2px 2px 0 rgba(88,52,194,0.5)' }}
```

This creates a **hard-edge shadow** (no blur) in purple at 50% opacity. It's not a soft drop shadow — it's a retro, screen-printed effect that:
- Makes white text readable against any background
- Adds depth without adding blur (which looks bad on low-res projectors)
- Reinforces the purple brand even on a mostly white/light text display

The hero on the Setup page uses a similar pattern: `textShadow: '3px 3px 0 rgba(0,0,0,0.2)'` — black shadow for a stamped-into-page effect.

### Score Bar Widths: Proportional, Not Absolute

On the scoreboard, each team has a background bar whose width is proportional to `(teamScore / maxScore) * 100`. This means:
- The first-place team always fills the full width
- Other teams' bars are proportional to their score relative to the leader
- When scores are close, bars are similar lengths (communicating "tight race")
- When one team dominates, the visual gap is dramatic

The bar uses `team.color + '15'` (8.4% opacity) — enough to create a visible zone of color without overwhelming the text on top.

### The Crown Emoji as First-Place Marker

First place on the scoreboard gets:
1. A crown emoji (👑) instead of the number "1"
2. A golden ring: `ring-2 ring-amber-400/50`
3. An amber gradient background: `from-amber-500/20 to-amber-500/5`
4. A glow on the rank badge: `boxShadow: 0 0 30px ${team.color}60`
5. Larger rank badge size: `h-16 w-16` vs `h-14 w-14` for others
6. Larger text: `text-2xl md:text-3xl` vs `text-xl md:text-2xl`
7. Larger score: `text-5xl md:text-7xl` vs `text-4xl md:text-5xl`
8. Pulsing scale animation on the rank badge

That's **8 simultaneous visual signals** that one team is first. Overkill for a data display, but perfect for a competition where first place needs to feel triumphant.

### Round Score Badges as Story

Each team's row shows `R1: 25 R2: 18 R3: 20 R4: 12 R5: 30` — tiny badges that tell the **story** of how they got their total. This is crucial because two teams with 100 points could have gotten there very differently (one dominated early, one came from behind), and that narrative matters for engagement.

---

## 10. The Buzz System: Drama Through Constraint

### The Lockout Mechanic

When any team buzzes in:
1. That team's button becomes full-color with "🔒 BUZZED!" text
2. All other teams' buttons dim to `opacity-40` and become `cursor-not-allowed`
3. Only the buzzed team gets correct/wrong buttons
4. Other teams get "Steal +3" buttons (but only after someone has buzzed)

This three-state system (available → buzzed → steal) creates **drama through constraint**. Once someone buzzes, the other teams can't buzz anymore — they can only steal. This forces fast decisions and rewards quick thinking.

### The Steal: A Forgiveness Mechanism

The "Steal +3" button only appears for teams that didn't buzz in. It offers fewer points (3 vs 5) but provides a safety net — a wrong answer doesn't end the question. This is good game design because:
- It keeps all teams engaged even after a wrong answer
- The reduced points mean buzzing in first is still advantageous
- It creates a "second chance" moment that audiences love

### Keyboard Shortcuts for Buzz

The host can press keys 1-8 to buzz in a specific team by their index. This is designed for the scenario where a team shouts "BUZZ!" verbally and the host needs to register it instantly — no need to find and click a small button. The shortcut respects the lockout: if a team is already buzzed in, pressing a number key does nothing.

### Clear Buzz as Reset

The "Clear buzz" button uses `variant="ghost"` and `text-slate-400` — intentionally understated. It's a utility action, not a primary action. It should be available but not prominent, because clearing a buzz is rare (usually only when the host accidentally registered the wrong team).

---

## 11. The Timer: Escalating Urgency

### Three-State Color Coding

The timer display uses three visual states that map to emotional states:

| Seconds Left | Background | Text Color | Animation | Emotional State |
|-------------|-----------|------------|-----------|-----------------|
| > 10 | `bg-slate-100` | `text-slate-700` | None | Calm — plenty of time |
| 10 → 6 | `bg-amber-500/20` | `text-amber-500` | None | Caution — time is running |
| 5 → 1 | `bg-red-500/20` | `text-red-500` | Pulse `scale(1, 1.05, 1)` at 0.5s | Danger — urgency! |

The pulse animation at ≤5 seconds is crucial — it makes the timer **feel** like it's running out, not just counting down. The 5% scale pulse is large enough to notice but small enough to not be distracting.

### Audible Tick at ≤10s

At 10 seconds and below, each tick plays a subtle `playTickSound()` (600Hz sine, 0.08 volume, 0.05s duration). It's barely audible — you feel it more than you hear it. At 5 seconds, `playTimerAlertSound()` (880Hz, 0.2 volume, 0.15s) adds a sharper ping. The escalation from subtle tick to sharp ping mirrors the visual escalation from amber to red.

### Preset Duration Buttons

The timer offers four presets: 30s, 60s, 90s, 120s. The current preset is highlighted with `bg-purple-100 text-purple-700` (the "current" color from our palette). These presets cover the common time ranges needed:
- 30s: Quick buzzer rounds
- 60s: Standard question time
- 90s: Extended thinking
- 120s: Physical challenges (relay, building)

### The Timer Display on Scoreboard

On the scoreboard, the timer appears as a centered bar with `rounded-xl` and `font-mono text-2xl`. The monospace font ensures the digits don't shift as the number changes (10 → 9 → 8 would cause layout jitter in proportional fonts). The timer only appears when `timerRunning` — when it's paused, it disappears, removing the visual clutter of a frozen timer.

---

## 12. Confetti & Celebration: Reward Moments

### Two Confetti Systems

The app has two distinct celebration systems, each designed for a different context:

**Scoreboard Celebration (CSS particles)**:
- 30 pieces
- Falls from random horizontal positions at top
- Each piece: `h-3 w-3 rounded-full` (12×12px circles)
- Colors cycle through the 5 team colors
- Physics: y moves down, x drifts randomly, rotation spins
- Duration: 2-4 seconds per piece with random delays
- Triggered when a round ends

**Results Confetti (React component)**:
- 100 pieces
- Custom physics simulation (30ms interval)
- Each piece has: x, y, rotation, color, size, speed, drift
- Size varies: 6-14px, shape alternates between circles and rectangles
- Duration: 8 seconds total
- Triggered on results page load

The scoreboard uses fewer pieces because it's on a projector — too many particles look messy at scale. The results page uses more because it's a celebration moment that should feel overwhelming.

### The Celebration Sound: An Arpeggio

`playCelebrationSound()` plays C5 → E5 → G5 → C6 (523 → 659 → 784 → 1047 Hz), a **root position major triad with octave**. The notes are staggered by 150ms, creating a rising arpeggio. The octave leap at the end (G5 → C6) is the musical equivalent of a drum roll's final hit — it signals completion.

---

## 13. Results: The Reveal Sequence

### Progressive Reveal: Building Suspense

The results page reveals teams one at a time at 800ms intervals, **starting from the top** (not from the bottom like a countdown show). This is a deliberate choice:
- Revealing the champion first means the audience knows the winner immediately
- The remaining teams are revealed in order, with each one receiving a spring animation
- By the time the last team is revealed, the audience has had time to process the rankings

### The Score Color Transition

When a score number first appears, it animates from:

```tsx
initial={{ scale: 1.5, color: '#F59E0B' }}  // 50% larger, amber
animate={{ scale: 1, color: team.color }}     // normal size, team color
```

The amber flash creates a **"just arrived"** signal — your eye is drawn to the amber number, which then settles into the team's color. This is the same principle as a notification badge that flashes before going quiet.

### Awards: Three Different Emotional Colors

The three award cards use three distinct color families:

| Award | Color Family | Emotional Association |
|-------|-------------|----------------------|
| Most Creative | Amber (`amber-400/30`, `amber-500/10`) | Warm, glowing — creativity is radiant |
| Sportsmanship | Pink (`pink-400/30`, `pink-500/10`) | Warm, caring — sportsmanship is about heart |
| MVP | Emerald (`emerald-400/30`, `emerald-500/10`) | Cool, strong — MVP is about dominance |

Each card uses the same structure (icon + label + name) but with different emotional coloring. The 30% opacity borders and 10% opacity backgrounds create a tinted-glass effect — the award category bleeds through the card.

### Share Results: Clipboard as Reward

The share button copies a plain-text summary to clipboard. The text format is deliberate:

```
🏆 TABLE WARS RESULTS 🏆

1. Team Alpha — 120 pts
2. Team Beta — 95 pts
...

Champion: Team Alpha!
```

This format works in any messaging app, group chat, or social media platform. It uses emoji for visual structure, and the champion callout at the bottom means the reader's eye naturally lands on the winner after scanning the rankings.

---

## 14. Presentation Mode: Confidence & Control

### The Black Screen as Breathing Room

The black screen mode isn't just "turn off the display" — it's `bg-black` on a `fixed inset-0 z-50` container. The fullscreen button is positioned at `items-end justify-end p-4` with `bg-white/10` (10% opacity white) and `text-white/30` (30% opacity text). These extremely low opacities mean the buttons are **invisible unless you're looking for them** — the audience doesn't see a control panel, only black.

### The Logo Screen as Branding Moment

The logo screen uses the same spring animation as the champion reveal (`stiffness: 100, damping: 15`), creating a visual continuity: "TABLE WARS" entering the screen should feel the same whether it's the pre-event logo or the post-event brand. The background gradient `from-purple-900 via-slate-900 to-purple-900` creates a subtle vignette effect — darker at edges, slightly lighter in center — which mimics stage lighting.

### Announcement: The Breaking News Aesthetic

The announcement overlay uses `from-amber-500 to-amber-600` — a **horizontal gradient** that creates a "breaking news" banner feel. The text uses `scale: [1, 1.02, 1]` pulse at 2s period — faster than the logo's 3s, because announcements are more urgent. The banner is fixed to `top-0 left-0 right-0 z-30`, sitting above the scoreboard content but below the splash screen (z-40) and confetti (z-50).

### Splash Auto-Clear: 3 Seconds

Round splash screens auto-clear after 3000ms. This is long enough for the audience to read "Round 4: Blind Taste Test" but short enough that the host doesn't need to manually dismiss it. The `setScoreboardSplash(null)` call is in a `setTimeout` with proper cleanup (`return () => clearTimeout(timer)`), so unmounting the component mid-splash doesn't cause a state update on an unmounted component.

---

## 15. Defensive UX: Error Prevention Over Error Handling

### Minimum Team Count: 3

The store's `startCompetition` function checks `if (state.teams.length < 3) return`. The start button is also disabled when `!allTeamsHaveNames`. These are **double safeguards**: the UI prevents the action, and the store rejects it even if the UI is bypassed.

### Score Clamping: `Math.max(0, ...)`

In Round 2, `lockRound2` calculates `Math.max(0, points - penalty)`. A team with 25 placement points and 30 penalty points gets 0, not -5. Negative scores in a competition create confusion and resentment — clamping to 0 is a UX decision disguised as a math decision.

### Penalty Step: Fixed at 3

Penalties increment/decrement by 3 points, not by 1. This is because each "drop" in the food relay is worth a fixed 3 points. Having the step match the game rule means the host doesn't need to do mental math — each button click = one dropped item.

### Input Guard on Keyboard Shortcuts

The keyboard shortcut handler checks `if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return`. This prevents the host from accidentally buzzing in a team while typing an announcement or editing a taste test item. The guard is at the top of the handler, so it applies to all shortcuts universally.

### Taste Score Dedup

`handleTasteScore` checks `if (prevScoreForItem !== scoreValue)` before making any changes. If the host clicks "Correct" twice for the same team and item, the second click is a no-op. This prevents the double-scoring bug that would otherwise accumulate points.

---

## 16. Emoji as Visual Shorthand

The app uses emoji strategically as **visual shorthand** — they communicate state faster than text:

| Emoji | Context | Meaning |
|-------|---------|---------|
| 👑 | Scoreboard first place | Champion / leader |
| 🥈 🥉 | Results 2nd/3rd place | Silver / bronze |
| 🔒 | Buzzed-in button | Locked, claimed |
| 🖐 | Buzz button | "Hand up" — raise your hand to buzz |
| ✓ ✗ | Correct/Wrong buttons | Universal check/cross |
| 🏆 | Results champion header | Trophy |
| 📢 | Announcement mode | Megaphone = broadcast |
| ⬛ | Black screen preview | The screen is black |
| ⚔️ | Logo screen / header | Swords = competition |
| 🧪 | Taste test hint card | Lab flask = mystery/experiment |
| 👅 | Taste test item | Tongue = taste |
| 🏃 🏗️ | Round 2/3 headers | Physical activities |
| 🎉 | Round complete | Celebration |
| ✨ | Creativity bonus | Sparkle = special |

Emoji work across all devices and locales without translation. They're particularly effective on the scoreboard where text needs to be readable at a distance — an emoji is a colored shape that the eye can recognize even when the surrounding text is too small to read.

---

## 17. The Invisible Details

These are the things users never notice because they work so well:

### `useEffect` Cleanup Functions

Every `setInterval`, `setTimeout`, and `addEventListener` in the app has a corresponding cleanup function in the `useEffect` return. This prevents:
- Memory leaks from orphaned intervals
- Multiple timer ticks firing simultaneously
- Stale event listeners persisting after component unmount

### Dynamic Import for Default Taste Items

`startCompetition` uses `import('./quiz-data').then(...)` to load default taste items asynchronously instead of importing at the top. This avoids a circular dependency between the store and quiz data while ensuring defaults are always available when needed.

### The Ref Pattern for Keyboard Shortcuts

Instead of adding keyboard shortcut dependencies to the `useEffect` dependency array (which would cause the listener to be re-registered on every state change), the app uses a `useRef` that is updated on every render. The `useEffect` with `[]` dependency runs once, registering the listener, and the listener reads from `stateRef.current` for fresh values. This is a performance optimization that also avoids stale closures.

### The `getOrdinal` Helper

```typescript
function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
```

This correctly handles all English ordinal suffixes, including the edge cases of 11th, 12th, 13th (which should be "th" not "st", "nd", "rd"). The `% 100` handles the teens, and the `(v - 20) % 10` handles the 20s, 30s, etc.

### `auto` Appearance on Select Elements

```css
select {
  appearance: auto;
}
```

This single CSS rule overrides Tailwind's default `appearance: none` and restores the native browser dropdown styling. Without it, `<select>` elements would have no dropdown arrow, making them confusing to use. This is a case where native UI beats custom UI — the browser's native select dropdown is more familiar and accessible than any custom implementation.

### The `playBuzzerSound` in BuzzButton

The BuzzButton component calls `playBuzzerSound()` locally rather than relying on the store to trigger it. This ensures the sound plays **immediately** when the button is pressed, not after the state update propagates. The ~16ms React render cycle would create a noticeable audio delay if the sound were triggered by state change.

### Conditional Rendering as Performance

The scoreboard uses conditional rendering (`{displayContent && ...}`) instead of `display: none`. This means the taste test card and question card are **not in the DOM** when they're not needed, saving the browser from computing layouts for invisible elements. On a projector running at 60fps, this matters.

### `prevRoundRef` for Round Change Detection

```typescript
const prevRoundRef = useRef(currentRound)
useEffect(() => {
  if (currentRound !== prevRoundRef.current && currentRound > 0 && currentRound <= 5) {
    setScoreboardSplash(...)
  }
  prevRoundRef.current = currentRound
}, [currentRound, setScoreboardSplash])
```

This pattern detects when `currentRound` **changes** (not just when it's a certain value). It only triggers the splash on the transition, not on every render. The ref stores the "previous" value, and the comparison detects the delta.

### The `.custom-scrollbar` Utility

The custom scrollbar uses a 6px width, transparent track, and `rgba(148, 163, 184, 0.3)` thumb with `border-radius: 3px`. The 30% opacity means the scrollbar is visible when hovered but invisible when not — it doesn't compete with content for visual attention. The 6px width is thin enough to not waste space but wide enough to be grabbable on touch devices.

---

*Every design choice documented here was made intentionally. None of these details are accidents — they are the compound interest of dozens of small decisions that collectively create an experience that feels professional, dramatic, and alive.*
