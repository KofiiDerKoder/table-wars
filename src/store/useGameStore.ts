import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type View = 'setup' | 'host' | 'scoreboard' | 'team' | 'results';
export type ProjectorMode = 'scoreboard' | 'black' | 'logo' | 'announcement' | 'intro';

export interface RoundScore {
  round: number;
  points: number;
  details: string;
}

export type Team = {
  id: string;
  name: string;
  color: string;
  score: number;
  roundScores: Record<number, number>;
  memberCount: number;
  rank: number;
  rankTrend: 'up' | 'down' | 'stable';
  chant?: string;
  // Specific tracking for Round 4 bug fix
  tasteItemScores: Record<string, number>; 
};

export type QuizQuestion = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  category: string;
};

export type TasteItem = {
  id: string;
  name: string;
  hint: string;
  category: string;
};

interface GameState {
  // Navigation & UI
  currentView: View;
  projectorMode: ProjectorMode;
  announcementText: string;
  showConfidenceMonitor: boolean;

  // Competition State
  teams: Team[];
  currentRound: number;
  gameStatus: 'idle' | 'running' | 'paused' | 'finished';
  isSuddenDeath: boolean;
  introTeamId: string | null;
  
  // Timer
  timer: {
    duration: number;
    remaining: number;
    isActive: boolean;
  };

