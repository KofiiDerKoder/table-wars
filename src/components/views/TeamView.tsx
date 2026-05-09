'use client';

import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Hash, Zap } from 'lucide-react';
import { useState } from 'react';
import { SoundEngine } from '@/lib/sounds';
import { clsx } from 'clsx';

export function TeamView() {
  const teams = useGameStore(s => s.teams);
  const quiz = useGameStore(s => s.quiz);
  const currentRound = useGameStore(s => s.currentRound);
  const buzzIn = useGameStore(s => s.buzzIn);
  
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const team = teams.find(t => t.id === selectedTeamId);

  const handleBuzz = () => {
    if (!selectedTeamId || quiz.buzzedTeamId) return;
    buzzIn(selectedTeamId);
    SoundEngine.playBuzzer();
    if (navigator.vibrate) navigator.vibrate(200);
  };

  if (!selectedTeamId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-black mb-8 tracking-tighter text-center">SELECT YOUR <span className="text-blue-600">TEAM</span></h1>
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
          {teams.map(t => (
            <Button
              key={t.id}
              onClick={() => setSelectedTeamId(t.id)}
              className="h-16 text-xl font-black border-2 bg-slate-900 hover:bg-slate-800 transition-all"
              style={{ borderColor: t.color + '44', borderLeftWidth: '8px', borderLeftColor: t.color }}
            >
              {t.name.toUpperCase()}
            </Button>
          ))}
          {teams.length === 0 && <p className="text-slate-500 text-center italic">Waiting for host to add teams...</p>}
        </div>
      </div>
    );
  }

  if (!team) return null;

  const isBuzzed = quiz.buzzedTeamId === team.id;
  const someoneElseBuzzed = quiz.buzzedTeamId && quiz.buzzedTeamId !== team.id;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <header className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: team.color }} />
          <h2 className="text-xl font-black tracking-tight">{team.name.toUpperCase()}</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setSelectedTeamId(null)} className="text-slate-500 text-xs">SWITCH</Button>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-900 border-slate-800 overflow-hidden relative text-white">
             <div className="absolute top-0 right-0 p-2 opacity-10"><Trophy size={48} /></div>
             <CardContent className="p-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Score</p>
                <p className="text-4xl font-black text-white">{team.score} <span className="text-sm text-slate-500">PTS</span></p>
             </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 overflow-hidden relative text-white">
             <div className="absolute top-0 right-0 p-2 opacity-10"><Hash size={48} /></div>
             <CardContent className="p-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rank</p>
                <p className="text-4xl font-black text-white">#{team.rank}</p>
             </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900 border-slate-800 text-white">
           <CardHeader className="p-4 border-b border-slate-800">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Round Breakdown</CardTitle>
           </CardHeader>
           <CardContent className="p-4 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <div key={r} className="flex flex-col items-center gap-1">
                   <div className={clsx(
                     "w-full aspect-square rounded-lg flex items-center justify-center font-black text-xs border transition-colors",
                     currentRound === r ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-slate-950 border-slate-800 text-slate-600"
                   )}>
                      R{r}
                   </div>
                   <span className="text-[10px] font-bold text-slate-500">{team.roundScores[r] || 0}</span>
                </div>
              ))}
           </CardContent>
        </Card>

        {(currentRound === 1 || currentRound === 5) && (
          <div className="flex-1 flex flex-col justify-center py-8">
             <motion.button
               whileTap={{ scale: 0.95 }}
               disabled={!!quiz.buzzedTeamId}
               onClick={handleBuzz}
               className={clsx(
                 "w-full aspect-square rounded-full border-[12px] flex flex-col items-center justify-center transition-all shadow-2xl relative",
                 isBuzzed ? "bg-blue-600 border-blue-400 shadow-blue-500/50" : 
                 someoneElseBuzzed ? "bg-slate-800 border-slate-900 grayscale" :
                 "bg-red-600 border-red-800 shadow-red-900/50 active:bg-red-500"
               )}
             >
                <Zap size={64} className={clsx("mb-2", isBuzzed ? "text-white animate-pulse" : "text-white/80")} />
                <span className="text-3xl font-black tracking-tighter">
                  {isBuzzed ? "BUZZED!" : someoneElseBuzzed ? "LOCKED" : "BUZZ IN"}
                </span>
                
                {!quiz.buzzedTeamId && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-4 border-red-400/30" 
                  />
                )}
             </motion.button>
             <p className="text-center mt-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
               {isBuzzed ? "Wait for host to adjudicate" : someoneElseBuzzed ? "Someone else was faster!" : "Press as fast as you can!"}
             </p>
          </div>
        )}
      </main>
    </div>
  );
}
