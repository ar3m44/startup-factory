// ============================================================================
// MONITOR AGENT - Отслеживание метрик ventures и рекомендации
// ============================================================================

import type { Venture, MonitorReport, TrendDirection } from '../types';

interface MetricsSnapshot {
  visits: number;
  purchases: number;
  revenue: number;
  mrr: number;
  conversionRate: number;
  churnRate: number;
}

interface MonitorConfig {
  // Kill criteria thresholds
  minDailyVisits: number;
  minWeeklyTransactions: number;
  maxDaysWithoutTransaction: number;
  minConversionRate: number;
  maxChurnRate: number;
  // Warning thresholds
  warningVisitDropPercent: number;
  warningRevenueDropPercent: number;
}

const DEFAULT_CONFIG: MonitorConfig = {
  minDailyVisits: 10,
  minWeeklyTransactions: 1,
  maxDaysWithoutTransaction: 14,
  minConversionRate: 0.5,
  maxChurnRate: 20,
  warningVisitDropPercent: 30,
  warningRevenueDropPercent: 20,
};

/**
 * Monitor Agent - анализирует метрики ventures и выдает рекомендации
 */
export class MonitorAgent {
  private config: MonitorConfig;

  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Анализировать venture и создать отчет
   */
  analyzeVenture(
    venture: Venture,
    previousMetrics?: MetricsSnapshot
  ): MonitorReport {
    const now = new Date();
    const reportId = `MONITOR-DAILY-${venture.id}-${now.toISOString().split('T')[0]}`;

    // Текущие метрики
    const currentMetrics: MetricsSnapshot = {
      visits: venture.metrics.dailyVisits,
      purchases: venture.metrics.totalUsers, // Using users as proxy for purchases
      revenue: venture.metrics.totalRevenue,
      mrr: venture.metrics.mrr,
      conversionRate: venture.metrics.conversionRate,
      churnRate: venture.metrics.churnRate,
    };

    // Рассчитать тренды
    const trends = this.calculateTrends(currentMetrics, previousMetrics);

    // Проверить kill criteria
    const killCriteriaCheck = this.checkKillCriteria(venture, currentMetrics);

    // Определить рекомендацию
    const { recommendation, reasoning, actionItems } = this.generateRecommendation(
      venture,
      currentMetrics,
      trends,
      killCriteriaCheck
    );

    // Следующая проверка
    const nextCheck = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    return {
      id: reportId,
      ventureId: venture.id,
      type: 'daily',
      date: now.toISOString(),
      metrics: currentMetrics,
      trends,
      killCriteriaCheck,
      recommendation,
      reasoning,
      actionItems,
      nextCheck,
    };
  }

  /**
   * Рассчитать тренды по сравнению с предыдущим периодом
   */
  private calculateTrends(
    current: MetricsSnapshot,
    previous?: MetricsSnapshot
  ): MonitorReport['trends'] {
    if (!previous) {
      return {
        visits: 'stable',
        purchases: 'stable',
        revenue: 'stable',
        mrr: 'stable',
      };
    }

    return {
      visits: this.getTrend(current.visits, previous.visits),
      purchases: this.getTrend(current.purchases, previous.purchases),
      revenue: this.getTrend(current.revenue, previous.revenue),
      mrr: this.getTrend(current.mrr, previous.mrr),
    };
  }

  /**
   * Определить направление тренда
   */
  private getTrend(current: number, previous: number): TrendDirection {
    if (previous === 0) {
      return current > 0 ? 'up' : 'stable';
    }
    const changePercent = ((current - previous) / previous) * 100;
    if (changePercent > 5) return 'up';
    if (changePercent < -5) return 'down';
    return 'stable';
  }

