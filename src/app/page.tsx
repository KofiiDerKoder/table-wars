/**
 * TABLE WARS! - Main View Router
 * 
 * This is the primary entry point for the application. It acts as a 
 * dynamic router, switching between different "Views" based on the
 * global game state.
 * 
 * Last Updated: May 13, 2026
 */

'use client';

import { useGameStore } from '@/store/useGameStore';
import { SetupView } from '@/components/views/SetupView';
import { HostPanel } from '@/components/views/HostPanel';
import { LiveScoreboard } from '@/components/views/LiveScoreboard';
import { TeamView } from '@/components/views/TeamView';
import { ResultsView } from '@/components/views/ResultsView';
import { LandingScreen } from '@/components/views/LandingScreen';
import { useState, useEffect } from 'react';

export default function GamePage() {
  const { currentView } = useGameStore();
  const [hasStarted, setHasStarted] = useState(false);
  const [mounted, setMounted] = useState(false);

  /**
   * HYDRATION & PERSISTENCE CHECK
   * We wait for mount to avoid hydration mismatch (SSR vs CSR).
   * We also check localStorage to see if the user was already in a game.
   */
  useEffect(() => {
    setMounted(true);
    const started = localStorage.getItem('tablewars-started');
    if (started === 'true') {
      setHasStarted(true);
    }
  }, []);

  const handleStart = () => {
    setHasStarted(true);
    localStorage.setItem('tablewars-started', 'true');
  };

  // Prevent hydration flicker
  if (!mounted) return null;

  // Show landing gate if game hasn't "started" in this browser
  if (!hasStarted) {
    return <LandingScreen onStart={handleStart} />;
  }

  /**
   * VIEW ROUTING LOGIC
   * The active screen is determined entirely by the 'currentView' in useGameStore.
   */
  switch (currentView) {
    case 'setup':
      return <SetupView />;
    case 'host':
      return <HostPanel />;
    case 'scoreboard':
      return <LiveScoreboard />;
    case 'team':
      return <TeamView />;
    case 'results':
      return <ResultsView />;
    default:
      return <SetupView />;
  }
}