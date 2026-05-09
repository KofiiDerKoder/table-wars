-- Table Wars! Supabase Schema

-- 1. Game State
CREATE TABLE game_state (
    id SERIAL PRIMARY KEY,
    current_view TEXT DEFAULT 'setup',
    projector_mode TEXT DEFAULT 'logo',
    current_round INTEGER DEFAULT 1,
    game_status TEXT DEFAULT 'idle',
    is_suddenDeath BOOLEAN DEFAULT FALSE,
    announcement_text TEXT,
    timer_remaining INTEGER DEFAULT 0,
    timer_is_active BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Teams
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    round_scores JSONB DEFAULT '{}',
    rank INTEGER DEFAULT 1,
    chant TEXT
);

-- 3. Quiz Questions
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    category TEXT
);

-- 4. Taste Test Items
CREATE TABLE taste_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    hint TEXT,
    category TEXT
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
