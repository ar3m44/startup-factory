// ============================================================================
// Database Layer for Factory OS
// ============================================================================

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Signal, Venture, ValidationResult, AuditEntry, FactoryState } from '@/lib/types';

// Database file path
const DB_PATH = process.env.DATABASE_PATH || join(process.cwd(), 'factory.db');

// Singleton database instance
let db: Database.Database | null = null;

/**
 * Get database instance (lazy initialization)
 */
export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeSchema();
  }
  return db;
}

/**
 * Initialize database schema
 */
function initializeSchema() {
  const database = db!;
  const schemaPath = join(process.cwd(), 'src/lib/db/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  database.exec(schema);

  // Initialize factory state if not exists
  const state = database.prepare('SELECT * FROM factory_state WHERE id = 1').get();
  if (!state) {
    database.prepare(`
      INSERT INTO factory_state (id, budget_monthly, budget_spent, budget_last_reset)
      VALUES (1, 50000, 0, datetime('now'))
    `).run();
  }
}

/**
 * Close database connection
 */
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

// ============================================================================
// Signals CRUD
// ============================================================================

export function getAllSignals(): Signal[] {
  const database = getDb();
  const rows = database.prepare('SELECT * FROM signals ORDER BY date DESC').all() as SignalRow[];
  return rows.map(rowToSignal);
}

export function getSignalById(id: string): Signal | null {
  const database = getDb();
  const row = database.prepare('SELECT * FROM signals WHERE id = ?').get(id) as SignalRow | undefined;
  return row ? rowToSignal(row) : null;
}

export function getSignalsByStatus(status: Signal['status']): Signal[] {
  const database = getDb();
  const rows = database.prepare('SELECT * FROM signals WHERE status = ? ORDER BY date DESC').all(status) as SignalRow[];
  return rows.map(rowToSignal);
}

export function createSignal(signal: Signal): Signal {
  const database = getDb();
  database.prepare(`
    INSERT INTO signals (
      id, date, source, source_url, confidence_score, problem, target_audience,
      quotes, context, mvp_description, price, track, key_features, tam,
      competitors, advantage, criteria, risks, status, validation_id
    ) VALUES (
      @id, @date, @source, @sourceUrl, @confidenceScore, @problem, @targetAudience,
      @quotes, @context, @mvpDescription, @price, @track, @keyFeatures, @tam,
      @competitors, @advantage, @criteria, @risks, @status, @validationId
    )
  `).run({
    id: signal.id,
    date: signal.date,
    source: signal.source,
    sourceUrl: signal.sourceUrl,
    confidenceScore: signal.confidenceScore,
    problem: signal.problem,
    targetAudience: signal.targetAudience,
    quotes: JSON.stringify(signal.quotes),
    context: signal.context,
    mvpDescription: signal.mvpDescription,
    price: signal.price,
    track: signal.track,
    keyFeatures: JSON.stringify(signal.keyFeatures),
    tam: signal.tam,
    competitors: JSON.stringify(signal.competitors),
    advantage: signal.advantage,
    criteria: JSON.stringify(signal.criteria),
    risks: JSON.stringify(signal.risks),
    status: signal.status,
    validationId: signal.validationId || null,
  });
  return signal;
}

export function updateSignalStatus(id: string, status: Signal['status'], validationId?: string): void {
  const database = getDb();
  database.prepare(`
    UPDATE signals SET status = ?, validation_id = ? WHERE id = ?
  `).run(status, validationId || null, id);
}

// ============================================================================
// Ventures CRUD
// ============================================================================

export function getAllVentures(): Venture[] {
  const database = getDb();
  const rows = database.prepare('SELECT * FROM ventures ORDER BY created_at DESC').all() as VentureRow[];
  return rows.map(rowToVenture);
}

export function getVentureById(id: string): Venture | null {
  const database = getDb();
  const row = database.prepare('SELECT * FROM ventures WHERE id = ?').get(id) as VentureRow | undefined;
  return row ? rowToVenture(row) : null;
}

export function getActiveVentures(): Venture[] {
  const database = getDb();
  const rows = database.prepare(`
    SELECT * FROM ventures WHERE status IN ('active', 'building', 'launched') ORDER BY created_at DESC
  `).all() as VentureRow[];
  return rows.map(rowToVenture);
}

export function createVenture(venture: Venture): Venture {
  const database = getDb();
  database.prepare(`
    INSERT INTO ventures (
      id, name, slug, url, status, track, created_at, launched_at, paused_at, killed_at,
      metrics, signal_id, validation_id, blueprint, pause_reason, kill_reason
    ) VALUES (
      @id, @name, @slug, @url, @status, @track, @createdAt, @launchedAt, @pausedAt, @killedAt,
      @metrics, @signalId, @validationId, @blueprint, @pauseReason, @killReason
    )
  `).run({
    id: venture.id,
    name: venture.name,
    slug: venture.slug,
    url: venture.url || null,
    status: venture.status,
    track: venture.track,
    createdAt: venture.createdAt,
    launchedAt: venture.launchedAt || null,
    pausedAt: venture.pausedAt || null,
    killedAt: venture.killedAt || null,
    metrics: JSON.stringify(venture.metrics),
    signalId: venture.signalId || null,
    validationId: venture.validationId || null,
    blueprint: venture.blueprint ? JSON.stringify(venture.blueprint) : null,
    pauseReason: venture.pauseReason || null,
    killReason: venture.killReason || null,
  });
  return venture;
}

export function updateVenture(id: string, updates: Partial<Venture>): void {
  const database = getDb();
  const current = getVentureById(id);
  if (!current) return;

  const merged = { ...current, ...updates };
  database.prepare(`
    UPDATE ventures SET
      name = ?, slug = ?, url = ?, status = ?, track = ?,
      launched_at = ?, paused_at = ?, killed_at = ?,
      metrics = ?, blueprint = ?, pause_reason = ?, kill_reason = ?
    WHERE id = ?
  `).run(
    merged.name,
    merged.slug,
    merged.url || null,
    merged.status,
    merged.track,
    merged.launchedAt || null,
    merged.pausedAt || null,
    merged.killedAt || null,
    JSON.stringify(merged.metrics),
    merged.blueprint ? JSON.stringify(merged.blueprint) : null,
    merged.pauseReason || null,
    merged.killReason || null,
    id
  );
}

// ============================================================================
// Tasks CRUD
// ============================================================================

export interface DbTask {
  id: string;
  ventureId: string;
  title: string;
  description?: string;
  priority: 'P0' | 'P1' | 'P2';
  status: 'draft' | 'pending' | 'in_progress' | 'review' | 'done' | 'failed';
  type?: 'feature' | 'bug' | 'refactor' | 'docs';
  files?: string[];
  dependencies?: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
  branch?: string;
  prUrl?: string;
  ciStatus?: 'pending' | 'success' | 'failure';
}

export function getAllTasks(): DbTask[] {
  const database = getDb();
  const rows = database.prepare('SELECT * FROM tasks ORDER BY updated_at DESC').all() as TaskRow[];
  return rows.map(rowToTask);
}

export function getTaskById(id: string): DbTask | null {
  const database = getDb();
  const row = database.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
  return row ? rowToTask(row) : null;
}

export function getTasksByVenture(ventureId: string): DbTask[] {
  const database = getDb();
  const rows = database.prepare('SELECT * FROM tasks WHERE venture_id = ? ORDER BY updated_at DESC').all(ventureId) as TaskRow[];
  return rows.map(rowToTask);
}

export function createTask(task: DbTask): DbTask {
  const database = getDb();
  database.prepare(`
    INSERT INTO tasks (
      id, venture_id, title, description, priority, status, type,
      files, dependencies, created_at, started_at, completed_at, updated_at,
      branch, pr_url, ci_status
    ) VALUES (
      @id, @ventureId, @title, @description, @priority, @status, @type,
      @files, @dependencies, @createdAt, @startedAt, @completedAt, @updatedAt,
      @branch, @prUrl, @ciStatus
    )
  `).run({
    id: task.id,
    ventureId: task.ventureId,
    title: task.title,
    description: task.description || null,
    priority: task.priority,
    status: task.status,
    type: task.type || null,
    files: task.files ? JSON.stringify(task.files) : null,
    dependencies: task.dependencies ? JSON.stringify(task.dependencies) : null,
    createdAt: task.createdAt,
    startedAt: task.startedAt || null,
    completedAt: task.completedAt || null,
    updatedAt: task.updatedAt,
    branch: task.branch || null,
    prUrl: task.prUrl || null,
    ciStatus: task.ciStatus || null,
  });
  return task;
}

export function updateTask(id: string, updates: Partial<DbTask>): void {
  const database = getDb();
  const current = getTaskById(id);
  if (!current) return;

  const merged = { ...current, ...updates, updatedAt: new Date().toISOString() };
  database.prepare(`
    UPDATE tasks SET
      title = ?, description = ?, priority = ?, status = ?, type = ?,
      files = ?, dependencies = ?, started_at = ?, completed_at = ?, updated_at = ?,
      branch = ?, pr_url = ?, ci_status = ?
    WHERE id = ?
  `).run(
    merged.title,
    merged.description || null,
    merged.priority,
    merged.status,
    merged.type || null,
    merged.files ? JSON.stringify(merged.files) : null,
    merged.dependencies ? JSON.stringify(merged.dependencies) : null,
    merged.startedAt || null,
    merged.completedAt || null,
    merged.updatedAt,
    merged.branch || null,
    merged.prUrl || null,
    merged.ciStatus || null,
    id
  );
}

// ============================================================================
// Audit Entries CRUD
// ============================================================================

export interface DbAuditEntry {
  id: string;
  timestamp: string;
  ventureId?: string;
  actor: 'Scout' | 'Validator' | 'Orchestrator' | 'Launcher' | 'Monitor' | 'User' | 'Engineer';
  action: string;
  result?: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export function getAllAuditEntries(limit = 100): DbAuditEntry[] {
  const database = getDb();
  const rows = database.prepare('SELECT * FROM audit_entries ORDER BY timestamp DESC LIMIT ?').all(limit) as AuditRow[];
  return rows.map(rowToAuditEntry);
}

export function getAuditEntryById(id: string): DbAuditEntry | null {
  const database = getDb();
  const row = database.prepare('SELECT * FROM audit_entries WHERE id = ?').get(id) as AuditRow | undefined;
  return row ? rowToAuditEntry(row) : null;
}

export function getAuditEntriesByVenture(ventureId: string): DbAuditEntry[] {
  const database = getDb();
  const rows = database.prepare('SELECT * FROM audit_entries WHERE venture_id = ? ORDER BY timestamp DESC').all(ventureId) as AuditRow[];
  return rows.map(rowToAuditEntry);
}

export function createAuditEntry(entry: DbAuditEntry): DbAuditEntry {
  const database = getDb();
  database.prepare(`
    INSERT INTO audit_entries (id, timestamp, venture_id, actor, action, result, data, metadata)
    VALUES (@id, @timestamp, @ventureId, @actor, @action, @result, @data, @metadata)
  `).run({
    id: entry.id,
    timestamp: entry.timestamp,
    ventureId: entry.ventureId || null,
    actor: entry.actor,
    action: entry.action,
    result: entry.result || null,
    data: entry.data ? JSON.stringify(entry.data) : null,
    metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
  });
  return entry;
}

// ============================================================================
// Factory State
// ============================================================================

export interface DbFactoryState {
  lastScoutRun: string | null;
  lastValidatorRun: string | null;
  lastMonitorRun: string | null;
  budgetMonthly: number;
  budgetSpent: number;
  budgetLastReset: string;
}

export function getFactoryState(): DbFactoryState {
  const database = getDb();
  const row = database.prepare('SELECT * FROM factory_state WHERE id = 1').get() as FactoryStateRow;
  return {
    lastScoutRun: row.last_scout_run,
    lastValidatorRun: row.last_validator_run,
    lastMonitorRun: row.last_monitor_run,
    budgetMonthly: row.budget_monthly,
    budgetSpent: row.budget_spent,
    budgetLastReset: row.budget_last_reset,
  };
}

export function updateFactoryState(updates: Partial<DbFactoryState>): void {
  const database = getDb();
  const current = getFactoryState();
  const merged = { ...current, ...updates };

  database.prepare(`
    UPDATE factory_state SET
      last_scout_run = ?,
      last_validator_run = ?,
      last_monitor_run = ?,
      budget_monthly = ?,
      budget_spent = ?,
      budget_last_reset = ?
    WHERE id = 1
  `).run(
    merged.lastScoutRun,
    merged.lastValidatorRun,
    merged.lastMonitorRun,
    merged.budgetMonthly,
    merged.budgetSpent,
    merged.budgetLastReset
  );
}

// ============================================================================
// Aggregated Stats
// ============================================================================

export interface FactoryStats {
  totalVentures: number;
  activeVentures: number;
  totalSignals: number;
  pendingSignals: number;
  totalTasks: number;
  completedTasks: number;
  totalRevenue: number;
  totalMRR: number;
}

export function getFactoryStats(): FactoryStats {
  const database = getDb();

  const ventureStats = database.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status IN ('active', 'building', 'launched') THEN 1 ELSE 0 END) as active
    FROM ventures
  `).get() as { total: number; active: number };

  const signalStats = database.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending_validation' THEN 1 ELSE 0 END) as pending
    FROM signals
  `).get() as { total: number; pending: number };

  const taskStats = database.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed
    FROM tasks
  `).get() as { total: number; completed: number };

  // Calculate revenue from ventures
  const ventures = getAllVentures();
  const totalRevenue = ventures.reduce((sum, v) => sum + (v.metrics?.totalRevenue || 0), 0);
  const totalMRR = ventures.reduce((sum, v) => sum + (v.metrics?.mrr || 0), 0);

  return {
    totalVentures: ventureStats.total,
    activeVentures: ventureStats.active,
    totalSignals: signalStats.total,
    pendingSignals: signalStats.pending,
    totalTasks: taskStats.total,
    completedTasks: taskStats.completed,
    totalRevenue,
    totalMRR,
  };
}

// ============================================================================
// Row Types & Converters
// ============================================================================

interface SignalRow {
  id: string;
  date: string;
  source: string;
  source_url: string;
  confidence_score: number;
  problem: string;
  target_audience: string;
  quotes: string;
  context: string;
  mvp_description: string;
  price: string;
  track: string;
  key_features: string;
  tam: string;
  competitors: string;
  advantage: string;
  criteria: string;
  risks: string;
  status: string;
  validation_id: string | null;
}

interface VentureRow {
  id: string;
  name: string;
  slug: string;
  url: string | null;
  status: string;
  track: string;
  created_at: string;
  launched_at: string | null;
  paused_at: string | null;
  killed_at: string | null;
  metrics: string;
  signal_id: string | null;
  validation_id: string | null;
  blueprint: string | null;
  pause_reason: string | null;
  kill_reason: string | null;
}

interface TaskRow {
  id: string;
  venture_id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  type: string | null;
  files: string | null;
  dependencies: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
  branch: string | null;
  pr_url: string | null;
  ci_status: string | null;
}

interface AuditRow {
  id: string;
  timestamp: string;
  venture_id: string | null;
  actor: string;
  action: string;
  result: string | null;
  data: string | null;
  metadata: string | null;
}

interface FactoryStateRow {
  id: number;
  last_scout_run: string | null;
  last_validator_run: string | null;
  last_monitor_run: string | null;
  budget_monthly: number;
  budget_spent: number;
  budget_last_reset: string;
}

function rowToSignal(row: SignalRow): Signal {
  return {
    id: row.id,
    date: row.date,
    source: row.source as Signal['source'],
    sourceUrl: row.source_url,
    confidenceScore: row.confidence_score,
    problem: row.problem,
    targetAudience: row.target_audience,
    quotes: JSON.parse(row.quotes),
    context: row.context,
    mvpDescription: row.mvp_description,
    price: row.price,
    track: row.track as Signal['track'],
    keyFeatures: JSON.parse(row.key_features),
    tam: row.tam,
    competitors: JSON.parse(row.competitors),
    advantage: row.advantage,
    criteria: JSON.parse(row.criteria),
    risks: JSON.parse(row.risks),
    status: row.status as Signal['status'],
    validationId: row.validation_id || undefined,
  };
}

function rowToVenture(row: VentureRow): Venture {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    url: row.url || '',
    status: row.status as Venture['status'],
    track: row.track as Venture['track'],
    createdAt: row.created_at,
    launchedAt: row.launched_at || undefined,
    pausedAt: row.paused_at || undefined,
    killedAt: row.killed_at || undefined,
    metrics: JSON.parse(row.metrics),
    signalId: row.signal_id || '',
    validationId: row.validation_id || '',
    blueprint: row.blueprint ? JSON.parse(row.blueprint) : undefined,
    pauseReason: row.pause_reason || undefined,
    killReason: row.kill_reason || undefined,
  };
}

function rowToTask(row: TaskRow): DbTask {
  return {
    id: row.id,
    ventureId: row.venture_id,
    title: row.title,
    description: row.description || undefined,
    priority: row.priority as DbTask['priority'],
    status: row.status as DbTask['status'],
    type: row.type as DbTask['type'] | undefined,
    files: row.files ? JSON.parse(row.files) : undefined,
    dependencies: row.dependencies ? JSON.parse(row.dependencies) : undefined,
    createdAt: row.created_at,
    startedAt: row.started_at || undefined,
    completedAt: row.completed_at || undefined,
    updatedAt: row.updated_at,
    branch: row.branch || undefined,
    prUrl: row.pr_url || undefined,
    ciStatus: row.ci_status as DbTask['ciStatus'] | undefined,
  };
}

function rowToAuditEntry(row: AuditRow): DbAuditEntry {
  return {
    id: row.id,
    timestamp: row.timestamp,
    ventureId: row.venture_id || undefined,
    actor: row.actor as DbAuditEntry['actor'],
    action: row.action,
    result: row.result || undefined,
    data: row.data ? JSON.parse(row.data) : undefined,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  };
}
