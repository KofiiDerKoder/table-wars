import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })) })) })),
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })) })) })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({ subscribe: vi.fn() })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
  },
}));

vi.mock('@/services/syncService', () => ({
  initSync: vi.fn(),
  setBroadcastHandler: vi.fn(),
  broadcastUpdate: vi.fn(),
  saveState: vi.fn(),
  loadState: vi.fn(() => null),
  clearSync: vi.fn(),
}));

vi.mock('@/services/gameService', () => ({
  fetchGameState: vi.fn(() => Promise.resolve({ data: null, error: null })),
  updateGameState: vi.fn(() => Promise.resolve({ error: null })),
  updateGameStateField: vi.fn(() => Promise.resolve({ error: null })),
}));

vi.mock('@/services/teamService', () => ({
  fetchTeams: vi.fn(() => Promise.resolve({ data: null, error: null })),
  updateTeamScore: vi.fn(() => Promise.resolve({ error: null })),
  updateTeam: vi.fn(() => Promise.resolve({ error: null })),
  upsertTeams: vi.fn(() => Promise.resolve({ error: null })),
  resetTeamScores: vi.fn(() => Promise.resolve({ error: null })),
}));

vi.mock('@/services/sessionService', () => ({
  createSession: vi.fn(() => Promise.resolve(null)),
  joinSessionByCode: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@/services/buzzService', () => ({
  lockBuzz: vi.fn(() => Promise.resolve({ data: null, error: null })),
}));

vi.mock('@/services/realtimeService', () => ({
  subscribeToGameState: vi.fn(),
  subscribeToGameStateLegacy: vi.fn(),
  subscribeToTeamsLegacy: vi.fn(),
}));

import { useGameStore } from '../useGameStore';

function createTeam(id: string, name: string) {
  return {
    id,
    name,
    color: '#ff0000',
    score: 0,
    roundScores: {} as Record<number, number>,
    rank: 1,
    rankTrend: 'stable' as const,
    tasteItemScores: {} as Record<string, number>,
    memberCount: 4,
  };
}

describe('Game Store - Scoring', () => {
  beforeEach(() => {
    useGameStore.setState({
      teams: [createTeam('t1', 'Team A'), createTeam('t2', 'Team B'), createTeam('t3', 'Team C')],
      lastScoreChange: null,
      currentRound: 1,
      timer: { duration: 0, remaining: 0, isActive: false },
    });
  });

  it('should add points to team score', async () => {
    await useGameStore.getState().updateTeamScore('t1', 10, 1);
    const team = useGameStore.getState().teams.find(t => t.id === 't1');
    expect(team?.score).toBe(10);
    expect(team?.roundScores[1]).toBe(10);
  });

  it('should accumulate points across rounds', async () => {
    await useGameStore.getState().updateTeamScore('t1', 10, 1);
    await useGameStore.getState().updateTeamScore('t1', 5, 2);
    const team = useGameStore.getState().teams.find(t => t.id === 't1');
    expect(team?.score).toBe(15);
    expect(team?.roundScores[1]).toBe(10);
    expect(team?.roundScores[2]).toBe(5);
  });

  it('should undo last score change', async () => {
    await useGameStore.getState().updateTeamScore('t1', 10, 1);
    await useGameStore.getState().updateTeamScore('t1', 5, 1);
    expect(useGameStore.getState().teams.find(t => t.id === 't1')?.score).toBe(15);
    await useGameStore.getState().undoLastScore();
    expect(useGameStore.getState().teams.find(t => t.id === 't1')?.score).toBe(10);
  });

  it('should reset scores while keeping teams', async () => {
    await useGameStore.getState().updateTeamScore('t1', 10, 1);
    await useGameStore.getState().resetScores();
    const teams = useGameStore.getState().teams;
    expect(teams.every(t => t.score === 0)).toBe(true);
    expect(teams.length).toBe(3);
  });

  it('should detect ties', () => {
    useGameStore.setState({
      teams: [
        { ...createTeam('t1', 'A'), score: 10 },
        { ...createTeam('t2', 'B'), score: 10 },
        { ...createTeam('t3', 'C'), score: 5 },
      ],
    });
    const result = useGameStore.getState().detectTies();
    expect(result).toHaveLength(2);
    expect(result.map(t => t.id)).toContain('t1');
    expect(result.map(t => t.id)).toContain('t2');
  });

  it('should not detect ties when no teams', () => {
    useGameStore.setState({ teams: [] });
    expect(useGameStore.getState().detectTies()).toEqual([]);
  });

  it('should not detect ties when single team', () => {
    useGameStore.setState({ teams: [createTeam('t1', 'A')] });
    expect(useGameStore.getState().detectTies()).toEqual([]);
  });
});

