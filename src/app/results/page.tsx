'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useRouter } from 'next/navigation';

export default function ResultsRedirect() {
  const setView = useGameStore(s => s.setView);
  const router = useRouter();

  useEffect(() => {
    setView('results');
    router.replace('/');
  }, [setView, router]);

  return null;
}
