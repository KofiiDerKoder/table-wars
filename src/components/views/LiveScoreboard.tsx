'use client';

import { useGameStore } from '@/store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

export function LiveScoreboard() {
  const teams = useGameStore(s => s.teams);
  useEffect(() => {
    console.log('Scoreboard teams updated:', teams);
  }, [teams]);
  const currentRound = useGameStore(s => s.currentRound);
  const projectorMode = useGameStore(s => s.projectorMode);
  useEffect(() => {
    console.log('Scoreboard mode changed to:', projectorMode);
  }, [projectorMode]);
  const announcementText = useGameStore(s => s.announcementText);
  const timer = useGameStore(s => s.timer);
  const quiz = useGameStore(s => s.quiz);
  const tasteTest = useGameStore(s => s.tasteTest);
  const introTeamId = useGameStore(s => s.introTeamId);

  const [showSplash, setShowSplash] = useState(false);
  const [splashText, setSplashText] = useState('');

  // Round Splash Logic
  useEffect(() => {
    setSplashText(`ROUND ${currentRound}`);
    setShowSplash(true);
    const splashTimer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(splashTimer);
  }, [currentRound]);

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...teams.map(t => t.score), 10);

  if (projectorMode === 'black') {
    return <div className="fixed inset-0 bg-background z-[100]" />;
  }

  if (projectorMode === 'logo') {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100] p-4">
        <motion.h1
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-foreground"
        >
          TABLE <span className="text-primary">WARS</span>
        </motion.h1>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-muted/50 p-4 md:p-12 text-foreground font-sans selection:bg-primary/20">
      
      <AnimatePresence>
        {projectorMode === 'announcement' && announcementText && (
          <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 bg-primary text-white py-4 md:py-6 px-4 md:px-12 z-50 flex items-center justify-center gap-4 shadow-xl"
          >
            <MessageSquare size={24} className="shrink-0 md:w-10 md:h-10" />
            <span className="text-xl md:text-4xl font-black uppercase tracking-widest">{announcementText}</span>
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

        <div className="flex-1 flex flex-col gap-4 md:gap-6 max-w-7xl mx-auto w-full relative">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-foreground">Current Standings</h2>
             <Badge variant="outline" className="text-sm md:text-base font-black px-4 py-1">
               {teams.length} Teams Competing
             </Badge>
          </div>
          <motion.div className="flex-1 flex flex-col gap-4 md:gap-6 w-full">
            <AnimatePresence mode="popLayout">
              {sortedTeams.map((team, idx) => (
                <motion.div
                  key={team.id}
                  layout
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={clsx(
                    "relative flex items-center gap-4 md:gap-8 p-4 md:p-8 rounded-2xl md:rounded-3xl transition-all border",
                    idx === 0 ? "bg-white border-primary/20 shadow-2xl scale-[1.01]" : "bg-white border-slate-100 shadow-lg"
                  )}
                >
                  <div className="w-12 h-12 md:w-20 md:h-20 flex items-center justify-center shrink-0">
                    {idx === 0 ? (
                      <Crown size={24} className="md:w-12 md:h-12 text-primary" />
                    ) : (
                      <div className="text-2xl md:text-5xl font-black text-slate-300 tabular-nums">
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1 md:space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl md:text-4xl font-black uppercase tracking-tight">{team.name}</h3>
                      <div className="flex gap-1 md:gap-2">
                        {[1, 2, 3, 4, 5].map(r => (
                          <div key={r} className={clsx("w-2 h-2 md:w-3 md:h-3 rounded-full", team.roundScores[r] ? "bg-primary" : "bg-slate-200")} />
                        ))}
                      </div>
                    </div>
                    <div className="h-2 md:h-4 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(team.score / maxScore) * 100}%` }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                    </div>
                  </div>

                  <div className="text-right min-w-[80px] md:min-w-[150px]">
                    <motion.div className="text-3xl md:text-7xl font-black tabular-nums leading-none">
                      {team.score}
                    </motion.div>
                    <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest mt-1 md:mt-2">Points</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
