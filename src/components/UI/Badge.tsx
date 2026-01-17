import React from 'react';

export interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant, size = 'md', children, className = '' }: BadgeProps) {
  const variantClasses = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}
