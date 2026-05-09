'use client';

import { useGameStore } from '@/store/useGameStore';
import { SetupView } from '@/components/views/SetupView';
import { HostPanel } from '@/components/views/HostPanel';
import { LiveScoreboard } from '@/components/views/LiveScoreboard';
import { TeamView } from '@/components/views/TeamView';
import { ResultsView } from '@/components/views/ResultsView';
import { LandingScreen } from '@/components/views/LandingScreen';
import { useEffect, useState } from 'react';

export default function GamePage() {
  const { currentView, setView } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!hasStarted) {
    return <LandingScreen onStart={() => setHasStarted(true)} />;
  }

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
