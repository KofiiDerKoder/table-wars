'use client';

import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { SoundEngine } from '@/lib/sounds';
import { useRouter } from 'next/navigation';

export function GlobalListeners() {
  const router = useRouter();

  // Selector for state values
  const timer = useGameStore(s => s.timer);
  const currentRound = useGameStore(s => s.currentRound);
  
  // Actions (stable)
  const revealContent = useGameStore(s => s.revealContent);
  const nextQuestion = useGameStore(s => s.nextQuestion);
  const nextTasteItem = useGameStore(s => s.nextTasteItem);
  const setProjectorMode = useGameStore(s => s.setProjectorMode);
  const buzzIn = useGameStore(s => s.buzzIn);
  const clearBuzz = useGameStore(s => s.clearBuzz);
  const setView = useGameStore(s => s.setView);
  const toggleTimer = useGameStore.getState().toggleTimer;
  const startTimer = useGameStore.getState().startTimer;

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer.isActive && timer.remaining > 0) {
      interval = setInterval(() => {
        useGameStore.getState().tickTimer();
      }, 1000);
    } else if (timer.isActive && timer.remaining === 0) {
      useGameStore.setState({ timer: { ...timer, isActive: false } });
    }
    return () => clearInterval(interval);
  }, [timer.isActive, timer.remaining]);

  // Auto-Start Timer on Round Change
  useEffect(() => {
    const timerDelay = setTimeout(() => {
      startTimer(300);
    }, 2000); 
    return () => clearTimeout(timerDelay);
  }, [currentRound, startTimer]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const s = useGameStore.getState();

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          revealContent();
          break;
        case 'ArrowRight':
          if (s.currentRound === 1 || s.currentRound === 5) {
            const stopTimer = useGameStore.getState().stopTimer;
            stopTimer();
            nextQuestion();
          }
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
  }, [revealContent, nextQuestion, nextTasteItem, setProjectorMode, setView, router, clearBuzz, buzzIn]);

  return null;
}
