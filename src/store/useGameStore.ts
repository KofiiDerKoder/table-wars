import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type View = 'setup' | 'host' | 'scoreboard' | 'team' | 'results';
export type ProjectorMode = 'scoreboard' | 'black' | 'logo' | 'announcement' | 'intro';

export type Team = {
  id: string;
  name: string;
  color: string;
  score: number;
  roundScores: Record<number, number>;
  rank: number;
  rankTrend: 'up' | 'down' | 'stable';
  chant?: string;
  memberCount: number;
  tasteItemScores: Record<string, number>;
};

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

export interface TasteItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  hint?: string;
}

interface GameState {
  currentView: View;
  projectorMode: ProjectorMode;
  announcementText: string;
  introTeamId: string | null;
  showConfidenceMonitor: boolean;
  teams: Team[];
  timer: {
    duration: number;
    remaining: number;
    isActive: boolean;
  };
  currentRound: number;
  isSuddenDeath: boolean;
  quiz: {
    questions: QuizQuestion[];
    currentIndex: number;
    isRevealed: boolean;
    buzzedTeamId: string | null;
  };
  tasteTest: {
    items: TasteItem[];
    currentIndex: number;
    isRevealed: boolean;
    itemsCustomized: boolean;
  };
  duel: {
    challengerId: string | null;
    challengedId: string | null;
    winnerId: string | null;
    isActive: boolean;
  };
  setCurrentRound: (round: number) => Promise<void>;
  setAnnouncement: (text: string) => Promise<void>;
  setGameStatus: (status: 'idle' | 'running' | 'paused' | 'finished') => Promise<void>;
  setIntroTeam: (teamId: string | null) => Promise<void>;
  setTeams: (teams: Team[]) => Promise<void>;
  setSuddenDeath: (active: boolean) => Promise<void>;
  initialize: () => Promise<void>;
  setView: (view: View) => Promise<void>;
  updateTeamScore: (teamId: string, points: number, round: number) => Promise<void>;
  startTimer: (seconds: number) => Promise<void>;
  stopTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  tickTimer: () => Promise<void>;
  toggleTimer: () => void;
  setTasteScore: (teamId: string, itemId: string, points: number) => Promise<void>;
  setTasteItems: (items: TasteItem[]) => Promise<void>;
  addTasteItem: (item: TasteItem) => Promise<void>;
  updateTasteItem: (item: TasteItem) => Promise<void>;
  removeTasteItem: (id: string) => Promise<void>;
  revealContent: () => Promise<void>;
  setQuizQuestions: (questions: QuizQuestion[]) => Promise<void>;
  nextQuestion: () => Promise<void>;
  prevQuestion: () => Promise<void>;
  buzzIn: (teamId: string) => Promise<void>;
  clearBuzz: () => Promise<void>;
  setProjectorMode: (mode: ProjectorMode) => Promise<void>;
  nextTasteItem: () => Promise<void>;
  prevTasteItem: () => Promise<void>;
  startDuel: (challengerId: string, challengedId: string) => Promise<void>;
  endDuel: (winnerId: string | null) => Promise<void>;
  resetAll: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentView: 'setup',
  projectorMode: 'logo',
  announcementText: '',
  introTeamId: null,
  showConfidenceMonitor: true,
  teams: [],
  currentRound: 1,
  isSuddenDeath: false,
  timer: { duration: 0, remaining: 0, isActive: false },
  quiz: { questions: [], currentIndex: 0, isRevealed: false, buzzedTeamId: null },
  tasteTest: { items: [], currentIndex: 0, isRevealed: false, itemsCustomized: false },
  duel: { challengerId: null, challengedId: null, winnerId: null, isActive: false },

  initialize: async () => {
    const { data: state } = await supabase.from('game_state').select('*').eq('id', 1).single();
    const { data: teams } = await supabase.from('teams').select('*');
    if (state) set({ 
        currentView: state.current_view, 
        projectorMode: state.projector_mode,
        currentRound: state.current_round,
        timer: { duration: 0, remaining: state.timer_remaining, isActive: state.timer_is_active }
    });
    if (teams) set({ teams: teams as Team[] });
  },

