# 🛠️ Table Wars! Technical Overview

Table Wars! is a modern, real-time web application built with **Next.js**, **Zustand**, and **Supabase**. It is designed for multi-device synchronization during live events.

---

## 🏗️ Architecture

The app uses a **Centralized State Model** managed by Zustand. Every action (scoring, round switching, buzzer) updates the store, which then broadcasts the change to all connected devices.

### Sync Engines
1.  **Cross-Tab Sync**: Uses the `BroadcastChannel API` for near-instant synchronization between tabs on the same browser (e.g., Host Panel and Scoreboard on different monitors).
2.  **Remote Sync**: Uses `Supabase Realtime` (PostgreSQL changes) to sync state between different physical devices (e.g., Host laptop and Team phones).
3.  **Persistence**: The state is mirrored to `localStorage` to ensure a page refresh during an event doesn't lose any data.

---

## 📁 Key Directories

-   `src/store/useGameStore.ts`: The "Brain" of the app. Contains all game logic, scoring rules, and sync drivers.
-   `src/components/views/`: Individual high-level views (Setup, Host, Scoreboard, Team, Results).
-   `src/components/GlobalListeners.tsx`: Handles keyboard shortcuts and background timer logic.
-   `supabase/SUPABASE_SCHEMA.sql`: The database schema required for remote sync.

---

## 🚀 Development

### Tech Stack
-   **Frontend**: React 19, Next.js 16 (App Router), Tailwind CSS
-   **State**: Zustand
-   **Animations**: Framer Motion, Canvas-Confetti
-   **Database**: Supabase (Realtime, PostgreSQL)
-   **PDF Generation**: jsPDF, html2canvas

### Environment Variables
To run with remote sync, you must provide:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Build Commands
```bash
npm install     # Install dependencies
npm run dev     # Start development server
npm run build   # Production build (TypeScript & Next.js)
```

---

## 📡 Database Locking (The Buzzer)

To ensure fair play in the buzzer system, the app uses a Supabase RPC function `lock_buzz_for_question`. This prevents "race conditions" where two teams buzz at the same time, ensuring only the absolute first signal is recorded by the server.

---

## 📄 License & Attribution
Table Wars! is built with ❤️ for event hosts. Feel free to extend the rounds or customize the styling in `src/app/globals.css`.
