import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'confirmed' | 'tentative' | 'cancelled' | 'project' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className
}) => {
  const variantClasses = {
    confirmed: 'badge-confirmed',
    tentative: 'badge-tentative',
    cancelled: 'badge-cancelled',
    project: 'badge-project',
    default: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={cn('badge', variantClasses[variant], className)}>
      {children}
    </span>
  );
};

interface StatusBadgeProps {
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusMap = {
    CONFIRMED: { variant: 'confirmed' as const, label: 'Confirmed' },
    TENTATIVE: { variant: 'tentative' as const, label: 'Tentative' },
    CANCELLED: { variant: 'cancelled' as const, label: 'Cancelled' },
  };

  const { variant, label } = statusMap[status];

  return <Badge variant={variant}>{label}</Badge>;
};
