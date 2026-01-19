'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Dashboard/Header';
import { StatsGrid } from '@/components/Dashboard/StatsGrid';
import { Button } from '@/components/UI/Button';
import { Modal } from '@/components/UI/Modal';
import { useToast } from '@/components/UI/Toast';
import { SkeletonDashboard } from '@/components/UI/Skeleton';
import type { Signal, FactoryState, Venture, MonitorReport } from '@/lib/types';

interface StateResponse {
  success: boolean;
  state: FactoryState;
}

interface MonitorResponse {
  success: boolean;
  summary: {
    total: number;
    healthy: number;
    warning: number;
    pivot: number;
    kill: number;
    totalMRR: number;
    totalRevenue: number;
  };
  needsAttention: Array<{
    ventureId: string;
    recommendation: string;
    reasoning: string;
    actionItems: string[];
  }>;
  reports: MonitorReport[];
}

const statusLabels: Record<string, string> = {
  pending_validation: 'Ожидает проверки',
  validated: 'Проверен',
  rejected: 'Отклонён',
  active: 'Активен',
  building: 'В разработке',
  launched: 'Запущен',
  validating: 'Проверка',
  paused: 'Приостановлен',
  killed: 'Закрыт',
};

const statusColors: Record<string, string> = {
  pending_validation: 'bg-yellow-100 text-yellow-700',
  validated: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  active: 'bg-blue-100 text-blue-700',
  building: 'bg-purple-100 text-purple-700',
  launched: 'bg-green-100 text-green-700',
  validating: 'bg-yellow-100 text-yellow-700',
  paused: 'bg-neutral-100 text-neutral-700',
  killed: 'bg-red-100 text-red-700',
};

const recommendationColors: Record<string, string> = {
  CONTINUE: 'bg-green-100 text-green-700',
  WARNING: 'bg-yellow-100 text-yellow-700',
  PIVOT: 'bg-orange-100 text-orange-700',
  KILL: 'bg-red-100 text-red-700',
};

const recommendationLabels: Record<string, string> = {
  CONTINUE: 'Продолжать',
  WARNING: 'Внимание',
  PIVOT: 'Пивот',
  KILL: 'Закрыть',
};

