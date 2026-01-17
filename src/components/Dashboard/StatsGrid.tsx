'use client';

import React from 'react';
import { StatCard } from '@/components/Cards/StatCard';
import type { FactoryState } from '@/lib/types';

export interface StatsGridProps {
  state: FactoryState;
  onVenturesClick?: () => void;
  onSignalsClick?: () => void;
  onMRRClick?: () => void;
  onBudgetClick?: () => void;
}

export function StatsGrid({
  state,
  onVenturesClick,
  onSignalsClick,
  onMRRClick,
  onBudgetClick
}: StatsGridProps) {
  const {stats, signals, budget} = state;

  // Calculate signals pending validation
  const pendingSignals = signals.filter((s) => s.status === 'pending_validation').length;

  // Icon components
  const VenturesIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );

  const SignalsIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );

  const MRRIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const BudgetIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="VENTURES"
        value={stats.totalVentures}
        subtitle={`${stats.activeVentures} active`}
        icon={VenturesIcon}
        gradient="blue"
        onClick={onVenturesClick}
      />

      <StatCard
        title="SIGNALS"
        value={signals.length}
        subtitle={`${pendingSignals} pending validation`}
        icon={SignalsIcon}
        gradient="purple"
        onClick={onSignalsClick}
      />

      <StatCard
        title="MRR"
        value={`${stats.totalMRR.toLocaleString()}₽`}
        subtitle={`${(stats.totalMRR * 12).toLocaleString()}₽ annual`}
        icon={MRRIcon}
        gradient="green"
        onClick={onMRRClick}
      />

      <StatCard
        title="BUDGET"
        value={`${budget.spent.toLocaleString()}₽`}
        subtitle={`of ${budget.monthly.toLocaleString()}₽ monthly`}
        icon={BudgetIcon}
        gradient="yellow"
        onClick={onBudgetClick}
      />
    </div>
  );
}
