'use client';

import { useGameStore, ProjectorMode } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Trophy, 
  ChevronRight, 
  ChevronLeft,
  Timer as TimerIcon,
  Monitor,
  Zap,
  Type
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  QuizControls, 
  PlacementControls, 
  TasteTestControls, 
  FinaleControls 
} from '@/components/RoundControls';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function HostPanel() {
  const teams = useGameStore(s => s.teams);
  const currentRound = useGameStore(s => s.currentRound);
  const projectorMode = useGameStore(s => s.projectorMode);
  const announcementText = useGameStore(s => s.announcementText);
  const timer = useGameStore(s => s.timer);
  const isSuddenDeath = useGameStore(s => s.isSuddenDeath);
  const introTeamId = useGameStore(s => s.introTeamId);

  const setCurrentRound = useGameStore(s => s.setCurrentRound);
  const setProjectorMode = useGameStore(s => s.setProjectorMode);
  const setAnnouncement = useGameStore(s => s.setAnnouncement);
  const startTimer = useGameStore(s => s.startTimer);
  const setView = useGameStore(s => s.setView);
  const setIntroTeam = useGameStore(s => s.setIntroTeam);
  const setSuddenDeath = useGameStore(s => s.setSuddenDeath);

  const toggleTimer = () => {
    useGameStore.setState((prev) => ({ timer: { ...prev.timer, isActive: !prev.timer.isActive } }));
  };

  const ROUNDS = [
    { id: 1, name: 'Table Trivia', type: 'quiz' },
    { id: 2, name: 'Food Relay', type: 'physical' },
    { id: 3, name: 'Table Building', type: 'creative' },
    { id: 4, name: 'Blind Taste Test', type: 'sensory' },
    { id: 5, name: 'Grand Finale', type: 'finale' },
  ];

  const currentRoundInfo = ROUNDS.find(r => r.id === currentRound);

  return (
    <div className="flex h-screen bg-muted/30 text-foreground overflow-hidden">
      {/* Standings Sidebar */}
      <aside className="w-80 border-r border-border bg-white flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-foreground">
            <Trophy className="text-amber-500" /> STANDINGS
          </h2>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {[...teams].sort((a, b) => b.score - a.score).map((team, idx) => (
              <motion.div
                key={team.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={clsx(
                  "mb-3 p-3 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer",
                  introTeamId === team.id ? "bg-primary text-white border-primary" : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
                )}
                onClick={() => setIntroTeam(introTeamId === team.id ? null : team.id)}
              >
                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-black text-sm", introTeamId === team.id ? "bg-primary-foreground text-primary" : "bg-slate-100")}>
                  {idx + 1}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold truncate text-sm">{team.name}</p>
                  <p className={clsx("text-[10px] font-mono uppercase tracking-widest", introTeamId === team.id ? "text-primary-foreground/70" : "text-muted-foreground")}>{team.score} PTS</p>
                </div>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="p-4 border-t border-border bg-white space-y-4">
           <div className="bg-red-50 border border-red-100 p-3 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1">
                   <Zap size={10} /> Sudden Death
                </span>
                <Switch 
                  checked={isSuddenDeath} 
                  onCheckedChange={setSuddenDeath}
                  className="data-[state=checked]:bg-red-600"
                />
              </div>
           </div>

           <Button 
            variant="destructive"
            className="w-full font-black uppercase tracking-widest"
            onClick={() => setView('results')}
           >
             END COMPETITION
           </Button>
        </div>
      </aside>

      {/* Main Control Area */}
      <main className="flex-1 flex flex-col">
        <header className="h-20 border-b border-border bg-white flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current Round</p>
              <h3 className="text-xl font-black text-foreground">{currentRoundInfo?.name.toUpperCase()}</h3>
            </div>
            <Separator orientation="vertical" className="h-8 bg-border" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setCurrentRound(Math.max(1, currentRound - 1))}><ChevronLeft /></Button>
              <div className="flex gap-1">
                {ROUNDS.map(r => (
                  <div key={r.id} className={clsx("w-8 h-1 rounded-full transition-all", r.id === currentRound ? "bg-primary w-12" : "bg-slate-200")} />
                ))}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCurrentRound(Math.min(5, currentRound + 1))}><ChevronRight /></Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-100 tabular-nums">
                <TimerIcon className={timer.isActive ? "text-primary animate-pulse" : "text-muted-foreground"} size={20} />
                <span className="text-2xl font-black tabular-nums">
                  {Math.floor(timer.remaining / 60)}:{(timer.remaining % 60).toString().padStart(2, '0')}
                </span>
             </div>
             <Button className="font-black" onClick={toggleTimer}>
               {timer.isActive ? 'STOP' : 'START'}
             </Button>
             <Button variant="outline" className="font-black" onClick={useGameStore.getState().resetTimer}>
               RESET
             </Button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {currentRound === 1 && <QuizControls />}
          {currentRound === 2 && <PlacementControls round={2} />}
          {currentRound === 3 && <PlacementControls round={3} />}
          {currentRound === 4 && <TasteTestControls />}
          {currentRound === 5 && <FinaleControls />}
        </div>

        <footer className="h-24 border-t border-border bg-white flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Projector Mode</span>
              <div className="flex gap-2 mt-1">
                {['scoreboard', 'black', 'logo'].map(mode => (
                  <Button key={mode} size="sm" variant={projectorMode === mode ? 'default' : 'outline'} onClick={() => setProjectorMode(mode as ProjectorMode)}>
                    {mode.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Announcement Banner</span>
            <div className="flex gap-2 mt-1">
              <Input placeholder="Type message..." className="bg-slate-50 border-border" onChange={(e) => setAnnouncement(e.target.value)} value={announcementText} />
              <Button variant={projectorMode === 'announcement' ? 'default' : 'outline'} onClick={() => setProjectorMode(projectorMode === 'announcement' ? 'scoreboard' : 'announcement')}>
                <Type size={18} />
              </Button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
