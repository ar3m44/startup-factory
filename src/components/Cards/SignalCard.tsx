import React from 'react';
import { Badge } from '@/components/UI/Badge';
import type { Signal } from '@/lib/types';

export interface SignalCardProps {
  signal: Signal;
  onClick?: () => void;
  onValidate?: () => void;
}

const sourceColors = {
  Reddit: 'info',
  HackerNews: 'warning',
  Twitter: 'info',
  ProductHunt: 'success',
  Telegram: 'info'
} as const;

const statusColors = {
  pending_validation: 'warning',
  validated: 'success',
  rejected: 'error'
} as const;

const statusLabels = {
  pending_validation: 'Pending',
  validated: 'Validated',
  rejected: 'Rejected'
};

export function SignalCard({ signal, onClick, onValidate }: SignalCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant={sourceColors[signal.source]} size="sm">
              {signal.source}
            </Badge>
            <Badge variant={statusColors[signal.status]} size="sm">
              {statusLabels[signal.status]}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 font-mono">{signal.id}</p>
        </div>

        {/* Confidence Score */}
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-1">
            <span className="text-2xl font-bold text-gray-900">{signal.confidenceScore}</span>
            <span className="text-sm text-gray-500">/100</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Confidence</p>
        </div>
      </div>

      {/* Problem Preview */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 line-clamp-2">{signal.problem}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {new Date(signal.date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>

        {signal.status === 'pending_validation' && onValidate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onValidate();
            }}
            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            Validate
          </button>
        )}
      </div>
    </div>
  );
}
