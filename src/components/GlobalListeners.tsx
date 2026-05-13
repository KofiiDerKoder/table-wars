/**
 * TABLE WARS! - Global Event Listeners
 * 
 * This headless component orchestrates global application behaviors:
 * 1. Global Keyboard Shortcuts (Master Shortcuts for the Host)
 * 2. Background Timer Interval (The countdown clock)
 * 3. Sound Effect Triggers
 * 
 * Last Updated: May 13, 2026
 */

'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { SoundEngine } from '@/lib/sounds';
import { useRouter } from 'next/navigation';

export function GlobalListeners() {
  const router = useRouter();

  // --- Store Selectors ---
  const timer = useGameStore(s => s.timer);
  const currentRound = useGameStore(s => s.currentRound);
  
  // --- Store Actions ---
  const revealContent = useGameStore(s => s.revealContent);
  const nextQuestion = useGameStore(s => s.nextQuestion);
  const nextTasteItem = useGameStore(s => s.nextTasteItem);
  const setProjectorMode = useGameStore(s => s.setProjectorMode);
  const buzzIn = useGameStore(s => s.buzzIn);
  const clearBuzz = useGameStore(s => s.clearBuzz);
  const setView = useGameStore(s => s.setView);
  const toggleTimer = useGameStore(s => s.toggleTimer);
  const startTimer = useGameStore(s => s.startTimer);
  const stopTimer = useGameStore(s => s.stopTimer);

  /**
   * TIMER TICK ORCHESTRATION
   * Handles the 1-second interval for the countdown clock.
   * Updates are pushed directly to the store.
   */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer.isActive && timer.remaining > 0) {
      interval = setInterval(() => {
        // Use getState() for the tick to ensure we have the absolute latest value
        useGameStore.getState().tickTimer();
      }, 1000);
    } else if (timer.isActive && timer.remaining === 0) {
      // Auto-stop when reaching zero
      useGameStore.setState({ timer: { ...timer, isActive: false } });
    }
    return () => clearInterval(interval);
  }, [timer.isActive, timer.remaining]);

  /**
   * ROUND TRANSITION LOGIC
   * Automatically resets/starts the timer when the round changes
   * to provide a smooth host experience.
   */
  useEffect(() => {
    const timerDelay = setTimeout(() => {
      // Standard round duration: 5 minutes
      startTimer(300);
    }, 2000); 
    return () => clearTimeout(timerDelay);
  }, [currentRound, startTimer]);

  /**
   * GLOBAL KEYBOARD SHORTCUTS
   * These shortcuts are active across all views as long as an input isn't focused.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Defensive check: Don't trigger shortcuts if user is typing in a form field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const s = useGameStore.getState();

      switch (e.key) {
        // --- Navigation (1-5) ---
        case '1': setView('setup'); break;
        case '2': setView('host'); break;
        case '3': setView('scoreboard'); break;
        case '4': setView('team'); break;
        case '5': setView('results'); break;
        
        // --- Projector Modes ---
        case 'l': case 'L': setProjectorMode('logo'); break;
        case 'b': case 'B': setProjectorMode('black'); break;
        case 's': case 'S': setProjectorMode('scoreboard'); break;
        case 'a': case 'A': setProjectorMode('announcement'); break;
        case 'i': case 'I': setProjectorMode('intro'); break;

        // --- Core Game Actions ---
        case ' ':
          e.preventDefault(); // Prevent page scroll
          if (s.quiz.buzzedTeamId) {
            clearBuzz();
          } else {
            revealContent();
          }
          break;
        case 'Escape':
          if (s.quiz.buzzedTeamId) {
            clearBuzz();
          } else {
            setProjectorMode('logo');
          }
          break;
        case 't': case 'T':
          toggleTimer();
          break;
        case 'ArrowRight':
          // Progression shortcuts
          if (s.currentRound === 1 || s.currentRound === 5) {
            stopTimer();
            nextQuestion();
          }
          if (s.currentRound === 4) nextTasteItem();
          break;
      }

      // --- Quick Buzz-In (Digits 1-8) ---
      // Allows the host to manually trigger a buzz for a team by index
      if (/^[1-8]$/.test(e.key)) {
        const teamIdx = parseInt(e.key) - 1;
        if (s.teams[teamIdx] && (s.currentRound === 1 || s.currentRound === 5)) {
          buzzIn(s.teams[teamIdx].id);
          SoundEngine.playBuzzer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setView, setProjectorMode, clearBuzz, revealContent, toggleTimer, stopTimer, nextQuestion, nextTasteItem, buzzIn]);

  return null;
}
