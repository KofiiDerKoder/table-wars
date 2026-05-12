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
  Type,
  Keyboard,
  Eye,
  Edit2,
  X,
  RotateCcw
} from 'lucide-react';
import { useState } from 'react';
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { LiveScoreboard } from './LiveScoreboard';

const TIMER_PRESETS = [30, 60, 90, 120];

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
  const toggleTimer = useGameStore(s => s.toggleTimer);
  const resetTimer = useGameStore(s => s.resetTimer);
  const resetScores = useGameStore(s => s.resetScores);
  const updateTeam = useGameStore(s => s.updateTeam);

  const session = useGameStore(s => s.session);
  const createSession = useGameStore(s => s.createSession);

  const [customTimer, setCustomTimer] = useState('');
  const [shortcutsVisible, setShortcutsVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [editTeamId, setEditTeamId] = useState<string | null>(null);

  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [editingChant, setEditingChant] = useState('');

  const handleCustomTimer = () => {
    const sec = parseInt(customTimer);
    if (!isNaN(sec) && sec > 0) {
      startTimer(sec);
      setCustomTimer('');
    }
  };

  const handleEditClick = (team: any) => {
    setEditTeamId(team.id);
    setEditingName(team.name);
    setEditingColor(team.color);
    setEditingChant(team.chant || '');
  };

  const handleSaveTeam = async () => {
    if (editTeamId) {
      await updateTeam(editTeamId, {
        name: editingName,
        color: editingColor,
        chant: editingChant
      });
      setEditTeamId(null);
    }
  };

  const handleCreateSession = async () => {
    await createSession();
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-foreground">
              <Trophy className="text-amber-500" /> STANDINGS
            </h2>
          </div>
          {!session && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-[10px] font-black uppercase tracking-widest border-dashed"
              onClick={handleCreateSession}
            >
              Enable Multi-Device Sync
            </Button>
          )}
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
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className={clsx("h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity", introTeamId === team.id ? "text-white hover:bg-white/20" : "text-slate-400 hover:bg-slate-100")}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(team);
                    }}
                  >
                    <Edit2 size={12} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="p-4 border-t border-border bg-white space-y-4">
           <Button 
            variant="outline"
            className="w-full text-[10px] font-black uppercase tracking-widest border-dashed text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            onClick={() => {
              if (confirm('Are you sure you want to reset all team scores to 0? This cannot be undone.')) {
                resetScores();
              }
            }}
           >
             <RotateCcw className="mr-2" size={12} /> RESET SCORES
           </Button>

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
            {session && (
              <>
                <Separator orientation="vertical" className="h-8 bg-border" />
                <div className="flex flex-col">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Session Code</p>
                  <Badge variant="outline" className="font-mono text-lg border-primary/30 text-primary py-0 px-2 h-7">
                    {session.code}
                  </Badge>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
             {/* Timer Presets + Custom */}
             <div className="flex items-center gap-1 mr-2">
               {TIMER_PRESETS.map(sec => (
                 <Button key={sec} size="sm" variant={timer.duration === sec ? 'default' : 'outline'} onClick={() => startTimer(sec)}>
                   {sec}s
                 </Button>
               ))}
               <Separator orientation="vertical" className="h-6 bg-border mx-1" />
               <Input
                 type="number"
                 min={1}
                 max={600}
                 placeholder="sec"
                 className="w-14 h-8 text-xs text-center"
                 value={customTimer}
                 onChange={(e) => setCustomTimer(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleCustomTimer()}
               />
               <Button size="sm" variant="outline" className="text-xs" onClick={handleCustomTimer}>
                 SET
               </Button>
             </div>
             {/* Timer Display */}
             <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-100 tabular-nums">
                <TimerIcon className={timer.isActive ? "text-primary animate-pulse" : "text-muted-foreground"} size={20} />
                <span className="text-2xl font-black tabular-nums">
                  {Math.floor(timer.remaining / 60)}:{(timer.remaining % 60).toString().padStart(2, '0')}
                </span>
             </div>
             <Button className="font-black" onClick={toggleTimer}>
               {timer.isActive ? 'STOP' : 'START'}
             </Button>
             <Button variant="outline" className="font-black" onClick={resetTimer}>
               RESET
             </Button>

             <Separator orientation="vertical" className="h-8 bg-border mx-2" />

             <Button 
               variant={shortcutsVisible ? "default" : "outline"} 
               size="icon"
               onClick={() => setShortcutsVisible(!shortcutsVisible)}
             >
               <Keyboard size={18} />
             </Button>

             <Button 
               variant={previewVisible ? "default" : "outline"} 
               size="icon"
               onClick={() => setPreviewVisible(!previewVisible)}
             >
               <Eye size={18} />
             </Button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto relative">
          <AnimatePresence>
            {shortcutsVisible && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 right-8 z-50 w-72 bg-slate-900 text-white border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[32px] p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary">Master Shortcuts</h4>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white" onClick={() => setShortcutsVisible(false)}><X size={14} /></Button>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'SPACE', desc: 'Reveal / Clear' },
                    { key: 'ESC', desc: 'Clear Buzzers' },
                    { key: 'T', desc: 'Toggle Timer' },
                    { key: 'L', desc: 'Logo Mode' },
                    { key: 'B', desc: 'Blackout' },
                    { key: 'A', desc: 'Announce' },
                    { key: '1-5', desc: 'Switch Views' }
                  ].map(s => (
                    <div key={s.key} className="flex justify-between items-center">
                      <span className="font-mono bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-primary font-black text-[10px]">{s.key}</span>
                      <span className="font-black text-slate-400 uppercase tracking-widest text-[9px]">{s.desc}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] leading-relaxed">
                    Shortcuts are global. Ensure no input is focused before using.
                  </p>
                </div>
              </motion.div>
            )}

            {previewVisible && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-4 left-8 right-8 bottom-4 z-40 bg-slate-950/20 backdrop-blur-md rounded-[40px] border-2 border-dashed border-primary/20 p-12 flex flex-col shadow-2xl"
              >
                 <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                     <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                     <h4 className="font-black text-sm uppercase tracking-[0.3em] text-primary">Live Projection Preview</h4>
                   </div>
                   <Button variant="outline" size="sm" className="font-black text-[10px] border-slate-200 hover:bg-slate-100" onClick={() => setPreviewVisible(false)}>DISMISS PREVIEW</Button>
                 </div>
                 <div className="flex-1 bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border-8 border-slate-950 relative group">
                    <div className="absolute inset-0 scale-[0.5] origin-top transform-gpu pointer-events-none">
                       <div className="w-[200%] h-[200%]">
                          <LiveScoreboard />
                       </div>
                    </div>
                    {/* Mode Indicator Overlay */}
                    <div className="absolute bottom-6 right-6 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Mode</p>
                       <p className="text-sm font-black text-primary uppercase tracking-tight">{projectorMode}</p>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

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

      <Dialog open={!!editTeamId} onOpenChange={(open) => !open && setEditTeamId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Team: {editingName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={editingName} onChange={(e) => setEditingName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">Color</Label>
              <div className="col-span-3 flex gap-2">
                <Input type="color" id="color" value={editingColor} onChange={(e) => setEditingColor(e.target.value)} className="w-12 h-10 p-1" />
                <Input value={editingColor} onChange={(e) => setEditingColor(e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chant" className="text-right">Chant</Label>
              <Input id="chant" value={editingChant} onChange={(e) => setEditingChant(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTeamId(null)}>Cancel</Button>
            <Button onClick={handleSaveTeam}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}