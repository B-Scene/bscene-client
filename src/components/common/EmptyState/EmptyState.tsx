import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <h3 className="text-label1 text-neutral-900">{title}</h3>

      {description ? (
        <p className="text-caption1 text-neutral-600">{description}</p>
      ) : null}

      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="flex h-9.5 w-27.5 items-center justify-center rounded-lg bg-secondary-400 px-3 py-2 text-body1 text-white"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
};
