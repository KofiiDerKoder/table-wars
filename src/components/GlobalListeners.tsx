'use client';

import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { SoundEngine } from '@/lib/sounds';
import { useRouter } from 'next/navigation';

export function GlobalListeners() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Selector for state values
  const timer = useGameStore(s => s.timer);
  const currentRound = useGameStore(s => s.currentRound);
  const projectorMode = useGameStore(s => s.projectorMode);
  const teams = useGameStore(s => s.teams);

  // Ref pattern for keyboard handler to avoid stale closures
  const stateRef = useRef({ currentRound, projectorMode, teams, timer });
  stateRef.current = { currentRound, projectorMode, teams, timer };

  // Actions (stable)
  const tickTimer = useGameStore(s => s.tickTimer);
  const revealContent = useGameStore(s => s.revealContent);
  const nextQuestion = useGameStore(s => s.nextQuestion);
  const nextTasteItem = useGameStore(s => s.nextTasteItem);
  const setProjectorMode = useGameStore(s => s.setProjectorMode);
  const buzzIn = useGameStore(s => s.buzzIn);
  const clearBuzz = useGameStore(s => s.clearBuzz);
  const setView = useGameStore(s => s.setView);
  const toggleTimer = () => useGameStore.setState((prev) => ({ timer: { ...prev.timer, isActive: !prev.timer.isActive } }));

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer Tick
  useEffect(() => {
    if (!mounted) return;
    
    let interval: NodeJS.Timeout;
    if (timer.isActive && timer.remaining > 0) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    } else if (timer.isActive && timer.remaining === 0) {
      // Auto-stop when timer finishes
      useGameStore.setState({ timer: { ...timer, isActive: false } });
    }
    return () => clearInterval(interval);
  }, [mounted, timer.isActive, timer.remaining, tickTimer]);

  // Auto-Start Timer on Round Change
  useEffect(() => {
    if (!mounted) return;
    const startTimer = useGameStore.getState().startTimer;
    // Auto-start for 300s (5 mins) when a new round starts
    const timerDelay = setTimeout(() => {
      startTimer(300);
    }, 2000); // 2 second delay before timer kicks in
    return () => clearTimeout(timerDelay);
  }, [currentRound, mounted]);

  // Auto-Stop Timer on Question Advancement
  const handleQuestionChange = () => {
    const stopTimer = useGameStore.getState().stopTimer;
    stopTimer();
    nextQuestion();
  };

  // Audio cues
  useEffect(() => {
    if (!mounted || !timer.isActive) return;
    
    if (timer.remaining <= 10 && timer.remaining > 0) {
      SoundEngine.playTick();
    }
    if (timer.remaining === 0) {
      SoundEngine.playTimerPing();
    }
  }, [mounted, timer.remaining, timer.isActive]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const s = stateRef.current;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          revealContent();
          break;
        case 'ArrowRight':
          if (s.currentRound === 1 || s.currentRound === 5) handleQuestionChange();
          if (s.currentRound === 4) nextTasteItem();
          break;
        case 'KeyT':
          toggleTimer();
          break;
        case 'KeyB':
          setProjectorMode(s.projectorMode === 'black' ? 'scoreboard' : 'black');
          break;
        case 'KeyL':
          setProjectorMode(s.projectorMode === 'logo' ? 'scoreboard' : 'logo');
          break;
        case 'KeyS':
          setView('scoreboard');
          router.push('/scoreboard');
          break;
        case 'KeyH':
          setView('host');
          router.push('/host');
          break;
        case 'Escape':
          clearBuzz();
          break;
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
          const teamIdx = parseInt(e.key) - 1;
          if (s.teams[teamIdx] && (s.currentRound === 1 || s.currentRound === 5)) {
            buzzIn(s.teams[teamIdx].id);
            SoundEngine.playBuzzer();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mounted, revealContent, nextQuestion, nextTasteItem, setProjectorMode, setView, router, clearBuzz, buzzIn]);

  return null;
}