describe('Game Store - Timer', () => {
  beforeEach(() => {
    useGameStore.setState({
      timer: { duration: 0, remaining: 0, isActive: false },
    });
  });

  it('should start timer with specified duration', async () => {
    await useGameStore.getState().startTimer(60);
    const t = useGameStore.getState().timer;
    expect(t.duration).toBe(60);
    expect(t.remaining).toBe(60);
    expect(t.isActive).toBe(true);
  });

  it('should tick timer down', async () => {
    await useGameStore.getState().startTimer(10);
    await useGameStore.getState().tickTimer();
    expect(useGameStore.getState().timer.remaining).toBe(9);
  });

  it('should not tick below zero', async () => {
    await useGameStore.getState().startTimer(1);
    await useGameStore.getState().tickTimer();
    await useGameStore.getState().tickTimer();
    expect(useGameStore.getState().timer.remaining).toBe(0);
  });

  it('should stop timer', async () => {
    await useGameStore.getState().startTimer(60);
    await useGameStore.getState().stopTimer();
    expect(useGameStore.getState().timer.isActive).toBe(false);
  });

  it('should toggle timer on and off', () => {
    useGameStore.setState({ timer: { duration: 60, remaining: 60, isActive: false } });
    useGameStore.getState().toggleTimer();
    expect(useGameStore.getState().timer.isActive).toBe(true);
    useGameStore.getState().toggleTimer();
    expect(useGameStore.getState().timer.isActive).toBe(false);
  });

  it('should reset timer', async () => {
    await useGameStore.getState().startTimer(60);
    await useGameStore.getState().resetTimer();
    const t = useGameStore.getState().timer;
    expect(t.duration).toBe(0);
    expect(t.remaining).toBe(0);
    expect(t.isActive).toBe(false);
  });
});

