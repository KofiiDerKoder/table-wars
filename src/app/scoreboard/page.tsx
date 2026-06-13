'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useRouter } from 'next/navigation';

export default function ScoreboardRedirect() {
  const setView = useGameStore(s => s.setView);
  const router = useRouter();

  useEffect(() => {
    setView('scoreboard');
    router.replace('/');
  }, [setView, router]);

  return null;
}
