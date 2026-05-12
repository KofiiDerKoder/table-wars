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
  teamSecret?: string;
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

export interface SessionInfo {
  id: string;
  code: string;
  isHost: boolean;
  joinedTeamId?: string;
}

interface GameState {
  competitionName: string;
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
  lastScoreChange: { teamId: string; points: number; round: number } | null;
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
  tiebreakerTeams: string[];
  session: SessionInfo | null;
  setCompetitionName: (name: string) => Promise<void>;
  setCurrentRound: (round: number) => Promise<void>;
  setAnnouncement: (text: string) => Promise<void>;
  setGameStatus: (status: 'idle' | 'running' | 'paused' | 'finished') => Promise<void>;
  setIntroTeam: (teamId: string | null) => Promise<void>;
  setTeams: (teams: Team[]) => Promise<void>;
  setSuddenDeath: (active: boolean) => Promise<void>;
  setTiebreakerTeams: (teamIds: string[]) => void;
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
  resetScores: () => Promise<void>;
  undoLastScore: () => Promise<void>;
  updateTeam: (teamId: string, updates: Partial<Omit<Team, 'id' | 'score' | 'roundScores' | 'rank' | 'rankTrend' | 'tasteItemScores'>>) => Promise<void>;
  createSession: () => Promise<SessionInfo | null>;
  joinSession: (code: string, teamId?: string) => Promise<SessionInfo | null>;
  leaveSession: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
}

// ─── Cross-Tab Sync (BroadcastChannel API) ────────────────────────────────
let broadcastChannel: BroadcastChannel | null = null;

function initBroadcastChannel(set: (fn: (state: GameState) => Partial<GameState>) => void) {
  if (typeof window === 'undefined') return;
  try {
    broadcastChannel = new BroadcastChannel('tablewars-sync');
    broadcastChannel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'STATE_UPDATE') {
        set(() => payload);
      }
    };
  } catch {
    // BroadcastChannel not supported
  }
}

function broadcastUpdate(partial: Record<string, unknown>) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'STATE_UPDATE', payload: partial });
    } catch {
      // Ignore broadcast errors
    }
  }
}

// ─── localStorage Persistence ─────────────────────────────────────────────
const STORAGE_KEY = 'tablewars-state';

