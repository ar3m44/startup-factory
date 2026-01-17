'use client';

// ============================================================================
// FACTORY CONTROL PANEL - UI для управления автономной системой
// ============================================================================

import { useState, useEffect } from 'react';
import type { Signal, Venture, FactoryState } from '@/lib/types';

interface StateResponse {
  success: boolean;
  state: {
    ventures: Venture[];
    signals: Array<
      Pick<
        Signal,
        | 'id'
        | 'date'
        | 'source'
        | 'confidenceScore'
        | 'problem'
        | 'status'
        | 'validationId'
      >
    >;
    lastScoutRun: string | null;
    lastValidatorRun: string | null;
    lastMonitorRun: string | null;
    budget: FactoryState['budget'];
    stats: FactoryState['stats'];
  };
}

export default function FactoryPage() {
  const [state, setState] = useState<StateResponse['state'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoutLoading, setScoutLoading] = useState(false);
  const [validatingSignalId, setValidatingSignalId] = useState<string | null>(
    null
  );

  // Загрузить state при монтировании
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
        alert(
          `Scout найден ${data.count} сигналов${data.count === 0 ? '' : ':'}\n${data.signals.map((s: Signal) => `- ${s.id} (${s.confidenceScore}/100)`).join('\n')}`
        );
        await loadState();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to run scout:', error);
      alert('Не удалось запустить Scout агента');
    } finally {
      setScoutLoading(false);
    }
  };

  const validateSignal = async (signalId: string) => {
    try {
      setValidatingSignalId(signalId);
      const res = await fetch('/api/validator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId }),
      });
      const data = await res.json();

      if (data.success) {
        const v = data.validation;
        alert(
          `Валидация завершена!\n\nРешение: ${v.decision}\n\nПайплайны:\n- TAM: ${v.pipelines.tam}\n- Конкуренты: ${v.pipelines.competitors}\n- Технич: ${v.pipelines.technical}\n- Цена: ${v.pipelines.pricing}\n- Риски: ${v.pipelines.risks}${v.blueprint ? `\n\nVenture: ${v.blueprint.name}\nSlug: ${v.blueprint.slug}\nTrack: ${v.blueprint.track}` : ''}`
        );
        await loadState();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to validate signal:', error);
      alert('Не удалось запустить Validator');
    } finally {
      setValidatingSignalId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8 font-mono">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl mb-8 border-b border-green-800 pb-4">
            FACTORY OS - CONTROL PANEL
          </h1>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-black text-red-400 p-8 font-mono">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl mb-8">FACTORY OS - ERROR</h1>
          <p>Не удалось загрузить состояние системы</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-green-800 pb-4">
          <h1 className="text-3xl mb-2">FACTORY OS - CONTROL PANEL</h1>
          <p className="text-green-600 text-sm">Phase 1: Manual Control</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border border-green-800 p-4">
            <div className="text-green-600 text-sm mb-1">VENTURES</div>
            <div className="text-2xl">{state.stats.totalVentures}</div>
            <div className="text-xs text-green-700">
              {state.stats.activeVentures} active
            </div>
          </div>

          <div className="border border-green-800 p-4">
            <div className="text-green-600 text-sm mb-1">SIGNALS</div>
            <div className="text-2xl">{state.signals.length}</div>
            <div className="text-xs text-green-700">
              {
                state.signals.filter((s) => s.status === 'pending_validation')
                  .length
              }{' '}
              pending
            </div>
          </div>

          <div className="border border-green-800 p-4">
            <div className="text-green-600 text-sm mb-1">MRR</div>
            <div className="text-2xl">
              {state.stats.totalMRR.toLocaleString()}₽
            </div>
            <div className="text-xs text-green-700">monthly recurring</div>
          </div>

          <div className="border border-green-800 p-4">
            <div className="text-green-600 text-sm mb-1">BUDGET</div>
            <div className="text-2xl">
              {state.budget.spent.toLocaleString()}₽
            </div>
            <div className="text-xs text-green-700">
              / {state.budget.monthly.toLocaleString()}₽
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8 border border-green-800 p-4">
          <h2 className="text-xl mb-4 text-green-300">ACTIONS</h2>

          <div className="space-y-2">
            <button
              onClick={runScout}
              disabled={scoutLoading}
              className="bg-green-900 hover:bg-green-800 disabled:bg-green-950 text-green-100 px-4 py-2 border border-green-700 w-full text-left transition-colors"
            >
              {scoutLoading ? '[RUNNING...] Scout Agent' : '▶ RUN Scout Agent'}
            </button>

            <div className="text-xs text-green-700 pl-4">
              Last run:{' '}
              {state.lastScoutRun
                ? new Date(state.lastScoutRun).toLocaleString()
                : 'Never'}
            </div>
          </div>
        </div>

        {/* Signals List */}
        {state.signals.length > 0 && (
          <div className="mb-8 border border-green-800 p-4">
            <h2 className="text-xl mb-4 text-green-300">
              SIGNALS ({state.signals.length})
            </h2>

            <div className="space-y-2">
              {state.signals.map((signal) => (
                <div
                  key={signal.id}
                  className="border border-green-900 p-3 hover:border-green-700 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm text-green-500">{signal.id}</div>
                      <div className="text-xs text-green-700">
                        {signal.source} • Confidence: {signal.confidenceScore}
                        /100
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xs px-2 py-1 border ${
                          signal.status === 'validated'
                            ? 'border-green-600 text-green-400'
                            : signal.status === 'rejected'
                              ? 'border-red-600 text-red-400'
                              : 'border-yellow-600 text-yellow-400'
                        }`}
                      >
                        {signal.status}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm mb-2">{signal.problem}</div>

                  {signal.status === 'pending_validation' && (
                    <button
                      onClick={() => validateSignal(signal.id)}
                      disabled={validatingSignalId === signal.id}
                      className="bg-blue-900 hover:bg-blue-800 disabled:bg-blue-950 text-blue-100 px-3 py-1 border border-blue-700 text-xs transition-colors"
                    >
                      {validatingSignalId === signal.id
                        ? '[VALIDATING...]'
                        : '▶ VALIDATE'}
                    </button>
                  )}

                  {signal.validationId && (
                    <div className="text-xs text-green-700 mt-2">
                      Validation: {signal.validationId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ventures List */}
        {state.ventures.length > 0 && (
          <div className="border border-green-800 p-4">
            <h2 className="text-xl mb-4 text-green-300">
              VENTURES ({state.ventures.length})
            </h2>

            <div className="space-y-2">
              {state.ventures.map((venture) => (
                <div
                  key={venture.id}
                  className="border border-green-900 p-3 hover:border-green-700 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold">{venture.name}</div>
                      <div className="text-xs text-green-700">
                        {venture.id} • {venture.track}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xs px-2 py-1 border ${
                          venture.status === 'active'
                            ? 'border-green-600 text-green-400'
                            : venture.status === 'paused'
                              ? 'border-yellow-600 text-yellow-400'
                              : 'border-red-600 text-red-400'
                        }`}
                      >
                        {venture.status}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <div className="text-green-700">MRR</div>
                      <div>{venture.metrics.mrr.toLocaleString()}₽</div>
                    </div>
                    <div>
                      <div className="text-green-700">Users</div>
                      <div>{venture.metrics.totalUsers}</div>
                    </div>
                    <div>
                      <div className="text-green-700">Visits/day</div>
                      <div>{venture.metrics.dailyVisits}</div>
                    </div>
                    <div>
                      <div className="text-green-700">Conversion</div>
                      <div>{venture.metrics.conversionRate}%</div>
                    </div>
                  </div>

                  {venture.url && (
                    <div className="mt-2 text-xs">
                      <a
                        href={venture.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {venture.url}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {state.signals.length === 0 && state.ventures.length === 0 && (
          <div className="border border-green-800 p-8 text-center">
            <p className="text-green-600 mb-4">
              Система готова к запуску автономных агентов
            </p>
            <p className="text-xs text-green-700">
              Нажмите &quot;RUN Scout Agent&quot; чтобы начать поиск идей
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
