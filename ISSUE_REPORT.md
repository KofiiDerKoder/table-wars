# Table Wars! Issue Report

## Overview
A comprehensive linting analysis has identified several recurring patterns of technical debt and React best-practice violations.

## Key Issues

1.  **React Anti-Patterns**
    *   **Components defined during render:** In `src/app/certificates/page.tsx`, the `Certificate` component is defined within the `GamePage` render scope, causing state reset on every re-render.
    *   **Synchronous `setState` in `useEffect`:** Occurring across multiple pages (`/host`, `/scoreboard`, `/team`, `page.tsx`), these cause cascading re-renders and performance degradation.
    *   **Ref access during render:** Found in `GlobalListeners.tsx`, where `stateRef.current` is updated directly in the render body.

2.  **Linting & Type Safety**
    *   **Unused variables/imports:** Numerous unused React components (e.g., `Badge`, `Separator`) across the codebase.
    *   **`any` types:** Missing explicit types in `RoundControls.tsx`, `HostPanel.tsx`, and `sounds.ts`.
    *   **Unescaped entities:** HTML entities like `"` need escaping in several JSX files (`certificates/page.tsx`, `RoundControls.tsx`, `LiveScoreboard.tsx`).

## Recommendations
- Refactor all internal components into dedicated files or move them outside the render function.
- Replace `useEffect` logic for state initialization with initial state constants or `useMemo`.
- Replace `any` types with appropriate TypeScript interfaces.
- Clean up unused imports via `eslint --fix` or manual removal.
- Escape special characters in JSX strings as indicated by the lint report.
