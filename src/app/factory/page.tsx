'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Dashboard/Header';
import { StatsGrid } from '@/components/Dashboard/StatsGrid';
import { Button } from '@/components/UI/Button';
import type { Signal, FactoryState, Venture } from '@/lib/types';

interface StateResponse {
  success: boolean;
  state: FactoryState;
}

const statusLabels: Record<string, string> = {
  pending_validation: 'Ожидает проверки',
  validated: 'Проверен',
  rejected: 'Отклонён',
  active: 'Активен',
  building: 'В разработке',
  launched: 'Запущен',
  killed: 'Закрыт',
};

const statusColors: Record<string, string> = {
  pending_validation: 'bg-yellow-100 text-yellow-700',
  validated: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  active: 'bg-blue-100 text-blue-700',
  building: 'bg-purple-100 text-purple-700',
  launched: 'bg-green-100 text-green-700',
  killed: 'bg-neutral-100 text-neutral-700',
};

export default function FactoryPage() {
  const [state, setState] = useState<FactoryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoutLoading, setScoutLoading] = useState(false);

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
        alert(`Scout нашёл ${data.count} сигналов!`);
        await loadState();
      }
    } catch (error) {
      console.error('Failed to run Scout:', error);
      alert('Не удалось запустить Scout');
    } finally {
      setScoutLoading(false);
    }
  };

  const validateSignal = async (signalId: string) => {
    try {
      const res = await fetch('/api/validator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId })
      });
      const data = await res.json();
      if (data.success) {
        const { validation } = data;
        alert(`Валидация завершена!\n\nРешение: ${validation.decision}`);
        await loadState();
      }
    } catch (error) {
      console.error('Failed to validate signal:', error);
      alert('Не удалось провести валидацию');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Загрузка Factory OS...</p>
        </div>
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

        {/* Scout Action */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-1">
                Запустить Scout
              </h2>
              <p className="text-sm text-neutral-500">
                Автоматический поиск новых бизнес-возможностей
              </p>
              {state.lastScoutRun && (
                <p className="text-xs text-neutral-400 mt-2">
                  Последний запуск: {new Date(state.lastScoutRun).toLocaleString('ru-RU')}
                </p>
              )}
            </div>
            <Button
              variant="primary"
              size="lg"
              loading={scoutLoading}
              onClick={runScout}
            >
              {scoutLoading ? 'Поиск...' : 'Запустить Scout'}
            </Button>
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
                  <div key={signal.id} className="px-6 py-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{signal.problem}</p>
                        <p className="text-sm text-neutral-500 mt-0.5">{signal.source}</p>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[signal.status] || 'bg-neutral-100 text-neutral-600'}`}>
                          {statusLabels[signal.status] || signal.status}
                        </span>
                        {signal.status === 'pending_validation' && (
                          <button
                            onClick={() => validateSignal(signal.id)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Проверить
                          </button>
                        )}
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

          <a
            href="https://github.com/ar3m44/startup-factory"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl p-4 border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-neutral-200 transition-colors">
                <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-neutral-900">GitHub</p>
                <p className="text-xs text-neutral-500">Исходный код</p>
              </div>
            </div>
          </a>
        </div>
      </main>
    </div>
  );
}
