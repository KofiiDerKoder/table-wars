# Table Wars!

Table Wars! is an interactive, multi-view web application built for managing and displaying live competition data.

## Features

- **Multi-View Interface**: Dynamically switch between different game states:
  - **Landing/Setup**: Game initialization and configuration.
  - **Host**: Administrative control panel.
  - **Live Scoreboard**: Real-time display of competition progress.
  - **Team View**: Interface for individual team management.
  - **Results**: Post-competition summary and analysis.
- **State Management**: Uses `zustand` for centralized and efficient game state management across views.
- **Interactive UI**: Powered by `framer-motion` for smooth transitions and `shadcn/ui` components for a polished interface.
- **Multimedia**: Integrated sound effects and visual feedback (confetti) for engagement.

## Technologies

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion, canvas-confetti
- **Components**: shadcn/ui

## Getting Started

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

- `src/app/`: Application routing and main page components.
- `src/components/`: Reusable UI components and specific game views.
- `src/store/`: Zustand stores for game state management.
- `src/lib/`: Utility functions and constants.
- `public/`: Static assets.

## Deployment

The project is configured for deployment on the Vercel Platform.
