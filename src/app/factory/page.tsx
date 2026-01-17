'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Dashboard/Header';
import { StatsGrid } from '@/components/Dashboard/StatsGrid';
import { SignalCard } from '@/components/Cards/SignalCard';
import { VentureCard } from '@/components/Cards/VentureCard';
import { Button } from '@/components/UI/Button';
import type { Signal, FactoryState } from '@/lib/types';

interface StateResponse {
  success: boolean;
  state: FactoryState;
}

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
        alert(`Scout found ${data.count} signals!`);
        await loadState();
      }
    } catch (error) {
      console.error('Failed to run Scout:', error);
      alert('Failed to run Scout agent');
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
        alert(
          `Validation complete!\n\nDecision: ${validation.decision}\n\nPipelines:\n` +
            `- TAM: ${validation.pipelines.tam}\n` +
            `- Competitors: ${validation.pipelines.competitors}\n` +
            `- Technical: ${validation.pipelines.technical}\n` +
            `- Pricing: ${validation.pipelines.pricing}\n` +
            `- Risks: ${validation.pipelines.risks}`
        );
        await loadState();
      }
    } catch (error) {
      console.error('Failed to validate signal:', error);
      alert('Failed to validate signal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Factory OS...</p>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load Factory state</p>
          <Button onClick={loadState}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <StatsGrid state={state} />

        {/* Actions Panel */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Run Scout Agent
              </h2>
              <p className="text-sm text-gray-600">
                Start the autonomous pipeline to find, validate, and launch ventures
              </p>
              {state.lastScoutRun && (
                <p className="text-xs text-gray-500 mt-2">
                  Last run: {new Date(state.lastScoutRun).toLocaleString('ru-RU')}
                </p>
              )}
            </div>
            <Button
              variant="primary"
              size="lg"
              loading={scoutLoading}
              onClick={runScout}
            >
              {scoutLoading ? 'Running...' : 'Run Scout Agent'}
            </Button>
          </div>
        </div>

        {/* Signals and Ventures Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Signals List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Signals</h2>
              <span className="text-sm text-gray-500">
                {state.signals.length} total
              </span>
            </div>

            <div className="space-y-4">
              {state.signals.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <p className="text-gray-600 mb-2">No signals yet</p>
                  <p className="text-sm text-gray-500">
                    Run Scout Agent to find new opportunities
                  </p>
                </div>
              ) : (
                state.signals.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal as Signal}
                    onClick={() => alert('Signal details modal - coming soon!')}
                    onValidate={
                      signal.status === 'pending_validation'
                        ? () => validateSignal(signal.id)
                        : undefined
                    }
                  />
                ))
              )}
            </div>
          </div>

          {/* Ventures List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Ventures</h2>
              <span className="text-sm text-gray-500">
                {state.ventures.length} total
              </span>
            </div>

            <div className="space-y-4">
              {state.ventures.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <p className="text-gray-600 mb-2">No ventures yet</p>
                  <p className="text-sm text-gray-500">
                    Validated signals with GO decision will appear here
                  </p>
                </div>
              ) : (
                state.ventures.map((venture) => (
                  <VentureCard
                    key={venture.id}
                    venture={venture}
                    onClick={() => alert('Venture details modal - coming soon!')}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