  // Round Content
  quiz: {
    banks: Record<number, QuizQuestion[]>;
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

  // Actions
  setView: (view: View) => void;
  setProjectorMode: (mode: ProjectorMode) => void;
  setAnnouncement: (text: string) => void;
  setTeams: (teams: Team[]) => void;
  
  // Refined Scoring Action (Fixes Bug 1 & 2 from Doc)
  setTasteScore: (teamId: string, itemId: string, points: number) => void;
  updateTeamScore: (teamId: string, points: number, round: number) => void;
  
  setCurrentRound: (round: number) => void;
  setGameStatus: (status: 'idle' | 'running' | 'paused' | 'finished') => void;
  setSuddenDeath: (active: boolean) => void;
  setIntroTeam: (teamId: string | null) => void;
  
  // Timer Actions
  startTimer: (seconds: number) => void;
  stopTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;

  // Quiz Actions
  setQuizQuestions: (questions: QuizQuestion[]) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  revealContent: () => void;
  buzzIn: (teamId: string) => void;
  clearBuzz: () => void;

  // Taste Test Actions (CRUD - Phase 3 enhancement)
  setTasteItems: (items: TasteItem[]) => void;
  addTasteItem: (item: TasteItem) => void;
  removeTasteItem: (id: string) => void;
  updateTasteItem: (item: TasteItem) => void;
  reorderTasteItems: (startIndex: number, endIndex: number) => void;
  nextTasteItem: () => void;
  prevTasteItem: () => void;

  // Duel Actions
  startDuel: (challengerId: string, challengedId: string) => void;
  endDuel: (winnerId: string | null) => void;

  resetAll: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => {
      // Cross-tab sync setup
      if (typeof window !== 'undefined') {
        const channel = new BroadcastChannel('table-wars-sync');
        channel.onmessage = (event) => {
          set(event.data);
        };
      }

      return {
        currentView: 'setup',
        projectorMode: 'logo',
        announcementText: '',
        showConfidenceMonitor: true,
        teams: [],
        currentRound: 1,
        gameStatus: 'idle',
        isSuddenDeath: false,
        introTeamId: null,
        timer: {
          duration: 0,
          remaining: 0,
          isActive: false,
        },
        quiz: {
          questions: [],
          currentIndex: 0,
          isRevealed: false,
          buzzedTeamId: null,
        },
        tasteTest: {
          items: [],
          currentIndex: 0,
          isRevealed: false,
          itemsCustomized: false,
        },
        duel: {
          challengerId: null,
          challengedId: null,
          winnerId: null,
          isActive: false,
        },

        setView: (currentView) => {
           set({ currentView });
           new BroadcastChannel('table-wars-sync').postMessage({ currentView });
        },
        setProjectorMode: (projectorMode) => {
           set({ projectorMode });
           new BroadcastChannel('table-wars-sync').postMessage({ projectorMode });
        },
        setAnnouncement: (announcementText) => {
           set({ announcementText });
           new BroadcastChannel('table-wars-sync').postMessage({ announcementText });
        },
        setTeams: (teams) => {
           set({ teams });
           new BroadcastChannel('table-wars-sync').postMessage({ teams });
        },
      
      setTasteScore: (teamId, itemId, points) => set((state) => {
        const teams = state.teams.map(t => {
          if (t.id === teamId) {
            const oldItemScore = t.tasteItemScores[itemId] || 0;
            const currentRoundTotal = t.roundScores[4] || 0;
            return {
              ...t,
              score: t.score - oldItemScore + points,
              roundScores: { ...t.roundScores, [4]: currentRoundTotal - oldItemScore + points },
              tasteItemScores: { ...t.tasteItemScores, [itemId]: points }
            };
          }
          return t;
        });
        return { teams };
      }),

      updateTeamScore: (teamId, points, round) => set((state) => {
        const updatedTeams = state.teams.map((t) => {
          if (t.id === teamId) {
            const currentRoundScore = t.roundScores[round] || 0;
            return {
              ...t,
              score: t.score + points,
              roundScores: { ...t.roundScores, [round]: currentRoundScore + points },
            };
          }
          return t;
        });

        // Compute rankings
        const sorted = [...updatedTeams].sort((a, b) => b.score - a.score);
        return {
          teams: updatedTeams.map(t => {
            const newRank = sorted.findIndex(s => s.id === t.id) + 1;
            const trend = newRank < t.rank ? 'up' : newRank > t.rank ? 'down' : 'stable';
            return { ...t, rank: newRank, rankTrend: trend };
          })
        };
      }),

      setCurrentRound: (currentRound) => set({ currentRound }),
      setGameStatus: (gameStatus) => set({ gameStatus }),
      setSuddenDeath: (isSuddenDeath) => set({ isSuddenDeath }),
      setIntroTeam: (introTeamId) => set({ introTeamId, projectorMode: introTeamId ? 'intro' : 'scoreboard' }),

      startTimer: (seconds) => set({ timer: { duration: seconds, remaining: seconds, isActive: true } }),
      stopTimer: () => set((state) => ({ timer: { ...state.timer, isActive: false } })),
      resetTimer: () => set((state) => ({ timer: { ...state.timer, remaining: state.timer.duration, isActive: false } })),
      tickTimer: () => set((state) => {
        if (!state.timer.isActive || state.timer.remaining <= 0) return {};
        return { timer: { ...state.timer, remaining: state.timer.remaining - 1 } };
      }),

      setQuizQuestions: (questions) => set((state) => ({ quiz: { ...state.quiz, questions } })),
      nextQuestion: () => set((state) => ({ 
        quiz: { ...state.quiz, currentIndex: Math.min(state.quiz.currentIndex + 1, state.quiz.questions.length - 1), isRevealed: false, buzzedTeamId: null } 
      })),
      prevQuestion: () => set((state) => ({ 
        quiz: { ...state.quiz, currentIndex: Math.max(state.quiz.currentIndex - 1, 0), isRevealed: false, buzzedTeamId: null } 
      })),
      revealContent: () => set((state) => {
        if (state.currentRound === 1 || state.currentRound === 5) {
          return { quiz: { ...state.quiz, isRevealed: true } };
        }
        if (state.currentRound === 4) {
          return { tasteTest: { ...state.tasteTest, isRevealed: true } };
        }
        return {};
      }),
      buzzIn: (teamId) => set((state) => {
        if (state.quiz.buzzedTeamId) return {};
        return { quiz: { ...state.quiz, buzzedTeamId: teamId } };
      }),
      clearBuzz: () => set((state) => ({ quiz: { ...state.quiz, buzzedTeamId: null } })),

      setTasteItems: (items) => set((state) => ({ tasteTest: { ...state.tasteTest, items, itemsCustomized: true } })),
      addTasteItem: (item) => set((state) => ({ tasteTest: { ...state.tasteTest, items: [...state.tasteTest.items, item], itemsCustomized: true } })),
      removeTasteItem: (id) => set((state) => ({ tasteTest: { ...state.tasteTest, items: state.tasteTest.items.filter(i => i.id !== id), itemsCustomized: true } })),
      updateTasteItem: (item) => set((state) => ({ tasteTest: { ...state.tasteTest, items: state.tasteTest.items.map(i => i.id === item.id ? item : i), itemsCustomized: true } })),
      reorderTasteItems: (start, end) => set((state) => {
        const items = [...state.tasteTest.items];
        const [removed] = items.splice(start, 1);
        items.splice(end, 0, removed);
        return { tasteTest: { ...state.tasteTest, items, itemsCustomized: true } };
      }),
      nextTasteItem: () => set((state) => ({ 
        tasteTest: { ...state.tasteTest, currentIndex: Math.min(state.tasteTest.currentIndex + 1, state.tasteTest.items.length - 1), isRevealed: false } 
      })),
      prevTasteItem: () => set((state) => ({ 
        tasteTest: { ...state.tasteTest, currentIndex: Math.max(state.tasteTest.currentIndex - 1, 0), isRevealed: false } 
      })),

      startDuel: (challengerId, challengedId) => set({ 
        duel: { challengerId, challengedId, winnerId: null, isActive: true } 
      }),
      endDuel: (winnerId) => set((state) => ({ 
        duel: { ...state.duel, winnerId, isActive: false } 
      })),

        resetAll: () => set({
          currentView: 'setup',
          projectorMode: 'scoreboard',
          announcementText: '',
          teams: [],
          currentRound: 1,
          gameStatus: 'idle',
          isSuddenDeath: false,
          introTeamId: null,
          timer: { duration: 0, remaining: 0, isActive: false },
          quiz: { banks: {}, currentIndex: 0, isRevealed: false, buzzedTeamId: null },
          tasteTest: { items: [], currentIndex: 0, isRevealed: false, itemsCustomized: false },
          duel: { challengerId: null, challengedId: null, winnerId: null, isActive: false },
        }),
      };
    },
    {
      name: 'table-wars-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
