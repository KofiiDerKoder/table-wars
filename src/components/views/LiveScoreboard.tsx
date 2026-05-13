/**
 * TABLE WARS! - Live Scoreboard View
 * 
 * The audience-facing view designed for projection. Features real-time 
 * leaderboard, timer display, and dynamic projector mode overlays.
 * 
 * Last Updated: May 13, 2026
 */

'use client';

import { useGameStore } from '@/store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, MessageSquare, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { clsx } from 'clsx';

/**
 * Renders the scoreboard. Switches layout/content based on `projectorMode`
 * set in the global game store.
 */
export function LiveScoreboard() {
  // --- Global Store State ---
  const teams = useGameStore(s => s.teams);
  const competitionName = useGameStore(s => s.competitionName);
  const currentRound = useGameStore(s => s.currentRound);
  const projectorMode = useGameStore(s => s.projectorMode);
  const announcementText = useGameStore(s => s.announcementText);
  const timer = useGameStore(s => s.timer);
  const introTeamId = useGameStore(s => s.introTeamId);
  const quiz = useGameStore(s => s.quiz);
  const tasteTest = useGameStore(s => s.tasteTest);

  // --- Derived State ---
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...teams.map(t => t.score), 10);

  const currentQuestion = quiz.questions[quiz.currentIndex];
  const currentTasteItem = tasteTest.items[tasteTest.currentIndex];

  // --- Projector Mode Handling ---

  // Black screen mode
  if (projectorMode === 'black') {
    return <div className="fixed inset-0 bg-background z-[100]" />;
  }

  // Logo mode
  if (projectorMode === 'logo') {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100] p-4">
        <motion.h1
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-foreground text-center uppercase"
        >
          {competitionName.split(' ').map((word, i) => (
            <span key={i} className={i === competitionName.split(' ').length - 1 ? "text-primary ml-4" : ""}>{word} </span>
          ))}
        </motion.h1>
      </div>
    );
  }

  // Intro mode (highlights specific team)
  if (projectorMode === 'intro') {
    const introTeam = teams.find(t => t.id === introTeamId);
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100] p-4 md:p-12 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 md:space-y-12">
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-full border-4 border-slate-200" style={{ backgroundColor: introTeam?.color }} />
            <h2 className="text-xl md:text-4xl font-black text-muted-foreground tracking-[0.2em] md:tracking-[0.5em] uppercase">INTRODUCING</h2>
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-foreground uppercase">{introTeam?.name}</h1>
          </div>
          {introTeam?.chant && (
             <div className="max-w-4xl mx-auto py-6 md:py-12 px-6 md:px-20 bg-muted rounded-[30px] md:rounded-[60px]">
                <p className="text-lg md:text-2xl font-black text-primary uppercase tracking-widest mb-2 md:mb-4">Team Chant</p>
                <p className="text-2xl md:text-4xl lg:text-6xl font-black italic text-foreground leading-tight">"{introTeam.chant}"</p>
             </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Question/Taste Item Display (Conditional Overlay)
  const showQuestionOverlay = quiz.isRevealed && currentQuestion && (currentRound === 1 || currentRound === 5);
  const showTasteOverlay = tasteTest.isRevealed && currentTasteItem && currentRound === 4;

  return (
    <div className="min-h-screen bg-muted/50 p-4 md:p-12 text-foreground font-sans selection:bg-primary/20">

      {/* Announcement Banner Overlay */}
      <AnimatePresence>
        {projectorMode === 'announcement' && announcementText && (
          <motion.div 
            initial={{ y: -100 }} 
            animate={{ y: 0 }} 
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 bg-primary text-white py-6 md:py-8 z-50 overflow-hidden shadow-2xl flex items-center"
          >
            <div className="absolute left-10 z-10 bg-primary pr-8 shadow-[20px_0_20px_-10px_rgba(var(--primary),1)]">
              <MessageSquare size={40} className="md:w-12 md:h-12" />
            </div>

            <div className="flex whitespace-nowrap">
              <motion.div
                animate={{ x: [0, -1000] }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="flex gap-20 items-center px-10"
              >
                <span className="text-3xl md:text-6xl font-black uppercase tracking-[0.2em]">{announcementText}</span>
                <span className="text-3xl md:text-6xl font-black uppercase tracking-[0.2em]">{announcementText}</span>
                <span className="text-3xl md:text-6xl font-black uppercase tracking-[0.2em]">{announcementText}</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col h-full gap-6 md:gap-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <motion.div layout>
            <h2 className="text-sm md:text-xl font-bold text-muted-foreground tracking-widest uppercase">TABLE WARS COMPETITION</h2>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter">
               ROUND {currentRound}
            </h1>
          </motion.div>

          <div className="text-left md:text-right">
            <p className="text-xs md:text-sm font-bold uppercase tracking-widest mb-1 md:mb-2 text-muted-foreground">Time Remaining</p>
            <div className={clsx("text-5xl md:text-8xl font-black tabular-nums", timer.remaining <= 10 ? "text-red-600 animate-pulse" : "text-foreground")}>
              {Math.floor(timer.remaining / 60)}:{(timer.remaining % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
...