import { supabase } from '@/lib/supabase';

export async function lockBuzz(sessionId: string | undefined, teamId: string, questionIndex: number) {
  if (sessionId) {
    const { data, error } = await supabase.rpc('lock_buzz_for_question', {
      p_session_id: sessionId,
      p_team_id: teamId,
      p_question_index: questionIndex
    });
    if (error) console.error('Failed to lock buzz:', error);
    return { data, error };
  }
  return { data: null, error: null };
}
