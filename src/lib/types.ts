// ============================================================================
// TYPES.ts — TypeScript типы для Startup Factory OS
// ============================================================================

/**
 * Сигнал рынка, найденный Scout агентом
 */
export interface Signal {
  id: string; // SIGNAL-YYYY-MM-DD-HH-MM
  date: string; // ISO 8601
  source: 'Reddit' | 'HackerNews' | 'Twitter' | 'ProductHunt' | 'Telegram';
  sourceUrl: string; // URL оригинального поста
  confidenceScore: number; // 0-100

  // Описание
  problem: string; // Какую проблему испытывают люди
  targetAudience: string; // Кто эти люди
  quotes: Array<{
    text: string;
    url: string;
  }>; // Минимум 3 цитаты
  context: string; // Почему актуально сейчас

  // Решение
  mvpDescription: string; // Минимальный продукт
  price: string; // Предполагаемая цена (например, "500₽" или "999₽/месяц")
  track: 'FAST' | 'LONG'; // ≤7 дней или 7д-3мес
  keyFeatures: string[]; // Топ-3 фичи

  // Анализ рынка
  tam: string; // Потенциальный TAM в России
  competitors: Array<{
    name: string;
    description: string;
    price: string;
  }>;
  advantage: string; // Почему мы можем сделать лучше

  // Критерии
  criteria: {
    mandatory: {
      repeatability: boolean; // 3+ упоминания
      targetAudienceSize: boolean; // >10k
      paymentWillingness: boolean; // 200-2000₽
      feasibility: boolean; // Можно сделать за срок
      noFreeAlternatives: boolean; // Нет сильных бесплатных
    };
    optional: {
      urgency: boolean;
      simpleMVP: boolean;
      viralPotential: boolean;
      recurringRevenue: boolean;
      lowCompetition: boolean;
    };
  };

  risks: Array<{
    description: string;
    probability: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;

  status: 'pending_validation' | 'validated' | 'rejected';
  validationId?: string; // VALIDATION-YYYY-MM-DD-HH-MM (если validated)
}

/**
 * Результат валидации идеи Validator агентом
 */
export interface ValidationResult {
  id: string; // VALIDATION-YYYY-MM-DD-HH-MM
  signalId: string; // SIGNAL-YYYY-MM-DD-HH-MM
  date: string; // ISO 8601
  decision: 'GO' | 'NO-GO';

  // Результаты 5 пайплайнов
  pipelines: {
    tam: PipelineStatus;
    competitors: PipelineStatus;
    technical: PipelineStatus;
    pricing: PipelineStatus;
    risks: PipelineStatus;
  };

  // Детали каждого пайплайна
  tamAnalysis: {
    marketSize: string; // >$1M/год
    targetAudienceSize: number; // >50k
    paymentWillingness: string;
    status: PipelineStatus;
    reasoning: string;
  };

  competitorAnalysis: {
    competitors: Array<{
      name: string;
      type: 'free' | 'paid';
      userBase: string;
      weakness: string;
    }>;
    ourAdvantage: string;
    status: PipelineStatus;
    reasoning: string;
  };

  technicalFeasibility: {
    estimatedTime: string; // "5 дней" или "2 месяца"
    techStack: string[];
    complexity: 'low' | 'medium' | 'high';
    blockers: string[];
    status: PipelineStatus;
    reasoning: string;
  };

  pricingFeasibility: {
    proposedPrice: string;
    ltvEstimate: number; // ₽
    cacEstimate: number; // ₽
    ltvCacRatio: number; // должно быть >3
    monetizationModel: 'one-time' | 'subscription' | 'freemium';
    status: PipelineStatus;
    reasoning: string;
  };

  riskAssessment: {
    risks: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      probability: 'low' | 'medium' | 'high';
      mitigation: string;
    }>;
    criticalRisks: number; // должно быть 0
    mediumRisks: number; // должно быть ≤2
    status: PipelineStatus;
    reasoning: string;
  };

  // Venture Blueprint (если GO)
  blueprint?: VentureBlueprint;
}

/**
 * Статус пайплайна валидации
 */
export type PipelineStatus = 'GREEN' | 'YELLOW' | 'RED';

/**
 * Venture Blueprint - план для создания продукта
 */
export interface VentureBlueprint {
  // Базовая информация
  name: string; // Название продукта
  slug: string; // URL-friendly slug
  tagline: string; // Одна строка: что это + главная выгода
  description: string; // 2-3 предложения

  // Целевая аудитория
  targetAudience: {
    who: string; // Кто эти люди
    problem: string; // Какую проблему решаем
    size: number; // Примерное количество людей
  };

  // MVP спецификация
  mvp: {
    coreFeatures: string[]; // 3-5 ключевых фич
    userFlow: string[]; // Шаги пользовательского сценария
    techStack: string[]; // Next.js, TypeScript, etc.
    estimatedTime: string; // "5 дней" или "2 месяца"
  };

  // Pricing & Monetization
  pricing: {
    model: 'one-time' | 'subscription' | 'freemium';
    price: string; // "500₽" или "999₽/месяц"
    currency: 'RUB' | 'USD';
    paymentProvider: 'Stripe' | 'YooKassa';
  };

  // GTM Strategy
  gtm: {
    channels: string[]; // Reddit, ProductHunt, Telegram, etc.
    initialBudget: number; // ₽
    firstWeekGoal: string; // "100 visits, 1 purchase"
  };

  // Success Metrics
  metrics: {
    track: 'FAST' | 'LONG';
    targetMRR: number; // ₽
    targetUsers: number;
    conversionRate: number; // %
    killCriteria: string[];
  };

