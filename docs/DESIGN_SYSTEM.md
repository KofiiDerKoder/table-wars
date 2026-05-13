# Table Wars! Design System & Stylistic Guidelines

**Last Updated:** May 13, 2026

> This document outlines the micro-decisions, visual architecture, and interactive principles that define the Table Wars! experience.

---

## 1. Color Theory & Palette Architecture

### The Purple-Amber Duality
The application is built on a two-pole color system that creates a clear cognitive split for the user:

| Pole | Usage | Psychological Effect |
|------|-------|---------------------|
| **Purple** (`#8B5CF6`) | Structure, navigation, progress, authority | Orientation: "This is the game structure." |
| **Amber** (`#F59E0B`) | Action, buzz-ins, announcements, highlights | Urgency: "This requires your attention." |

### Team Color Optimization
The 8 team colors are chosen to be **maximally perceptually distant** to ensure they are distinguishable even on low-quality projectors:
- **Red** (`#EF4444`), **Amber** (`#F59E0B`), **Emerald** (`#10B981`), **Blue** (`#3B82F6`), **Purple** (`#8B5CF6`), **Pink** (`#EC4899`), **Cyan** (`#06B6D4`), **Orange** (`#F97316`)

---

## 2. Typography & Hierarchy

### The Weight Spectrum
We use an extreme weight range to create an unmistakable hierarchy without complex layouts:
- **Hero Titles**: `text-7xl` to `9xl`, `font-black`, `tracking-tighter`.
- **Data (Scores)**: `text-3xl` to `7xl`, `font-black`, `tabular-nums`.
- **Metadata**: `text-xs`, `font-semibold`.

### Tabular Numbers
**Rule:** All score displays MUST use `tabular-nums`. This prevents layout jitter when scores change (e.g., from 9 to 10), ensuring visual stability on the scoreboard.

---

## 3. Animation Physics (Framer Motion)

### Spring-Based Motion
Avoid linear or ease-in-out transitions for game elements. Use spring physics to make the UI feel "alive":
- **Default Spring**: `stiffness: 200, damping: 25`.
- **Celebration/Trophy**: `stiffness: 200, damping: 15` (more bounce).

### Scoreboard Shifts
When ranks change, the leaderboard entries use `layout` prop animations. This allows the eye to follow a team as it moves up or down the standings.

---

## 4. Interaction Design (UX)

### Progressive Disclosure
Complex features (like the Taste Test customization or Master Shortcuts) are hidden behind badges or toggles to avoid overwhelming the Host.

### State Visualization
Use color opacity to encode state:
- `team.color + '20'`: Inactive/Passive.
- `team.color` (Full): Active/Buzzed.
- `team.color + '08'`: Ambient background wash.

---

## 5. Design Critique & Future Goals
- **Accessibility**: Future iterations should move beyond color-only indicators to support color-blind users.
- **Dark Mode**: The Scoreboard View is optimized for projection; always maintain high-contrast ratios against the dark slate background.
