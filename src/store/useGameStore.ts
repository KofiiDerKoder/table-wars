import { create } from 'zustand';
import { broadcastUpdate, saveState, loadState, initSync, setBroadcastHandler, clearSync } from '@/services/syncService';
import * as gameService from '@/services/gameService';
import * as teamService from '@/services/teamService';
import * as sessionService from '@/services/sessionService';
import * as buzzService from '@/services/buzzService';
import { subscribeToGameState, subscribeToGameStateLegacy, subscribeToTeamsLegacy } from '@/services/realtimeService';
import { RoundDefinition, RoundData, createDefaultRounds, RoundType, createDefaultRoundConfig } from '@/types/rounds';

// --- Types & Interfaces ---------------------------------------------------

/** High-level application views */
export type View = 'setup' | 'host' | 'scoreboard' | 'team' | 'results' | 'join' | 'certificates';

/** Display modes for the projector scoreboard */
export type ProjectorMode = 'scoreboard' | 'black' | 'logo' | 'announcement' | 'intro';

/** Represents a competing table/team */
export type Team = {
  id: string;
  name: string;
  color: string;
  score: number;
  /** Cumulative points per round (1-5) */
  roundScores: Record<number, number>;
  rank: number;
  rankTrend: 'up' | 'down' | 'stable';
  chant?: string;
  memberCount: number;
  /** Granular scores for Round 4 items */
  tasteItemScores: Record<string, number>;
  teamSecret?: string;
};

/** Round 1 & 5 trivia structure */
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

/** Round 4 blind taste item structure */
export interface TasteItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  hint?: string;
}

/** Meta-info for the active multi-device session */
export interface SessionInfo {
  id: string;
  code: string;
  isHost: boolean;
  joinedTeamId?: string;
}

/** The unified state shape for Table Wars */
interface GameState {
  // --- Competition Metadata ---
  competitionName: string;
  currentView: View;
  projectorMode: ProjectorMode;
  announcementText: string;
  introTeamId: string | null;
  showConfidenceMonitor: boolean;
  teams: Team[];
  
  // --- Timer Engine ---
  timer: {
    duration: number;
    remaining: number;
    isActive: boolean;
  };
  
  // --- Game Mechanics ---
  currentRound: number;
  isSuddenDeath: boolean;
  /** Used for the Undo Score feature */
  lastScoreChange: { teamId: string; points: number; round: number } | null;
  
  // --- Round System (Data-Driven) ---
  rounds: RoundDefinition[];
  roundsData: RoundData;

  // --- Round-Specific Data (Backward Compat) ---
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

  // --- Actions ---
  setCompetitionName: (name: string) => Promise<void>;
  setCurrentRound: (round: number) => Promise<void>;
  setAnnouncement: (text: string) => Promise<void>;
  setGameStatus: (status: 'idle' | 'running' | 'paused' | 'finished') => Promise<void>;
  setIntroTeam: (teamId: string | null) => Promise<void>;
  setTeams: (teams: Team[]) => Promise<void>;
  setSuddenDeath: (active: boolean) => Promise<void>;
  setTiebreakerTeams: (teamIds: string[]) => void;
  setRounds: (rounds: RoundDefinition[]) => Promise<void>;
  getRoundData: <T>(roundId: string, key: string, defaultValue: T) => T;
  setRoundData: (roundId: string, key: string, value: unknown) => Promise<void>;
  addRound: (type: RoundType) => void;
  removeRound: (roundId: string) => void;
  reorderRounds: (fromIndex: number, toIndex: number) => void;
  updateRoundName: (roundId: string, name: string) => void;
  updateRoundDescription: (roundId: string, description: string) => void;
  updateRoundConfig: (roundId: string, config: Partial<RoundDefinition['config']>) => void;
  updateRoundTypeConfig: (roundId: string, roundConfig: RoundDefinition['roundConfig']) => void;
  setRoundQuestions: (roundId: string, questions: QuizQuestion[]) => void;
  setRoundTasteItems: (roundId: string, items: TasteItem[]) => void;
  setRoundPlacementValues: (roundId: string, pointValues: number[]) => void;
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
  setJoinedTeam: (teamId: string | undefined) => void;
  detectTies: () => Team[];
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
}

