-- Table Wars! Supabase Schema (Full Multi-Device + Session Management)

-- Drop existing tables if they exist (to avoid type conflicts)
DROP TABLE IF EXISTS buzz_events CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS game_state CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS taste_items CASCADE;

-- 1. Sessions (New - Multi-Device Sync)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,  -- 6-char alphanumeric code (e.g., "AB3X9K")
    host_password TEXT,          -- Optional password for host access
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    is_active BOOLEAN DEFAULT TRUE,
    game_state JSONB DEFAULT '{}',  -- Full serialized game state
    metadata JSONB DEFAULT '{}'       -- Competition name, school, etc.
);

-- 2. Game State (Per-Session)
CREATE TABLE game_state (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    current_view TEXT DEFAULT 'setup',
    projector_mode TEXT DEFAULT 'logo',
    current_round INTEGER DEFAULT 1,
    game_status TEXT DEFAULT 'idle',
    is_suddenDeath BOOLEAN DEFAULT FALSE,
    announcement_text TEXT DEFAULT '',
    intro_team_id TEXT DEFAULT NULL,
    timer_remaining INTEGER DEFAULT 0,
    timer_is_active BOOLEAN DEFAULT FALSE,
    timer_duration INTEGER DEFAULT 0,
    quiz_index INTEGER DEFAULT 0,
    quiz_revealed BOOLEAN DEFAULT FALSE,
    quiz_questions JSONB DEFAULT '[]',
    buzzed_team_id TEXT DEFAULT NULL,
    taste_index INTEGER DEFAULT 0,
    taste_items JSONB DEFAULT '[]',
    duel_challenger TEXT DEFAULT NULL,
    duel_challenged TEXT DEFAULT NULL,
    duel_winner TEXT DEFAULT NULL,
    duel_active BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Teams (Per-Session)
CREATE TABLE teams (
    id TEXT PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    round_scores JSONB DEFAULT '{}',
    rank INTEGER DEFAULT 1,
    rank_trend TEXT DEFAULT 'stable',
    chant TEXT DEFAULT '',
    member_count INTEGER DEFAULT 4,
    taste_item_scores JSONB DEFAULT '{}',
    team_secret TEXT DEFAULT NULL  -- Secret code for team to authenticate buzzes
);

-- 4. Buzz Events (New - Real-time Buzz Tracking)
CREATE TABLE buzz_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
    question_index INTEGER NOT NULL,
    buzzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_locked BOOLEAN DEFAULT FALSE,  -- First buzz locks out others
    is_correct BOOLEAN DEFAULT NULL,
    points_awarded INTEGER DEFAULT 0
);

-- 5. Quiz Questions (Legacy — questions stored in game_state.quiz_questions)
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    category TEXT
);

-- 6. Taste Test Items (Legacy — items stored in game_state.taste_items)
CREATE TABLE taste_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    hint TEXT,
    category TEXT
);

-- ─── Indexes for Performance ──────────────────────────────────────────────
CREATE INDEX idx_sessions_code ON sessions(code);
CREATE INDEX idx_sessions_active ON sessions(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_game_state_session ON game_state(session_id);
CREATE INDEX idx_teams_session ON teams(session_id);
CREATE INDEX idx_buzz_events_session ON buzz_events(session_id);
CREATE INDEX idx_buzz_events_question ON buzz_events(session_id, question_index);

-- ─── Enable Realtime ──────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE buzz_events;

-- ─── Row Level Security ───────────────────────────────────────────────────
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE buzz_events ENABLE ROW LEVEL SECURITY;

-- Sessions: Anyone can read active sessions, only host can write
DROP POLICY IF EXISTS "anon_read_sessions" ON sessions;
CREATE POLICY "anon_read_sessions" ON sessions
    FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "anon_create_sessions" ON sessions;
CREATE POLICY "anon_create_sessions" ON sessions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON sessions;
CREATE POLICY "anon_update_sessions" ON sessions
    FOR UPDATE USING (true) WITH CHECK (true);

-- Game State: Full access for now (session-scoped in app logic)
DROP POLICY IF EXISTS "anon_read_game_state" ON game_state;
CREATE POLICY "anon_read_game_state" ON game_state
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "anon_write_game_state" ON game_state;
CREATE POLICY "anon_write_game_state" ON game_state
    FOR ALL USING (true) WITH CHECK (true);

-- Teams: Full access for now (session-scoped in app logic)
DROP POLICY IF EXISTS "anon_read_teams" ON teams;
CREATE POLICY "anon_read_teams" ON teams
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "anon_write_teams" ON teams;
CREATE POLICY "anon_write_teams" ON teams
    FOR ALL USING (true) WITH CHECK (true);

-- Buzz Events: Anyone can insert (buzz in), everyone can read
DROP POLICY IF EXISTS "anon_read_buzz_events" ON buzz_events;
CREATE POLICY "anon_read_buzz_events" ON buzz_events
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "anon_insert_buzz_events" ON buzz_events;
CREATE POLICY "anon_insert_buzz_events" ON buzz_events
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_buzz_events" ON buzz_events;
CREATE POLICY "anon_update_buzz_events" ON buzz_events
    FOR UPDATE USING (true) WITH CHECK (true);

-- ─── Function: Generate Session Code ──────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- No I, O, 0, 1
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substring(chars from floor(random() * length(chars) + 1)::integer for 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ─── Function: Lock Buzz (First buzz wins) ────────────────────────────────
CREATE OR REPLACE FUNCTION lock_buzz_for_question(
    p_session_id UUID,
    p_team_id TEXT,
    p_question_index INTEGER
)
RETURNS UUID AS $$
DECLARE
    v_buzz_id UUID;
BEGIN
    -- Check if buzz is already locked for this question
    SELECT id INTO v_buzz_id
    FROM buzz_events
    WHERE session_id = p_session_id
      AND question_index = p_question_index
      AND is_locked = TRUE;

    IF v_buzz_id IS NOT NULL THEN
        -- Buzz already locked, return existing
        RETURN v_buzz_id;
    END IF;

    -- Create new buzz and lock it
    INSERT INTO buzz_events (session_id, team_id, question_index, is_locked, buzzed_at)
    VALUES (p_session_id, p_team_id, p_question_index, TRUE, NOW())
    RETURNING id INTO v_buzz_id;

    -- Lock any other buzzes for this question
    UPDATE buzz_events
    SET is_locked = TRUE
    WHERE session_id = p_session_id
      AND question_index = p_question_index
      AND id != v_buzz_id;

    RETURN v_buzz_id;
END;
$$ LANGUAGE plpgsql;

-- ─── Cleanup: Auto-expire old sessions ────────────────────────────────────
-- Run this as a cron job or manually:
-- DELETE FROM sessions WHERE expires_at < NOW();