export default function FactoryPage() {
  const [state, setState] = useState<FactoryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoutLoading, setScoutLoading] = useState(false);
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [monitorResult, setMonitorResult] = useState<MonitorResponse | null>(null);
  const [showMonitorModal, setShowMonitorModal] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [validatingSignalId, setValidatingSignalId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/state');
      const data: StateResponse = await res.json();
      if (data.success) {
        setState(data.state);
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    } finally {
      setLoading(false);
    }
  };

  const runScout = async () => {
    try {
      setScoutLoading(true);
      const res = await fetch('/api/scout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`Scout нашёл ${data.count} сигналов!`, 'success');
        await loadState();
      }
    } catch (error) {
      console.error('Failed to run Scout:', error);
      showToast('Не удалось запустить Scout', 'error');
    } finally {
      setScoutLoading(false);
    }
  };

  const runMonitor = async () => {
    try {
      setMonitorLoading(true);
      const res = await fetch('/api/monitor', { method: 'POST' });
      const data: MonitorResponse = await res.json();
      if (data.success) {
        setMonitorResult(data);
        setShowMonitorModal(true);
        showToast(`Monitor проанализировал ${data.summary.total} проектов`, 'success');
        await loadState();
      }
    } catch (error) {
      console.error('Failed to run Monitor:', error);
      showToast('Не удалось запустить Monitor', 'error');
    } finally {
      setMonitorLoading(false);
    }
  };

  const validateSignal = async (signalId: string) => {
    try {
      setValidatingSignalId(signalId);
      const res = await fetch('/api/validator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId })
      });
      const data = await res.json();
      if (data.success) {
        const { validation } = data;
        showToast(`Валидация завершена: ${validation.decision}`, validation.decision === 'GO' ? 'success' : 'warning');
        setSelectedSignal(null);
        await loadState();
      }
    } catch (error) {
      console.error('Failed to validate signal:', error);
      showToast('Не удалось провести валидацию', 'error');
    } finally {
      setValidatingSignalId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <SkeletonDashboard />
        </main>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Не удалось загрузить данные</p>
          <Button onClick={loadState}>Повторить</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <StatsGrid state={state} />

        {/* Agent Actions */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Scout Action */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-blue-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-neutral-900 mb-1">
                  Scout Agent
                </h2>
                <p className="text-sm text-neutral-500 mb-3">
                  Автоматический поиск новых бизнес-возможностей и трендов
                </p>
                {state.lastScoutRun && (
                  <p className="text-xs text-neutral-400 mb-3">
                    Последний запуск: {new Date(state.lastScoutRun).toLocaleString('ru-RU')}
                  </p>
                )}
                <Button
                  variant="primary"
                  size="md"
                  loading={scoutLoading}
                  disabled={scoutLoading}
                  onClick={runScout}
                >
                  {scoutLoading ? 'Поиск...' : 'Запустить Scout'}
                </Button>
              </div>
            </div>
          </div>

          {/* Monitor Action */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-green-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-neutral-900 mb-1">
                  Monitor Agent
                </h2>
                <p className="text-sm text-neutral-500 mb-3">
                  Анализ метрик проектов и рекомендации по развитию
                </p>
                {state.lastMonitorRun && (
                  <p className="text-xs text-neutral-400 mb-3">
                    Последний запуск: {new Date(state.lastMonitorRun).toLocaleString('ru-RU')}
                  </p>
                )}
                <Button
                  variant="secondary"
                  size="md"
                  loading={monitorLoading}
                  disabled={monitorLoading || state.ventures.length === 0}
                  onClick={runMonitor}
                >
                  {monitorLoading ? 'Анализ...' : 'Запустить Monitor'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Two columns: Signals & Ventures */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Signals */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900">Сигналы</h2>
              <span className="text-sm text-neutral-500">{state.signals.length} всего</span>
            </div>

            <div className="divide-y divide-neutral-100">
              {state.signals.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-neutral-600 mb-1">Сигналов пока нет</p>
                  <p className="text-sm text-neutral-400">Запустите Scout для поиска возможностей</p>
                </div>
              ) : (
                state.signals.slice(0, 5).map((signal: Signal) => (
                  <div
                    key={signal.id}
                    className="px-6 py-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedSignal(signal)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{signal.problem}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-neutral-500">{signal.source}</span>
                          <span className="text-xs text-neutral-300">•</span>
                          <span className="text-xs text-neutral-500">
                            Score: {signal.confidenceScore}%
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[signal.status] || 'bg-neutral-100 text-neutral-600'}`}>
                          {statusLabels[signal.status] || signal.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ventures */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900">Проекты</h2>
              <Link href="/factory/ventures" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Все проекты →
              </Link>
            </div>

            <div className="divide-y divide-neutral-100">
              {state.ventures.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-neutral-600 mb-1">Проектов пока нет</p>
                  <p className="text-sm text-neutral-400">Проверенные сигналы станут проектами</p>
                </div>
              ) : (
                state.ventures.slice(0, 5).map((venture: Venture) => (
                  <Link
                    key={venture.id}
                    href={`/factory/ventures/${venture.id}`}
                    className="block px-6 py-4 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{venture.name}</p>
                        <p className="text-sm text-neutral-500 mt-0.5 truncate">
                          {venture.blueprint?.tagline || venture.slug}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[venture.status] || 'bg-neutral-100 text-neutral-600'}`}>
                          {statusLabels[venture.status] || venture.status}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-medium text-neutral-900">
                            {(venture.metrics?.mrr || 0).toLocaleString('ru-RU')} ₽
                          </p>
                          <p className="text-xs text-neutral-400">MRR</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/factory/tasks"
            className="bg-white rounded-xl p-4 border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-neutral-200 transition-colors">
                <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-neutral-900">Задачи</p>
                <p className="text-xs text-neutral-500">Инженерные задачи</p>
              </div>
            </div>
          </Link>

          <Link
            href="/factory/audit"
            className="bg-white rounded-xl p-4 border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-neutral-200 transition-colors">
                <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-neutral-900">Журнал</p>
                <p className="text-xs text-neutral-500">История операций</p>
              </div>
            </div>
          </Link>

          <Link
            href="/factory/control"
            className="bg-white rounded-xl p-4 border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-neutral-200 transition-colors">
                <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-neutral-900">Панель</p>
                <p className="text-xs text-neutral-500">Контроль системы</p>
              </div>
            </div>
          </Link>

          <Link
            href="/factory/engineer-runs"
            className="bg-white rounded-xl p-4 border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-neutral-200 transition-colors">
                <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-neutral-900">Engineer</p>
                <p className="text-xs text-neutral-500">История AI запусков</p>
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Signal Detail Modal */}
      <Modal
        isOpen={!!selectedSignal}
        onClose={() => setSelectedSignal(null)}
        title="Детали сигнала"
        size="md"
      >
        {selectedSignal && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {selectedSignal.problem}
              </h3>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[selectedSignal.status]}`}>
                  {statusLabels[selectedSignal.status]}
                </span>
                <span className="text-sm text-neutral-500">
                  Confidence: {selectedSignal.confidenceScore}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-500 mb-1">Источник</p>
                <p className="font-medium text-neutral-900">{selectedSignal.source}</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-500 mb-1">Дата</p>
                <p className="font-medium text-neutral-900">
                  {new Date(selectedSignal.date).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>

            {selectedSignal.mvpDescription && (
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-2">MVP решение</p>
                <p className="text-neutral-600">{selectedSignal.mvpDescription}</p>
              </div>
            )}

            {selectedSignal.targetAudience && (
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-2">Целевая аудитория</p>
                <p className="text-neutral-600">{selectedSignal.targetAudience}</p>
              </div>
            )}

            {selectedSignal.tam && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-green-600 mb-1">Потенциальный рынок (TAM)</p>
                <p className="text-lg font-semibold text-green-700">
                  {selectedSignal.tam}
                </p>
              </div>
            )}

            {selectedSignal.sourceUrl && (
              <a
                href={selectedSignal.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:text-blue-700"
              >
                Открыть источник →
              </a>
            )}

            {selectedSignal.status === 'pending_validation' && (
              <div className="pt-4 border-t border-neutral-200">
                <Button
                  variant="primary"
                  size="lg"
                  loading={validatingSignalId === selectedSignal.id}
                  disabled={validatingSignalId === selectedSignal.id}
                  onClick={() => validateSignal(selectedSignal.id)}
                  className="w-full"
                >
                  {validatingSignalId === selectedSignal.id ? 'Проверка...' : 'Запустить валидацию'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Monitor Results Modal */}
      <Modal
        isOpen={showMonitorModal}
        onClose={() => setShowMonitorModal(false)}
        title="Результаты Monitor Agent"
        size="lg"
      >
        {monitorResult && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{monitorResult.summary.healthy}</p>
                <p className="text-xs text-green-600">Здоровых</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-yellow-700">{monitorResult.summary.warning}</p>
                <p className="text-xs text-yellow-600">Предупреждений</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-orange-700">{monitorResult.summary.pivot}</p>
                <p className="text-xs text-orange-600">Нужен пивот</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-700">{monitorResult.summary.kill}</p>
                <p className="text-xs text-red-600">Закрыть</p>
              </div>
            </div>

            {/* Total Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-500 mb-1">Общий MRR</p>
                <p className="text-xl font-bold text-neutral-900">
                  {monitorResult.summary.totalMRR.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-500 mb-1">Общий доход</p>
                <p className="text-xl font-bold text-neutral-900">
                  {monitorResult.summary.totalRevenue.toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </div>

            {/* Needs Attention */}
            {monitorResult.needsAttention.length > 0 && (
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Требуют внимания</h3>
                <div className="space-y-3">
                  {monitorResult.needsAttention.map((item) => {
                    const venture = state?.ventures.find(v => v.id === item.ventureId);
                    return (
                      <div key={item.ventureId} className="bg-neutral-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-neutral-900">
                            {venture?.name || item.ventureId}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${recommendationColors[item.recommendation]}`}>
                            {recommendationLabels[item.recommendation]}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mb-3">{item.reasoning}</p>
                        {item.actionItems.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-neutral-500 mb-1">Рекомендации:</p>
                            <ul className="text-sm text-neutral-600 space-y-1">
                              {item.actionItems.map((action, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-neutral-400">•</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {monitorResult.needsAttention.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-neutral-900">Все проекты в норме!</p>
                <p className="text-sm text-neutral-500">Нет проектов, требующих срочного внимания</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