// ─── The Game Store ───────────────────────────────────────────────────────

export const useGameStore = create<GameState>((set, get) => {
  if (typeof window !== 'undefined') {
    initSync();
    setBroadcastHandler((data) => set(() => data));
  }

  const savedState = loadState();
  const initialState: Partial<GameState> = savedState || {};

  return {
    // --- Initial State ---
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
    rounds: initialState.rounds?.length ? initialState.rounds : createDefaultRounds(),
    roundsData: initialState.roundsData || {},
    quiz: initialState.quiz || { questions: [], currentIndex: 0, isRevealed: false, buzzedTeamId: null },
    tasteTest: initialState.tasteTest || { items: [], currentIndex: 0, isRevealed: false, itemsCustomized: false },
    duel: initialState.duel || { challengerId: null, challengedId: null, winnerId: null, isActive: false },
    session: initialState.session || null,
    tiebreakerTeams: [] as string[],

    // --- State Actions ---

    setCompetitionName: async (name: string) => {
      set({ competitionName: name });
      broadcastUpdate({ competitionName: name });
      saveState({ competitionName: name });
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'competition_name', name);
    },

    detectTies: () => {
      const { teams } = get();
      if (teams.length < 2) return [];
      const sorted = [...teams].sort((a, b) => b.score - a.score);
      const maxScore = sorted[0].score;
      const winners = teams.filter(t => t.score === maxScore);
      if (winners.length > 1) {
        return winners;
      }
      return [];
    },

    setTiebreakerTeams: (teamIds: string[]) => {
      set({ tiebreakerTeams: teamIds });
    },

    setRounds: async (rounds: RoundDefinition[]) => {
      set({ rounds });
      broadcastUpdate({ rounds });
      saveState({ rounds });
    },

    getRoundData: <T>(roundId: string, key: string, defaultValue: T): T => {
      const { roundsData } = get();
      const round = roundsData[roundId];
      if (round && key in round) return round[key] as T;
      return defaultValue;
    },

    setRoundData: async (roundId: string, key: string, value: unknown) => {
      const { roundsData } = get();
      const newRoundsData = {
        ...roundsData,
        [roundId]: {
          ...(roundsData[roundId] || {}),
          [key]: value,
        },
      };
      set({ roundsData: newRoundsData });
      broadcastUpdate({ roundsData: newRoundsData });
      saveState({ roundsData: newRoundsData });
    },

    addRound: (type: RoundType) => {
      const { rounds } = get();
      const newRound: RoundDefinition = {
        id: crypto.randomUUID(),
        name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Round`,
        type,
        order: rounds.length + 1,
        config: { timerEnabled: false },
        roundConfig: createDefaultRoundConfig(type),
      };
      const newRounds = [...rounds, newRound];
      set({ rounds: newRounds });
      broadcastUpdate({ rounds: newRounds });
      saveState({ rounds: newRounds });
    },

    removeRound: (roundId: string) => {
      const { rounds } = get();
      const newRounds = rounds.filter(r => r.id !== roundId).map((r, i) => ({ ...r, order: i + 1 }));
      set({ rounds: newRounds });
      broadcastUpdate({ rounds: newRounds });
      saveState({ rounds: newRounds });
    },

    reorderRounds: (fromIndex: number, toIndex: number) => {
      const { rounds } = get();
      const newRounds = [...rounds];
      const [moved] = newRounds.splice(fromIndex, 1);
      newRounds.splice(toIndex, 0, moved);
      const reordered = newRounds.map((r, i) => ({ ...r, order: i + 1 }));
      set({ rounds: reordered });
      broadcastUpdate({ rounds: reordered });
      saveState({ rounds: reordered });
    },

    updateRoundName: (roundId: string, name: string) => {
      const { rounds } = get();
      const newRounds = rounds.map(r => r.id === roundId ? { ...r, name } : r);
      set({ rounds: newRounds });
      broadcastUpdate({ rounds: newRounds });
      saveState({ rounds: newRounds });
    },

    updateRoundDescription: (roundId: string, description: string) => {
      const { rounds } = get();
      const newRounds = rounds.map(r => r.id === roundId ? { ...r, description } : r);
      set({ rounds: newRounds });
      broadcastUpdate({ rounds: newRounds });
      saveState({ rounds: newRounds });
    },

    updateRoundConfig: (roundId: string, config: Partial<RoundDefinition['config']>) => {
      const { rounds } = get();
      const newRounds = rounds.map(r => r.id === roundId ? { ...r, config: { ...r.config, ...config } } : r);
      set({ rounds: newRounds });
      broadcastUpdate({ rounds: newRounds });
      saveState({ rounds: newRounds });
    },

    updateRoundTypeConfig: (roundId: string, roundConfig: RoundDefinition['roundConfig']) => {
      const { rounds } = get();
      const newRounds = rounds.map(r => r.id === roundId ? { ...r, roundConfig } : r);
      set({ rounds: newRounds });
      broadcastUpdate({ rounds: newRounds });
      saveState({ rounds: newRounds });
    },

    setRoundQuestions: (roundId: string, questions: QuizQuestion[]) => {
      const { rounds } = get();
      const round = rounds.find(r => r.id === roundId);
      if (!round) return;
      const roundConfig = round.roundConfig as any;
      get().updateRoundTypeConfig(roundId, { ...roundConfig, questions, categories: [...new Set(questions.map(q => q.category))] });
    },

    setRoundTasteItems: (roundId: string, items: TasteItem[]) => {
      const { rounds } = get();
      const round = rounds.find(r => r.id === roundId);
      if (!round) return;
      const roundConfig = (round.roundConfig as any) || {};
      get().updateRoundTypeConfig(roundId, { ...roundConfig, items });
    },

    setRoundPlacementValues: (roundId: string, pointValues: number[]) => {
      const { rounds } = get();
      const round = rounds.find(r => r.id === roundId);
      if (!round) return;
      const roundConfig = (round.roundConfig as any) || {};
      get().updateRoundTypeConfig(roundId, { ...roundConfig, pointValues });
    },

    /**
     * Bootstraps the application state by pulling from Supabase.
     * Supports both legacy single-game and modern session-based modes.
     */
    initialize: async () => {
      const { session } = get();
      const { data: state } = await gameService.fetchGameState(session?.id);
      const { data: teams } = await teamService.fetchTeams(session?.id);
      if (state) set({ 
        currentView: state.current_view, 
        projectorMode: state.projector_mode,
        currentRound: state.current_round,
        timer: { duration: 0, remaining: state.timer_remaining, isActive: state.timer_is_active },
        quiz: { 
          questions: (state.quiz_questions as QuizQuestion[]) || [],
          currentIndex: state.quiz_index,
          isRevealed: state.quiz_revealed,
          buzzedTeamId: state.buzzed_team_id
        },
        tasteTest: {
          items: (state.taste_items as TasteItem[]) || [],
          currentIndex: state.taste_index,
          isRevealed: false,
          itemsCustomized: false
        }
      });
      if (teams) set({ teams: teams as Team[] });
    },

    setView: async (view: View) => {
      set({ currentView: view });
      broadcastUpdate({ currentView: view });
      saveState({ currentView: view });
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'current_view', view);
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
      saveState({ teams: get().teams, lastScoreChange: { teamId, points, round } });
      
      const { session } = get();
      await teamService.updateTeamScore(session?.id, teamId, newScore, newRoundScores);
    },
    
    setCurrentRound: async (round) => {
      const { rounds } = get();
      const clamped = Math.max(1, Math.min(round, rounds.length));
      set({ currentRound: clamped });
      broadcastUpdate({ currentRound: clamped });
      saveState({ currentRound: clamped });
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'current_round', clamped);
    },

    setAnnouncement: async (text) => {
      set({ announcementText: text });
      broadcastUpdate({ announcementText: text });
      saveState({ announcementText: text });
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'announcement_text', text);
    },

    setGameStatus: async (status) => {
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'game_status', status);
    },

    setIntroTeam: async (id) => {
      set({ introTeamId: id });
      broadcastUpdate({ introTeamId: id });
      saveState({ introTeamId: id });
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'intro_team_id', id);
    },

    setTeams: async (teams) => {
      set({ teams });
      broadcastUpdate({ teams });
      saveState({ teams });
      const { session } = get();
      await teamService.upsertTeams(session?.id, teams);
    },

    setSuddenDeath: async (active) => {
      set({ isSuddenDeath: active });
      broadcastUpdate({ isSuddenDeath: active });
      saveState({ isSuddenDeath: active });
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'is_suddenDeath', active);
    },
    
    startTimer: async (seconds: number) => {
      const { session } = get();
      await gameService.updateGameState(session?.id, { timer_remaining: seconds, timer_is_active: true, timer_duration: seconds });
      const timerState = { duration: seconds, remaining: seconds, isActive: true };
      set((state) => ({ timer: timerState }));
      broadcastUpdate({ timer: timerState });
      saveState({ timer: timerState });
    },

    stopTimer: async () => {
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'timer_is_active', false);
      set((state) => ({ timer: { ...state.timer, isActive: false } }));
      broadcastUpdate({ timer: { ...get().timer, isActive: false } });
      saveState({ timer: { ...get().timer, isActive: false } });
    },

    resetTimer: async () => {
      const { session } = get();
      await gameService.updateGameState(session?.id, { timer_remaining: 0, timer_is_active: false });
      const timerState = { duration: 0, remaining: 0, isActive: false };
      set({ timer: timerState });
      broadcastUpdate({ timer: timerState });
      saveState({ timer: timerState });
    },

    tickTimer: async () => {
      const { timer } = get();
      if (timer.remaining > 0) {
        const newRemaining = timer.remaining - 1;
        const { session } = get();
        await gameService.updateGameStateField(session?.id, 'timer_remaining', newRemaining);
        const newTimer = { ...timer, remaining: newRemaining };
        set({ timer: newTimer });
        broadcastUpdate({ timer: newTimer });
        saveState({ timer: newTimer });
      }
    },

    revealContent: async () => {
      const { quiz } = get();
      const newQuiz = { ...quiz, isRevealed: !quiz.isRevealed };
      set({ quiz: newQuiz });
      broadcastUpdate({ quiz: newQuiz });
      saveState({ quiz: newQuiz });
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'quiz_revealed', newQuiz.isRevealed);
    },

    nextQuestion: async () => {
      const { quiz } = get();
      const newIdx = quiz.currentIndex + 1;
      const newQuiz = { ...quiz, currentIndex: newIdx, isRevealed: false };
      set({ quiz: newQuiz });
      broadcastUpdate({ quiz: newQuiz });
      saveState({ quiz: newQuiz });
      const { session } = get();
      await gameService.updateGameState(session?.id, { quiz_index: newIdx, quiz_revealed: false });
    },

    prevQuestion: async () => {
      const { quiz } = get();
      const newIdx = Math.max(0, quiz.currentIndex - 1);
      const newQuiz = { ...quiz, currentIndex: newIdx, isRevealed: false };
      set({ quiz: newQuiz });
      broadcastUpdate({ quiz: newQuiz });
      saveState({ quiz: newQuiz });
      const { session } = get();
      await gameService.updateGameState(session?.id, { quiz_index: newIdx, quiz_revealed: false });
    },

    setProjectorMode: async (projectorMode: ProjectorMode) => {
      set({ projectorMode });
      broadcastUpdate({ projectorMode });
      saveState({ projectorMode });
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'projector_mode', projectorMode);
    },

    nextTasteItem: async () => {
      const { tasteTest } = get();
      const newIdx = tasteTest.currentIndex + 1;
      const newTaste = { ...tasteTest, currentIndex: newIdx };
      set({ tasteTest: newTaste });
      broadcastUpdate({ tasteTest: newTaste });
      saveState({ tasteTest: newTaste });
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'taste_index', newIdx);
    },

    prevTasteItem: async () => {
      const { tasteTest } = get();
      const newIdx = Math.max(0, tasteTest.currentIndex - 1);
      const newTaste = { ...tasteTest, currentIndex: newIdx };
      set({ tasteTest: newTaste });
      broadcastUpdate({ tasteTest: newTaste });
      saveState({ tasteTest: newTaste });
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'taste_index', newIdx);
    },

    startDuel: async (challengerId: string, challengedId: string) => {
      set((state) => ({ duel: { ...state.duel, challengerId, challengedId, isActive: true } }));
      broadcastUpdate({ duel: get().duel });
      saveState({ duel: get().duel });
      const { session } = get();
      await gameService.updateGameState(session?.id, { duel_challenger: challengerId, duel_challenged: challengedId, duel_active: true });
    },

    endDuel: async (winnerId: string | null) => {
      set((state) => ({ duel: { ...state.duel, winnerId, isActive: false } }));
      broadcastUpdate({ duel: get().duel });
      saveState({ duel: get().duel });
      const { session } = get();
      await gameService.updateGameState(session?.id, { duel_winner: winnerId, duel_active: false });
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
      await teamService.updateTeam(session?.id, teamId, { 
        score: newScore, 
        round_scores: newRoundScores,
        taste_item_scores: newTasteItemScores
      });
      
      set((state) => ({
        teams: state.teams.map(t => t.id === teamId ? { ...t, score: newScore, roundScores: newRoundScores, tasteItemScores: newTasteItemScores } : t)
      }));
      broadcastUpdate({ teams: get().teams });
      saveState({ teams: get().teams });
    },

    setTasteItems: async (items) => {
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'taste_items', items);
      set((state) => ({ tasteTest: { ...state.tasteTest, items } }));
      broadcastUpdate({ tasteTest: get().tasteTest });
      saveState({ tasteTest: get().tasteTest });
    },

    addTasteItem: async (item) => {
      const newItems = [...get().tasteTest.items, item];
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'taste_items', newItems);
      set((state) => ({ tasteTest: { ...state.tasteTest, items: newItems } }));
      broadcastUpdate({ tasteTest: get().tasteTest });
      saveState({ tasteTest: get().tasteTest });
    },

    updateTasteItem: async (item) => {
      const newItems = get().tasteTest.items.map(i => i.id === item.id ? item : i);
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'taste_items', newItems);
      set((state) => ({ tasteTest: { ...state.tasteTest, items: newItems } }));
      broadcastUpdate({ tasteTest: get().tasteTest });
      saveState({ tasteTest: get().tasteTest });
    },

    removeTasteItem: async (id) => {
      const newItems = get().tasteTest.items.filter(i => i.id !== id);
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'taste_items', newItems);
      set((state) => ({ tasteTest: { ...state.tasteTest, items: newItems } }));
      broadcastUpdate({ tasteTest: get().tasteTest });
      saveState({ tasteTest: get().tasteTest });
    },

    toggleTimer: () => {
      set((state) => ({ timer: { ...state.timer, isActive: !state.timer.isActive } }));
      broadcastUpdate({ timer: get().timer });
      saveState({ timer: get().timer });
    },

    setQuizQuestions: async (questions) => {
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'quiz_questions', questions);
      set((state) => ({ quiz: { ...state.quiz, questions } }));
      broadcastUpdate({ quiz: get().quiz });
      saveState({ quiz: get().quiz });
    },

    buzzIn: async (teamId: string) => {
      const { quiz, session } = get();
      const newQuiz = { ...quiz, buzzedTeamId: teamId };
      set({ quiz: newQuiz });
      broadcastUpdate({ quiz: newQuiz });
      saveState({ quiz: newQuiz });

      const { data } = await buzzService.lockBuzz(session?.id, teamId, quiz.currentIndex);
      
      if (data) {
        await gameService.updateGameStateField(session?.id, 'buzzed_team_id', teamId);
      } else if (!session) {
        await gameService.updateGameStateField(undefined, 'buzzed_team_id', teamId);
      }
    },

    clearBuzz: async () => {
      const { quiz } = get();
      const newQuiz = { ...quiz, buzzedTeamId: null };
      set({ quiz: newQuiz });
      broadcastUpdate({ quiz: newQuiz });
      saveState({ quiz: newQuiz });
      const { session } = get();
      await gameService.updateGameStateField(session?.id, 'buzzed_team_id', null);
    },

    resetAll: async () => {
      const { session } = get();
      await teamService.resetTeamScores(session?.id);
      await gameService.updateGameState(session?.id, { 
        current_view: 'setup',
        current_round: 1,
        buzzed_team_id: null
      });
      set({
        currentView: 'setup',
        currentRound: 1,
        lastScoreChange: null,
        teams: get().teams.map(t => ({ ...t, score: 0, roundScores: {} })),
        roundsData: {}
      });
      broadcastUpdate({ currentView: 'setup', currentRound: 1 });
      saveState({ currentView: 'setup', currentRound: 1 });
    },

    resetScores: async () => {
      const { session } = get();
      await teamService.resetTeamScores(session?.id);
      set({
        lastScoreChange: null,
        teams: get().teams.map(t => ({ ...t, score: 0, roundScores: {} }))
      });
      broadcastUpdate({ teams: get().teams });
      saveState({ teams: get().teams });
    },

    undoLastScore: async () => {
      const { lastScoreChange, teams } = get();
      if (!lastScoreChange) return;
      const team = teams.find(t => t.id === lastScoreChange.teamId);
      if (!team) return;
      const newScore = team.score - lastScoreChange.points;
      const newRoundScores = { ...team.roundScores, [lastScoreChange.round]: (team.roundScores[lastScoreChange.round] || 0) - lastScoreChange.points };
      
      const { session } = get();
      await teamService.updateTeam(session?.id, lastScoreChange.teamId, { score: newScore, round_scores: newRoundScores });
      set({
        lastScoreChange: null,
        teams: teams.map(t => t.id === lastScoreChange.teamId ? { ...t, score: newScore, roundScores: newRoundScores } : t)
      });
      broadcastUpdate({ teams: get().teams });
      saveState({ teams: get().teams, lastScoreChange: null });
    },

    updateTeam: async (teamId, updates) => {
      const { session } = get();
      await teamService.updateTeam(session?.id, teamId, updates as Record<string, unknown>);
      set((state) => ({
        teams: state.teams.map(t => t.id === teamId ? { ...t, ...updates } : t)
      }));
      broadcastUpdate({ teams: get().teams });
      saveState({ teams: get().teams });
    },

    // --- Multi-Device Session Management ---
    
    createSession: async () => {
      const { teams, currentRound, projectorMode, announcementText, quiz, tasteTest, rounds } = get();
      const sessionInfo = await sessionService.createSession(teams, currentRound, projectorMode, announcementText, quiz, tasteTest);
      if (sessionInfo) {
        set({ session: sessionInfo });
        saveState({ session: sessionInfo });
        return sessionInfo;
      }
      return null;
    },

    joinSession: async (code: string, teamId?: string) => {
      const result = await sessionService.joinSessionByCode(code);
      if (!result) return null;
      const { session } = result;

      const sessionInfo: SessionInfo = {
        id: session.id as string,
        code: session.code as string,
        isHost: false,
        joinedTeamId: teamId,
      };

      set({ session: sessionInfo });
      saveState({ session: sessionInfo });

      subscribeToGameState(session.id as string, (n) => {
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
          rounds: (n.rounds as RoundDefinition[]) ?? undefined,
          roundsData: (n.rounds_data as RoundData) ?? undefined,
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
      });

      return sessionInfo;
    },

    leaveSession: () => {
      set({ session: null });
      clearSync();
    },

    setJoinedTeam: (teamId: string | undefined) => {
      const { session } = get();
      if (session) {
        const newSession = { ...session, joinedTeamId: teamId };
        set({ session: newSession });
        broadcastUpdate({ session: newSession });
        saveState({ session: newSession });
      }
    },

    saveToLocalStorage: () => {
      saveState(get() as unknown as Record<string, unknown>);
    },

    loadFromLocalStorage: () => {
      const saved = loadState();
      if (saved) {
        set(saved as Partial<GameState>);
        return true;
      }
      return false;
    },
  };
});

// ─── Supabase Realtime Subscriptions (Legacy / Single Game) ────────────────

if (typeof window !== 'undefined') {
  subscribeToGameStateLegacy((n) => {
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
      rounds: (n.rounds as RoundDefinition[]) ?? undefined,
      roundsData: (n.rounds_data as RoundData) ?? undefined,
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
  });

  subscribeToTeamsLegacy((n) => {
    useGameStore.setState((state) => ({
      teams: state.teams.map(t => t.id === n.id ? { ...t, ...n } as Team : t)
    }));
  });
}
