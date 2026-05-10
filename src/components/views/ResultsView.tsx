'use client';

import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Heart, RotateCcw, Award, Printer, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function ResultsView() {
  const teams = useGameStore(s => s.teams);
  const resetAll = useGameStore(s => s.resetAll);
  const router = useRouter();
  
  const [revealIndex, setRevealIndex] = useState(-1);
  const [hasVoted, setHasVoted] = useState(false);
  const [tiebreakerActive, setTiebreakerActive] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const sortedTeams = [...teams].sort((a, b) => a.score - b.score);

  const exportResultsPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('results-content');
    if (element) {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'px', [canvas.width / 2, canvas.height / 2]);
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save('table-wars-results.pdf');
    }
    setIsExporting(false);
  };

  const detectTies = () => {
    if (teams.length < 2) return [];
    const highToLow = [...teams].sort((a, b) => b.score - a.score);
    const maxScore = highToLow[0].score;
    const winners = teams.filter(t => t.score === maxScore);
    return winners.length > 1 ? winners : [];
  };

  const ties = detectTies();

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
      <div id="results-content" className="w-full flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-7xl font-black tracking-tighter mb-4 uppercase text-foreground">
            Competition <span className="text-primary">Results</span>
          </h1>
          <p className="text-xl text-muted-foreground font-bold tracking-widest uppercase">The moment of truth has arrived</p>
        </motion.div>

        {revealIndex === -1 ? (
          <div className="flex flex-col items-center gap-6">
            <Button onClick={startReveal} size="lg" className="h-24 px-16 text-3xl font-black uppercase tracking-widest shadow-xl rounded-full">
              REVEAL STANDINGS
            </Button>
            {ties.length > 0 && (
              <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 px-4 py-2 text-sm font-black uppercase tracking-widest animate-pulse">
                ⚠️ Tie Detected for 1st Place!
              </Badge>
            )}
          </div>
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
                      {isWinner && ties.length === 0 ? <Crown size={48} className="text-amber-500" /> : <span className="text-5xl font-black text-slate-200 tabular-nums">{actualRank}</span>}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="text-4xl font-black uppercase tracking-tight">{team.name}</h3>
                        {isWinner && ties.length === 0 && <Badge className="bg-primary uppercase font-black text-xs py-1">CHAMPION</Badge>}
                        {isWinner && ties.length > 1 && <Badge variant="outline" className="text-red-500 border-red-200 uppercase font-black text-xs py-1">TIE</Badge>}
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
          </div>
        )}
      </div>

      {revealIndex >= sortedTeams.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-16 space-y-12 max-w-4xl w-full">
          {ties.length > 1 && (
            <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl text-center shadow-sm">
                <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter text-amber-900">Tiebreaker Round Required</h2>
                <p className="text-amber-700 mb-6 font-medium">The following teams are tied for 1st place:</p>
                <div className="flex justify-center gap-4 mb-8">
                  {ties.map(t => (
                    <Badge key={t.id} className="text-lg py-2 px-4" style={{ backgroundColor: t.color }}>{t.name}</Badge>
                  ))}
                </div>
                <Button variant="default" className="bg-amber-600 hover:bg-amber-700 font-black uppercase tracking-widest" onClick={() => setTiebreakerActive(true)}>
                  Start Tiebreaker Question
                </Button>
            </div>
          )}

          <div className="bg-white border border-border p-10 rounded-3xl text-center shadow-sm">
              <Heart className="text-red-500 mx-auto mb-6" size={48} />
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">Sportsmanship Vote</h2>
              {!hasVoted ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {teams.map(t => <Button key={t.id} variant="outline" onClick={() => setHasVoted(true)}>{t.name}</Button>)}
                </div>
              ) : <p className="text-primary font-bold uppercase tracking-widest">Votes counted! Thank you.</p>}
          </div>

          <div className="flex flex-wrap justify-center gap-4 pb-24">
              <Button variant="outline" onClick={() => resetAll()} className="font-black uppercase tracking-widest"><RotateCcw className="mr-2" size={16} /> RESET</Button>
              <Button variant="outline" onClick={() => window.print()} className="font-black uppercase tracking-widest"><Printer className="mr-2" size={16} /> PRINT</Button>
              <Button variant="outline" onClick={exportResultsPDF} disabled={isExporting} className="font-black uppercase tracking-widest"><Download className="mr-2" size={16} /> {isExporting ? 'EXPORTING...' : 'EXPORT PDF'}</Button>
              <Button className="font-black px-8 uppercase tracking-widest" onClick={() => router.push('/certificates')}><Award className="mr-2" size={16} /> MANAGE CERTIFICATES</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
