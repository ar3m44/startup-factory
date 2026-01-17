import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number; // Положительное или отрицательное изменение в процентах
  icon?: React.ReactNode;
  gradient?: 'blue' | 'green' | 'purple' | 'yellow';
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  icon,
  gradient,
  onClick
}: StatCardProps) {
  const gradientClasses = {
    blue: 'gradient-blue',
    green: 'gradient-green',
    purple: 'gradient-purple',
    yellow: 'gradient-yellow'
  };

  const isClickable = onClick !== undefined;

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-gray-200 transition-all duration-200 ${
        isClickable ? 'cursor-pointer hover:shadow-md hover:border-gray-300' : ''
      }`}
      onClick={onClick}
    >
      {/* Gradient background (опционально) */}
      {gradient && (
        <div className={`absolute inset-0 ${gradientClasses[gradient]} opacity-5`} />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>

        {/* Value */}
        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <span
              className={`inline-flex items-center text-sm font-medium ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change >= 0 ? (
                <svg className="w-4 h-4 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {Math.abs(change)}%
            </span>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
