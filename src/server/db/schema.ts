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

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_topics_parent ON topics(parent_id);
CREATE INDEX IF NOT EXISTS idx_topics_level ON topics(level);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_options_question ON options(question_id);
`;