function saveStateToLocalStorage(state: Partial<GameState>) {
  if (typeof window === 'undefined') return;
  try {
    const serializable = {
      teams: state.teams,
      currentRound: state.currentRound,
      isSuddenDeath: state.isSuddenDeath,
      timer: state.timer,
      quiz: state.quiz,
      tasteTest: state.tasteTest,
      duel: state.duel,
      projectorMode: state.projectorMode,
      announcementText: state.announcementText,
      session: state.session,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // localStorage not available
  }
}

function loadStateFromLocalStorage(): Partial<GameState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Only load if saved within last 24 hours
    if (Date.now() - (data.timestamp || 0) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// ─── Zustand Store ───────────────────────────────────────────────────────

export const useGameStore = create<GameState>((set, get) => {
  if (typeof window !== 'undefined') {
    initBroadcastChannel(set);
  }

  // Load from localStorage on init
  const savedState = loadStateFromLocalStorage();
  const initialState: Partial<GameState> = savedState || {};

  return {
    competitionName: initialState.competitionName || 'Table Wars!',
    currentView: initialState.currentView || 'setup',
    projectorMode: initialState.projectorMode || 'logo',
    announcementText: initialState.announcementText || '',
    introTeamId: initialState.introTeamId || null,
    showConfidenceMonitor: true,
    teams: initialState.teams || [],
    currentRound: initialState.currentRound || 1,
    isSuddenDeath: initialState.isSuddenDeath || false,
    lastScoreChange: null,
    timer: initialState.timer || { duration: 0, remaining: 0, isActive: false },
    quiz: initialState.quiz || { questions: [], currentIndex: 0, isRevealed: false, buzzedTeamId: null },
    tasteTest: initialState.tasteTest || { items: [], currentIndex: 0, isRevealed: false, itemsCustomized: false },
    duel: initialState.duel || { challengerId: null, challengedId: null, winnerId: null, isActive: false },
    session: initialState.session || null,
    tiebreakerTeams: [] as string[],

    setCompetitionName: async (name: string) => {
      set({ competitionName: name });
      broadcastUpdate({ competitionName: name });
      saveStateToLocalStorage({ competitionName: name });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ competition_name: name }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ competition_name: name }).eq('id', 1);
      }
    },

    detectTies: () => {
      const { teams } = get();
      if (teams.length < 2) return [];
      const sorted = [...teams].sort((a, b) => b.score - a.score);
      const maxScore = sorted[0].score;
      const winners = teams.filter(t => t.score === maxScore);
      if (winners.length > 1) {
        return winners.map(t => t.id);
      }
      return [];
    },

    setTiebreakerTeams: (teamIds: string[]) => {
      set({ tiebreakerTeams: teamIds });
    },

    initialize: async () => {
      const { session } = get();
      if (session) {
        // Load from Supabase session
        const { data: state } = await supabase.from('game_state').select('*').eq('session_id', session.id).single();
        const { data: teams } = await supabase.from('teams').select('*').eq('session_id', session.id);
        if (state) set({ 
          currentView: state.current_view, 
          projectorMode: state.projector_mode,
          currentRound: state.current_round,
          timer: { duration: 0, remaining: state.timer_remaining, isActive: state.timer_is_active }
        });
        if (teams) set({ teams: teams as Team[] });
      } else {
        // Load from legacy single-row game_state
        const { data: state } = await supabase.from('game_state').select('*').eq('id', 1).single();
        const { data: teams } = await supabase.from('teams').select('*');
        if (state) set({ 
          currentView: state.current_view, 
          projectorMode: state.projector_mode,
          currentRound: state.current_round,
          timer: { duration: 0, remaining: state.timer_remaining, isActive: state.timer_is_active }
        });
        if (teams) set({ teams: teams as Team[] });
      }
    },

    setView: async (view: View) => {
      set({ currentView: view });
      broadcastUpdate({ currentView: view });
      saveStateToLocalStorage({ currentView: view });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ current_view: view }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ current_view: view }).eq('id', 1);
      }
    },

    updateTeamScore: async (teamId, points, round) => {
      const team = get().teams.find(t => t.id === teamId);
      if (!team) return;
      const newScore = team.score + points;
      const newRoundScores = { ...team.roundScores, [round]: (team.roundScores[round] || 0) + points };
      set((state) => ({
        lastScoreChange: { teamId, points, round },
        teams: state.teams.map(t => t.id === teamId ? { ...t, score: newScore, roundScores: newRoundScores } : t)
      }));
      broadcastUpdate({ teams: get().teams });
      saveStateToLocalStorage({ teams: get().teams, lastScoreChange: { teamId, points, round } });
      
      const { session } = get();
      if (session) {
        await supabase.from('teams').update({ score: newScore, round_scores: newRoundScores }).eq('id', teamId);
      } else {
        await supabase.from('teams').update({ score: newScore, round_scores: newRoundScores }).eq('id', teamId);
      }
    },
    
    setCurrentRound: async (round) => {
      set({ currentRound: round });
      broadcastUpdate({ currentRound: round });
      saveStateToLocalStorage({ currentRound: round });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ current_round: round }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ current_round: round }).eq('id', 1);
      }
    },

    setAnnouncement: async (text) => {
      set({ announcementText: text });
      broadcastUpdate({ announcementText: text });
      saveStateToLocalStorage({ announcementText: text });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ announcement_text: text }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ announcement_text: text }).eq('id', 1);
      }
    },

    setGameStatus: async (status) => {
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ game_status: status }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ game_status: status }).eq('id', 1);
      }
    },

    setIntroTeam: async (id) => {
      set({ introTeamId: id });
      broadcastUpdate({ introTeamId: id });
      saveStateToLocalStorage({ introTeamId: id });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ intro_team_id: id }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ intro_team_id: id }).eq('id', 1);
      }
    },

    setTeams: async (teams) => {
      set({ teams });
      broadcastUpdate({ teams });
      saveStateToLocalStorage({ teams });
      const { session } = get();
      if (session) {
        // Set session_id on each team
        const teamsWithSession = teams.map(t => ({ ...t, session_id: session.id }));
        await supabase.from('teams').upsert(teamsWithSession);
      } else {
        await supabase.from('teams').upsert(teams);
      }
    },

    setSuddenDeath: async (active) => {
      set({ isSuddenDeath: active });
      broadcastUpdate({ isSuddenDeath: active });
      saveStateToLocalStorage({ isSuddenDeath: active });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ is_suddenDeath: active }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ is_suddenDeath: active }).eq('id', 1);
      }
    },
    
    startTimer: async (seconds: number) => {
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ timer_remaining: seconds, timer_is_active: true, timer_duration: seconds }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ timer_remaining: seconds, timer_is_active: true, timer_duration: seconds }).eq('id', 1);
      }
      const timerState = { duration: seconds, remaining: seconds, isActive: true };
      set((state) => ({ timer: timerState }));
      broadcastUpdate({ timer: timerState });
      saveStateToLocalStorage({ timer: timerState });
    },

    stopTimer: async () => {
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ timer_is_active: false }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ timer_is_active: false }).eq('id', 1);
      }
      set((state) => ({ timer: { ...state.timer, isActive: false } }));
      broadcastUpdate({ timer: { ...get().timer, isActive: false } });
      saveStateToLocalStorage({ timer: { ...get().timer, isActive: false } });
    },

    resetTimer: async () => {
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ timer_remaining: 0, timer_is_active: false }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ timer_remaining: 0, timer_is_active: false }).eq('id', 1);
      }
      const timerState = { duration: 0, remaining: 0, isActive: false };
      set({ timer: timerState });
      broadcastUpdate({ timer: timerState });
      saveStateToLocalStorage({ timer: timerState });
    },

    tickTimer: async () => {
      const { timer } = get();
      if (timer.remaining > 0) {
        const newRemaining = timer.remaining - 1;
        const { session } = get();
        if (session) {
          await supabase.from('game_state').update({ timer_remaining: newRemaining }).eq('session_id', session.id);
        } else {
          await supabase.from('game_state').update({ timer_remaining: newRemaining }).eq('id', 1);
        }
        const newTimer = { ...timer, remaining: newRemaining };
        set({ timer: newTimer });
        broadcastUpdate({ timer: newTimer });
        saveStateToLocalStorage({ timer: newTimer });
      }
    },

    revealContent: async () => {
      const { quiz } = get();
      const newQuiz = { ...quiz, isRevealed: !quiz.isRevealed };
      set({ quiz: newQuiz });
      broadcastUpdate({ quiz: newQuiz });
      saveStateToLocalStorage({ quiz: newQuiz });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ quiz_revealed: newQuiz.isRevealed }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ quiz_revealed: newQuiz.isRevealed }).eq('id', 1);
      }
    },

    nextQuestion: async () => {
      const { quiz } = get();
      const newIdx = quiz.currentIndex + 1;
      const newQuiz = { ...quiz, currentIndex: newIdx, isRevealed: false };
      set({ quiz: newQuiz });
      broadcastUpdate({ quiz: newQuiz });
      saveStateToLocalStorage({ quiz: newQuiz });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ quiz_index: newIdx, quiz_revealed: false }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ quiz_index: newIdx, quiz_revealed: false }).eq('id', 1);
      }
    },

    prevQuestion: async () => {
      const { quiz } = get();
      const newIdx = Math.max(0, quiz.currentIndex - 1);
      const newQuiz = { ...quiz, currentIndex: newIdx, isRevealed: false };
      set({ quiz: newQuiz });
      broadcastUpdate({ quiz: newQuiz });
      saveStateToLocalStorage({ quiz: newQuiz });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ quiz_index: newIdx, quiz_revealed: false }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ quiz_index: newIdx, quiz_revealed: false }).eq('id', 1);
      }
    },

    setProjectorMode: async (projectorMode: ProjectorMode) => {
      set({ projectorMode });
      broadcastUpdate({ projectorMode });
      saveStateToLocalStorage({ projectorMode });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ projector_mode: projectorMode }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ projector_mode: projectorMode }).eq('id', 1);
      }
    },

    nextTasteItem: async () => {
      const { tasteTest } = get();
      const newIdx = tasteTest.currentIndex + 1;
      const newTaste = { ...tasteTest, currentIndex: newIdx };
      set({ tasteTest: newTaste });
      broadcastUpdate({ tasteTest: newTaste });
      saveStateToLocalStorage({ tasteTest: newTaste });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ taste_index: newIdx }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ taste_index: newIdx }).eq('id', 1);
      }
    },

    prevTasteItem: async () => {
      const { tasteTest } = get();
      const newIdx = Math.max(0, tasteTest.currentIndex - 1);
      const newTaste = { ...tasteTest, currentIndex: newIdx };
      set({ tasteTest: newTaste });
      broadcastUpdate({ tasteTest: newTaste });
      saveStateToLocalStorage({ tasteTest: newTaste });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ taste_index: newIdx }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ taste_index: newIdx }).eq('id', 1);
      }
    },

    startDuel: async (challengerId: string, challengedId: string) => {
      set((state) => ({ duel: { ...state.duel, challengerId, challengedId, isActive: true } }));
      broadcastUpdate({ duel: get().duel });
      saveStateToLocalStorage({ duel: get().duel });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ duel_challenger: challengerId, duel_challenged: challengedId, duel_active: true }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ duel_challenger: challengerId, duel_challenged: challengedId, duel_active: true }).eq('id', 1);
      }
    },

    endDuel: async (winnerId: string | null) => {
      set((state) => ({ duel: { ...state.duel, winnerId, isActive: false } }));
      broadcastUpdate({ duel: get().duel });
      saveStateToLocalStorage({ duel: get().duel });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ duel_winner: winnerId, duel_active: false }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ duel_winner: winnerId, duel_active: false }).eq('id', 1);
      }
    },

    setTasteScore: async (teamId, itemId, points) => {
      const { teams, currentRound } = get();
      const team = teams.find(t => t.id === teamId);
      if (!team) return;
      
      const oldScoreForThisItem = team.tasteItemScores[itemId] || 0;
      const newScore = team.score - oldScoreForThisItem + points;
      const roundKey = currentRound;
      const newRoundScores = { ...team.roundScores, [roundKey]: (team.roundScores[roundKey] || 0) - oldScoreForThisItem + points };
      const newTasteItemScores = { ...team.tasteItemScores, [itemId]: points };

      const { session } = get();
      if (session) {
        await supabase.from('teams').update({ 
          score: newScore, 
          round_scores: newRoundScores,
          taste_item_scores: newTasteItemScores
        }).eq('id', teamId);
      } else {
        await supabase.from('teams').update({ 
          score: newScore, 
          round_scores: newRoundScores,
          taste_item_scores: newTasteItemScores
        }).eq('id', teamId);
      }
      
      set((state) => ({
        teams: state.teams.map(t => t.id === teamId ? { ...t, score: newScore, roundScores: newRoundScores, tasteItemScores: newTasteItemScores } : t)
      }));
      broadcastUpdate({ teams: get().teams });
      saveStateToLocalStorage({ teams: get().teams });
    },

    setTasteItems: async (items) => {
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ taste_items: items }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ taste_items: items }).eq('id', 1);
      }
      set((state) => ({ tasteTest: { ...state.tasteTest, items } }));
      broadcastUpdate({ tasteTest: get().tasteTest });
      saveStateToLocalStorage({ tasteTest: get().tasteTest });
    },

    addTasteItem: async (item) => {
      const newItems = [...get().tasteTest.items, item];
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ taste_items: newItems }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ taste_items: newItems }).eq('id', 1);
      }
      set((state) => ({ tasteTest: { ...state.tasteTest, items: newItems } }));
      broadcastUpdate({ tasteTest: get().tasteTest });
      saveStateToLocalStorage({ tasteTest: get().tasteTest });
    },

    updateTasteItem: async (item) => {
      const newItems = get().tasteTest.items.map(i => i.id === item.id ? item : i);
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ taste_items: newItems }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ taste_items: newItems }).eq('id', 1);
      }
      set((state) => ({ tasteTest: { ...state.tasteTest, items: newItems } }));
      broadcastUpdate({ tasteTest: get().tasteTest });
      saveStateToLocalStorage({ tasteTest: get().tasteTest });
    },

    removeTasteItem: async (id) => {
      const newItems = get().tasteTest.items.filter(i => i.id !== id);
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ taste_items: newItems }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ taste_items: newItems }).eq('id', 1);
      }
      set((state) => ({ tasteTest: { ...state.tasteTest, items: newItems } }));
      broadcastUpdate({ tasteTest: get().tasteTest });
      saveStateToLocalStorage({ tasteTest: get().tasteTest });
    },

    toggleTimer: () => {
      set((state) => ({ timer: { ...state.timer, isActive: !state.timer.isActive } }));
      broadcastUpdate({ timer: get().timer });
      saveStateToLocalStorage({ timer: get().timer });
    },

    setQuizQuestions: async (questions) => {
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ quiz_questions: questions }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ quiz_questions: questions }).eq('id', 1);
      }
      set((state) => ({ quiz: { ...state.quiz, questions } }));
      broadcastUpdate({ quiz: get().quiz });
      saveStateToLocalStorage({ quiz: get().quiz });
    },

    buzzIn: async (teamId: string) => {
      const { quiz, session } = get();
      const newQuiz = { ...quiz, buzzedTeamId: teamId };
      set({ quiz: newQuiz });
      broadcastUpdate({ quiz: newQuiz });
      saveStateToLocalStorage({ quiz: newQuiz });

      if (session) {
        // Use the lock_buzz_for_question function for real-time buzz locking
        const { data } = await supabase.rpc('lock_buzz_for_question', {
          p_session_id: session.id,
          p_team_id: teamId,
          p_question_index: quiz.currentIndex
        });
        
        if (data) {
          await supabase.from('game_state').update({ buzzed_team_id: teamId }).eq('session_id', session.id);
        }
      } else {
        await supabase.from('game_state').update({ buzzed_team_id: teamId }).eq('id', 1);
      }
    },

    clearBuzz: async () => {
      const { quiz } = get();
      const newQuiz = { ...quiz, buzzedTeamId: null };
      set({ quiz: newQuiz });
      broadcastUpdate({ quiz: newQuiz });
      saveStateToLocalStorage({ quiz: newQuiz });
      const { session } = get();
      if (session) {
        await supabase.from('game_state').update({ buzzed_team_id: null }).eq('session_id', session.id);
      } else {
        await supabase.from('game_state').update({ buzzed_team_id: null }).eq('id', 1);
      }
    },

    resetAll: async () => {
      const { session } = get();
      if (session) {
        await supabase.from('teams').update({ score: 0, round_scores: {} }).eq('session_id', session.id);
        await supabase.from('game_state').update({ 
          current_view: 'setup',
          current_round: 1,
          buzzed_team_id: null
        }).eq('session_id', session.id);
      } else {
        await supabase.from('teams').update({ score: 0, round_scores: {} }).neq('id', 'non-existent');
        await supabase.from('game_state').update({ 
          current_view: 'setup',
          current_round: 1,
          buzzed_team_id: null
        }).eq('id', 1);
      }
      set({
        currentView: 'setup',
        currentRound: 1,
        lastScoreChange: null,
        teams: get().teams.map(t => ({ ...t, score: 0, roundScores: {} }))
      });
      broadcastUpdate({ currentView: 'setup', currentRound: 1 });
      saveStateToLocalStorage({ currentView: 'setup', currentRound: 1 });
    },

    resetScores: async () => {
      const { session } = get();
      if (session) {
        await supabase.from('teams').update({ score: 0, round_scores: {} }).eq('session_id', session.id);
      } else {
        await supabase.from('teams').update({ score: 0, round_scores: {} }).neq('id', 'non-existent');
      }
      set({
        lastScoreChange: null,
        teams: get().teams.map(t => ({ ...t, score: 0, roundScores: {} }))
      });
      broadcastUpdate({ teams: get().teams });
      saveStateToLocalStorage({ teams: get().teams });
    },

    undoLastScore: async () => {
      const { lastScoreChange, teams } = get();
      if (!lastScoreChange) return;
      const team = teams.find(t => t.id === lastScoreChange.teamId);
      if (!team) return;
      const newScore = team.score - lastScoreChange.points;
      const newRoundScores = { ...team.roundScores, [lastScoreChange.round]: (team.roundScores[lastScoreChange.round] || 0) - lastScoreChange.points };
      
      const { session } = get();
      if (session) {
        await supabase.from('teams').update({ score: newScore, round_scores: newRoundScores }).eq('id', lastScoreChange.teamId);
      } else {
        await supabase.from('teams').update({ score: newScore, round_scores: newRoundScores }).eq('id', lastScoreChange.teamId);
      }
      set({
        lastScoreChange: null,
        teams: teams.map(t => t.id === lastScoreChange.teamId ? { ...t, score: newScore, roundScores: newRoundScores } : t)
      });
      broadcastUpdate({ teams: get().teams });
      saveStateToLocalStorage({ teams: get().teams, lastScoreChange: null });
    },

    updateTeam: async (teamId, updates) => {
      const { session } = get();
      if (session) {
        await supabase.from('teams').update(updates).eq('id', teamId);
      } else {
        await supabase.from('teams').update(updates).eq('id', teamId);
      }
      set((state) => ({
        teams: state.teams.map(t => t.id === teamId ? { ...t, ...updates } : t)
      }));
      broadcastUpdate({ teams: get().teams });
      saveStateToLocalStorage({ teams: get().teams });
    },

    // ─── Session Management ───────────────────────────────────────────────
    createSession: async () => {
      // Generate a unique 6-char code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert([{ code, is_active: true }])
        .select()
        .single();

      if (error || !data) {
        console.error('Failed to create session:', error);
        return null;
      }

      // Create initial game_state for the session
      const { teams, currentRound, projectorMode, announcementText, quiz, tasteTest } = get();
      const { error: gsError } = await supabase
        .from('game_state')
        .insert([{ 
          session_id: data.id,
          current_view: 'setup',
          current_round: currentRound,
          projector_mode: projectorMode,
          announcement_text: announcementText,
          quiz_index: quiz.currentIndex,
          quiz_questions: quiz.questions,
          taste_items: tasteTest.items,
          taste_index: tasteTest.currentIndex
        }]);

      if (gsError) {
        console.error('Failed to create game state:', gsError);
        return null;
      }

      // Insert existing teams if any
      if (teams.length > 0) {
        const teamsToInsert = teams.map(t => ({
          ...t,
          id: t.id, // Keep the same ID
          session_id: data.id,
          round_scores: t.roundScores,
          taste_item_scores: t.tasteItemScores
        }));
        // Remove local-only fields if they aren't in the DB schema
        const cleanedTeams = teamsToInsert.map(({ roundScores, tasteItemScores, rankTrend, memberCount, ...rest }) => ({
          ...rest,
          round_scores: roundScores,
          taste_item_scores: tasteItemScores,
          rank_trend: rankTrend,
          member_count: memberCount
        }));

        await supabase.from('teams').insert(cleanedTeams);
      }

      const sessionInfo: SessionInfo = {
        id: data.id,
        code: data.code,
        isHost: true,
      };

      set({ session: sessionInfo });
      saveStateToLocalStorage({ session: sessionInfo });
      return sessionInfo;
    },

    joinSession: async (code: string, teamId?: string) => {
      const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !session) {
        console.error('Failed to join session:', error);
        return null;
      }

      const sessionInfo: SessionInfo = {
        id: session.id,
        code: session.code,
        isHost: false,
        joinedTeamId: teamId,
      };

      set({ session: sessionInfo });
      saveStateToLocalStorage({ session: sessionInfo });

      // Subscribe to realtime updates for this session
      const channel = supabase.channel(`session:${session.id}`);
      channel
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state', filter: `session_id=eq.${session.id}` }, (payload) => {
          const n = payload.new as Record<string, unknown>;
          useGameStore.setState({
            currentView: n.current_view as View ?? undefined,
            projectorMode: n.projector_mode as ProjectorMode ?? undefined,
            currentRound: (n.current_round as number) ?? undefined,
            announcementText: n.announcement_text as string ?? '',
            isSuddenDeath: (n.is_suddenDeath as boolean) ?? false,
            introTeamId: n.intro_team_id as string | null ?? null,
            timer: {
              duration: (n.timer_duration as number) ?? 0,
              remaining: (n.timer_remaining as number) ?? 0,
              isActive: (n.timer_is_active as boolean) ?? false,
            },
            quiz: {
              questions: (n.quiz_questions as []) ?? [],
              currentIndex: (n.quiz_index as number) ?? 0,
              isRevealed: (n.quiz_revealed as boolean) ?? false,
              buzzedTeamId: n.buzzed_team_id as string | null ?? null,
            },
            tasteTest: {
              items: (n.taste_items as []) ?? [],
              currentIndex: (n.taste_index as number) ?? 0,
              isRevealed: false,
              itemsCustomized: false,
            },
          });
        })
        .subscribe();

      return sessionInfo;
    },

    leaveSession: () => {
      set({ session: null });
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    saveToLocalStorage: () => {
      saveStateToLocalStorage(get());
    },

    loadFromLocalStorage: () => {
      const saved = loadStateFromLocalStorage();
      if (saved) {
        set(saved as Partial<GameState>);
        return true;
      }
      return false;
    },
  };
});

