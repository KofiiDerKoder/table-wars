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
  
  // Actions (stable hooks)
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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const s = useGameStore.getState();

      switch (e.key) {
        // Navigation Shortcuts
        case '1': setView('setup'); break;
        case '2': setView('host'); break;
        case '3': setView('scoreboard'); break;
        case '4': setView('team'); break;
        case '5': setView('results'); break;
        
        // Mode Shortcuts
        case 'l': case 'L': setProjectorMode('logo'); break;
        case 'b': case 'B': setProjectorMode('black'); break;
        case 's': case 'S': setProjectorMode('scoreboard'); break;
        case 'a': case 'A': setProjectorMode('announcement'); break;
        case 'i': case 'I': setProjectorMode('intro'); break;

        // Action Shortcuts
        case ' ':
          e.preventDefault();
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
          if (s.currentRound === 1 || s.currentRound === 5) {
            stopTimer();
            nextQuestion();
          }
          if (s.currentRound === 4) nextTasteItem();
          break;
      }

      // Quick Buzz (Digit 1-8)
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
