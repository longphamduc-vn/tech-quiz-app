export const SCHEMA_SQL = `
-- Topics (3-Level Hierarchy)
CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parent_id INTEGER NULL REFERENCES topics(id) ON DELETE SET NULL,
  level INTEGER NOT NULL, -- 1: Subject, 2: Chapter, 3: Sub-topic
  path TEXT NOT NULL
);

-- Media Assets
CREATE TABLE IF NOT EXISTS media_assets (
  media_key TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  alt_text TEXT NULL,
  caption TEXT NULL
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  difficulty_level INTEGER NOT NULL DEFAULT 2, -- 1: Easy, 2: Medium, 3: Hard
  question_type TEXT NOT NULL DEFAULT 'SINGLE_CHOICE',
  tags TEXT NULL, -- JSON Array string
  context_text TEXT NULL, -- Markdown + LaTeX containing <!-- media:KEY -->
  has_context_image BOOLEAN NOT NULL DEFAULT 0,
  content TEXT NOT NULL, -- Markdown + LaTeX containing <!-- media:KEY -->
  has_media BOOLEAN NOT NULL DEFAULT 0,
  media_keys TEXT NULL, -- JSON Array string of extracted keys
  explanation TEXT NULL, -- Markdown + LaTeX
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Options
CREATE TABLE IF NOT EXISTS options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT 0,
  has_image BOOLEAN DEFAULT 0,
  image_url TEXT NULL,
  order_index INTEGER NOT NULL DEFAULT 1
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT NULL,
  avatar_url TEXT NULL,
  role TEXT NOT NULL DEFAULT 'student', -- 'student', 'engineer', 'admin'
  color TEXT NOT NULL DEFAULT '#06b6d4',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Attempts / History
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER NULL REFERENCES topics(id) ON DELETE SET NULL,
  topic_name TEXT NULL,
  mode TEXT NOT NULL DEFAULT 'exam', -- 'exam' | 'practice'
  view_mode TEXT NOT NULL DEFAULT 'list', -- 'list' | 'single'
  total_questions INTEGER NOT NULL,
  answered_count INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  score_percentage REAL NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  answers_detail TEXT NOT NULL, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_topics_parent ON topics(parent_id);
CREATE INDEX IF NOT EXISTS idx_topics_level ON topics(level);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_options_question ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created ON quiz_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_mode ON quiz_attempts(mode);
`;
