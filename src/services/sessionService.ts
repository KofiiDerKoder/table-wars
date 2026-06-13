import { supabase } from '@/lib/supabase';
import type { SessionInfo } from '@/store/useGameStore';

export async function createSession(teams: Record<string, unknown>[], currentRound: number, projectorMode: string, announcementText: string, quiz: Record<string, unknown>, tasteTest: Record<string, unknown>): Promise<SessionInfo | null> {
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

  if (teams.length > 0) {
    const cleanedTeams = teams.map(t => ({
      ...t,
      session_id: data.id,
      round_scores: t.roundScores,
      taste_item_scores: t.tasteItemScores,
      rank_trend: t.rankTrend,
      member_count: t.memberCount
    }));
    supabase.from('teams').insert(cleanedTeams);
  }

  return { id: data.id, code: data.code, isHost: true };
}

export async function joinSessionByCode(code: string): Promise<{ session: Record<string, unknown>; error?: string } | null> {
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
  return { session, error: undefined };
}
