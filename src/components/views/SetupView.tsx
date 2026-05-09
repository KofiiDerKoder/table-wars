'use client';

import { useGameStore, Team } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { Plus, Trash2, Trophy, Users, ChefHat, Play } from 'lucide-react';
import { useState } from 'react';
import { DEFAULT_QUIZ_QUESTIONS, DEFAULT_TASTE_ITEMS } from '@/lib/constants';
import { clsx } from 'clsx';

const COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#eab308', 
  '#a855f7', '#f97316', '#ec4899', '#06b6d4'
];

export function SetupView() {
  const { teams, setTeams, setView, setQuizQuestions, setTasteItems } = useGameStore();
  console.log('SetupView rendered, teams length:', teams.length);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamChant, setNewTeamChant] = useState('');

  const addTeam = () => {
    if (teams.length >= 8 || !newTeamName.trim()) return;
    const newTeam: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTeamName,
      chant: newTeamChant,
      color: COLORS[teams.length % COLORS.length],
      score: 0,
      roundScores: {},
      memberCount: 4,
      rank: teams.length + 1,
      rankTrend: 'stable' as const,
      tasteItemScores: {},
    };
    setTeams([...teams, newTeam]);
    setNewTeamName('');
    setNewTeamChant('');
  };

  const removeTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id));
  };

  const handleStart = () => {
    console.log('Start Competition button clicked!');
    console.log('Current teams length:', teams.length);
    if (teams.length < 3) {
      console.warn('Need at least 3 teams to start. Current:', teams.length);
      return;
    }
    setQuizQuestions(DEFAULT_QUIZ_QUESTIONS);
    setTasteItems(DEFAULT_TASTE_ITEMS);
    setView('host');
  };

  return (
    <div className="min-h-screen bg-muted/30 text-foreground font-sans p-12">
      <section className="mb-12 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4">
          <Trophy className="w-20 h-20 text-primary" strokeWidth={1.5} />
          <h1 className="text-8xl font-black tracking-tighter uppercase text-foreground">
            Table <span className="text-primary">Wars!</span>
          </h1>
          <p className="text-2xl text-muted-foreground font-medium tracking-wide max-w-2xl">
            Configure your teams, set the stage, and prepare for the ultimate event management showdown.
          </p>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border border-border bg-white shadow-lg shadow-slate-100">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-foreground font-black text-2xl uppercase tracking-tight">
              <Users className="text-primary" /> Team Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 items-end">
              <div className="space-y-2">
                <Label htmlFor="teamName" className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Team Name</Label>
                <Input id="teamName" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="e.g. The Lions" className="h-12 border-border focus:border-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamChant" className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Team Chant</Label>
                <Input id="teamChant" value={newTeamChant} onChange={(e) => setNewTeamChant(e.target.value)} placeholder="e.g. Roar for the Lions!" className="h-12 border-border focus:border-primary" />
              </div>
              <Button onClick={addTeam} className="md:col-span-2 h-12 font-black uppercase tracking-widest" disabled={teams.length >= 8 || !newTeamName}>
                <Plus className="mr-2" /> Add Team
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <motion.div key={team.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between group shadow-sm bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full shadow-inner border border-white" style={{ backgroundColor: team.color }} />
                    <div>
                      <h3 className="font-black text-lg text-foreground uppercase tracking-tight">{team.name}</h3>
                      <p className="text-xs text-muted-foreground italic tracking-wide">{team.chant || 'No chant set'}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeTeam(team.id)} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </Button>
                </motion.div>
              ))}
              {teams.length === 0 && (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl text-muted-foreground italic font-medium">
                  Teams will appear here once added.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border border-border bg-white shadow-lg shadow-slate-100">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-foreground uppercase tracking-tight font-black">Competition Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {[
                { label: 'Teams Configured', value: `${teams.length} / 8` },
                { label: 'Total Rounds', value: '5 Rounds' },
                { label: 'Current State', value: 'PRE-GAME' }
              ].map(info => (
                <div key={info.label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-muted-foreground font-medium text-sm">{info.label}</span>
                  <span className="font-black text-foreground text-lg">{info.value}</span>
                </div>
              ))}
              <Button onClick={handleStart} className="w-full h-16 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                <Play className="mr-2" /> Start Competition
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
