'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Plus, Trash2, Settings, Copy, ChevronDown, ChevronUp, Timer, Trophy, ChefHat, Swords, Sparkles, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import type { RoundDefinition, RoundType } from '@/types/rounds';

interface JudgingCriterion {
  id: string;
  name: string;
  maxScore: number;
  weight: number;
}

type EditorRoundType = RoundType | 'judged' | 'timed';

const ROUND_TYPE_META: Record<string, { label: string; color: string; icon: React.ReactNode; description: string }> = {
  quiz: { label: 'Quiz', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Zap size={14} />, description: 'Buzzer-based trivia with steal opportunities' },
  placement: { label: 'Placement', color: 'bg-green-100 text-green-700 border-green-200', icon: <Trophy size={14} />, description: 'Rank-based scoring for physical/creative rounds' },
  taste: { label: 'Taste Test', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <ChefHat size={14} />, description: 'Blind taste testing with correct/partial scoring' },
  finale: { label: 'Finale', color: 'bg-red-100 text-red-700 border-red-200', icon: <Swords size={14} />, description: 'Double-point quiz with duel mechanic' },
  judged: { label: 'Judged', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Sparkles size={14} />, description: 'Judge-based scoring with custom criteria' },
  timed: { label: 'Timed Challenge', color: 'bg-pink-100 text-pink-700 border-pink-200', icon: <Timer size={14} />, description: 'Time-based challenge with completion bonus' },
};

