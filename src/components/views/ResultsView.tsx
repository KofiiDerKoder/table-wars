'use client';

import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Heart, RotateCcw, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { clsx } from 'clsx';

export function ResultsView() {
  const teams = useGameStore(s => s.teams);
  const resetAll = useGameStore(s => s.resetAll);
  
  const [revealIndex, setRevealIndex] = useState(-1);
  const [hasVoted, setHasVoted] = useState(false);

  const sortedTeams = [...teams].sort((a, b) => a.score - b.score);

  const startReveal = () => {
    setRevealIndex(0);
  };

  useEffect(() => {
    if (revealIndex >= 0 && revealIndex < sortedTeams.length) {
      const timer = setTimeout(() => {
        setRevealIndex(prev => prev + 1);
        if (revealIndex === sortedTeams.length - 1) {
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#2563eb', '#f59e0b', '#ffffff'] });
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [revealIndex, sortedTeams.length]);

  return (
    <div className="min-h-screen bg-muted/30 p-12 flex flex-col items-center font-sans">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1 className="text-7xl font-black tracking-tighter mb-4 uppercase text-foreground">
          Competition <span className="text-primary">Results</span>
        </h1>
        <p className="text-xl text-muted-foreground font-bold tracking-widest uppercase">The moment of truth has arrived</p>
      </motion.div>

      {revealIndex === -1 ? (
        <Button onClick={startReveal} size="lg" className="h-24 px-16 text-3xl font-black uppercase tracking-widest shadow-xl rounded-full">
          REVEAL STANDINGS
        </Button>
      ) : (
        <div className="max-w-4xl w-full space-y-4">
          <AnimatePresence>
            {sortedTeams.slice(0, revealIndex + 1).reverse().map((team) => {
              const actualRank = sortedTeams.length - sortedTeams.indexOf(team);
              const isWinner = actualRank === 1;

              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: isWinner ? 1.05 : 1 }}
                  className={clsx(
                    "p-8 rounded-3xl border flex items-center gap-8 transition-all shadow-sm",
                    isWinner ? "bg-white border-primary shadow-2xl" : "bg-white border-border"
                  )}
                >
                  <div className="w-20 h-20 flex items-center justify-center shrink-0">
                    {isWinner ? <Crown size={48} className="text-amber-500" /> : <span className="text-5xl font-black text-slate-200 tabular-nums">{actualRank}</span>}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-4xl font-black uppercase tracking-tight">{team.name}</h3>
                      {isWinner && <Badge className="bg-primary uppercase font-black text-xs py-1">CHAMPION</Badge>}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-7xl font-black tabular-nums leading-none">{team.score}</p>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-2">Total Points</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {revealIndex >= sortedTeams.length && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-16 space-y-12">
              <div className="bg-white border border-border p-10 rounded-3xl text-center shadow-sm">
                 <Heart className="text-red-500 mx-auto mb-6" size={48} />
                 <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">Sportsmanship Vote</h2>
                 {!hasVoted ? (
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {teams.map(t => <Button key={t.id} variant="outline" onClick={() => setHasVoted(true)}>{t.name}</Button>)}
                   </div>
                 ) : <p className="text-primary font-bold uppercase tracking-widest">Votes counted! Thank you.</p>}
              </div>

              <div className="flex justify-center gap-6 pb-24">
                 <Button variant="outline" onClick={() => resetAll()}><RotateCcw className="mr-2" size={16} /> RESET</Button>
                 <Button className="font-black px-8"><Award className="mr-2" size={16} /> PRINT CERTIFICATES</Button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
