type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  neutral: 'bg-neutral-100 text-neutral-800',
  info: 'bg-blue-100 text-blue-800',
};

export function StatusBadge({ label, variant = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variantStyles[variant]}`}>
      {label}
    </span>
  );
}

export function getTaskStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'done':
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'neutral';
  }
}

export function getVentureStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'active':
    case 'launched':
      return 'success';
    case 'validating':
    case 'building':
      return 'warning';
    case 'killed':
      return 'error';
    default:
      return 'neutral';
  }
}

export function getCIStatusVariant(status: string | null): BadgeVariant {
  switch (status) {
    case 'success':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failure':
      return 'error';
    default:
      return 'neutral';
  }
}
