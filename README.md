# Table Wars!

**Table Wars!** is an interactive, multi-view web application designed to manage and display live competition data. It features real-time scoring, a buzzer system, and an animated presentation mode.

## 🚀 Features

-   **Multi-View Interface**: Seamlessly switch between different game states:
    -   **Landing/Setup**: Initialize teams and configure the game.
    -   **Host Panel**: Administrative control for the game master.
    -   **Live Scoreboard**: Projector-ready real-time leaderboard.
    -   **Team View**: Interface for team interaction (buzzer, score tracking).
    -   **Results**: Detailed post-competition summary and analysis.
-   **Interactive Mechanics**: Built-in buzzer system, round timers, and scoring logic for a multi-round competition.
-   **Centralized State**: Uses `zustand` for high-performance state management across all views.
-   **Polished UI/UX**: Responsive design powered by `shadcn/ui` and smooth animations via `framer-motion` and `canvas-confetti`.
-   **Multimedia Integration**: Integrated sound effects system for immersive gameplay.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **State Management**: Zustand
-   **Animations**: Framer Motion
-   **Database/Backend**: Supabase (PostgreSQL)
-   **Desktop**: Tauri 2
-   **Components**: Base UI / shadcn/ui

## 📁 Project Structure

The project has been organized into a clean, documentation-first structure:

-   `docs/`: Comprehensive project documentation, including analysis reports, design details, and functional assessments.
-   `docs/resources/`: Reference materials, including the original program outlines (PDF), site descriptions, and Word documents.
-   `src/app/`: Application routing and page-level components.
-   `src/components/`: Reusable UI components and specialized game views (Host, Scoreboard, etc.).
-   `src/store/`: Zustand stores for game engine and state management.
-   `src/lib/`: Shared utilities, constants, and sound definitions.
-   `supabase/`: Database schema definitions (`SUPABASE_SCHEMA.sql`).
-   `public/`: Static assets and media.

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Rust toolchain (for Tauri desktop build)
- A Supabase project (for live data syncing)

### Installation (Web App)

1. **Clone the repository.**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env.local` file in the root and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) to view the application.

### Desktop App (Tauri)

1. Follow web app setup steps above.
2. **Run desktop development build**:
   ```bash
   npm run tauri:dev
   ```
3. **Build for distribution**:
   ```bash
   npm run tauri:build
   ```

### Running Tests
```bash
npm test           # Run once
npm run test:watch # Watch mode
npm run test:coverage # With coverage report
```

## 📖 Documentation

- [**Host User Guide**](docs/public/HOST_GUIDE.md): Master the game controls and shortcuts.
- [**Technical Overview**](docs/public/TECHNICAL_OVERVIEW.md): Architecture and sync engine details.
- [Functional Assessment](docs/FUNCTIONAL_ASSESSMENT.md)
- [UI/UX Overhaul Plan](docs/UI_UX_OVERHAUL_PLAN.md)