  /**
   * Проверить kill criteria
   */
  private checkKillCriteria(
    venture: Venture,
    metrics: MetricsSnapshot
  ): MonitorReport['killCriteriaCheck'] {
    // Дней с момента создания
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(venture.createdAt).getTime()) / (24 * 60 * 60 * 1000)
    );

    // Zero transactions (после первой недели)
    const zeroTransactions =
      daysSinceCreation > 7 && metrics.purchases === 0 && metrics.revenue === 0;

    // Low traffic
    const lowTraffic = metrics.visits < this.config.minDailyVisits;

    // Negative economics (churn > growth)
    const negativeEconomics =
      metrics.churnRate > this.config.maxChurnRate ||
      (metrics.mrr > 0 && metrics.conversionRate < this.config.minConversionRate);

    // Critical bugs - определяется внешне, здесь false
    const criticalBugs = false;

    // No growth (2+ недели без роста MRR)
    const noGrowth = daysSinceCreation > 14 && metrics.mrr === 0;

    return {
      zeroTransactions,
      lowTraffic,
      negativeEconomics,
      criticalBugs,
      noGrowth,
    };
  }

  /**
   * Сгенерировать рекомендацию на основе анализа
   */
  private generateRecommendation(
    venture: Venture,
    metrics: MetricsSnapshot,
    trends: MonitorReport['trends'],
    killCriteria: MonitorReport['killCriteriaCheck']
  ): {
    recommendation: MonitorReport['recommendation'];
    reasoning: string;
    actionItems: string[];
  } {
    const actionItems: string[] = [];
    let reasoning = '';

    // Подсчет сработавших kill criteria
    const killCriteriaCount = Object.values(killCriteria).filter(Boolean).length;

    // KILL: 2+ критериев или критический баг
    if (killCriteriaCount >= 2 || killCriteria.criticalBugs) {
      const triggeredCriteria = Object.entries(killCriteria)
        .filter(([_, v]) => v)
        .map(([k]) => k);

      reasoning = `Сработало ${killCriteriaCount} kill-критериев: ${triggeredCriteria.join(', ')}. `;
      reasoning += 'Рекомендуется закрыть проект и переключиться на новую идею.';

      actionItems.push('Провести post-mortem анализ');
      actionItems.push('Сохранить learnings в документацию');
      actionItems.push('Закрыть venture через Orchestrator');

      return { recommendation: 'KILL', reasoning, actionItems };
    }

    // PIVOT: 1 kill критерий + негативные тренды
    if (killCriteriaCount === 1 || (trends.mrr === 'down' && trends.revenue === 'down')) {
      const issue = Object.entries(killCriteria).find(([_, v]) => v)?.[0] || 'declining metrics';

      reasoning = `Обнаружена проблема: ${issue}. `;
      reasoning += 'Текущая стратегия не работает, рекомендуется pivot.';

      actionItems.push('Провести customer interviews для понимания причин');
      actionItems.push('Пересмотреть value proposition');
      actionItems.push('Протестировать альтернативный pricing/позиционирование');

      return { recommendation: 'PIVOT', reasoning, actionItems };
    }

    // WARNING: негативные тренды
    const negativeCount = Object.values(trends).filter(t => t === 'down').length;
    if (negativeCount >= 2) {
      reasoning = 'Несколько метрик показывают негативную динамику. ';
      reasoning += 'Требуется внимание, но ситуация еще не критическая.';

      if (trends.visits === 'down') {
        actionItems.push('Увеличить маркетинговые активности');
      }
      if (trends.revenue === 'down') {
        actionItems.push('Проверить воронку продаж на точки потерь');
      }
      if (trends.mrr === 'down') {
        actionItems.push('Провести retention-кампанию для существующих клиентов');
      }

      return { recommendation: 'WARNING', reasoning, actionItems };
    }

    // CONTINUE: всё хорошо
    const positiveCount = Object.values(trends).filter(t => t === 'up').length;

    if (positiveCount >= 2) {
      reasoning = 'Проект показывает позитивную динамику. Продолжаем в том же направлении.';
    } else {
      reasoning = 'Проект стабилен. Рекомендуется продолжать текущую стратегию.';
    }

    // Базовые рекомендации для CONTINUE
    if (metrics.mrr < (venture.blueprint?.metrics.targetMRR || 10000)) {
      actionItems.push('Продолжить работу над ростом MRR');
    }
    if (metrics.conversionRate < 2) {
      actionItems.push('Оптимизировать conversion rate');
    }
    if (metrics.visits < 100) {
      actionItems.push('Увеличить трафик через контент-маркетинг');
    }

    if (actionItems.length === 0) {
      actionItems.push('Поддерживать текущий курс');
      actionItems.push('Искать возможности для масштабирования');
    }

    return { recommendation: 'CONTINUE', reasoning, actionItems };
  }

  /**
   * Анализировать все активные ventures
   */
  analyzeAll(ventures: Venture[]): MonitorReport[] {
    const activeVentures = ventures.filter(
      v => v.status === 'active' || v.status === 'launched'
    );

    return activeVentures.map(venture => this.analyzeVenture(venture));
  }

  /**
   * Получить ventures требующие внимания
   */
  getVenturesNeedingAttention(reports: MonitorReport[]): MonitorReport[] {
    return reports.filter(
      r => r.recommendation === 'KILL' || r.recommendation === 'WARNING' || r.recommendation === 'PIVOT'
    );
  }

  /**
   * Создать summary отчет по всем ventures
   */
  createSummary(reports: MonitorReport[]): {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
    totalMRR: number;
    totalRevenue: number;
    recommendations: Array<{ ventureId: string; recommendation: string; reasoning: string }>;
  } {
    const healthy = reports.filter(r => r.recommendation === 'CONTINUE').length;
    const warning = reports.filter(r => r.recommendation === 'WARNING').length;
    const critical = reports.filter(
      r => r.recommendation === 'KILL' || r.recommendation === 'PIVOT'
    ).length;

    const totalMRR = reports.reduce((sum, r) => sum + r.metrics.mrr, 0);
    const totalRevenue = reports.reduce((sum, r) => sum + r.metrics.revenue, 0);

    const recommendations = reports
      .filter(r => r.recommendation !== 'CONTINUE')
      .map(r => ({
        ventureId: r.ventureId,
        recommendation: r.recommendation,
        reasoning: r.reasoning,
      }));

    return {
      total: reports.length,
      healthy,
      warning,
      critical,
      totalMRR,
      totalRevenue,
      recommendations,
    };
  }
}
