// ============================================================================
// FACTORY FIXTURES - Now reads from SQLite database
// ============================================================================
// This file provides compatibility layer for components still using fixtures
// All data is now stored in SQLite database (factory.db)
// ============================================================================

import {
  getAllVentures,
  getAllTasks,
  getAllAuditEntries,
  getFactoryStats,
  type DbTask,
  type DbAuditEntry,
} from '@/lib/db';
import { seedDatabase } from '@/lib/db/seed';
import type { Venture } from '@/lib/types';

// Ensure database is seeded on first import
try {
  seedDatabase();
} catch {
  // Ignore if already seeded
}

/**
 * Get all ventures from database
 */
export function getFixtureVentures(): Venture[] {
  return getAllVentures();
}

/**
 * Get all tasks from database
 */
export function getFixtureTasks(): FixtureTask[] {
  const tasks = getAllTasks();
  return tasks.map(dbTaskToFixtureTask);
}

/**
 * Get all audit entries from database
 */
export function getFixtureAuditEntries(): FixtureAuditEntry[] {
  const entries = getAllAuditEntries();
  return entries.map(dbAuditToFixtureAudit);
}

/**
 * Get factory metrics from database
 */
export function getFixtureMetrics(): FactoryMetrics {
  const stats = getFactoryStats();
  return {
    totalLeads: stats.pendingSignals,
    totalRevenue: stats.totalRevenue,
    conversionRate: stats.totalSignals > 0 ? (stats.totalVentures / stats.totalSignals) * 100 : null,
    activeVentures: stats.activeVentures,
    totalTasks: stats.totalTasks,
    completedTasks: stats.completedTasks,
  };
}

// ============================================================================
// Compatibility exports (for static pages that don't support dynamic data yet)
// ============================================================================

export const fixtureVentures: Venture[] = [];
export const fixtureTasks: FixtureTask[] = [];
export const fixtureAuditEntries: FixtureAuditEntry[] = [];
export const fixtureMetrics: FactoryMetrics = {
  totalLeads: 0,
  totalRevenue: 0,
  conversionRate: null,
  activeVentures: 0,
  totalTasks: 0,
  completedTasks: 0,
};

// ============================================================================
// Types for fixtures
// ============================================================================

export interface FixtureTask {
  id: string;
  title: string;
  status: 'draft' | 'pending' | 'in_progress' | 'review' | 'done' | 'failed';
  priority: 'P0' | 'P1' | 'P2';
  ventureId: string;
  prUrl: string | null;
  ciStatus: 'pending' | 'success' | 'failure' | null;
  updatedAt: string;
}

export interface FixtureAuditEntry {
  id: string;
  timestamp: string;
  ventureId: string | null;
  actor: 'Scout' | 'Validator' | 'Orchestrator' | 'Launcher' | 'Monitor' | 'User' | 'Engineer';
  action: string;
  result: string;
}

export interface FactoryMetrics {
  totalLeads: number;
  totalRevenue: number;
  conversionRate: number | null;
  activeVentures: number;
  totalTasks: number;
  completedTasks: number;
}

// ============================================================================
// Converters
// ============================================================================

function dbTaskToFixtureTask(task: DbTask): FixtureTask {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    ventureId: task.ventureId,
    prUrl: task.prUrl || null,
    ciStatus: task.ciStatus || null,
    updatedAt: task.updatedAt,
  };
}

function dbAuditToFixtureAudit(entry: DbAuditEntry): FixtureAuditEntry {
  return {
    id: entry.id,
    timestamp: entry.timestamp,
    ventureId: entry.ventureId || null,
    actor: entry.actor,
    action: entry.action,
    result: entry.result || '',
  };
}
