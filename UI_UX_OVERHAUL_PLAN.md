# UI/UX Overhaul Plan: Professional Event Display

## Objective
Modernize "Table Wars!" into a high-visibility, audience-friendly application with a default light theme, modern sans-serif typography, and a prominent, branded landing screen. The design will draw inspiration from professional sports broadcast overlays, prioritizing readability and visual harmony for large-screen projection.

## Design Principles
*   **High-Visibility Contrast:** Minimum 7:1 contrast ratio for critical scoreboard data.
*   **Broadcast Typography:** Bold, condensed sans-serif (Inter/system-ui) with `tabular-nums` applied to all numeric data displays to prevent layout jitter.
*   **Color Harmony:** A "TV-safe" light mode palette using `#FFFFFF` backgrounds, deep navy/charcoal for text, and high-saturation primary accents for status/teams.
*   **Visual Hierarchy:** Clean, modular card-based structure utilizing whitespace and subtle shadows for depth.

## Communication & Site Improvements
*   **Feedback Loops:** Enhance user feedback for actions (buzzed-in, team select, timer alerts) using clear, audible, and visual cues.
*   **State Indicators:** Implement consistent, persistent indicators for "Host Mode," "Audience View," and "Sync Status" so the app's current context is always apparent.
*   **Navigation:** Introduce clear, non-intrusive navigation cues to help the host move between views seamlessly.

## Detailed Implementation Steps

### Phase 1: Global Foundation & Style System
*   **Theme Migration:** Update `globals.css` base colors:
    *   `--background`: `#FFFFFF`
    *   `--foreground`: `#0F172A` (Slate 900)
    *   `--primary`: `#2563EB` (Blue 600 - verified for 7:1 visibility)
    *   `--muted`: `#F1F5F9` (Slate 100)
*   **Typography:** Set `font-sans` to "Inter, sans-serif". Add a global utility class `.tabular-nums` for all score containers.
*   **Global Components:** Refine `shadcn/ui` button and badge variants to use the new light-mode palette.

### Phase 2: Branded Landing Screen
*   **Layout:** Center alignment with large-scale typography. 
*   **Branding:** Replace text-only title with an "Event Logo" placeholder or stylized wordmark.
*   **CTA:** High-visibility "Start Event" button using primary brand color with a subtle hover/pulsing animation to draw immediate attention.

### Phase 3: Audience-Optimized Scoreboard
*   **Layout Structure:** Transition from dark grid to clean, high-contrast cards.
*   **Header:** Standardize font weights, ensuring round info and timer are clearly separated.
*   **Data Displays:** Implement card-based rows for teams with explicit brand-color indicators (pill shapes or thick left-border). Ensure all numeric scores use `font-variant-numeric: tabular-nums`.
*   **Animations:** Use subtle, professional transitions (framer-motion) to avoid "jarring" jumps during score updates.

### Phase 4: Consistent View Refinement
*   **Host/Setup/Results:** Apply standardized whitespace (padding/margins) to match the scoreboard. Ensure all form elements (inputs/buttons) are high-visibility and consistent with the new light-mode palette.
*   **Component Unification:** Abstract repeated styling (e.g., card backgrounds, headers) into reusable CSS utility classes.

### Phase 5: Verification & Accessibility
*   **Contrast Audit:** Use browser dev-tools to verify all text nodes meet accessibility standards.
*   **Projection Check:** Mock high-contrast output with a browser-based projection simulator.
*   **Responsiveness:** Test font scaling at different viewport widths to ensure text remains legible on large screens.

## Verification & Testing
*   **Accessibility:** Automated audit using Lighthouse for contrast.
*   **Visual Consistency:** Manual side-by-side comparison of all views for uniform color usage.
*   **Stability:** Verification of no visual jittering during score updates with `tabular-nums`.