// ─── Supabase Realtime Subscriptions (Legacy Fallback) ────────────────────
let channel: ReturnType<typeof supabase.channel> | null = null;

if (typeof window !== 'undefined') {
  channel = supabase.channel('game_updates');

  channel
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state' }, (payload: { new: Record<string, unknown> }) => {
      const n = payload.new as Record<string, unknown>;
      // Only apply if NOT session-scoped (legacy mode)
      if (!n.session_id) {
        useGameStore.setState({ 
          currentView: n.current_view as View ?? undefined,
          projectorMode: n.projector_mode as ProjectorMode ?? undefined,
          currentRound: (n.current_round as number) ?? undefined,
          announcementText: n.announcement_text as string ?? '',
          isSuddenDeath: (n.is_suddenDeath as boolean) ?? false,
          introTeamId: n.intro_team_id as string | null ?? null,
          timer: {
            duration: (n.timer_duration as number) ?? 0,
            remaining: (n.timer_remaining as number) ?? 0,
            isActive: (n.timer_is_active as boolean) ?? false,
          },
          quiz: {
            questions: (n.quiz_questions as []) ?? [],
            currentIndex: (n.quiz_index as number) ?? 0,
            isRevealed: (n.quiz_revealed as boolean) ?? false,
            buzzedTeamId: n.buzzed_team_id as string | null ?? null,
          },
          tasteTest: {
            items: (n.taste_items as []) ?? [],
            currentIndex: (n.taste_index as number) ?? 0,
            isRevealed: false,
            itemsCustomized: false,
          },
          duel: {
            challengerId: n.duel_challenger as string | null ?? null,
            challengedId: n.duel_challenged as string | null ?? null,
            winnerId: n.duel_winner as string | null ?? null,
            isActive: (n.duel_active as boolean) ?? false,
          },
        });
      }
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' }, (payload: { new: Record<string, unknown> }) => {
      const newTeam = payload.new as Record<string, unknown>;
      useGameStore.setState((state) => ({
        teams: state.teams.map(t => t.id === newTeam.id ? { ...t, ...newTeam } as Team : t)
      }));
    })
    .subscribe();
}