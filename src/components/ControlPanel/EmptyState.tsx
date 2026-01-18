interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
}

export function EmptyState({
  title,
  description,
  icon = '📭'
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-lg font-medium text-neutral-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-500 max-w-sm">{description}</p>
      )}
    </div>
  );
}
