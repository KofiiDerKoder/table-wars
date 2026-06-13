import { supabase } from '@/lib/supabase';
import type { Team } from '@/store/useGameStore';

export async function fetchTeams(sessionId?: string) {
  if (sessionId) {
    return supabase.from('teams').select('*').eq('session_id', sessionId);
  }
  return supabase.from('teams').select('*');
}

export async function updateTeamScore(sessionId: string | undefined, teamId: string, score: number, roundScores: Record<number, number>) {
  return updateTeam(sessionId, teamId, { score, round_scores: roundScores });
}

export async function updateTeam(sessionId: string | undefined, teamId: string, updates: Record<string, unknown>) {
  const query = sessionId
    ? supabase.from('teams').update(updates).eq('id', teamId).eq('session_id', sessionId)
    : supabase.from('teams').update(updates).eq('id', teamId);
  const { error } = await query;
  if (error) console.error('Failed to update team:', error);
  return { error };
}

export async function upsertTeams(sessionId: string | undefined, teams: Record<string, unknown>[]) {
  const teamsWithSession = sessionId
    ? teams.map(t => ({ ...t, session_id: sessionId }))
    : teams;
  const { error } = await supabase.from('teams').upsert(teamsWithSession);
  if (error) console.error('Failed to upsert teams:', error);
  return { error };
}

export async function resetTeamScores(sessionId: string | undefined) {
  const query = sessionId
    ? supabase.from('teams').update({ score: 0, round_scores: {} }).eq('session_id', sessionId)
    : supabase.from('teams').update({ score: 0, round_scores: {} }).neq('id', 'non-existent');
  const { error } = await query;
  if (error) console.error('Failed to reset scores:', error);
  return { error };
}