describe('Game Store - Quiz', () => {
  const testQuestions = [
    { id: 'q1', text: 'Test Q1', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', category: 'Test' },
    { id: 'q2', text: 'Test Q2', options: ['A', 'B', 'C', 'D'], correctAnswer: 'B', category: 'Test' },
  ];

  beforeEach(() => {
    useGameStore.setState({
      quiz: { questions: testQuestions, currentIndex: 0, isRevealed: false, buzzedTeamId: null },
      teams: [createTeam('t1', 'Team A')],
      currentRound: 1,
    });
  });

  it('should navigate forward through questions', async () => {
    await useGameStore.getState().nextQuestion();
    expect(useGameStore.getState().quiz.currentIndex).toBe(1);
  });

  it('should navigate backward through questions', async () => {
    await useGameStore.getState().nextQuestion();
    await useGameStore.getState().prevQuestion();
    expect(useGameStore.getState().quiz.currentIndex).toBe(0);
  });

  it('should not go before first question', async () => {
    await useGameStore.getState().prevQuestion();
    expect(useGameStore.getState().quiz.currentIndex).toBe(0);
  });

  it('should toggle reveal state', async () => {
    expect(useGameStore.getState().quiz.isRevealed).toBe(false);
    await useGameStore.getState().revealContent();
    expect(useGameStore.getState().quiz.isRevealed).toBe(true);
    await useGameStore.getState().revealContent();
    expect(useGameStore.getState().quiz.isRevealed).toBe(false);
  });

  it('should set buzzed team', async () => {
    await useGameStore.getState().buzzIn('t1');
    expect(useGameStore.getState().quiz.buzzedTeamId).toBe('t1');
  });

  it('should clear buzzed team', async () => {
    await useGameStore.getState().buzzIn('t1');
    await useGameStore.getState().clearBuzz();
    expect(useGameStore.getState().quiz.buzzedTeamId).toBeNull();
  });

  it('should update question bank', async () => {
    const newQuestions = [{ id: 'q3', text: 'New Q', options: ['X', 'Y'], correctAnswer: 'X', category: 'New' }];
    await useGameStore.getState().setQuizQuestions(newQuestions);
    expect(useGameStore.getState().quiz.questions).toEqual(newQuestions);
  });

  it('should reset reveal and freeze index on navigation', async () => {
    await useGameStore.getState().revealContent();
    await useGameStore.getState().nextQuestion();
    expect(useGameStore.getState().quiz.isRevealed).toBe(false);
    expect(useGameStore.getState().quiz.currentIndex).toBe(1);
  });
});

describe('Game Store - Taste Test', () => {
  const testItems = [
    { id: 'it1', name: 'Item 1', category: 'Test' },
    { id: 'it2', name: 'Item 2', category: 'Test' },
    { id: 'it3', name: 'Item 3', category: 'Test' },
  ];

  beforeEach(() => {
    useGameStore.setState({
      tasteTest: { items: testItems, currentIndex: 0, isRevealed: false, itemsCustomized: false },
    });
  });

  it('should navigate forward through taste items', async () => {
    await useGameStore.getState().nextTasteItem();
    expect(useGameStore.getState().tasteTest.currentIndex).toBe(1);
  });

  it('should navigate backward through taste items', async () => {
    await useGameStore.getState().nextTasteItem();
    await useGameStore.getState().prevTasteItem();
    expect(useGameStore.getState().tasteTest.currentIndex).toBe(0);
  });

  it('should not go before first taste item', async () => {
    await useGameStore.getState().prevTasteItem();
    expect(useGameStore.getState().tasteTest.currentIndex).toBe(0);
  });

  it('should set taste items', async () => {
    const newItems = [{ id: 'it4', name: 'Item 4', category: 'New' }];
    await useGameStore.getState().setTasteItems(newItems);
    expect(useGameStore.getState().tasteTest.items).toEqual(newItems);
  });

  it('should add a taste item', async () => {
    const newItem = { id: 'it4', name: 'Item 4', category: 'New' };
    await useGameStore.getState().addTasteItem(newItem);
    expect(useGameStore.getState().tasteTest.items).toHaveLength(4);
  });

  it('should update a taste item', async () => {
    const updated = { id: 'it1', name: 'Updated Item 1', category: 'Updated' };
    await useGameStore.getState().updateTasteItem(updated);
    const item = useGameStore.getState().tasteTest.items.find(i => i.id === 'it1');
    expect(item?.name).toBe('Updated Item 1');
  });

  it('should remove a taste item', async () => {
    await useGameStore.getState().removeTasteItem('it1');
    expect(useGameStore.getState().tasteTest.items).toHaveLength(2);
    expect(useGameStore.getState().tasteTest.items.find(i => i.id === 'it1')).toBeUndefined();
  });
});

describe('Game Store - Duel', () => {
  beforeEach(() => {
    useGameStore.setState({
      duel: { challengerId: null, challengedId: null, winnerId: null, isActive: false },
      teams: [createTeam('t1', 'Team A'), createTeam('t2', 'Team B')],
    });
  });

  it('should start a duel between two teams', async () => {
    await useGameStore.getState().startDuel('t1', 't2');
    const duel = useGameStore.getState().duel;
    expect(duel.challengerId).toBe('t1');
    expect(duel.challengedId).toBe('t2');
    expect(duel.isActive).toBe(true);
  });

  it('should end a duel with a winner', async () => {
    await useGameStore.getState().startDuel('t1', 't2');
    await useGameStore.getState().endDuel('t1');
    const duel = useGameStore.getState().duel;
    expect(duel.winnerId).toBe('t1');
    expect(duel.isActive).toBe(false);
  });
});

describe('Game Store - Teams', () => {
  beforeEach(() => {
    useGameStore.setState({
      teams: [createTeam('t1', 'Team A'), createTeam('t2', 'Team B')],
      currentRound: 1,
    });
  });

  it('should update team name', async () => {
    await useGameStore.getState().updateTeam('t1', { name: 'Renamed Team' });
    const team = useGameStore.getState().teams.find(t => t.id === 't1');
    expect(team?.name).toBe('Renamed Team');
  });

  it('should update team color', async () => {
    await useGameStore.getState().updateTeam('t1', { color: '#00ff00' });
    const team = useGameStore.getState().teams.find(t => t.id === 't1');
    expect(team?.color).toBe('#00ff00');
  });

  it('should set teams', async () => {
    const newTeams = [createTeam('t3', 'Team C')];
    await useGameStore.getState().setTeams(newTeams);
    expect(useGameStore.getState().teams).toEqual(newTeams);
  });

  it('should set current round', async () => {
    await useGameStore.getState().setCurrentRound(3);
    expect(useGameStore.getState().currentRound).toBe(3);
  });

  it('should set sudden death', async () => {
    await useGameStore.getState().setSuddenDeath(true);
    expect(useGameStore.getState().isSuddenDeath).toBe(true);
  });
});
