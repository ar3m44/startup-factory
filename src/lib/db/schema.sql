-- ============================================================================
-- Factory OS Database Schema
-- ============================================================================

-- Signals table
CREATE TABLE IF NOT EXISTS signals (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  confidence_score INTEGER NOT NULL,
  problem TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  quotes TEXT NOT NULL, -- JSON array
  context TEXT NOT NULL,
  mvp_description TEXT NOT NULL,
  price TEXT NOT NULL,
  track TEXT NOT NULL CHECK (track IN ('FAST', 'LONG')),
  key_features TEXT NOT NULL, -- JSON array
  tam TEXT NOT NULL,
  competitors TEXT NOT NULL, -- JSON array
  advantage TEXT NOT NULL,
  criteria TEXT NOT NULL, -- JSON object
  risks TEXT NOT NULL, -- JSON array
  status TEXT NOT NULL CHECK (status IN ('pending_validation', 'validated', 'rejected')),
  validation_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Ventures table
CREATE TABLE IF NOT EXISTS ventures (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  url TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'building', 'launched', 'paused', 'killed', 'validating')),
  track TEXT NOT NULL CHECK (track IN ('FAST', 'LONG')),
  created_at TEXT NOT NULL,
  launched_at TEXT,
  paused_at TEXT,
  killed_at TEXT,
  metrics TEXT NOT NULL, -- JSON object
  signal_id TEXT,
  validation_id TEXT,
  blueprint TEXT, -- JSON object
  pause_reason TEXT,
  kill_reason TEXT,
  FOREIGN KEY (signal_id) REFERENCES signals(id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  venture_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('P0', 'P1', 'P2')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'in_progress', 'review', 'done', 'failed')),
  type TEXT CHECK (type IN ('feature', 'bug', 'refactor', 'docs')),
  files TEXT, -- JSON array
  dependencies TEXT, -- JSON array
  created_at TEXT NOT NULL,
  started_at TEXT,
  completed_at TEXT,
  updated_at TEXT NOT NULL,
  branch TEXT,
  pr_url TEXT,
  ci_status TEXT CHECK (ci_status IN ('pending', 'success', 'failure'))
);

-- Audit entries table
CREATE TABLE IF NOT EXISTS audit_entries (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  venture_id TEXT,
  actor TEXT NOT NULL CHECK (actor IN ('Scout', 'Validator', 'Orchestrator', 'Launcher', 'Monitor', 'User', 'Engineer')),
  action TEXT NOT NULL,
  result TEXT,
  data TEXT, -- JSON object
  metadata TEXT, -- JSON object
  FOREIGN KEY (venture_id) REFERENCES ventures(id)
);

-- Validation results table
CREATE TABLE IF NOT EXISTS validations (
  id TEXT PRIMARY KEY,
  signal_id TEXT NOT NULL,
  date TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('GO', 'NO-GO')),
  pipelines TEXT NOT NULL, -- JSON object
  tam_analysis TEXT NOT NULL, -- JSON object
  competitor_analysis TEXT NOT NULL, -- JSON object
  technical_feasibility TEXT NOT NULL, -- JSON object
  pricing_feasibility TEXT NOT NULL, -- JSON object
  risk_assessment TEXT NOT NULL, -- JSON object
  blueprint TEXT, -- JSON object (if GO)
  FOREIGN KEY (signal_id) REFERENCES signals(id)
);

-- Factory state (singleton table)
CREATE TABLE IF NOT EXISTS factory_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_scout_run TEXT,
  last_validator_run TEXT,
  last_monitor_run TEXT,
  budget_monthly INTEGER NOT NULL DEFAULT 50000,
  budget_spent INTEGER NOT NULL DEFAULT 0,
  budget_last_reset TEXT NOT NULL
);

-- Engineer runs table (logs all AI engineer executions)
CREATE TABLE IF NOT EXISTS engineer_runs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'cancelled')),
  model TEXT NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  files_created TEXT, -- JSON array
  files_updated TEXT, -- JSON array
  files_deleted TEXT, -- JSON array
  error_message TEXT,
  logs TEXT, -- JSON array of log entries
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  venture_id TEXT,
  data TEXT, -- JSON object
  timestamp TEXT NOT NULL,
  FOREIGN KEY (venture_id) REFERENCES ventures(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_date ON signals(date);
CREATE INDEX IF NOT EXISTS idx_ventures_status ON ventures(status);
CREATE INDEX IF NOT EXISTS idx_tasks_venture_id ON tasks(venture_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_audit_entries_timestamp ON audit_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_entries_venture_id ON audit_entries(venture_id);
CREATE INDEX IF NOT EXISTS idx_audit_entries_actor ON audit_entries(actor);
CREATE INDEX IF NOT EXISTS idx_engineer_runs_task_id ON engineer_runs(task_id);
CREATE INDEX IF NOT EXISTS idx_engineer_runs_status ON engineer_runs(status);
CREATE INDEX IF NOT EXISTS idx_engineer_runs_started_at ON engineer_runs(started_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_venture_id ON analytics_events(venture_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