  // Risks
  risks: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
}

/**
 * Venture - запущенный продукт
 */
export interface Venture {
  id: string; // V-YYYY-NNN-slug
  name: string;
  slug: string;
  url: string; // Production URL

  status: 'active' | 'building' | 'launched' | 'paused' | 'killed' | 'validating';
  track: 'FAST' | 'LONG';

  // Даты
  createdAt: string; // ISO 8601
  launchedAt?: string; // Когда задеплоен в production
  pausedAt?: string; // Если paused
  killedAt?: string; // Если killed

  // Метрики
  metrics: {
    mrr: number; // Monthly Recurring Revenue (₽)
    totalRevenue: number; // ₽
    totalUsers: number;
    activeUsers7d: number;
    dailyVisits: number;
    conversionRate: number; // %
    churnRate: number; // %
  };

  // Связи
  signalId: string; // SIGNAL-YYYY-MM-DD-HH-MM
  validationId: string; // VALIDATION-YYYY-MM-DD-HH-MM
  blueprint: VentureBlueprint;

  // Причины паузы/закрытия
  pauseReason?: string;
  killReason?: string;
}

/**
 * Задача для Codex агента
 */
export interface Task {
  id: string; // TASK-XXXX
  ventureId: string; // V-YYYY-NNN-slug
  title: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2';
  status: 'pending' | 'in_progress' | 'review' | 'done';

  // Технические детали
  type: 'feature' | 'bug' | 'refactor' | 'docs';
  files: string[]; // Файлы, которые нужно изменить
  dependencies: string[]; // TASK-XXXX IDs

  // Даты
  createdAt: string;
  startedAt?: string;
  completedAt?: string;

  // PR info
  branch?: string; // feat/task-xxxx
  prUrl?: string;
}

/**
 * Factory State - текущее состояние системы
 */
export interface FactoryState {
  // Ventures
  ventures: Venture[];

  // Signals
  signals: Signal[];

  // Последние запуски агентов
  lastScoutRun: string | null; // ISO 8601
  lastValidatorRun: string | null;
  lastMonitorRun: string | null;

  // Бюджет
  budget: {
    monthly: number; // ₽
    spent: number; // ₽
    lastReset: string; // ISO 8601
  };

  // Статистика
  stats: {
    totalVentures: number;
    activeVentures: number;
    killedVentures: number;
    totalRevenue: number; // ₽
    totalMRR: number; // ₽
  };
}

/**
 * Отчёт Monitor агента
 */
export interface MonitorReport {
  id: string; // MONITOR-DAILY/WEEKLY/MONTHLY-V-YYYY-NNN-slug-...
  ventureId: string;
  type: 'daily' | 'weekly' | 'monthly';
  date: string; // ISO 8601

  // Метрики
  metrics: {
    visits: number;
    purchases: number;
    revenue: number; // ₽
    mrr: number; // ₽
    conversionRate: number; // %
    churnRate: number; // %
  };

  // Сравнение с предыдущим периодом
  trends: {
    visits: TrendDirection;
    purchases: TrendDirection;
    revenue: TrendDirection;
    mrr: TrendDirection;
  };

  // Kill Criteria Check
  killCriteriaCheck: {
    zeroTransactions: boolean;
    lowTraffic: boolean;
    negativeEconomics: boolean;
    criticalBugs: boolean;
    noGrowth: boolean;
  };

  // Рекомендация
  recommendation: 'CONTINUE' | 'WARNING' | 'PIVOT' | 'KILL';
  reasoning: string;
  actionItems: string[];

  nextCheck: string; // ISO 8601
}

/**
 * Направление тренда
 */
export type TrendDirection = 'up' | 'down' | 'stable';

/**
 * Audit Entry - лог всех решений системы
 */
export interface AuditEntry {
  id: string; // AUDIT-YYYY-MM-DD-HH-MM
  date: string; // ISO 8601
  type: 'signal_found' | 'validation_completed' | 'venture_launched' | 'venture_killed' | 'decision_made';

  actor: 'Scout' | 'Validator' | 'Orchestrator' | 'Launcher' | 'Monitor' | 'User';

  data: {
    signalId?: string;
    validationId?: string;
    ventureId?: string;
    decision?: string;
    reasoning?: string;
    [key: string]: unknown;
  };

  metadata: {
    duration?: number; // ms
    cost?: number; // ₽
    [key: string]: unknown;
  };
}

/**
 * Orchestrator Config
 */
export interface OrchestratorConfig {
  // Scout settings
  scout: {
    enabled: boolean;
    runInterval: number; // часы (24 = раз в день)
    maxSignalsPerRun: number; // максимум 10
    confidenceThreshold: number; // минимум 70
  };

  // Validator settings
  validator: {
    enabled: boolean;
    autoValidate: boolean; // автоматически валидировать новые сигналы
    goThreshold: number; // сколько GREEN пайплайнов нужно для GO
  };

  // Launcher settings
  launcher: {
    enabled: boolean;
    autoLaunch: boolean; // автоматически запускать GO ventures (Phase 2)
    requireApproval: boolean; // требовать approval перед launch (Phase 1: true)
  };

  // Monitor settings
  monitor: {
    enabled: boolean;
    runInterval: number; // часы (24 = раз в день)
    autoKill: boolean; // автоматически закрывать по kill criteria (Phase 3)
  };

  // Budget limits
  budget: {
    monthlyLimit: number; // ₽
    stopWhenExceeded: boolean;
  };
}
