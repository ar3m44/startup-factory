// ============================================================================
// ANALYTICS - Отслеживание метрик и событий
// ============================================================================

import { getDb } from './db';

interface AnalyticsEvent {
  id: string;
  type: string;
  ventureId?: string;
  data: Record<string, unknown>;
  timestamp: string;
}

interface RevenueMetrics {
  totalRevenue: number;
  mrr: number;
  arr: number;
  revenueByVenture: Array<{
    ventureId: string;
    ventureName: string;
    mrr: number;
    revenue: number;
  }>;
}

interface ConversionMetrics {
  totalVisits: number;
  totalUsers: number;
  totalPurchases: number;
  overallConversionRate: number;
  conversionByVenture: Array<{
    ventureId: string;
    ventureName: string;
    visits: number;
    users: number;
    conversionRate: number;
  }>;
}

interface CostMetrics {
  totalCost: number;
  apiCosts: number;
  infrastructureCosts: number;
  marketingCosts: number;
  costByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

interface AnalyticsSummary {
  revenue: RevenueMetrics;
  conversion: ConversionMetrics;
  costs: CostMetrics;
  roi: number;
  profitMargin: number;
  timestamp: string;
}

/**
 * Analytics - сервис для отслеживания и анализа метрик
 */
export class Analytics {
  private db = getDb();

  /**
   * Записать аналитическое событие
   */
  trackEvent(type: string, ventureId: string | undefined, data: Record<string, unknown>): void {
    const id = `ANALYTICS-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const timestamp = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO analytics_events (id, type, venture_id, data, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, type, ventureId || null, JSON.stringify(data), timestamp);
  }

  /**
   * Отследить визит
   */
  trackVisit(ventureId: string, source?: string): void {
    this.trackEvent('visit', ventureId, { source: source || 'direct' });
  }

  /**
   * Отследить регистрацию пользователя
   */
  trackSignup(ventureId: string, data?: Record<string, unknown>): void {
    this.trackEvent('signup', ventureId, data || {});
  }

  /**
   * Отследить покупку
   */
  trackPurchase(ventureId: string, amount: number, currency: string = 'RUB'): void {
    this.trackEvent('purchase', ventureId, { amount, currency });
  }

  /**
   * Отследить расход на API
   */
  trackApiCost(service: string, tokens: number, cost: number): void {
    this.trackEvent('api_cost', undefined, { service, tokens, cost });
  }

  /**
   * Получить метрики дохода
   */
  getRevenueMetrics(): RevenueMetrics {
    const ventures = this.db.prepare(`
      SELECT id, name, metrics FROM ventures WHERE status IN ('active', 'launched')
    `).all() as Array<{ id: string; name: string; metrics: string }>;

    let totalRevenue = 0;
    let mrr = 0;

    const revenueByVenture = ventures.map(v => {
      const metrics = JSON.parse(v.metrics || '{}');
      totalRevenue += metrics.totalRevenue || 0;
      mrr += metrics.mrr || 0;

      return {
        ventureId: v.id,
        ventureName: v.name,
        mrr: metrics.mrr || 0,
        revenue: metrics.totalRevenue || 0,
      };
    });

    return {
      totalRevenue,
      mrr,
      arr: mrr * 12,
      revenueByVenture: revenueByVenture.sort((a, b) => b.mrr - a.mrr),
    };
  }

  /**
   * Получить метрики конверсии
   */
  getConversionMetrics(): ConversionMetrics {
    const ventures = this.db.prepare(`
      SELECT id, name, metrics FROM ventures WHERE status IN ('active', 'launched')
    `).all() as Array<{ id: string; name: string; metrics: string }>;

    let totalVisits = 0;
    let totalUsers = 0;
    let totalPurchases = 0;

    const conversionByVenture = ventures.map(v => {
      const metrics = JSON.parse(v.metrics || '{}');
      const visits = metrics.dailyVisits || 0;
      const users = metrics.totalUsers || 0;
      const conversionRate = metrics.conversionRate || 0;

      totalVisits += visits;
      totalUsers += users;
      totalPurchases += Math.round(visits * conversionRate / 100);

      return {
        ventureId: v.id,
        ventureName: v.name,
        visits,
        users,
        conversionRate,
      };
    });

    return {
      totalVisits,
      totalUsers,
      totalPurchases,
      overallConversionRate: totalVisits > 0 ? (totalPurchases / totalVisits) * 100 : 0,
      conversionByVenture: conversionByVenture.sort((a, b) => b.conversionRate - a.conversionRate),
    };
  }

  /**
   * Получить метрики расходов
   */
  getCostMetrics(): CostMetrics {
    // Подсчёт API расходов из engineer_runs
    const apiCostResult = this.db.prepare(`
      SELECT
        SUM(prompt_tokens + completion_tokens) as total_tokens
      FROM engineer_runs
      WHERE status = 'success'
    `).get() as { total_tokens: number | null };

    // Примерная стоимость: $0.003 за 1000 токенов для Sonnet
    const totalTokens = apiCostResult?.total_tokens || 0;
    const apiCosts = (totalTokens / 1000) * 0.003 * 90; // Конвертация в рубли (курс ~90)

    // Примерные расходы на инфраструктуру (можно настроить)
    const infrastructureCosts = 0; // Пока бесплатный хостинг
    const marketingCosts = 0; // Пока без маркетинга

    const totalCost = apiCosts + infrastructureCosts + marketingCosts;

    const costByCategory = [
      { category: 'API (Claude)', amount: apiCosts, percentage: totalCost > 0 ? (apiCosts / totalCost) * 100 : 0 },
      { category: 'Инфраструктура', amount: infrastructureCosts, percentage: totalCost > 0 ? (infrastructureCosts / totalCost) * 100 : 0 },
      { category: 'Маркетинг', amount: marketingCosts, percentage: totalCost > 0 ? (marketingCosts / totalCost) * 100 : 0 },
    ].filter(c => c.amount > 0);

    return {
      totalCost,
      apiCosts,
      infrastructureCosts,
      marketingCosts,
      costByCategory,
    };
  }

  /**
   * Получить полную сводку аналитики
   */
  getSummary(): AnalyticsSummary {
    const revenue = this.getRevenueMetrics();
    const conversion = this.getConversionMetrics();
    const costs = this.getCostMetrics();

    const profit = revenue.totalRevenue - costs.totalCost;
    const roi = costs.totalCost > 0 ? (profit / costs.totalCost) * 100 : 0;
    const profitMargin = revenue.totalRevenue > 0 ? (profit / revenue.totalRevenue) * 100 : 0;

    return {
      revenue,
      conversion,
      costs,
      roi,
      profitMargin,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Получить тренды за период
   */
  getTrends(days: number = 30): {
    dailyRevenue: Array<{ date: string; revenue: number }>;
    dailyVisits: Array<{ date: string; visits: number }>;
    dailyCosts: Array<{ date: string; cost: number }>;
  } {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Здесь можно добавить запросы к таблице analytics_events
    // для построения графиков трендов

    return {
      dailyRevenue: [],
      dailyVisits: [],
      dailyCosts: [],
    };
  }
}

// Singleton instance
let analyticsInstance: Analytics | null = null;

export function getAnalytics(): Analytics {
  if (!analyticsInstance) {
    analyticsInstance = new Analytics();
  }
  return analyticsInstance;
}
