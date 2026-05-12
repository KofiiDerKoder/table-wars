'use client';

import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Hash, Zap, ChevronRight, ChefHat } from 'lucide-react';
import { useState } from 'react';
import { SoundEngine } from '@/lib/sounds';
import { clsx } from 'clsx';

export function TeamView() {
  const teams = useGameStore(s => s.teams);
  const quiz = useGameStore(s => s.quiz);
  const currentRound = useGameStore(s => s.currentRound);
  const buzzIn = useGameStore(s => s.buzzIn);
  const session = useGameStore(s => s.session);
  const setView = useGameStore(s => s.setView);
  const competitionName = useGameStore(s => s.competitionName);
  
  const [localSelectedTeamId, setLocalSelectedTeamId] = useState<string | null>(null);

  const effectiveTeamId = session?.joinedTeamId || localSelectedTeamId;
  const team = teams.find(t => t.id === effectiveTeamId);

  const handleSelectTeam = (id: string) => {
    if (session) {
      useGameStore.setState({ session: { ...session, joinedTeamId: id } });
    }
    setLocalSelectedTeamId(id);
  };

  const handleBuzz = () => {
    if (!effectiveTeamId || quiz.buzzedTeamId) return;
    buzzIn(effectiveTeamId);
    SoundEngine.playBuzzer();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  };

  if (!effectiveTeamId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center justify-center font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="mb-12 text-center">
            <Trophy className="mx-auto text-primary mb-6 w-16 h-16" />
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-2">
              {competitionName.split(' ').map((word, i) => (
                <span key={i} className={i === competitionName.split(' ').length - 1 ? "text-primary" : ""}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-sm">Select Your Team</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map(t => (
              <Button
                key={t.id}
                onClick={() => handleSelectTeam(t.id)}
                className="h-20 text-xl font-black bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-primary/50 transition-all group flex items-center justify-between px-6 rounded-2xl border-2"
                style={{ borderLeftWidth: '12px', borderLeftColor: t.color }}
              >
                <span>{t.name.toUpperCase()}</span>
                <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </Button>
            ))}
          </div>

          {teams.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[40px]">
              <p className="text-slate-500 italic mb-4 font-medium text-lg">Waiting for host to configure teams...</p>
              {session && (
                <Badge variant="outline" className="font-mono text-lg py-1 px-4 border-slate-700 text-slate-400">
                  SESSION: {session.code}
                </Badge>
              )}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  if (!team) return null;

  const isBuzzed = quiz.buzzedTeamId === team.id;
  const someoneElseBuzzed = quiz.buzzedTeamId && quiz.buzzedTeamId !== team.id;

  const handleSwitchTeam = () => {
    if (session) {
      useGameStore.setState({ session: { ...session, joinedTeamId: undefined } });
    }
    setLocalSelectedTeamId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <header className="px-6 md:px-12 py-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-5 h-5 rounded-full ring-4 ring-slate-800/50" style={{ backgroundColor: team.color }} />
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase leading-none">{team.name}</h2>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Active Team Device</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {session && (
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Connected</p>
              <p className="text-xs font-mono text-primary font-bold">{session.code}</p>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleSwitchTeam} className="border-slate-800 text-slate-400 hover:text-white font-black text-[10px] h-8 px-3 rounded-lg">
            SWITCH
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Stats Sidebar/Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <Card className="bg-slate-900 border-slate-800 border-2 rounded-[32px] overflow-hidden text-white shadow-2xl">
                <CardContent className="p-8">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Total Score</p>
                  <p className="text-6xl font-black tabular-nums">{team.score}</p>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mt-2">Points</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800 border-2 rounded-[32px] overflow-hidden text-white shadow-2xl">
                <CardContent className="p-8">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Current Rank</p>
                  <p className="text-6xl font-black tabular-nums">#{team.rank}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Overall</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900 border-slate-800 border-2 rounded-[32px] overflow-hidden text-white">
              <CardHeader className="p-6 border-b border-slate-800 pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Round History</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(r => (
                    <div key={r} className={clsx(
                      "flex items-center justify-between p-3 rounded-xl border transition-all",
                      currentRound === r ? "bg-primary/10 border-primary/30" : "bg-slate-950/50 border-slate-800"
                    )}>
                      <div className="flex items-center gap-3">
                        <span className={clsx("w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black", currentRound === r ? "bg-primary text-white" : "bg-slate-800 text-slate-500")}>
                          {r}
                        </span>
                        <span className={clsx("font-bold text-sm uppercase tracking-wide", currentRound === r ? "text-white" : "text-slate-500")}>
                          Round {r}
                        </span>
                      </div>
                      <span className={clsx("font-black tabular-nums", currentRound === r ? "text-primary" : "text-slate-400")}>
                        {team.roundScores[r] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Area */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center py-8">
            <AnimatePresence mode="wait">
              {(currentRound === 1 || currentRound === 5) ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="mb-8 text-center">
                    <h3 className="text-2xl md:text-4xl font-black tracking-tight uppercase mb-2">Quiz Mode Active</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Ready your fingers on the buzzer</p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.92, rotate: isBuzzed ? 0 : [0, -1, 1, 0] }}
                    disabled={!!someoneElseBuzzed}
                    onClick={handleBuzz}
                    className={clsx(
                      "w-full max-w-sm sm:max-w-md aspect-square rounded-[60px] sm:rounded-[80px] border-[12px] sm:border-[20px] flex flex-col items-center justify-center transition-all shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative group overflow-hidden",
                      isBuzzed ? "bg-primary border-primary-foreground/20" : 
                      someoneElseBuzzed ? "bg-slate-900 border-slate-950 grayscale opacity-50 cursor-not-allowed" :
                      "bg-red-600 border-red-800 active:bg-red-500 hover:border-red-700"
                    )}
                  >
                    {/* Glowing effect inside button */}
                    {!someoneElseBuzzed && (
                      <div className={clsx(
                        "absolute inset-0 opacity-20 bg-gradient-to-b from-white to-transparent transition-opacity",
                        isBuzzed ? "opacity-40" : "group-hover:opacity-30"
                      )} />
                    )}

                    <Zap size={80} className={clsx(
                      "mb-4 sm:mb-6 transition-transform duration-500", 
                      isBuzzed ? "text-white scale-125 animate-pulse" : "text-white/90 group-hover:scale-110"
                    )} />
                    
                    <span className="text-4xl sm:text-6xl font-black tracking-tighter uppercase">
                      {isBuzzed ? "IN!" : someoneElseBuzzed ? "LOCK" : "BUZZ"}
                    </span>
                    
                    {isBuzzed && (
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1.2], opacity: [0, 0.5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 rounded-full border-[10px] border-white/30" 
                      />
                    )}
                  </motion.button>
                  
                  <div className="mt-12 text-center space-y-4">
                    <p className={clsx(
                      "text-xl sm:text-2xl font-black uppercase tracking-[0.1em] transition-colors",
                      isBuzzed ? "text-primary animate-pulse" : someoneElseBuzzed ? "text-slate-700" : "text-slate-400"
                    )}>
                      {isBuzzed ? "Waiting for Host..." : someoneElseBuzzed ? "Someone else was faster!" : "Ready to Buzz In"}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <div className={clsx("w-2 h-2 rounded-full", isBuzzed ? "bg-primary animate-ping" : "bg-slate-800")} />
                      <div className={clsx("w-2 h-2 rounded-full", isBuzzed ? "bg-primary animate-ping delay-75" : "bg-slate-800")} />
                      <div className={clsx("w-2 h-2 rounded-full", isBuzzed ? "bg-primary animate-ping delay-150" : "bg-slate-800")} />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 px-12 border-2 border-dashed border-slate-900 rounded-[60px]"
                >
                  <ChefHat className="mx-auto text-slate-800 mb-6" size={64} />
                  <h3 className="text-3xl font-black uppercase tracking-tight text-slate-700 mb-2">Activity in Progress</h3>
                  <p className="text-slate-600 font-bold uppercase tracking-widest text-xs max-w-md mx-auto">
                    The host is currently running a manual scoring round. Watch the main screen for instructions!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      
      {/* Footer / Connection Status */}
      <footer className="p-6 text-center border-t border-slate-900 bg-slate-950/80 backdrop-blur-sm">
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">
          Boarding House Table Wars • v2.0 Production Sync
        </p>
      </footer>
    </div>
  );
}
