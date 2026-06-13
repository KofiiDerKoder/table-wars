let broadcastChannel: BroadcastChannel | null = null;

export function initSync() {
  if (typeof window === 'undefined') return;
  try {
    broadcastChannel = new BroadcastChannel('tablewars-sync');
  } catch { /* ignore */ }
}

export function broadcastUpdate(partial: Record<string, unknown>) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'STATE_UPDATE', payload: partial });
    } catch { /* ignore */ }
  }
}

export function setBroadcastHandler(handler: (data: Record<string, unknown>) => void) {
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'STATE_UPDATE') handler(payload);
    };
  }
}

const STORAGE_KEY = 'tablewars-state';

export function saveState(state: Record<string, unknown>) {
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
      rounds: state.rounds,
      roundsData: state.roundsData,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch { /* ignore */ }
}

export function loadState(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - (data.timestamp || 0) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch { return null; }
}

export function clearSync() {
  if (broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
