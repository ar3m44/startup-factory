// ============================================================================
// Seed Database with Initial Data
// ============================================================================

import {
  getDb,
  createVenture,
  createTask,
  createAuditEntry,
  createSignal,
  getAllVentures,
  getAllTasks,
} from './index';
import type { Venture, Signal } from '@/lib/types';

/**
 * Seed the database with initial demo data
 */
export function seedDatabase() {
  const db = getDb();

  // Check if already seeded
  const ventures = getAllVentures();
  if (ventures.length > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database...');

  // Create demo signal
  const demoSignal: Signal = {
    id: 'SIGNAL-2026-01-17-12-00',
    date: '2026-01-17T12:00:00Z',
    source: 'Reddit',
    sourceUrl: 'https://reddit.com/r/typescript/example',
    confidenceScore: 85,
    problem: 'TypeScript разработчики тратят много времени на создание документации API',
    targetAudience: 'TypeScript разработчики в России/СНГ',
    quotes: [
      { text: 'Spend hours writing API docs manually', url: 'https://reddit.com/example1' },
      { text: 'Need auto-generated docs for my TS project', url: 'https://reddit.com/example2' },
      { text: 'Existing tools are too complex to setup', url: 'https://reddit.com/example3' },
    ],
    context: 'TypeScript adoption is growing rapidly, developers need better tooling',
    mvpDescription: 'Web service for auto-generating interactive API docs from TypeScript files',
    price: '499₽/месяц',
    track: 'FAST',
    keyFeatures: ['Auto-parse TS to docs', 'Interactive playground', 'Export HTML/PDF'],
    tam: '>$1M/год в России',
    competitors: [
      { name: 'TypeDoc', description: 'Free but complex setup', price: 'Free' },
      { name: 'TSDoc', description: 'Microsoft tool, requires configuration', price: 'Free' },
    ],
    advantage: 'Простота использования - загрузи файл, получи документацию за 1 минуту',
    criteria: {
      mandatory: {
        repeatability: true,
        targetAudienceSize: true,
        paymentWillingness: true,
        feasibility: true,
        noFreeAlternatives: true,
      },
      optional: {
        urgency: false,
        simpleMVP: true,
        viralPotential: true,
        recurringRevenue: true,
        lowCompetition: false,
      },
    },
    risks: [
      { description: 'Free alternatives competition', probability: 'medium', mitigation: 'Focus on UX' },
    ],
    status: 'validated',
    validationId: 'VALIDATION-2026-01-17T14-24-21',
  };

  createSignal(demoSignal);

  // Create demo venture
  const demoVenture: Venture = {
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
    signalId: 'SIGNAL-2026-01-17-12-00',
    validationId: 'VALIDATION-2026-01-17T14-24-21',
    blueprint: {
      name: 'TypeScript Docs Generator',
      slug: 'typescript-docs',
      tagline: 'Загрузи TypeScript файлы — получи красивую документацию за 1 минуту',
      description: 'Web сервис для автоматической генерации интерактивной API документации из TypeScript кода',
      targetAudience: {
        who: 'TypeScript разработчики в России/СНГ',
        problem: 'Нужна простая документация API без сложной настройки',
        size: 50000,
      },
      mvp: {
        coreFeatures: ['Auto-parse TS to docs', 'Interactive playground', 'Export HTML/PDF'],
        userFlow: ['Загрузка файлов', 'Предпросмотр', 'Оплата', 'Скачивание/Хостинг'],
        techStack: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Vercel'],
        estimatedTime: '5 дней',
      },
      pricing: {
        model: 'subscription',
        price: '499₽/месяц',
        currency: 'RUB',
        paymentProvider: 'YooKassa',
      },
      gtm: {
        channels: ['Reddit', 'ProductHunt', 'Telegram'],
        initialBudget: 5000,
        firstWeekGoal: '100 посещений, 1 покупка',
      },
      metrics: {
        track: 'FAST',
        targetMRR: 10000,
        targetUsers: 100,
        conversionRate: 1,
        killCriteria: ['0 транзакций за 14 дней', '<100 посещений/день 7 дней подряд'],
      },
      risks: [
        { description: 'Конкуренция с бесплатными альтернативами', severity: 'medium', mitigation: 'Фокус на UX' },
      ],
    },
  };

  createVenture(demoVenture);

  // Create Factory venture for internal tasks
  const factoryVenture: Venture = {
    id: 'V-FACTORY-000',
    name: 'Factory OS',
    slug: 'factory-os',
    url: '',
    status: 'active',
    track: 'LONG',
    createdAt: '2026-01-01T00:00:00.000Z',
    metrics: {
      mrr: 0,
      totalRevenue: 0,
      totalUsers: 1,
      activeUsers7d: 1,
      dailyVisits: 0,
      conversionRate: 0,
      churnRate: 0,
    },
    signalId: '',
    validationId: '',
    blueprint: {
      name: 'Factory OS',
      slug: 'factory-os',
      tagline: 'Автономная фабрика стартапов',
      description: 'Система для автоматического создания и управления стартапами',
      targetAudience: {
        who: 'Startup Factory Owner',
        problem: 'Автоматизация создания стартапов',
        size: 1,
      },
      mvp: {
        coreFeatures: ['Scout', 'Validator', 'Launcher', 'Monitor'],
        userFlow: ['Signal → Validation → Launch → Monitor'],
        techStack: ['Next.js 16', 'TypeScript', 'Claude API'],
        estimatedTime: '3 месяца',
      },
      pricing: {
        model: 'one-time',
        price: '0₽',
        currency: 'RUB',
        paymentProvider: 'YooKassa',
      },
      gtm: {
        channels: [],
        initialBudget: 0,
        firstWeekGoal: 'Internal use',
      },
      metrics: {
        track: 'LONG',
        targetMRR: 0,
        targetUsers: 1,
        conversionRate: 0,
        killCriteria: [],
      },
      risks: [],
    },
  };

  createVenture(factoryVenture);

  // Create tasks
  const tasks = [
    {
      id: 'TASK-0008',
      ventureId: 'V-FACTORY-000',
      title: 'Implement ENGINEER RUNNER with Claude API',
      description: 'Setup Claude API for autonomous code generation',
      priority: 'P0' as const,
      status: 'done' as const,
      type: 'feature' as const,
      createdAt: '2026-01-16T15:00:00Z',
      completedAt: '2026-01-17T10:00:00Z',
      updatedAt: '2026-01-17T10:00:00Z',
      prUrl: 'https://github.com/ar3m44/startup-factory/pull/1',
      ciStatus: 'success' as const,
    },
    {
      id: 'TASK-0009',
      ventureId: 'V-FACTORY-000',
      title: 'Factory Control Panel (read-only)',
      description: 'Dashboard for monitoring Factory OS',
      priority: 'P1' as const,
      status: 'done' as const,
      type: 'feature' as const,
      createdAt: '2026-01-17T08:00:00Z',
      completedAt: '2026-01-17T16:00:00Z',
      updatedAt: '2026-01-17T16:00:00Z',
      ciStatus: 'success' as const,
    },
    {
      id: 'TASK-0010',
      ventureId: 'V-FACTORY-000',
      title: 'Unicode sanitization + CI check',
      description: 'Add bidi character sanitization and CI check',
      priority: 'P1' as const,
      status: 'done' as const,
      type: 'feature' as const,
      createdAt: '2026-01-17T10:00:00Z',
      completedAt: '2026-01-17T14:00:00Z',
      updatedAt: '2026-01-17T14:00:00Z',
      ciStatus: 'success' as const,
    },
    {
      id: 'TASK-0011',
      ventureId: 'V-FACTORY-000',
      title: 'Engineer Runner via Claude API + GitHub Actions',
      description: 'Autonomous code execution workflow',
      priority: 'P0' as const,
      status: 'done' as const,
      type: 'feature' as const,
      createdAt: '2026-01-17T12:00:00Z',
      completedAt: '2026-01-17T15:00:00Z',
      updatedAt: '2026-01-17T15:00:00Z',
      ciStatus: 'success' as const,
    },
    {
      id: 'TASK-0012',
      ventureId: 'V-FACTORY-000',
      title: 'Data Layer - SQLite database',
      description: 'Replace fixtures with real database',
      priority: 'P1' as const,
      status: 'in_progress' as const,
      type: 'feature' as const,
      createdAt: '2026-01-18T09:00:00Z',
      updatedAt: '2026-01-18T09:00:00Z',
    },
    {
      id: 'TASK-0013',
      ventureId: 'V-FACTORY-000',
      title: 'Multi-page Factory UI with drill-down',
      description: 'Expand UI to multi-page with detailed views',
      priority: 'P1' as const,
      status: 'done' as const,
      type: 'feature' as const,
      createdAt: '2026-01-17T16:00:00Z',
      completedAt: '2026-01-18T08:00:00Z',
      updatedAt: '2026-01-18T08:00:00Z',
      ciStatus: 'success' as const,
    },
  ];

  for (const task of tasks) {
    createTask(task);
  }

  // Create audit entries
  const auditEntries = [
    {
      id: 'AUDIT-2026-01-18-001',
      timestamp: '2026-01-18T09:00:00Z',
      ventureId: 'V-FACTORY-000',
      actor: 'User' as const,
      action: 'task_started',
      result: 'TASK-0012',
    },
    {
      id: 'AUDIT-2026-01-18-002',
      timestamp: '2026-01-18T08:00:00Z',
      ventureId: 'V-FACTORY-000',
      actor: 'Engineer' as const,
      action: 'task_completed',
      result: 'TASK-0013',
    },
    {
      id: 'AUDIT-2026-01-17-001',
      timestamp: '2026-01-17T14:24:21Z',
      ventureId: 'V-2026-001-typescript-1',
      actor: 'Validator' as const,
      action: 'validation_completed',
      result: 'GO',
    },
    {
      id: 'AUDIT-2026-01-17-002',
      timestamp: '2026-01-17T12:00:00Z',
      ventureId: undefined,
      actor: 'Scout' as const,
      action: 'signal_found',
      result: 'SIGNAL-2026-01-17-12-00',
    },
    {
      id: 'AUDIT-2026-01-17-003',
      timestamp: '2026-01-17T08:47:28Z',
      ventureId: undefined,
      actor: 'Orchestrator' as const,
      action: 'system_startup',
      result: 'OK',
    },
    {
      id: 'AUDIT-2026-01-16-001',
      timestamp: '2026-01-16T15:00:00Z',
      ventureId: 'V-FACTORY-000',
      actor: 'User' as const,
      action: 'task_created',
      result: 'TASK-0008',
    },
  ];

  for (const entry of auditEntries) {
    createAuditEntry(entry);
  }

  console.log('Database seeded successfully!');
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase();
}
