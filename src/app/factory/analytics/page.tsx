'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Dashboard/Header';
import { Button } from '@/components/UI/Button';
import { SkeletonTable } from '@/components/UI/Skeleton';

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

interface AnalyticsData {
  success: boolean;
  revenue: RevenueMetrics;
  conversion: ConversionMetrics;
  costs: CostMetrics;
  roi: number;
  profitMargin: number;
  timestamp: string;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      const result: AnalyticsData = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <SkeletonTable />
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Не удалось загрузить аналитику</p>
            <Button onClick={loadAnalytics}>Повторить</Button>
          </div>
        </main>
      </div>
    );
  }

  const profit = data.revenue.totalRevenue - data.costs.totalCost;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Аналитика</h1>
            <p className="text-neutral-500 mt-1">
              Последнее обновление: {new Date(data.timestamp).toLocaleString('ru-RU')}
            </p>
          </div>
          <Button variant="secondary" onClick={loadAnalytics}>
            Обновить
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-neutral-200">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">MRR</p>
            <p className="text-2xl font-bold text-neutral-900">
              {data.revenue.mrr.toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              ARR: {data.revenue.arr.toLocaleString('ru-RU')} ₽
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-neutral-200">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Общий доход</p>
            <p className="text-2xl font-bold text-green-600">
              {data.revenue.totalRevenue.toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              За всё время
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-neutral-200">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Расходы</p>
            <p className="text-2xl font-bold text-orange-600">
              {data.costs.totalCost.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              API: {data.costs.apiCosts.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-neutral-200">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Прибыль</p>
            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profit.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              Маржа: {data.profitMargin.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Two columns: Conversion & ROI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Conversion Metrics */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Конверсия</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-500 mb-1">Визиты</p>
                <p className="text-xl font-bold text-neutral-900">
                  {data.conversion.totalVisits.toLocaleString()}
                </p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-500 mb-1">Пользователи</p>
                <p className="text-xl font-bold text-neutral-900">
                  {data.conversion.totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-500 mb-1">Покупки</p>
                <p className="text-xl font-bold text-neutral-900">
                  {data.conversion.totalPurchases.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600 mb-1">Конверсия</p>
                <p className="text-xl font-bold text-blue-700">
                  {data.conversion.overallConversionRate.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Conversion by Venture */}
            {data.conversion.conversionByVenture.length > 0 && (
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-3">По проектам</p>
                <div className="space-y-2">
                  {data.conversion.conversionByVenture.map((v) => (
                    <div key={v.ventureId} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                      <span className="text-sm text-neutral-700">{v.ventureName}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-neutral-500">{v.visits} визитов</span>
                        <span className="text-sm font-medium text-neutral-900">
                          {v.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Revenue by Venture */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Доход по проектам</h2>

            {data.revenue.revenueByVenture.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-neutral-600">Пока нет данных о доходах</p>
                <p className="text-sm text-neutral-400 mt-1">Запустите проекты для отслеживания</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.revenue.revenueByVenture.map((v) => (
                  <div key={v.ventureId} className="bg-neutral-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-neutral-900">{v.ventureName}</span>
                      <span className="text-lg font-bold text-green-600">
                        {v.mrr.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">MRR</span>
                      <span className="text-neutral-500">
                        Всего: {v.revenue.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${Math.min(100, data.revenue.mrr > 0 ? (v.mrr / data.revenue.mrr) * 100 : 0)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Структура расходов</h2>

          {data.costs.costByCategory.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-neutral-600">Расходов пока нет</p>
              <p className="text-sm text-neutral-400 mt-1">Здесь будет структура ваших затрат</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {data.costs.costByCategory.map((category) => (
                <div key={category.category} className="bg-neutral-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-600">{category.category}</span>
                    <span className="text-sm font-medium text-neutral-900">
                      {category.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xl font-bold text-neutral-900">
                    {category.amount.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
                  </p>
                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ROI Summary */}
        <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Return on Investment (ROI)</p>
              <p className="text-4xl font-bold">{data.roi.toFixed(1)}%</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm mb-1">Profit Margin</p>
              <p className="text-2xl font-semibold">{data.profitMargin.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
