import type { QuizQuestion, TasteItem } from '@/store/useGameStore';

export type RoundType = 'quiz' | 'placement' | 'taste' | 'finale' | 'judged' | 'timed';

export interface QuizRoundConfig {
  correctPoints: number;
  stealPoints: number;
  allowSteal: boolean;
  questions: QuizQuestion[];
  categories: string[];
}

export interface PlacementRoundConfig {
  pointValues: number[];
  allowPenalty: boolean;
  penaltyPoints: number;
}

export interface TasteRoundConfig {
  correctPoints: number;
  partialPoints: number;
  items: TasteItem[];
}

export interface FinaleRoundConfig {
  correctPoints: number;
  allowDuel: boolean;
  duelBonusPoints: number;
  questions: QuizQuestion[];
  categories: string[];
}

export interface JudgedRoundConfig {
  criteria: JudgingCriterion[];
  maxScorePerCriterion: number;
}

export interface TimedRoundConfig {
  completionBonus: number;
  penaltyPerSecond: number;
}

export interface JudgingCriterion {
  id: string;
  name: string;
  description?: string;
  maxScore: number;
  weight: number;
}

export interface RoundDefinition {
  id: string;
  name: string;
  type: RoundType;
  order: number;
  description?: string;
  config: {
    timerEnabled: boolean;
    defaultTimerSeconds?: number;
    allowSteal?: boolean;
    allowDuel?: boolean;
  };
  roundConfig?: QuizRoundConfig | PlacementRoundConfig | TasteRoundConfig | FinaleRoundConfig | JudgedRoundConfig | TimedRoundConfig;
}

export interface RoundData {
  [roundId: string]: Record<string, unknown>;
}

export function createDefaultRoundConfig(type: RoundType): RoundDefinition['roundConfig'] {
  switch (type) {
    case 'quiz':
      return { correctPoints: 5, stealPoints: 3, allowSteal: true, questions: [], categories: ['General'] };
    case 'placement':
      return { pointValues: [25, 20, 15, 10, 5, 3, 2, 1], allowPenalty: false, penaltyPoints: -3 };
    case 'taste':
      return { correctPoints: 4, partialPoints: 2, items: [] };
    case 'finale':
      return { correctPoints: 10, allowDuel: true, duelBonusPoints: 10, questions: [], categories: ['General'] };
    case 'judged':
      return { criteria: [{ id: crypto.randomUUID(), name: 'Overall Impression', maxScore: 10, weight: 1 }], maxScorePerCriterion: 10 };
    case 'timed':
      return { completionBonus: 10, penaltyPerSecond: 1 };
  }
}

export function getRoundQuestionCount(round: RoundDefinition): number {
  const rc = round.roundConfig as any;
  return rc?.questions?.length ?? rc?.items?.length ?? 0;
}

export function getRoundTimerLabel(round: RoundDefinition): string {
  if (!round.config.timerEnabled || !round.config.defaultTimerSeconds) return 'No timer';
  const sec = round.config.defaultTimerSeconds;
  if (sec >= 60) return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
  return `${sec}s`;
}

export function createDefaultRounds(): RoundDefinition[] {
  return [
    { id: 'trivia', name: 'Table Trivia', type: 'quiz', order: 1, description: 'Buzzer-based trivia quiz', config: { timerEnabled: true, defaultTimerSeconds: 30, allowSteal: true } },
    { id: 'relay', name: 'Food Relay', type: 'placement', order: 2, description: 'Physical relay race — placement scoring', config: { timerEnabled: true, defaultTimerSeconds: 120 } },
    { id: 'building', name: 'Table Building', type: 'placement', order: 3, description: 'Creative construction challenge', config: { timerEnabled: true, defaultTimerSeconds: 300 } },
    { id: 'taste', name: 'Blind Taste Test', type: 'taste', order: 4, description: 'Identify mystery foods', config: { timerEnabled: false } },
    { id: 'finale', name: 'Grand Finale', type: 'finale', order: 5, description: 'Double-point quiz with duel mechanic', config: { timerEnabled: true, defaultTimerSeconds: 30, allowSteal: true, allowDuel: true } },
  ];
}
