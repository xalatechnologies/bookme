import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'pending';

interface StatusConfig {
  readonly variant: StatusVariant;
  readonly label?: string;
  readonly icon?: React.ComponentType<{ className?: string }>;
  readonly showIcon?: boolean;
  readonly size?: 'sm' | 'md' | 'lg';
}

export interface StatusBadgeProps {
  readonly status: string;
  readonly translationKey?: string;
  readonly variant?: StatusVariant;
  readonly showIcon?: boolean;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

const defaultStatusConfig: Record<string, StatusConfig> = {
  // Booking statuses
  approved: { variant: 'success', icon: CheckCircle },
  pending: { variant: 'warning', icon: Clock },
  rejected: { variant: 'error', icon: XCircle },
  cancelled: { variant: 'error', icon: XCircle },
  
  // Payment statuses
  paid: { variant: 'success', icon: CheckCircle },
  unpaid: { variant: 'warning', icon: AlertCircle },
  refunded: { variant: 'info', icon: CheckCircle },
  
  // General statuses
  active: { variant: 'success', icon: CheckCircle },
  inactive: { variant: 'error', icon: XCircle },
  processing: { variant: 'warning', icon: Clock },
  completed: { variant: 'success', icon: CheckCircle },
};

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

const iconSizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  translationKey,
  variant,
  showIcon = true,
  size = 'sm',
  className = '',
}) => {
  const { t } = useTranslation('common');
  
  const config = defaultStatusConfig[status.toLowerCase()] || {
    variant: 'info',
    icon: AlertCircle,
  };
  
  const finalVariant = variant || config.variant;
  const Icon = config.icon;
  const label = translationKey 
    ? t(translationKey) 
    : t(`statuses.${status.toLowerCase()}`, status);
  
  return (
    <Badge className={`${variantStyles[finalVariant]} ${className}`}>
      {showIcon && Icon && (
        <Icon className={`${iconSizes[size]} mr-1`} />
      )}
      {label}
    </Badge>
  );
};

// Convenience exports for common use cases
export const BookingStatusBadge: React.FC<{ readonly status: string }> = ({ status }) => (
  <StatusBadge status={status} translationKey={`statuses.${status}`} />
);

export const PaymentStatusBadge: React.FC<{ readonly status: string }> = ({ status }) => (
  <StatusBadge status={status} translationKey={`statuses.${status}`} />
);

export const UserStatusBadge: React.FC<{ readonly status: string }> = ({ status }) => (
  <StatusBadge status={status} translationKey={`statuses.${status}`} />
);
