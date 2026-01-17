import React from 'react';
import type { PipelineStatus as Status } from '@/lib/types';

export interface PipelineStatusProps {
  pipelines: {
    tam: Status;
    competitors: Status;
    technical: Status;
    pricing: Status;
    risks: Status;
  };
  onClick?: (pipeline: string) => void;
}

const pipelineLabels = {
  tam: 'TAM Analysis',
  competitors: 'Competitors',
  technical: 'Technical',
  pricing: 'Pricing',
  risks: 'Risks'
};

export function PipelineStatus({ pipelines, onClick }: PipelineStatusProps) {
  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'GREEN':
        return 'text-green-600 bg-green-100';
      case 'YELLOW':
        return 'text-yellow-600 bg-yellow-100';
      case 'RED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'GREEN':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'YELLOW':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'RED':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-5 gap-2">
      {(Object.keys(pipelines) as Array<keyof typeof pipelines>).map((key) => {
        const status = pipelines[key];
        const isClickable = onClick !== undefined;

        return (
          <div
            key={key}
            className={`flex flex-col items-center p-3 rounded-lg border ${getStatusColor(status)} ${
              isClickable ? 'cursor-pointer hover:shadow-md transition-all' : ''
            }`}
            onClick={() => onClick?.(key)}
          >
            <div className="flex items-center space-x-1 mb-1">
              {getStatusIcon(status)}
              <span className="text-xs font-semibold">{status}</span>
            </div>
            <div className="text-xs text-center text-gray-600 mt-1">
              {pipelineLabels[key]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
