-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT 'local-user',
  nickname TEXT DEFAULT 'Musician',
  avatar TEXT,
  skill_level TEXT DEFAULT 'beginner' CHECK(skill_level IN ('beginner','intermediate','advanced')),
  instrument TEXT DEFAULT 'piano' CHECK(instrument IN ('piano','cello')),
  language TEXT DEFAULT 'en' CHECK(language IN ('en','zh')),
  sound_effects_enabled INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  composer TEXT,
  instrument TEXT NOT NULL CHECK(instrument IN ('piano','cello')),
  difficulty TEXT CHECK(difficulty IN ('beginner','intermediate','advanced')),
  difficulty_score REAL,
  duration_seconds INTEGER,
  category TEXT,
  musicxml_path TEXT,
  midi_path TEXT,
  is_builtin INTEGER DEFAULT 1,
  created_at TEXT
);

-- Practice sessions table
CREATE TABLE IF NOT EXISTS practice_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'local-user',
  track_id TEXT NOT NULL,
  scoring_mode TEXT CHECK(scoring_mode IN ('piece','single-note')),
  status TEXT DEFAULT 'completed' CHECK(status IN ('in-progress','completed','abandoned')),
  duration_seconds INTEGER,
  target_bpm INTEGER,
  actual_bpm REAL,
  total_score REAL,
  speed_score REAL,
  rhythm_score REAL,
  intonation_score REAL,
  smoothness_score REAL,
  completeness_score REAL,
  audio_blob_key TEXT,
  video_blob_key TEXT,
  resume_position INTEGER,
  created_at TEXT,
  FOREIGN KEY (track_id) REFERENCES tracks(id)
);

-- Practice errors table
CREATE TABLE IF NOT EXISTS practice_errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  measure_number INTEGER NOT NULL,
  beat_position REAL,
  error_type TEXT CHECK(error_type IN ('pitch','rhythm','missed','extra')),
  expected_note TEXT,
  actual_note TEXT,
  deviation_cents REAL,
  deviation_ms REAL,
  severity TEXT CHECK(severity IN ('minor','moderate','severe')),
  hand TEXT CHECK(hand IN ('left','right','both')),
  FOREIGN KEY (session_id) REFERENCES practice_sessions(id)
);

-- Diagnostics table
CREATE TABLE IF NOT EXISTS diagnostics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  dimension TEXT CHECK(dimension IN ('speed','rhythm','intonation','smoothness','completeness')),
  problem TEXT,
  cause_analysis TEXT,
  solution TEXT,
  measure_start INTEGER,
  measure_end INTEGER,
  severity_rank INTEGER,
  FOREIGN KEY (session_id) REFERENCES practice_sessions(id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'local-user',
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  unlocked_at TEXT
);

-- Weekly goals table
CREATE TABLE IF NOT EXISTS weekly_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'local-user',
  week_start TEXT NOT NULL,
  target_days INTEGER DEFAULT 5,
  target_minutes INTEGER DEFAULT 120,
  actual_days INTEGER DEFAULT 0,
  actual_minutes INTEGER DEFAULT 0,
  created_at TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_track ON practice_sessions(track_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON practice_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_errors_session ON practice_errors(session_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_session ON diagnostics(session_id);
CREATE INDEX IF NOT EXISTS idx_tracks_instrument ON tracks(instrument);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_week ON weekly_goals(week_start);