function RoundTypePicker({ onSelect, onClose }: { onSelect: (type: EditorRoundType) => void; onClose: () => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
      {(Object.entries(ROUND_TYPE_META) as [EditorRoundType, typeof ROUND_TYPE_META['quiz']][]).map(([type, meta]) => (
        <button
          key={type}
          onClick={() => { onSelect(type); onClose(); }}
          className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
        >
          <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", meta.color)}>
            {meta.icon}
          </div>
          <div>
            <p className="font-black text-sm text-foreground group-hover:text-primary transition-colors">{meta.label}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{meta.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function RoundCard({ round, index, total, onEdit, onRemove, onMoveUp, onMoveDown }: {
  round: RoundDefinition;
  index: number;
  total: number;
  onEdit: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const meta = ROUND_TYPE_META[round.type];
  const questionCount = (round.roundConfig as any)?.questions?.length ?? (round.roundConfig as any)?.items?.length ?? 0;
  const timerLabel = round.config.timerEnabled && round.config.defaultTimerSeconds
    ? `${Math.floor(round.config.defaultTimerSeconds / 60)}:${(round.config.defaultTimerSeconds % 60).toString().padStart(2, '0')}`
    : null;

  return (
    <motion.div layout className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm group hover:border-primary/30 transition-colors">
      <div className="flex flex-col gap-1 cursor-grab text-slate-300">
        <GripVertical size={16} />
      </div>

      <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm", meta?.color)}>
        {meta?.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-muted-foreground">R{index + 1}</span>
          <span className="font-black text-sm text-foreground truncate">{round.name}</span>
          {meta && <Badge variant="outline" className={clsx("text-[9px] py-0 h-4", meta.color)}>{meta.label}</Badge>}
        </div>
        <div className="flex items-center gap-3 mt-1">
          {round.description && <span className="text-[10px] text-muted-foreground truncate">{round.description}</span>}
          {timerLabel && <span className="text-[10px] font-mono text-muted-foreground">{timerLabel}</span>}
          {questionCount > 0 && <span className="text-[10px] font-mono text-muted-foreground">{questionCount} items</span>}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {index > 0 && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMoveUp}><ChevronUp size={14} /></Button>}
        {index < total - 1 && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMoveDown}><ChevronDown size={14} /></Button>}
        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-foreground" onClick={onEdit}><Settings size={14} /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={onRemove}><Trash2 size={14} /></Button>
      </div>
    </motion.div>
  );
}

function QuizConfigPanel({ round }: { round: RoundDefinition }) {
  const updateRoundConfig = useGameStore(s => s.updateRoundConfig);
  const updateRoundTypeConfig = useGameStore(s => s.updateRoundTypeConfig);
  const setRoundQuestions = useGameStore(s => s.setRoundQuestions);
  const config = (round.roundConfig as any) || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Correct Points</Label>
          <Input type="number" value={config.correctPoints ?? 5} onChange={(e) => updateRoundTypeConfig(round.id, { ...config, correctPoints: parseInt(e.target.value) || 0 })} />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Steal Points</Label>
          <Input type="number" value={config.stealPoints ?? 3} onChange={(e) => updateRoundTypeConfig(round.id, { ...config, stealPoints: parseInt(e.target.value) || 0 })} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Allow Steal</Label>
        <Switch checked={config.allowSteal ?? true} onCheckedChange={(v) => updateRoundTypeConfig(round.id, { ...config, allowSteal: v })} />
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Question Bank</Label>
          <span className="text-[10px] font-mono text-muted-foreground">{config.questions?.length || 0} questions</span>
        </div>
        <QuestionBankEditor round={round} />
      </div>
    </div>
  );
}

function QuestionBankEditor({ round }: { round: RoundDefinition }) {
  const config = (round.roundConfig as any) || {};
  const questions: any[] = config.questions || [];
  const setRoundQuestions = useGameStore(s => s.setRoundQuestions);
  const [newQuestion, setNewQuestion] = useState({ text: '', options: ['', '', '', ''], correctAnswer: '', category: 'General' });

  const addQuestion = () => {
    if (!newQuestion.text.trim()) return;
    const q = {
      id: crypto.randomUUID(),
      text: newQuestion.text,
      options: newQuestion.options.filter(o => o.trim()),
      correctAnswer: newQuestion.correctAnswer,
      category: newQuestion.category,
    };
    setRoundQuestions(round.id, [...questions, q]);
    setNewQuestion({ text: '', options: ['', '', '', ''], correctAnswer: '', category: 'General' });
  };

  const removeQuestion = (id: string) => {
    setRoundQuestions(round.id, questions.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
        <Input placeholder="Question text" value={newQuestion.text} onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })} className="border-slate-200" />
        <div className="grid grid-cols-2 gap-2">
          {newQuestion.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-black text-muted-foreground">{String.fromCharCode(65 + i)})</span>
              <Input placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={(e) => {
                const opts = [...newQuestion.options];
                opts[i] = e.target.value;
                setNewQuestion({ ...newQuestion, options: opts });
              }} className="border-slate-200 text-sm" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Correct answer" value={newQuestion.correctAnswer} onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })} className="border-slate-200 flex-1" />
          <Input placeholder="Category" value={newQuestion.category} onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })} className="border-slate-200 w-32" />
          <Button size="sm" onClick={addQuestion} className="shrink-0 font-black text-[10px]"><Plus size={14} className="mr-1" /> ADD</Button>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {questions.map((q, i) => (
          <div key={q.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl group">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{i + 1}. {q.text}</p>
              <p className="text-[10px] text-muted-foreground">{q.category} - {q.correctAnswer}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-red-400" onClick={() => removeQuestion(q.id)}>
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
        {questions.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-4 text-center">No questions yet. Add your first question above.</p>
        )}
      </div>
    </div>
  );
}

function PlacementConfigPanel({ round }: { round: RoundDefinition }) {
  const updateRoundTypeConfig = useGameStore(s => s.updateRoundTypeConfig);
  const setRoundPlacementValues = useGameStore(s => s.setRoundPlacementValues);
  const config = (round.roundConfig as any) || {};
  const values = config.pointValues || [25, 20, 15, 10, 5, 3, 2, 1];

  const updatePointValue = (index: number, value: number) => {
    const newValues = [...values];
    newValues[index] = value;
    setRoundPlacementValues(round.id, newValues);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Point Values by Position</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {values.map((v: number, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-black text-muted-foreground w-4">#{i + 1}</span>
              <Input type="number" value={v} onChange={(e) => updatePointValue(i, parseInt(e.target.value) || 0)} className="border-slate-200 h-8 text-sm" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Allow Penalty</Label>
        <Switch checked={config.allowPenalty ?? false} onCheckedChange={(v) => updateRoundTypeConfig(round.id, { ...config, allowPenalty: v })} />
      </div>
    </div>
  );
}

function TasteConfigPanel({ round }: { round: RoundDefinition }) {
  const updateRoundTypeConfig = useGameStore(s => s.updateRoundTypeConfig);
  const setRoundTasteItems = useGameStore(s => s.setRoundTasteItems);
  const config = (round.roundConfig as any) || {};
  const items: any[] = config.items || [];
  const [newItem, setNewItem] = useState({ name: '', hint: '', category: 'General' });

  const addItem = () => {
    if (!newItem.name.trim()) return;
    const item = { id: crypto.randomUUID(), name: newItem.name, hint: newItem.hint, category: newItem.category };
    setRoundTasteItems(round.id, [...items, item]);
    setNewItem({ name: '', hint: '', category: 'General' });
  };

  const removeItem = (id: string) => {
    setRoundTasteItems(round.id, items.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Correct Points</Label>
          <Input type="number" value={config.correctPoints ?? 4} onChange={(e) => updateRoundTypeConfig(round.id, { ...config, correctPoints: parseInt(e.target.value) || 0 })} />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Partial Points</Label>
          <Input type="number" value={config.partialPoints ?? 2} onChange={(e) => updateRoundTypeConfig(round.id, { ...config, partialPoints: parseInt(e.target.value) || 0 })} />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Taste Items</Label>
        <div className="flex gap-2">
          <Input placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="border-slate-200 flex-1" />
          <Input placeholder="Hint" value={newItem.hint} onChange={(e) => setNewItem({ ...newItem, hint: e.target.value })} className="border-slate-200 flex-1" />
          <Button size="sm" onClick={addItem} className="font-black text-[10px]"><Plus size={14} className="mr-1" /> ADD</Button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl group">
              <div>
                <p className="font-bold text-sm">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">{item.category}{item.hint ? ` - "${item.hint}"` : ''}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-red-400" onClick={() => removeItem(item.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
          {items.length === 0 && <p className="text-xs text-muted-foreground italic py-4 text-center">No items yet.</p>}
        </div>
      </div>
    </div>
  );
}

function FinaleConfigPanel({ round }: { round: RoundDefinition }) {
  const updateRoundConfig = useGameStore(s => s.updateRoundConfig);
  const updateRoundTypeConfig = useGameStore(s => s.updateRoundTypeConfig);
  const config = (round.roundConfig as any) || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Correct Points</Label>
          <Input type="number" value={config.correctPoints ?? 10} onChange={(e) => updateRoundTypeConfig(round.id, { ...config, correctPoints: parseInt(e.target.value) || 0 })} />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duel Bonus</Label>
          <Input type="number" value={config.duelBonusPoints ?? 10} onChange={(e) => updateRoundTypeConfig(round.id, { ...config, duelBonusPoints: parseInt(e.target.value) || 0 })} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Allow Duel Mechanic</Label>
        <Switch checked={config.allowDuel ?? true} onCheckedChange={(v) => updateRoundTypeConfig(round.id, { ...config, allowDuel: v })} />
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Question Bank</Label>
          <span className="text-[10px] font-mono text-muted-foreground">{config.questions?.length || 0} questions</span>
        </div>
        <QuestionBankEditor round={round} />
      </div>
    </div>
  );
}

function JudgedConfigPanel({ round }: { round: RoundDefinition }) {
  const updateRoundTypeConfig = useGameStore(s => s.updateRoundTypeConfig);
  const config = (round.roundConfig as any) || {};
  const criteria: JudgingCriterion[] = config.criteria || [];

  const addCriterion = () => {
    const newCriteria = [...criteria, { id: crypto.randomUUID(), name: 'New Criterion', maxScore: 10, weight: 1 }];
    updateRoundTypeConfig(round.id, { ...config, criteria: newCriteria });
  };

  const updateCriterion = (id: string, updates: Partial<JudgingCriterion>) => {
    const newCriteria = criteria.map(c => c.id === id ? { ...c, ...updates } : c);
    updateRoundTypeConfig(round.id, { ...config, criteria: newCriteria });
  };

  const removeCriterion = (id: string) => {
    const newCriteria = criteria.filter(c => c.id !== id);
    updateRoundTypeConfig(round.id, { ...config, criteria: newCriteria });
  };

  return (
    <div className="space-y-4">
      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Judging Criteria</Label>
      {criteria.map(c => (
        <div key={c.id} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <Input value={c.name} onChange={(e) => updateCriterion(c.id, { name: e.target.value })} className="border-slate-200 flex-1" placeholder="Criterion name" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black text-muted-foreground">Max</span>
            <Input type="number" value={c.maxScore} onChange={(e) => updateCriterion(c.id, { maxScore: parseInt(e.target.value) || 0 })} className="border-slate-200 w-16 h-8 text-sm" />
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => removeCriterion(c.id)}><Trash2 size={14} /></Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addCriterion} className="font-black text-[10px]"><Plus size={14} className="mr-1" /> Add Criterion</Button>
    </div>
  );
}

function TimedConfigPanel({ round }: { round: RoundDefinition }) {
  const updateRoundTypeConfig = useGameStore(s => s.updateRoundTypeConfig);
  const config = (round.roundConfig as any) || {};

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Completion Bonus</Label>
        <Input type="number" value={config.completionBonus ?? 10} onChange={(e) => updateRoundTypeConfig(round.id, { ...config, completionBonus: parseInt(e.target.value) || 0 })} />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Penalty Per Second</Label>
        <Input type="number" value={config.penaltyPerSecond ?? 1} onChange={(e) => updateRoundTypeConfig(round.id, { ...config, penaltyPerSecond: parseInt(e.target.value) || 0 })} />
      </div>
    </div>
  );
}

function RoundConfigPanel({ round, onClose }: { round: RoundDefinition; onClose: () => void }) {
  const updateRoundName = useGameStore(s => s.updateRoundName);
  const updateRoundDescription = useGameStore(s => s.updateRoundDescription);
  const updateRoundConfig = useGameStore(s => s.updateRoundConfig);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-lg uppercase tracking-tight">Configure Round</h3>
        <Badge variant="outline" className={ROUND_TYPE_META[round.type]?.color}>{ROUND_TYPE_META[round.type]?.label}</Badge>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Round Name</Label>
          <Input value={round.name} onChange={(e) => updateRoundName(round.id, e.target.value)} className="border-slate-200" />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</Label>
          <Input value={round.description || ''} onChange={(e) => updateRoundDescription(round.id, e.target.value)} className="border-slate-200" placeholder="Optional round description" />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timer</Label>
            <p className="text-xs text-muted-foreground">Enable countdown timer for this round</p>
          </div>
          <Switch checked={round.config.timerEnabled} onCheckedChange={(v) => updateRoundConfig(round.id, { timerEnabled: v })} />
        </div>

        {round.config.timerEnabled && (
          <div className="space-y-2 ml-6">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Default Duration (seconds)</Label>
            <Input type="number" value={round.config.defaultTimerSeconds || 60} onChange={(e) => updateRoundConfig(round.id, { defaultTimerSeconds: parseInt(e.target.value) || 0 })} className="border-slate-200 w-32" />
          </div>
        )}

        <Separator />

        {round.type === 'quiz' && <QuizConfigPanel round={round} />}
        {round.type === 'placement' && <PlacementConfigPanel round={round} />}
        {round.type === 'taste' && <TasteConfigPanel round={round} />}
        {round.type === 'finale' && <FinaleConfigPanel round={round} />}
        {round.type === 'judged' && <JudgedConfigPanel round={round} />}
        {round.type === 'timed' && <TimedConfigPanel round={round} />}
      </div>
    </div>
  );
}

export function RoundEditor({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const rounds = useGameStore(s => s.rounds);
  const addRound = useGameStore(s => s.addRound);
  const removeRound = useGameStore(s => s.removeRound);
  const reorderRounds = useGameStore(s => s.reorderRounds);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [showAddPicker, setShowAddPicker] = useState(false);

  const selectedRound = rounds.find(r => r.id === selectedRoundId);

  const handleMoveRound = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= rounds.length) return;
    reorderRounds(index, newIndex);
  };

  const handleAddRound = (type: EditorRoundType) => {
    addRound(type);
    setShowAddPicker(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="font-black text-2xl uppercase tracking-tight">Round Editor</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">{rounds.length} Rounds</h3>
            </div>

            {rounds.map((round, i) => (
              <RoundCard
                key={round.id}
                round={round}
                index={i}
                total={rounds.length}
                onEdit={() => setSelectedRoundId(round.id)}
                onRemove={() => {
                  if (confirm(`Remove "${round.name}"?`)) removeRound(round.id);
                  if (selectedRoundId === round.id) setSelectedRoundId(null);
                }}
                onMoveUp={() => handleMoveRound(i, -1)}
                onMoveDown={() => handleMoveRound(i, 1)}
              />
            ))}

            {showAddPicker ? (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4">
                <RoundTypePicker onSelect={handleAddRound} onClose={() => setShowAddPicker(false)} />
              </div>
            ) : (
              <Button onClick={() => setShowAddPicker(true)} variant="outline" className="w-full h-12 border-dashed font-black text-[10px] uppercase tracking-widest">
                <Plus size={16} className="mr-2" /> Add Round
              </Button>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 min-h-[400px]">
            {selectedRound ? (
              <RoundConfigPanel round={selectedRound} onClose={() => setSelectedRoundId(null)} />
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <Settings className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-sm font-bold text-muted-foreground">Select a round to configure</p>
                  <p className="text-[10px] text-slate-400 mt-1">Click the gear icon on any round above</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