  setView: async (view: View) => {
    set({ currentView: view });
    try {
      await supabase.from('game_state').update({ current_view: view }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist view:', error);
    }
  },

  updateTeamScore: async (teamId, points, round) => {
    const team = get().teams.find(t => t.id === teamId);
    if (!team) return;
    const newScore = team.score + points;
    const newRoundScores = { ...team.roundScores, [round]: (team.roundScores[round] || 0) + points };
    set((state) => ({
      teams: state.teams.map(t => t.id === teamId ? { ...t, score: newScore, roundScores: newRoundScores } : t)
    }));
    try {
      await supabase.from('teams').update({ score: newScore, round_scores: newRoundScores }).eq('id', teamId);
      const { data: updatedTeam } = await supabase.from('teams').select('*').eq('id', teamId).single();
      if (updatedTeam) {
        set((state) => ({
          teams: state.teams.map(t => t.id === teamId ? { ...t, score: updatedTeam.score, roundScores: updatedTeam.round_scores } : t)
        }));
      }
    } catch (error) {
      console.warn('Failed to persist team score:', error);
    }
  },
  
  setCurrentRound: async (round) => {
    set({ currentRound: round });
    try {
      await supabase.from('game_state').update({ current_round: round }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist current round:', error);
    }
  },
  setAnnouncement: async (text) => {
    set({ announcementText: text });
    try {
      await supabase.from('game_state').update({ announcement_text: text }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist announcement:', error);
    }
  },
  setGameStatus: async (status) => {
    try {
      await supabase.from('game_state').update({ game_status: status }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist game status:', error);
    }
  },
  setIntroTeam: async (id) => {
    set({ introTeamId: id });
    try {
      await supabase.from('game_state').update({ intro_team_id: id }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist intro team:', error);
    }
  },
  setTeams: async (teams) => {
    set({ teams });
    try {
      await supabase.from('teams').upsert(teams);
    } catch (error) {
      console.warn('Failed to persist teams:', error);
    }
  },
  setSuddenDeath: async (active) => {
    set({ isSuddenDeath: active });
    try {
      await supabase.from('game_state').update({ is_suddenDeath: active }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist sudden death:', error);
    }
  },
  
  startTimer: async (seconds: number) => {
    await supabase.from('game_state').update({ timer_remaining: seconds, timer_is_active: true }).eq('id', 1);
    set((state) => ({ timer: { duration: seconds, remaining: seconds, isActive: true } }));
  },
  stopTimer: async () => {
    await supabase.from('game_state').update({ timer_is_active: false }).eq('id', 1);
    set((state) => ({ timer: { ...state.timer, isActive: false } }));
  },
  resetTimer: async () => {
    await supabase.from('game_state').update({ timer_remaining: 0, timer_is_active: false }).eq('id', 1);
    set({ timer: { duration: 0, remaining: 0, isActive: false } });
  },
  tickTimer: async () => {
    const { timer } = get();
    if (timer.remaining > 0) {
      const newRemaining = timer.remaining - 1;
      await supabase.from('game_state').update({ timer_remaining: newRemaining }).eq('id', 1);
      set({ timer: { ...timer, remaining: newRemaining } });
    }
  },
  revealContent: async () => {
    const { quiz } = get();
    set({ quiz: { ...quiz, isRevealed: true } });
    try {
      await supabase.from('game_state').update({ quiz_revealed: true }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist reveal state:', error);
    }
  },
  nextQuestion: async () => {
    const { quiz } = get();
    const newIdx = quiz.currentIndex + 1;
    set({ quiz: { ...quiz, currentIndex: newIdx, isRevealed: false } });
    try {
      await supabase.from('game_state').update({ quiz_index: newIdx, quiz_revealed: false }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist next question:', error);
    }
  },
  prevQuestion: async () => {
    const { quiz } = get();
    const newIdx = Math.max(0, quiz.currentIndex - 1);
    set({ quiz: { ...quiz, currentIndex: newIdx, isRevealed: false } });
    try {
      await supabase.from('game_state').update({ quiz_index: newIdx, quiz_revealed: false }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist previous question:', error);
    }
  },
  setProjectorMode: async (projectorMode: ProjectorMode) => {
    set({ projectorMode });
    try {
      await supabase.from('game_state').update({ projector_mode: projectorMode }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist projector mode:', error);
    }
  },
  nextTasteItem: async () => {
    const { tasteTest } = get();
    const newIdx = tasteTest.currentIndex + 1;
    set({ tasteTest: { ...tasteTest, currentIndex: newIdx } });
    try {
      await supabase.from('game_state').update({ taste_index: newIdx }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist taste item index:', error);
    }
  },
  prevTasteItem: async () => {
    const { tasteTest } = get();
    const newIdx = Math.max(0, tasteTest.currentIndex - 1);
    set({ tasteTest: { ...tasteTest, currentIndex: newIdx } });
    try {
      await supabase.from('game_state').update({ taste_index: newIdx }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist taste item index:', error);
    }
  },
  startDuel: async (challengerId: string, challengedId: string) => {
    set((state) => ({ duel: { ...state.duel, challengerId, challengedId, isActive: true } }));
    try {
      await supabase.from('game_state').update({ duel_challenger: challengerId, duel_challenged: challengedId, duel_active: true }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist duel start:', error);
    }
  },
  endDuel: async (winnerId: string | null) => {
    set((state) => ({ duel: { ...state.duel, winnerId, isActive: false } }));
    try {
      await supabase.from('game_state').update({ duel_winner: winnerId, duel_active: false }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist duel end:', error);
    }
  },
  setTasteScore: async (teamId, itemId, points) => {
    const team = get().teams.find(t => t.id === teamId);
    if (!team) return;
    
    // Calculate new score and round score
    const oldScoreForThisItem = team.tasteItemScores[itemId] || 0;
    const newScore = team.score - oldScoreForThisItem + points;
    const newRoundScores = { ...team.roundScores, 4: (team.roundScores[4] || 0) - oldScoreForThisItem + points };
    const newTasteItemScores = { ...team.tasteItemScores, [itemId]: points };

    await supabase.from('teams').update({ 
      score: newScore, 
      round_scores: newRoundScores,
      taste_item_scores: newTasteItemScores
    }).eq('id', teamId);
    
    // Optimistic local update
    set((state) => ({
      teams: state.teams.map(t => t.id === teamId ? { ...t, score: newScore, roundScores: newRoundScores, tasteItemScores: newTasteItemScores } : t)
    }));
  },
  setTasteItems: async (items) => {
    await supabase.from('game_state').update({ taste_items: items }).eq('id', 1);
    set((state) => ({ tasteTest: { ...state.tasteTest, items } }));
  },
  addTasteItem: async (item) => {
    const newItems = [...get().tasteTest.items, item];
    await supabase.from('game_state').update({ taste_items: newItems }).eq('id', 1);
    set((state) => ({ tasteTest: { ...state.tasteTest, items: newItems } }));
  },
  updateTasteItem: async (item) => {
    const newItems = get().tasteTest.items.map(i => i.id === item.id ? item : i);
    await supabase.from('game_state').update({ taste_items: newItems }).eq('id', 1);
    set((state) => ({ tasteTest: { ...state.tasteTest, items: newItems } }));
  },
  removeTasteItem: async (id) => {
    const newItems = get().tasteTest.items.filter(i => i.id !== id);
    await supabase.from('game_state').update({ taste_items: newItems }).eq('id', 1);
    set((state) => ({ tasteTest: { ...state.tasteTest, items: newItems } }));
  },
  toggleTimer: () => set((state) => ({ timer: { ...state.timer, isActive: !state.timer.isActive } })),
  setQuizQuestions: async (questions) => {
    await supabase.from('game_state').update({ quiz_questions: questions }).eq('id', 1);
    set((state) => ({ quiz: { ...state.quiz, questions } }));
  },
  buzzIn: async (teamId: string) => {
    const { quiz } = get();
    set({ quiz: { ...quiz, buzzedTeamId: teamId } });
    try {
      await supabase.from('game_state').update({ buzzed_team_id: teamId }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist buzz:', error);
    }
  },
  clearBuzz: async () => {
    const { quiz } = get();
    set({ quiz: { ...quiz, buzzedTeamId: null } });
    try {
      await supabase.from('game_state').update({ buzzed_team_id: null }).eq('id', 1);
    } catch (error) {
      console.warn('Failed to persist buzz clear:', error);
    }
  },
  resetAll: async () => {
    await supabase.from('teams').update({ score: 0, round_scores: {} }).neq('id', 'non-existent');
    await supabase.from('game_state').update({ 
      current_view: 'setup',
      current_round: 1,
      buzzed_team_id: null
    }).eq('id', 1);
    set({
      currentView: 'setup',
      currentRound: 1,
      teams: get().teams.map(t => ({ ...t, score: 0, roundScores: {} }))
    });
  },
}));

// Initialize Supabase Subscriptions
const channel = supabase.channel('game_updates');

channel
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state' }, (payload: { new: Record<string, unknown> }) => {
    const newState = payload.new as {
      current_view: View;
      projector_mode: ProjectorMode;
      current_round: number;
      announcement_text: string;
    };
    useGameStore.setState({ 
      currentView: newState.current_view,
      projectorMode: newState.projector_mode,
      currentRound: newState.current_round,
      announcementText: newState.announcement_text
    });
  })
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' }, (payload: { new: Team }) => {
    useGameStore.setState((state) => ({
      teams: state.teams.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t)
    }));
  })
  .subscribe();
