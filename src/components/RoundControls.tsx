'use client';

import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Swords, ChevronRight, ChevronLeft, Eye, Edit2, Trash2, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { SoundEngine } from '@/lib/sounds';
import { useState } from 'react';
import { motion } from 'framer-motion';

export function QuizControls() {
  const teams = useGameStore(s => s.teams);
  const quiz = useGameStore(s => s.quiz);
  const currentRound = useGameStore(s => s.currentRound);
  const isSuddenDeath = useGameStore(s => s.isSuddenDeath);
  
  const updateTeamScore = useGameStore(s => s.updateTeamScore);
  const nextQuestion = useGameStore(s => s.nextQuestion);
  const prevQuestion = useGameStore(s => s.prevQuestion);
  const revealContent = useGameStore(s => s.revealContent);
  const clearBuzz = useGameStore(s => s.clearBuzz);
  const setQuizQuestions = useGameStore(s => s.setQuizQuestions);

  const q = quiz.questions[quiz.currentIndex];
  const buzzedTeam = teams.find(t => t.id === quiz.buzzedTeamId);
  const isFinale = currentRound === 5;

  const handleUpdateQuestion = (index: number, updated: any) => {
    const newQs = [...quiz.questions];
    newQs[index] = updated;
    setQuizQuestions(newQs);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQs = quiz.questions.filter((_, i) => i !== index);
    setQuizQuestions(newQs);
  };

  const addQuestion = () => {
    const newQ = { id: Math.random().toString(), text: 'New Question', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', category: 'General' };
    setQuizQuestions([...quiz.questions, newQ]);
  };

  const handleCorrect = () => {
    if (!buzzedTeam) return;
    updateTeamScore(buzzedTeam.id, isSuddenDeath ? 1 : (isFinale ? 10 : 5), currentRound);
    SoundEngine.playCorrect();
    clearBuzz();
  };

  const handleWrong = () => {
    SoundEngine.playWrong();
    clearBuzz();
  };

  const handleSteal = (teamId: string) => {
    updateTeamScore(teamId, 3, currentRound);
    SoundEngine.playCorrect();
    clearBuzz();
  };

  const buzzIn = useGameStore(s => s.buzzIn);
  const handleHostBuzz = (teamId: string) => {
    if (quiz.buzzedTeamId) return;
    buzzIn(teamId);
    SoundEngine.playBuzzer();
  };

  if (!q) return <div>No questions loaded.</div>;

  return (
    <div className="space-y-6">
      {/* Buzz-In Control Card */}
      <div className="rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Buzz-In Control</p>
            <p className="text-xs text-muted-foreground">Assign buzz to a team directly.</p>
          </div>
          <span className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">1-8 keys work</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {teams.map(team => (
            <Button
              key={team.id}
              className={clsx(
                "h-12 rounded-xl font-black text-xs transition-all",
                quiz.buzzedTeamId
                  ? "bg-slate-100 text-slate-400"
                  : "bg-white hover:bg-slate-50 text-foreground border border-slate-200"
              )}
              style={!quiz.buzzedTeamId ? { boxShadow: `inset 0 -4px 0 0 ${team.color}` } : {}}
              onClick={() => handleHostBuzz(team.id)}
              disabled={!!quiz.buzzedTeamId}
            >
              {team.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Question Display */}
      <div className="bg-white border border-slate-100 shadow-sm p-8 rounded-3xl relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {q.category}
          </span>
          <Dialog>
             <DialogTrigger className="border border-slate-200 bg-white rounded-lg px-4 py-2 hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest transition-colors">
               <Edit2 size={12} className="mr-2 inline"/> Edit Questions
             </DialogTrigger>
             <DialogContent className="bg-white text-foreground max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Question Bank Editor</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  {quiz.questions.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded">
                       <Input className="col-span-6 border-slate-200" value={item.text} onChange={(e) => handleUpdateQuestion(idx, {...item, text: e.target.value})} />
                       <Input className="col-span-2 border-slate-200" value={item.correctAnswer} onChange={(e) => handleUpdateQuestion(idx, {...item, correctAnswer: e.target.value})} />
                       <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestion(idx)}><Trash2 size={16} className="text-red-500" /></Button>
                    </div>
                  ))}
                  <Button onClick={addQuestion} className="bg-primary"><Plus size={16} className="mr-2" /> Add Question</Button>
                </div>
             </DialogContent>
          </Dialog>
        </div>
        <h2 className="text-3xl font-black mb-8 leading-tight text-foreground">{q.text}</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {q.options.map((opt, i) => (
            <div key={i} className={clsx(
              "p-4 rounded-xl border-2 font-black text-sm",
              opt === q.correctAnswer ? "border-primary/50 bg-primary/5 text-primary" : "border-slate-100 bg-slate-50 text-slate-400"
            )}>
              {String.fromCharCode(65 + i)}) {opt}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center">
           <div className="flex gap-2">
             <Button variant="outline" size="icon" onClick={prevQuestion}><ChevronLeft /></Button>
             <Button variant="outline" size="icon" onClick={nextQuestion}><ChevronRight /></Button>
           </div>
           <Button 
            onClick={revealContent} 
            className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 shadow-lg"
            disabled={quiz.isRevealed}
           >
             <Eye className="mr-2" size={18} /> Reveal to Audience [SPACE]
           </Button>
        </div>
      </div>

      {/* Control Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Current Buzz</h3>
            {buzzedTeam ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20 animate-pulse">
                   <div className="w-12 h-12 rounded-full border-4 border-white shadow-sm" style={{ backgroundColor: buzzedTeam.color }} />
                   <div className="flex-1">
                      <p className="text-xl font-black text-foreground">{buzzedTeam.name.toUpperCase()}</p>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest">Buzzed in first</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <Button onClick={handleCorrect} className="flex-1 h-14 bg-green-600 hover:bg-green-700 font-black">
                     <CheckCircle className="mr-2" /> Correct (+{isSuddenDeath ? 1 : (isFinale ? 10 : 5)})
                   </Button>
                   <Button onClick={handleWrong} className="flex-1 h-14 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black">
                     <XCircle className="mr-2" /> Wrong
                   </Button>
                </div>
              </div>
            ) : (
              <div className="h-32 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-slate-400 italic text-sm">
                Waiting for teams to buzz...
              </div>
            )}
         </div>

         <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Steal Opportunities</h3>
            <div className="grid grid-cols-2 gap-2">
               {teams.filter(t => t.id !== quiz.buzzedTeamId).map(t => (
                 <Button 
                   key={t.id} 
                   variant="outline" 
                   className="justify-start border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-all"
                   onClick={() => handleSteal(t.id)}
                 >
                   <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: t.color }} />
                   <span className="truncate font-black">{t.name}</span>
                   <span className="ml-auto text-primary font-black">+3</span>
                 </Button>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

export function PlacementControls({ round }: { round: number }) {
  const teams = useGameStore(s => s.teams);
  const updateTeamScore = useGameStore(s => s.updateTeamScore);
  const PLACEMENTS = [25, 20, 15, 10, 5, 3, 2, 1];

  return (
    <div className="space-y-4">
      {teams.map(team => (
        <Card key={team.id} className="bg-slate-900 border-slate-800">
           <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }} />
                <span className="text-xl font-black text-white">{team.name.toUpperCase()}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {PLACEMENTS.slice(0, teams.length).map((pts, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant="outline"
                      className={clsx(
                        "w-12 h-12 font-black border-slate-800 transition-all",
                        team.roundScores[round] === pts ? "bg-blue-600 text-white border-blue-400" : "hover:bg-slate-800"
                      )}
                      onClick={() => updateTeamScore(team.id, pts - (team.roundScores[round] || 0), round)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                
                <Separator orientation="vertical" className="h-8 bg-slate-800" />
                
                {round === 2 && (
                  <Button 
                    variant="outline" 
                    className="bg-red-900/20 border-red-900 text-red-500 font-black"
                    onClick={() => updateTeamScore(team.id, -3, round)}
                  >
                    DROP (-3)
                  </Button>
                )}
                
                {round === 3 && (
                  <Button 
                    variant="outline" 
                    className="bg-pink-900/20 border-pink-900 text-pink-500 font-black"
                    onClick={() => updateTeamScore(team.id, 5, round)}
                  >
                    CREATIVE (+5)
                  </Button>
                )}

                <div className="min-w-[80px] text-right">
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">R{round} Pts</p>
                   <p className="text-2xl font-black text-white">{team.roundScores[round] || 0}</p>
                </div>
              </div>
           </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TasteTestControls() {
  const teams = useGameStore(s => s.teams);
  const tasteTest = useGameStore(s => s.tasteTest);
  const updateTeamScore = useGameStore(s => s.updateTeamScore);
  const setTasteScore = useGameStore(s => s.setTasteScore);
  const nextTasteItem = useGameStore(s => s.nextTasteItem);
  const prevTasteItem = useGameStore(s => s.prevTasteItem);
  const revealContent = useGameStore(s => s.revealContent);
  const addTasteItem = useGameStore(s => s.addTasteItem);
  const updateTasteItem = useGameStore(s => s.updateTasteItem);
  const removeTasteItem = useGameStore(s => s.removeTasteItem);

  const item = tasteTest.items[tasteTest.currentIndex];

  if (!item) return <div>No items loaded.</div>;

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
         <div className="flex justify-between items-start mb-6">
            <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded text-xs font-black uppercase tracking-widest">
              {item.category}
            </span>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger className="border border-slate-700 bg-slate-800 rounded-lg px-4 py-2 hover:bg-slate-700">
                  <Edit2 size={16} className="mr-2 inline"/> EDIT ITEMS
                </DialogTrigger>
                <DialogContent className="bg-slate-900 text-white max-h-[80vh] overflow-y-auto">
                   <DialogHeader><DialogTitle>Edit Taste Test Items</DialogTitle></DialogHeader>
                   {tasteTest.items.map(it => (
                     <div key={it.id} className="flex gap-2 items-center p-2 bg-slate-950 rounded">
                        <Input value={it.name} onChange={(e) => updateTasteItem({...it, name: e.target.value})} className="bg-slate-900 border-none" />
                        <Button variant="ghost" size="icon" onClick={() => removeTasteItem(it.id)}><Trash2 size={16} className="text-red-500" /></Button>
                     </div>
                   ))}
                   <Button onClick={() => addTasteItem({id: Math.random().toString(), name: 'New Item', hint: 'Add hint', category: 'General'})}><Plus size={16} /></Button>
                </DialogContent>
              </Dialog>
              <span className="text-slate-500 font-mono text-xs pt-2">ITEM {tasteTest.currentIndex + 1} / {tasteTest.items.length}</span>
            </div>
         </div>
         <div className="flex justify-between items-end">
            <div>
               <h2 className="text-5xl font-black text-white mb-2">{item.name.toUpperCase()}</h2>
               <p className="text-xl text-slate-400 italic">Hint: "{item.hint}"</p>
            </div>
            <Button 
              onClick={revealContent} 
              className="bg-blue-600 hover:bg-blue-700 font-black h-12 px-8"
              disabled={tasteTest.isRevealed}
            >
               REVEAL HINT [SPACE]
            </Button>
         </div>
         <div className="mt-8 flex gap-2">
            <Button variant="outline" size="icon" onClick={prevTasteItem}><ChevronLeft /></Button>
            <Button variant="outline" size="icon" onClick={nextTasteItem}><ChevronRight /></Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {teams.map(team => (
           <Card key={team.id} className="bg-slate-900 border-slate-800">
              <CardContent className="p-4 space-y-4">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                       <span className="font-black text-white">{team.name}</span>
                    </div>
                    <span className="text-blue-500 font-black">{team.roundScores[4] || 0}</span>
                 </div>
                 <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-green-600 text-xs font-black" onClick={() => setTasteScore(team.id, item.id, 4)}>CORRECT (+4)</Button>
                    <Button size="sm" className="flex-1 bg-yellow-600 text-xs font-black" onClick={() => setTasteScore(team.id, item.id, 2)}>PARTIAL (+2)</Button>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>
    </div>
  );
}

export function FinaleControls() {
  const teams = useGameStore(s => s.teams);
  const duel = useGameStore(s => s.duel);
  const startDuel = useGameStore(s => s.startDuel);
  const endDuel = useGameStore(s => s.endDuel);
  const updateTeamScore = useGameStore(s => s.updateTeamScore);

  const [challenger, setChallenger] = useState('');
  const [challenged, setChallenged] = useState('');

  return (
    <div className="space-y-8">
       <QuizControls />
       
       <Separator className="bg-slate-800" />
       
       <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <div className="flex items-center gap-4 mb-8">
             <Swords className="text-red-500" size={32} />
             <h2 className="text-3xl font-black uppercase tracking-tighter">Duel Mechanic</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
             <div className="space-y-2">
                <Label className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Challenger</Label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white font-bold"
                  value={challenger}
                  onChange={(e) => setChallenger(e.target.value)}
                >
                  <option value="">Select Team...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
             </div>
             <div className="space-y-2">
                <Label className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Opponent</Label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white font-bold"
                  value={challenged}
                  onChange={(e) => setChallenged(e.target.value)}
                >
                  <option value="">Select Team...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
             </div>
             <Button 
               className="h-14 bg-red-600 hover:bg-red-700 text-lg font-black"
               disabled={!challenger || !challenged || challenger === challenged}
               onClick={() => startDuel(challenger, challenged)}
             >
               ACTIVATE DUEL
             </Button>
          </div>

          {duel.isActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-6 bg-red-900/10 border-2 border-red-600/50 rounded-2xl flex flex-col items-center gap-6"
            >
               <p className="text-2xl font-black text-red-500 tracking-widest uppercase">HEAD-TO-HEAD SHOWDOWN</p>
               <div className="flex items-center gap-12">
                  <div className="text-center">
                     <p className="text-3xl font-black text-white mb-2">{teams.find(t => t.id === duel.challengerId)?.name}</p>
                     <Button className="bg-green-600" onClick={() => {
                        updateTeamScore(duel.challengerId!, 10, 5);
                        endDuel(duel.challengerId!);
                     }}>WINNER</Button>
                  </div>
                  <Swords size={48} className="text-slate-700" />
                  <div className="text-center">
                     <p className="text-3xl font-black text-white mb-2">{teams.find(t => t.id === duel.challengedId)?.name}</p>
                     <Button className="bg-green-600" onClick={() => {
                        updateTeamScore(duel.challengedId!, 10, 5);
                        endDuel(duel.challengedId!);
                     }}>WINNER</Button>
                  </div>
               </div>
            </motion.div>
          )}
       </div>
    </div>
  );
}
