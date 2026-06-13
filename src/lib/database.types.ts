export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          code: string;
          host_password: string | null;
          created_at: string;
          updated_at: string;
          expires_at: string;
          is_active: boolean;
          game_state: Json;
          metadata: Json;
        };
        Insert: {
          id?: string;
          code: string;
          host_password?: string | null;
          created_at?: string;
          updated_at?: string;
          expires_at?: string;
          is_active?: boolean;
          game_state?: Json;
          metadata?: Json;
        };
        Update: {
          id?: string;
          code?: string;
          host_password?: string | null;
          created_at?: string;
          updated_at?: string;
          expires_at?: string;
          is_active?: boolean;
          game_state?: Json;
          metadata?: Json;
        };
      };
      game_state: {
        Row: {
          id: number;
          session_id: string | null;
          competition_name: string;
          current_view: string;
          projector_mode: string;
          current_round: number;
          game_status: string;
          is_suddenDeath: boolean;
          announcement_text: string;
          intro_team_id: string | null;
          timer_remaining: number;
          timer_is_active: boolean;
          timer_duration: number;
          quiz_index: number;
          quiz_revealed: boolean;
          quiz_questions: Json;
          buzzed_team_id: string | null;
          taste_index: number;
          taste_items: Json;
          duel_challenger: string | null;
          duel_challenged: string | null;
          duel_winner: string | null;
          duel_active: boolean;
          updated_at: string;
        };
        Insert: {
          id?: number;
          session_id?: string | null;
          competition_name?: string;
          current_view?: string;
          projector_mode?: string;
          current_round?: number;
          game_status?: string;
          is_suddenDeath?: boolean;
          announcement_text?: string;
          intro_team_id?: string | null;
          timer_remaining?: number;
          timer_is_active?: boolean;
          timer_duration?: number;
          quiz_index?: number;
          quiz_revealed?: boolean;
          quiz_questions?: Json;
          buzzed_team_id?: string | null;
          taste_index?: number;
          taste_items?: Json;
          duel_challenger?: string | null;
          duel_challenged?: string | null;
          duel_winner?: string | null;
          duel_active?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: number;
          session_id?: string | null;
          competition_name?: string;
          current_view?: string;
          projector_mode?: string;
          current_round?: number;
          game_status?: string;
          is_suddenDeath?: boolean;
          announcement_text?: string;
          intro_team_id?: string | null;
          timer_remaining?: number;
          timer_is_active?: boolean;
          timer_duration?: number;
          quiz_index?: number;
          quiz_revealed?: boolean;
          quiz_questions?: Json;
          buzzed_team_id?: string | null;
          taste_index?: number;
          taste_items?: Json;
          duel_challenger?: string | null;
          duel_challenged?: string | null;
          duel_winner?: string | null;
          duel_active?: boolean;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          session_id: string | null;
          name: string;
          color: string;
          score: number;
          round_scores: Json;
          rank: number;
          rank_trend: string;
          chant: string;
          member_count: number;
          taste_item_scores: Json;
          team_secret: string | null;
        };
        Insert: {
          id: string;
          session_id?: string | null;
          name: string;
          color: string;
          score?: number;
          round_scores?: Json;
          rank?: number;
          rank_trend?: string;
          chant?: string;
          member_count?: number;
          taste_item_scores?: Json;
          team_secret?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          name?: string;
          color?: string;
          score?: number;
          round_scores?: Json;
          rank?: number;
          rank_trend?: string;
          chant?: string;
          member_count?: number;
          taste_item_scores?: Json;
          team_secret?: string | null;
        };
      };
      buzz_events: {
        Row: {
          id: string;
          session_id: string | null;
          team_id: string;
          question_index: number;
          buzzed_at: string;
          is_locked: boolean;
          is_correct: boolean | null;
          points_awarded: number;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          team_id: string;
          question_index: number;
          buzzed_at?: string;
          is_locked?: boolean;
          is_correct?: boolean | null;
          points_awarded?: number;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          team_id?: string;
          question_index?: number;
          buzzed_at?: string;
          is_locked?: boolean;
          is_correct?: boolean | null;
          points_awarded?: number;
        };
      };
    };
    Functions: {
      lock_buzz_for_question: {
        Args: {
          p_session_id: string;
          p_team_id: string;
          p_question_index: number;
        };
        Returns: string;
      };
      generate_session_code: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
  };
}
