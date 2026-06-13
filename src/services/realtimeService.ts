import { supabase } from '@/lib/supabase';

type OnStateChange = (state: Record<string, unknown>) => void;
type OnTeamChange = (team: Record<string, unknown>) => void;

let channels: ReturnType<typeof supabase.channel>[] = [];

export function subscribeToGameState(sessionId: string, onStateChange: OnStateChange) {
  const channel = supabase.channel(`state:${sessionId}`);
  channel
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'game_state', filter: `session_id=eq.${sessionId}` }, 
      (payload) => onStateChange(payload.new as Record<string, unknown>)
    )
    .subscribe();
  channels.push(channel);
  return channel;
}

export function subscribeToTeams(sessionId: string, onTeamChange: OnTeamChange) {
  const channel = supabase.channel(`teams:${sessionId}`);
  channel
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'teams', filter: `session_id=eq.${sessionId}` }, 
      (payload) => onTeamChange(payload.new as Record<string, unknown>)
    )
    .subscribe();
  channels.push(channel);
  return channel;
}

export function subscribeToTeamsLegacy(onTeamChange: OnTeamChange) {
  const channel = supabase.channel('teams_updates');
  channel
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' }, 
      (payload) => onTeamChange(payload.new as Record<string, unknown>)
    )
    .subscribe();
  channels.push(channel);
  return channel;
}

export function subscribeToGameStateLegacy(onStateChange: OnStateChange) {
  const channel = supabase.channel('game_updates');
  channel
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state' }, 
      (payload) => {
        const n = payload.new as Record<string, unknown>;
        if (!n.session_id) onStateChange(n);
      }
    )
    .subscribe();
  channels.push(channel);
  return channel;
}

export function cleanupSubscriptions() {
  channels.forEach(ch => ch.unsubscribe());
  channels = [];
}
