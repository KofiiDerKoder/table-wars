import { supabase } from '@/lib/supabase';

export async function fetchGameState(sessionId?: string) {
  if (sessionId) {
    return supabase.from('game_state').select('*').eq('session_id', sessionId).single();
  }
  return supabase.from('game_state').select('*').eq('id', 1).single();
}

export async function updateGameState(sessionId: string | undefined, updates: Record<string, unknown>) {
  try {
    const query = sessionId
      ? supabase.from('game_state').update(updates).eq('session_id', sessionId)
      : supabase.from('game_state').update(updates).eq('id', 1);
    const { error } = await query;
    if (error) console.error('Failed to update game state:', error);
    return { error };
  } catch (err) {
    console.error('Failed to update game state:', err);
    return { error: err as Error };
  }
}

export async function updateGameStateField(sessionId: string | undefined, field: string, value: unknown) {
  return updateGameState(sessionId, { [field]: value });
}
