'use client';

import React from 'react';
import Link from 'next/link';
import type { FactoryState } from '@/lib/types';

export interface StatsGridProps {
  state: FactoryState;
}

export function StatsGrid({ state }: StatsGridProps) {
  const { stats, signals, budget } = state;

  const pendingSignals = signals.filter((s) => s.status === 'pending_validation').length;
  const budgetPercent = budget.monthly > 0 ? Math.round((budget.spent / budget.monthly) * 100) : 0;

  const cards = [
    {
      title: 'Проекты',
      value: stats.totalVentures,
      subtitle: `${stats.activeVentures} активных`,
      href: '/factory/ventures',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: 'Сигналы',
      value: signals.length,
      subtitle: `${pendingSignals} ожидают проверки`,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Доход (MRR)',
      value: `${stats.totalMRR.toLocaleString('ru-RU')} ₽`,
      subtitle: `${(stats.totalMRR * 12).toLocaleString('ru-RU')} ₽ в год`,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Бюджет',
      value: `${budget.spent.toLocaleString('ru-RU')} ₽`,
      subtitle: `${budgetPercent}% от ${budget.monthly.toLocaleString('ru-RU')} ₽`,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      progress: budgetPercent,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const content = (
          <div
            key={card.title}
            className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                <div className={card.textColor}>{card.icon}</div>
              </div>
              <svg className="w-4 h-4 text-neutral-300 group-hover:text-neutral-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{card.title}</p>
              <p className="text-2xl font-semibold text-neutral-900 tracking-tight">{card.value}</p>
              <p className="text-sm text-neutral-500">{card.subtitle}</p>
            </div>

            {card.progress !== undefined && (
              <div className="mt-4">
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${card.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(card.progress, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );

        return card.href ? (
          <Link key={card.title} href={card.href}>
            {content}
          </Link>
        ) : (
          <div key={card.title}>{content}</div>
        );
      })}
    </div>
  );
}
