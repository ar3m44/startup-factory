// ============================================================================
// ORCHESTRATOR.ts — Главный координатор автономной системы
// ============================================================================

import type {
  Signal,
  ValidationResult,
  Venture,
  VentureBlueprint,
  FactoryState,
  MonitorReport,
  AuditEntry,
  OrchestratorConfig,
} from './types';
import { ScoutAgent } from './agents/scout';
import { ValidatorAgent } from './agents/validator';
import { CodexAgent } from './agents/codex';
import {
  getAllSignals,
  getAllVentures,
  getFactoryState,
  getFactoryStats,
  createSignal as dbCreateSignal,
  createVenture as dbCreateVenture,
  createAuditEntry as dbCreateAuditEntry,
  updateSignalStatus,
  updateFactoryState,
  updateVenture,
} from './db';
import fs from 'fs/promises';
import path from 'path';

/**
 * Orchestrator - главный координатор всей автономной системы
 *
 * Отвечает за:
 * - Запуск Scout агента для поиска идей
 * - Запуск Validator агента для валидации сигналов
 * - Создание ventures при GO решении
 * - Координацию Monitor агента
 * - Управление state системы
 */
export class Orchestrator {
  private scoutAgent: ScoutAgent;
  private validatorAgent: ValidatorAgent;
  private codexAgent: CodexAgent;
  private config: OrchestratorConfig;

  constructor(config?: Partial<OrchestratorConfig>) {
    this.scoutAgent = new ScoutAgent();
    this.validatorAgent = new ValidatorAgent();
    this.codexAgent = new CodexAgent();

    // Default config (Phase 1: manual mode)
    this.config = {
      scout: {
        enabled: true,
        runInterval: 24, // раз в день
        maxSignalsPerRun: 10,
        confidenceThreshold: 70,
      },
      validator: {
        enabled: true,
        autoValidate: false, // Phase 1: ручная валидация
        goThreshold: 4, // минимум 4 GREEN пайплайна
      },
      launcher: {
        enabled: true,
        autoLaunch: false, // Phase 1: ручной launch
        requireApproval: true,
      },
      monitor: {
        enabled: true,
        runInterval: 24,
        autoKill: false, // Phase 1: ручные kill решения
      },
      budget: {
        monthlyLimit: 50000, // ₽
        stopWhenExceeded: true,
      },
      ...config,
    };
  }

  // ============================================================================
  // STATE MANAGEMENT (now using SQLite database)
  // ============================================================================

  /**
   * Загрузить текущее состояние системы из БД
   */
  async loadState(): Promise<FactoryState> {
    const ventures = getAllVentures();
    const signals = getAllSignals();
    const dbState = getFactoryState();
    const stats = getFactoryStats();

    return {
      ventures,
      signals,
      lastScoutRun: dbState.lastScoutRun,
      lastValidatorRun: dbState.lastValidatorRun,
      lastMonitorRun: dbState.lastMonitorRun,
      budget: {
        monthly: dbState.budgetMonthly,
        spent: dbState.budgetSpent,
        lastReset: dbState.budgetLastReset,
      },
      stats: {
        totalVentures: stats.totalVentures,
        activeVentures: stats.activeVentures,
        killedVentures: stats.totalVentures - stats.activeVentures,
        totalRevenue: stats.totalRevenue,
        totalMRR: stats.totalMRR,
      },
    };
  }

  /**
   * Сохранить состояние системы (обновляет только метаданные, данные сохраняются через отдельные методы)
   */
  async saveState(state: FactoryState): Promise<void> {
    updateFactoryState({
      lastScoutRun: state.lastScoutRun,
      lastValidatorRun: state.lastValidatorRun,
      lastMonitorRun: state.lastMonitorRun,
      budgetMonthly: state.budget.monthly,
      budgetSpent: state.budget.spent,
      budgetLastReset: state.budget.lastReset,
    });
  }

  // ============================================================================
  // SCOUT AGENT
  // ============================================================================

