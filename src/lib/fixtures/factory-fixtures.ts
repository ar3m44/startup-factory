// ============================================================================
// FACTORY FIXTURES - Demo data for read-only Factory Control Panel
// ============================================================================
// TODO: Replace with real data from:
// - factory/state.json (ventures, signals)
// - factory/tasks/*.md (tasks)
// - factory/audit/*.md (audit entries)
// - GitHub API (PR links, CI status)
// ============================================================================

import type { Venture } from '@/lib/types';

/**
 * Demo ventures data
 * TODO: Ingest from factory/state.json via API route
 */
export const fixtureVentures: Venture[] = [
  {
    id: 'V-2026-001-typescript-1',
    name: 'TypeScript Docs Generator',
    slug: 'typescript-docs',
    url: '',
    status: 'active',
    track: 'FAST',
    createdAt: '2026-01-17T14:24:21.051Z',
    metrics: {
      mrr: 0,
      totalRevenue: 0,
      totalUsers: 0,
      activeUsers7d: 0,
      dailyVisits: 0,
      conversionRate: 0,
      churnRate: 0,
    },
    signalId: 'SIGNAL-2025-01-17-12-00',
    validationId: 'VALIDATION-2026-01-17T14-24-21',
    blueprint: {
      name: 'TypeScript Docs Generator',
      slug: 'typescript-docs',
      tagline: 'Upload TypeScript files, get beautiful docs in 1 minute',
      description: 'Web service for auto-generating interactive API docs from TypeScript',
      targetAudience: {
        who: 'TypeScript developers in Russia/CIS',
        problem: 'Need simple API documentation without complex setup',
        size: 50000,
      },
      mvp: {
        coreFeatures: ['Auto-parse TS to docs', 'Interactive playground', 'Export HTML/PDF'],
        userFlow: ['Upload files', 'Preview docs', 'Pay', 'Download/Host'],
        techStack: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Vercel'],
        estimatedTime: '5 days',
      },
      pricing: {
        model: 'subscription',
        price: '499 RUB/month',
        currency: 'RUB',
        paymentProvider: 'YooKassa',
      },
      gtm: {
        channels: ['Reddit', 'ProductHunt', 'Telegram'],
        initialBudget: 5000,
        firstWeekGoal: '100 visits, 1 purchase',
      },
      metrics: {
        track: 'FAST',
        targetMRR: 10000,
        targetUsers: 100,
        conversionRate: 1,
        killCriteria: ['0 transactions in 14 days', '<100 visits/day for 7 days'],
      },
      risks: [
        { description: 'Free alternatives competition', severity: 'medium', mitigation: 'Focus on UX' },
      ],
    },
  },
];

/**
 * Demo tasks data
 * TODO: Ingest from factory/tasks/*.md files
 */
export const fixtureTasks: FixtureTask[] = [
  {
    id: 'TASK-0008',
    title: 'Implement ENGINEER RUNNER with Claude API',
    status: 'done',
    priority: 'P0',
    ventureId: 'V-FACTORY-000',
    prUrl: 'https://github.com/ar3m44/startup-factory/pull/1',
    ciStatus: 'success',
    updatedAt: '2026-01-17T10:00:00Z',
  },
  {
    id: 'TASK-0009',
    title: 'Factory Control Panel (read-only)',
    status: 'in_progress',
    priority: 'P1',
    ventureId: 'V-FACTORY-000',
    prUrl: null,
    ciStatus: null,
    updatedAt: '2026-01-17T12:00:00Z',
  },
  {
    id: 'TASK-0010',
    title: 'Enable Auto-Merge in Engineer Workflow',
    status: 'draft',
    priority: 'P2',
    ventureId: 'V-FACTORY-000',
    prUrl: null,
    ciStatus: null,
    updatedAt: '2026-01-16T09:00:00Z',
  },
];

/**
 * Demo audit entries
 * TODO: Ingest from factory/audit/*.md files
 */
export const fixtureAuditEntries: FixtureAuditEntry[] = [
  {
    id: 'AUDIT-2026-01-17-001',
    timestamp: '2026-01-17T14:24:21Z',
    ventureId: 'V-2026-001-typescript-1',
    actor: 'Validator',
    action: 'validation_completed',
    result: 'GO',
  },
  {
    id: 'AUDIT-2026-01-17-002',
    timestamp: '2026-01-17T08:49:32Z',
    ventureId: null,
    actor: 'Scout',
    action: 'signal_found',
    result: 'SIGNAL-2025-01-17-12-00',
  },
  {
    id: 'AUDIT-2026-01-17-003',
    timestamp: '2026-01-17T08:47:28Z',
    ventureId: null,
    actor: 'Orchestrator',
    action: 'system_startup',
    result: 'OK',
  },
  {
    id: 'AUDIT-2026-01-16-001',
    timestamp: '2026-01-16T15:00:00Z',
    ventureId: 'V-FACTORY-000',
    actor: 'User',
    action: 'task_created',
    result: 'TASK-0008',
  },
  {
    id: 'AUDIT-2026-01-16-002',
    timestamp: '2026-01-16T10:30:00Z',
    ventureId: null,
    actor: 'Orchestrator',
    action: 'config_updated',
    result: 'OK',
  },
];

/**
 * Demo metrics data
 * TODO: Aggregate from venture metrics and external analytics
 */
export const fixtureMetrics: FactoryMetrics = {
  totalLeads: 0,
  totalRevenue: 0,
  conversionRate: null,
  activeVentures: 1,
  totalTasks: 3,
  completedTasks: 1,
};

// ============================================================================
// Types for fixtures (simplified for demo)
// ============================================================================

export interface FixtureTask {
  id: string;
  title: string;
  status: 'draft' | 'in_progress' | 'done';
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
  actor: 'Scout' | 'Validator' | 'Orchestrator' | 'Launcher' | 'Monitor' | 'User';
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
