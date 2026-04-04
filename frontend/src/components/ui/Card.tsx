import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return <div className={cn('card', className)}>{children}</div>;
};

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  trend,
  icon,
}) => {
  const trendColors = {
    up: 'text-emerald-700',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-1 sm:mb-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="text-2xl sm:text-3xl font-semibold text-gray-950 mb-1">{value}</p>
      {subtext && (
        <p className={cn('text-xs sm:text-sm', trend ? trendColors[trend] : 'text-gray-500')}>
          {subtext}
        </p>
      )}
    </div>
  );
};