  /**
   * Запустить Scout агента для поиска идей
   *
   * @returns Массив найденных сигналов
   */
  async runScout(): Promise<Signal[]> {
    console.log('🔍 Running Scout Agent...');

    // Проверить budget
    const state = await this.loadState();
    if (
      this.config.budget.stopWhenExceeded &&
      state.budget.spent >= state.budget.monthly
    ) {
      console.warn('⚠️ Budget exceeded, Scout disabled');
      return [];
    }

    // Проверить, не запускался ли Scout недавно
    if (state.lastScoutRun) {
      const lastRun = new Date(state.lastScoutRun);
      const now = new Date();
      const hoursSinceLastRun =
        (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastRun < this.config.scout.runInterval) {
        console.warn(
          `⚠️ Scout ran ${hoursSinceLastRun.toFixed(1)} hours ago, skipping`
        );
        return [];
      }
    }

    // Запустить Scout агента
    const signals = await this.scoutAgent.findSignals(
      this.config.scout.maxSignalsPerRun
    );

    // Фильтровать по confidence threshold
    const qualitySignals = signals.filter(
      (s) => s.confidenceScore >= this.config.scout.confidenceThreshold
    );

    console.log(
      `✅ Scout found ${signals.length} signals, ${qualitySignals.length} above threshold (${this.config.scout.confidenceThreshold})`
    );

    // Сохранить сигналы в БД
    for (const signal of qualitySignals) {
      dbCreateSignal(signal);
    }

    // Обновить state
    state.lastScoutRun = new Date().toISOString();
    await this.saveState(state);

    // Создать audit entry
    await this.createAuditEntry({
      type: 'signal_found',
      actor: 'Scout',
      data: {
        signalsFound: signals.length,
        qualitySignals: qualitySignals.length,
        threshold: this.config.scout.confidenceThreshold,
      },
      metadata: {},
    });

    // Если autoValidate включён - запустить валидацию
    if (this.config.validator.autoValidate) {
      console.log('🔄 Auto-validation enabled, validating signals...');
      for (const signal of qualitySignals) {
        await this.runValidator(signal.id);
      }
    }

    return qualitySignals;
  }

  // ============================================================================
  // VALIDATOR AGENT
  // ============================================================================

  /**
   * Запустить Validator агента для валидации сигнала
   *
   * @param signalId - ID сигнала для валидации
   * @returns Результат валидации
   */
  async runValidator(signalId: string): Promise<ValidationResult> {
    console.log(`🔬 Running Validator for signal ${signalId}...`);

    // Загрузить signal
    const state = await this.loadState();
    const signal = state.signals.find((s) => s.id === signalId);

    if (!signal) {
      throw new Error(`Signal ${signalId} not found`);
    }

    // Запустить Validator агента
    const result = await this.validatorAgent.validate(signal);

    // Обновить signal status в БД
    const newStatus = result.decision === 'GO' ? 'validated' : 'rejected';
    updateSignalStatus(signalId, newStatus, result.id);

    // Обновить state
    state.lastValidatorRun = new Date().toISOString();
    await this.saveState(state);

    // Создать audit entry
    await this.createAuditEntry({
      type: 'validation_completed',
      actor: 'Validator',
      data: {
        signalId,
        validationId: result.id,
        decision: result.decision,
        pipelines: result.pipelines,
      },
      metadata: {},
    });

    console.log(`✅ Validation complete: ${result.decision}`);

    // Если GO и autoLaunch включён - создать venture
    if (result.decision === 'GO' && this.config.launcher.autoLaunch) {
      console.log('🚀 Auto-launch enabled, creating venture...');
      await this.launchVenture(result.blueprint!);
    }

    return result;
  }

  // ============================================================================
  // LAUNCHER
  // ============================================================================

  /**
   * Запустить новый venture на основе blueprint
   *
   * @param blueprint - Venture blueprint от Validator
   * @returns Созданный venture
   */
  async launchVenture(blueprint: VentureBlueprint): Promise<Venture> {
    console.log(`🚀 Launching venture: ${blueprint.name}...`);

    // Генерировать venture ID
    const state = await this.loadState();
    const now = new Date();
    const year = now.getFullYear();
    const ventureNumber = state.ventures.length + 1;
    const ventureId = `V-${year}-${ventureNumber.toString().padStart(3, '0')}-${blueprint.slug}`;

    // Создать venture объект
    const venture: Venture = {
      id: ventureId,
      name: blueprint.name,
      slug: blueprint.slug,
      url: '', // Будет заполнен после deployment

      status: 'active',
      track: blueprint.metrics.track,

      createdAt: now.toISOString(),
      launchedAt: undefined, // Будет заполнен после production deployment

      metrics: {
        mrr: 0,
        totalRevenue: 0,
        totalUsers: 0,
        activeUsers7d: 0,
        dailyVisits: 0,
        conversionRate: 0,
        churnRate: 0,
      },

      signalId: '', // Нужно заполнить из контекста
      validationId: '', // Нужно заполнить из контекста
      blueprint,
    };

    // Сохранить venture в БД
    dbCreateVenture(venture);

    // Создать директорию venture
    await this.createVentureDirectory(venture);

    // Создать audit entry
    await this.createAuditEntry({
      type: 'venture_launched',
      actor: 'Launcher',
      data: {
        ventureId,
        name: blueprint.name,
        track: blueprint.metrics.track,
      },
      metadata: {},
    });

    console.log(`✅ Venture ${ventureId} created`);

    // 🤖 Trigger Codex Agent для генерации кода
    console.log(`🤖 Triggering Codex Agent for code generation...`);
    const codexResult = await this.codexAgent.triggerCodeGeneration({
      venture,
      blueprint,
      taskDescription: `Build ${blueprint.name} - ${blueprint.tagline}`,
    });

    if (codexResult.success) {
      console.log(`✅ Codex Agent triggered successfully`);
      console.log(`📌 Branch: ${codexResult.branchName}`);
      if (codexResult.prUrl) {
        console.log(`🔗 PR will be created at: ${codexResult.prUrl}`);
      }
    } else {
      console.warn(`⚠️  Codex Agent failed: ${codexResult.error}`);
    }

    return venture;
  }

