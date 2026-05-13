/**
 * TABLE WARS! - Results View
 * 
 * The final screen shown after a competition concludes. Handles ranking,
 * ties (sudden death), celebratory confetti, and export functionality (PDF).
 * 
 * Last Updated: May 13, 2026
 */

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
  // --- Global Store State ---
  const teams = useGameStore(s => s.teams);
  const resetAll = useGameStore(s => s.resetAll);
  const competitionName = useGameStore(s => s.competitionName);
  
  const router = useRouter();
  
  // --- Local UI State ---
  const [revealIndex, setRevealIndex] = useState(-1);
  const [hasVoted, setHasVoted] = useState(false);
  const [tiebreakerActive, setTiebreakerActive] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const sortedTeams = [...teams].sort((a, b) => a.score - b.score);

  /** 
   * Captures the hidden PDF report div as a canvas and triggers a download.
   */
  const exportResultsPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('pdf-report-layout');
    if (element) {
      element.style.display = 'block';
      const canvas = await html2canvas(element, { scale: 2 });
      element.style.display = 'none';
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'px', [canvas.width / 2, canvas.height / 2]);
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${competitionName.toLowerCase().replace(/\s+/g, '-')}-results.pdf`);
    }
    setIsExporting(false);
  };

  /** Identifies teams tied for the current highest score */
  const detectTies = () => {
    if (teams.length < 2) return [];
    const highToLow = [...teams].sort((a, b) => b.score - a.score);
    const maxScore = highToLow[0].score;
    const winners = teams.filter(t => t.score === maxScore);
    return winners.length > 1 ? winners : [];
  };

  const ties = detectTies();

  // --- Tiebreaker Logic ---
  if (tiebreakerActive && ties.length > 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-12 flex flex-col items-center justify-center font-sans">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-[40px] p-12 text-center shadow-2xl">
          <Badge className="bg-amber-500 text-black font-black mb-6 px-4 py-1 text-lg">SUDDEN DEATH TIEBREAKER</Badge>
          <h2 className="text-6xl font-black tracking-tighter mb-12 uppercase">Final Showdown</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {ties.map(team => (
              <div key={team.id} className={clsx(
                "p-8 rounded-3xl border-4 transition-all flex flex-col items-center gap-6",
                useGameStore.getState().quiz.buzzedTeamId === team.id ? "border-primary bg-primary/10 animate-pulse" : "border-slate-800 bg-slate-950/50"
              )}>
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg" style={{ backgroundColor: team.color }} />
                <h3 className="text-3xl font-black uppercase">{team.name}</h3>
                <div className="flex gap-2 w-full">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 font-black h-12"
                    onClick={() => {
                      useGameStore.getState().updateTeamScore(team.id, 1, 5);
                      setTiebreakerActive(false);
                      setRevealIndex(teams.length); // Stay on results
                    }}
                  >
                    WINNER (+1)
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-800">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-6">
              Host: Ask a sudden death question. First team to buzz wins.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="border-slate-700 text-slate-400 font-black uppercase" onClick={() => useGameStore.getState().clearBuzz()}>
                CLEAR BUZZ
              </Button>
              <Button variant="ghost" className="text-slate-600 font-black uppercase" onClick={() => setTiebreakerActive(false)}>
                CANCEL
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const startReveal = () => {
    setRevealIndex(0);
  };

  /** Reveal effect: sequentially reveal teams every 2s */
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
      {/* Hidden layout for PDF Export */}
      <div id="pdf-report-layout" className="hidden w-[800px] bg-white text-slate-900 p-16 font-sans">
        <div className="text-center mb-12 border-b-4 border-slate-900 pb-8">
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">{competitionName}</h1>
          <p className="text-xl font-bold text-slate-500 uppercase tracking-widest">Official Competition Results</p>
        </div>

        <table className="w-full mb-16">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="py-4 text-left font-black uppercase tracking-widest text-sm text-slate-400">Rank</th>
              <th className="py-4 text-left font-black uppercase tracking-widest text-sm text-slate-400">Team</th>
              <th className="py-4 text-right font-black uppercase tracking-widest text-sm text-slate-400">Total Score</th>
            </tr>
          </thead>
          <tbody>
            {[...sortedTeams].reverse().map((team, idx) => (
              <tr key={team.id} className="border-b border-slate-100">
                <td className="py-6 text-3xl font-black">{idx + 1}</td>
                <td className="py-6 flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: team.color }} />
                  <span className="text-2xl font-black uppercase">{team.name}</span>
                </td>
                <td className="py-6 text-right text-3xl font-black tabular-nums">{team.score}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-8 mb-16">
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Champion</p>
            <p className="text-2xl font-black uppercase">{[...sortedTeams].reverse()[0]?.name}</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Participants</p>
            <p className="text-2xl font-black uppercase">{teams.length} Teams</p>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generated on {new Date().toLocaleDateString()} • Boarding House Table Wars System</p>
        </div>
      </div>

      {/* Main Results View */}
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

      {/* Footer controls */}
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
