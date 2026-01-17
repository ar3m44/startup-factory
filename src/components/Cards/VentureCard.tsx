import React from 'react';
import { Badge } from '@/components/UI/Badge';
import type { Venture } from '@/lib/types';

export interface VentureCardProps {
  venture: Venture;
  onClick?: () => void;
}

const statusColors = {
  active: 'success',
  building: 'warning',
  launched: 'success',
  paused: 'default',
  killed: 'error'
} as const;

const statusLabels: Record<string, string> = {
  active: 'Active',
  building: 'Building',
  launched: 'Launched',
  paused: 'Paused',
  killed: 'Killed'
};

export function VentureCard({ venture, onClick }: VentureCardProps) {
  const { metrics } = venture;

  return (
    <div
      className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">
            {venture.name}
          </h3>
          <div className="flex items-center space-x-2">
            <Badge variant={statusColors[venture.status]} size="sm">
              {statusLabels[venture.status]}
            </Badge>
            <span className="text-xs text-gray-500 font-mono">{venture.slug}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* MRR */}
        <div>
          <p className="text-xs text-gray-500 mb-1">MRR</p>
          <p className="text-lg font-bold text-gray-900">
            {metrics.mrr.toLocaleString()}₽
          </p>
        </div>

        {/* Users */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Users</p>
          <p className="text-lg font-bold text-gray-900">
            {metrics.totalUsers.toLocaleString()}
          </p>
        </div>

        {/* Daily Visits */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Daily Visits</p>
          <p className="text-sm font-semibold text-gray-700">
            {metrics.dailyVisits.toLocaleString()}
          </p>
        </div>

        {/* Conversion Rate */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Conversion</p>
          <p className="text-sm font-semibold text-gray-700">
            {metrics.conversionRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Progress Bar для MRR */}
      {venture.blueprint?.metrics?.targetMRR && (
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress to target</span>
            <span>
              {Math.min(100, (metrics.mrr / venture.blueprint.metrics.targetMRR) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (metrics.mrr / venture.blueprint.metrics.targetMRR) * 100)}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