  /**
   * Создать директорию для venture
   */
  private async createVentureDirectory(venture: Venture): Promise<void> {
    const venturePath = path.join(process.cwd(), 'ventures', venture.id);

    // Создать директорию
    await fs.mkdir(venturePath, { recursive: true });

    // Создать README.md
    const readme = `# ${venture.name}

**Venture ID**: ${venture.id}
**Status**: ${venture.status}
**Track**: ${venture.track}
**Created**: ${venture.createdAt}

## Blueprint

### Tagline
${venture.blueprint.tagline}

### Description
${venture.blueprint.description}

### Target Audience
- **Who**: ${venture.blueprint.targetAudience.who}
- **Problem**: ${venture.blueprint.targetAudience.problem}
- **Size**: ${venture.blueprint.targetAudience.size.toLocaleString()} people

### MVP
**Core Features**:
${venture.blueprint.mvp.coreFeatures.map((f, i) => `${i + 1}. ${f}`).join('\n')}

**Tech Stack**: ${venture.blueprint.mvp.techStack.join(', ')}

**Estimated Time**: ${venture.blueprint.mvp.estimatedTime}

### Pricing
- **Model**: ${venture.blueprint.pricing.model}
- **Price**: ${venture.blueprint.pricing.price}
- **Payment**: ${venture.blueprint.pricing.paymentProvider}

### GTM
**Channels**: ${venture.blueprint.gtm.channels.join(', ')}

**First Week Goal**: ${venture.blueprint.gtm.firstWeekGoal}

### Metrics
- **Target MRR**: ${venture.blueprint.metrics.targetMRR.toLocaleString()}₽
- **Target Users**: ${venture.blueprint.metrics.targetUsers.toLocaleString()}
- **Conversion Rate**: ${venture.blueprint.metrics.conversionRate}%

## Current Status

**MRR**: ${venture.metrics.mrr}₽
**Total Revenue**: ${venture.metrics.totalRevenue}₽
**Total Users**: ${venture.metrics.totalUsers}
**Daily Visits**: ${venture.metrics.dailyVisits}
`;

    await fs.writeFile(path.join(venturePath, 'README.md'), readme);

    // Создать RISKS.md
    const risks = `# RISKS: ${venture.name}

${venture.blueprint.risks.map((r, i) => `## Risk ${i + 1}: ${r.description}

**Severity**: ${r.severity}

**Mitigation**:
${r.mitigation}
`).join('\n')}
`;

    await fs.writeFile(path.join(venturePath, 'RISKS.md'), risks);
  }

  // ============================================================================
  // MONITOR AGENT
  // ============================================================================

  /**
   * Запустить Monitor агента для отслеживания ventures
   *
   * @returns Массив отчётов мониторинга
   */
  async monitorVentures(): Promise<MonitorReport[]> {
    console.log('📊 Running Monitor Agent...');

    const state = await this.loadState();
    const activeVentures = state.ventures.filter((v) => v.status === 'active');

    if (activeVentures.length === 0) {
      console.log('No active ventures to monitor');
      return [];
    }

    // TODO: Реализовать Monitor агента
    // Пока просто возвращаем пустой массив
    console.log(`Monitoring ${activeVentures.length} active ventures...`);

    state.lastMonitorRun = new Date().toISOString();
    await this.saveState(state);

    return [];
  }

  // ============================================================================
  // AUDIT
  // ============================================================================

  /**
   * Создать audit entry в БД
   */
  private async createAuditEntry(
    entry: Omit<AuditEntry, 'id' | 'date'>
  ): Promise<void> {
    const now = new Date();
    const id = `AUDIT-${now.toISOString().replace(/:/g, '-').split('.')[0]}`;

    // Сохранить в БД
    dbCreateAuditEntry({
      id,
      timestamp: now.toISOString(),
      ventureId: entry.data.ventureId as string | undefined,
      actor: entry.actor,
      action: entry.type,
      result: entry.data.decision as string || entry.data.signalId as string || 'OK',
      data: entry.data as Record<string, unknown>,
      metadata: entry.metadata as Record<string, unknown>,
    });
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  /**
   * Получить конфигурацию Orchestrator
   */
  getConfig(): OrchestratorConfig {
    return this.config;
  }

  /**
   * Обновить конфигурацию
   */
  updateConfig(config: Partial<OrchestratorConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}
